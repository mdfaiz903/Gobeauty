from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from decimal import Decimal
from typing import Any

from django.conf import settings

from orders.models import Order
from payments.models import Payment


@dataclass(frozen=True)
class PaymentRequest:
    order: Order
    amount: Decimal
    currency: str = 'BDT'
    success_url: str = ''
    cancel_url: str = ''
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class PaymentResult:
    provider: str
    status: str
    transaction_id: str = ''
    redirect_url: str = ''
    raw_response: dict[str, Any] = field(default_factory=dict)


class PaymentProviderStrategy(ABC):
    provider_name: str

    @abstractmethod
    def initiate_payment(self, payment_request: PaymentRequest) -> PaymentResult:
        """Create the provider-side payment session or payment intent."""

    @abstractmethod
    def execute_payment(self, transaction_id: str) -> PaymentResult:
        """Complete a provider-side payment after user authorization."""

    @abstractmethod
    def query_payment(self, transaction_id: str) -> PaymentResult:
        """Fetch the latest provider-side payment status."""


class StripePaymentStrategy(PaymentProviderStrategy):
    provider_name = Payment.Provider.STRIPE

    def __init__(self, client=None):
        self.client = client

    def initiate_payment(self, payment_request: PaymentRequest) -> PaymentResult:
        if self.client:
            return self._initiate_with_client(payment_request)
        return self._initiate_test_payment(payment_request)

    def execute_payment(self, transaction_id: str) -> PaymentResult:
        return PaymentResult(
            provider=self.provider_name,
            status=Payment.Status.SUCCEEDED,
            transaction_id=transaction_id,
            raw_response={
                'mode': settings.STRIPE_MODE,
                'simulated': True,
                'message': 'Stripe success is normally confirmed by webhook.',
            },
        )

    def query_payment(self, transaction_id: str) -> PaymentResult:
        return PaymentResult(
            provider=self.provider_name,
            status=Payment.Status.PENDING,
            transaction_id=transaction_id,
            raw_response={
                'mode': settings.STRIPE_MODE,
                'simulated': True,
            },
        )

    def _initiate_test_payment(self, payment_request: PaymentRequest) -> PaymentResult:
        transaction_id = self._build_transaction_id(payment_request.order)
        return PaymentResult(
            provider=self.provider_name,
            status=Payment.Status.PENDING,
            transaction_id=transaction_id,
            redirect_url=f'{settings.STRIPE_CHECKOUT_BASE_URL}/{transaction_id}',
            raw_response={
                'mode': settings.STRIPE_MODE,
                'amount': str(payment_request.amount),
                'currency': payment_request.currency,
                'order_id': payment_request.order.id,
                'metadata': payment_request.metadata,
                'simulated': True,
            },
        )

    def _initiate_with_client(self, payment_request: PaymentRequest) -> PaymentResult:
        checkout_session = self.client.create_checkout_session(payment_request)
        return PaymentResult(
            provider=self.provider_name,
            status=Payment.Status.PENDING,
            transaction_id=checkout_session['id'],
            redirect_url=checkout_session.get('url', ''),
            raw_response=checkout_session,
        )

    def _build_transaction_id(self, order: Order) -> str:
        return f'stripe_test_order_{order.id}'


class BkashPaymentStrategy(PaymentProviderStrategy):
    provider_name = Payment.Provider.BKASH

    def __init__(self, client=None):
        self.client = client

    def initiate_payment(self, payment_request: PaymentRequest) -> PaymentResult:
        if self.client:
            return self._initiate_with_client(payment_request)
        return self._initiate_sandbox_payment(payment_request)

    def execute_payment(self, transaction_id: str) -> PaymentResult:
        if self.client:
            response = self.client.execute_payment(transaction_id)
            return self._result_from_response(response, Payment.Status.SUCCEEDED)

        return PaymentResult(
            provider=self.provider_name,
            status=Payment.Status.SUCCEEDED,
            transaction_id=transaction_id,
            raw_response={
                'mode': settings.BKASH_MODE,
                'simulated': True,
                'message': 'bKash sandbox execution succeeded.',
            },
        )

    def query_payment(self, transaction_id: str) -> PaymentResult:
        if self.client:
            response = self.client.query_payment(transaction_id)
            return self._result_from_response(response, Payment.Status.PENDING)

        return PaymentResult(
            provider=self.provider_name,
            status=Payment.Status.PENDING,
            transaction_id=transaction_id,
            raw_response={
                'mode': settings.BKASH_MODE,
                'simulated': True,
            },
        )

    def _initiate_sandbox_payment(self, payment_request: PaymentRequest) -> PaymentResult:
        transaction_id = self._build_transaction_id(payment_request.order)
        return PaymentResult(
            provider=self.provider_name,
            status=Payment.Status.PENDING,
            transaction_id=transaction_id,
            redirect_url=f'{settings.BKASH_BASE_URL}/payment/{transaction_id}',
            raw_response={
                'mode': settings.BKASH_MODE,
                'amount': str(payment_request.amount),
                'currency': payment_request.currency,
                'order_id': payment_request.order.id,
                'metadata': payment_request.metadata,
                'simulated': True,
            },
        )

    def _initiate_with_client(self, payment_request: PaymentRequest) -> PaymentResult:
        response = self.client.create_payment(payment_request)
        return self._result_from_response(response, Payment.Status.PENDING)

    def _result_from_response(self, response: dict[str, Any], default_status: str) -> PaymentResult:
        return PaymentResult(
            provider=self.provider_name,
            status=response.get('status', default_status),
            transaction_id=response.get('paymentID', response.get('transaction_id', '')),
            redirect_url=response.get('bkashURL', response.get('redirect_url', '')),
            raw_response=response,
        )

    def _build_transaction_id(self, order: Order) -> str:
        return f'bkash_sandbox_order_{order.id}'
