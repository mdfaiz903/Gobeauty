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
