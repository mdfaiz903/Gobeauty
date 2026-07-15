import hashlib
import hmac
import json
import time

from django.conf import settings
from django.db import transaction

from payments.factories import PaymentProviderFactory
from payments.models import Payment
from payments.strategies import PaymentRequest


class PaymentInitiationService:
    @transaction.atomic
    def initiate_payment(
        self,
        *,
        order,
        provider,
        success_url='',
        cancel_url='',
    ):
        payment_request = self._build_payment_request(
            order=order,
            success_url=success_url,
            cancel_url=cancel_url,
        )
        result = PaymentProviderFactory.create(provider).initiate_payment(payment_request)
        payment = self._save_payment(order=order, result=result)
        return payment, result

    def _build_payment_request(self, *, order, success_url, cancel_url):
        return PaymentRequest(
            order=order,
            amount=order.total_amount,
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                'order_id': order.id,
                'user_id': order.user_id,
            },
        )

    def _save_payment(self, *, order, result):
        defaults = {
            'order': order,
            'amount': order.total_amount,
            'status': result.status,
            'raw_response': result.raw_response,
        }
        if result.transaction_id:
            payment, _ = Payment.objects.update_or_create(
                provider=result.provider,
                transaction_id=result.transaction_id,
                defaults=defaults,
            )
            return payment

        return Payment.objects.create(
            provider=result.provider,
            transaction_id='',
            **defaults,
        )


class StripeWebhookService:
    signature_tolerance_seconds = 300

    def handle_event(self, *, payload, signature=''):
        event = self._parse_payload(payload)
        self._validate_signature(payload=payload, signature=signature)

        transaction_id = self._extract_transaction_id(event)
        payment = self._get_payment(transaction_id)
        payment.status = self._map_event_status(event['type'])
        payment.raw_response = event
        payment.save(update_fields=['status', 'raw_response', 'updated_at'])
        return payment

    def _parse_payload(self, payload):
        try:
            event = json.loads(payload.decode('utf-8'))
        except (UnicodeDecodeError, json.JSONDecodeError) as exc:
            raise ValueError('Invalid Stripe webhook payload.') from exc

        if not event.get('type') or not isinstance(event.get('data'), dict):
            raise ValueError('Stripe webhook event is missing required fields.')
        return event

    def _validate_signature(self, *, payload, signature):
        if not settings.STRIPE_WEBHOOK_SECRET:
            return

        timestamp, received_signature = self._parse_signature_header(signature)
        if self._is_expired(timestamp):
            raise ValueError('Stripe webhook signature timestamp is expired.')

        expected_signature = self._build_signature(timestamp=timestamp, payload=payload)
        if not hmac.compare_digest(expected_signature, received_signature):
            raise ValueError('Invalid Stripe webhook signature.')

    def _parse_signature_header(self, signature):
        signature_parts = self._split_signature(signature)
        try:
            timestamp = int(signature_parts['t'])
            received_signature = signature_parts['v1']
        except (KeyError, ValueError) as exc:
            raise ValueError('Invalid Stripe signature header.') from exc
        return timestamp, received_signature

    def _split_signature(self, signature):
        parts = {}
        for item in signature.split(','):
            if '=' not in item:
                continue
            name, value = item.split('=', 1)
            parts[name] = value
        return parts

    def _is_expired(self, timestamp):
        return abs(time.time() - timestamp) > self.signature_tolerance_seconds

    def _build_signature(self, *, timestamp, payload):
        signed_payload = f'{timestamp}.{payload.decode("utf-8")}'.encode('utf-8')
        return hmac.new(
            settings.STRIPE_WEBHOOK_SECRET.encode('utf-8'),
            signed_payload,
            hashlib.sha256,
        ).hexdigest()

    def _extract_transaction_id(self, event):
        event_object = event['data'].get('object', {})
        transaction_id = event_object.get('id') or event_object.get('payment_intent')
        if not transaction_id:
            raise ValueError('Stripe webhook event is missing transaction id.')
        return transaction_id

    def _get_payment(self, transaction_id):
        try:
            return Payment.objects.get(
                provider=Payment.Provider.STRIPE,
                transaction_id=transaction_id,
            )
        except Payment.DoesNotExist as exc:
            raise ValueError('Stripe payment was not found.') from exc

    def _map_event_status(self, event_type):
        succeeded_events = {
            'checkout.session.completed',
            'payment_intent.succeeded',
        }
        failed_events = {
            'payment_intent.payment_failed',
        }
        canceled_events = {
            'checkout.session.expired',
            'payment_intent.canceled',
        }

        if event_type in succeeded_events:
            return Payment.Status.SUCCEEDED
        if event_type in failed_events:
            return Payment.Status.FAILED
        if event_type in canceled_events:
            return Payment.Status.CANCELED
        return Payment.Status.PENDING


class BkashPaymentService:
    @transaction.atomic
    def execute_payment(self, transaction_id):
        result = PaymentProviderFactory.create(Payment.Provider.BKASH).execute_payment(
            transaction_id,
        )
        return self._update_payment(result)

    @transaction.atomic
    def query_payment(self, transaction_id):
        result = PaymentProviderFactory.create(Payment.Provider.BKASH).query_payment(
            transaction_id,
        )
        return self._update_payment(result)

    def _update_payment(self, result):
        payment = self._get_payment(result.transaction_id)
        payment.status = result.status
        payment.raw_response = result.raw_response
        payment.save(update_fields=['status', 'raw_response', 'updated_at'])
        return payment

    def _get_payment(self, transaction_id):
        try:
            return Payment.objects.get(
                provider=Payment.Provider.BKASH,
                transaction_id=transaction_id,
            )
        except Payment.DoesNotExist as exc:
            raise ValueError('bKash payment was not found.') from exc
