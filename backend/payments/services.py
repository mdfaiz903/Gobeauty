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
