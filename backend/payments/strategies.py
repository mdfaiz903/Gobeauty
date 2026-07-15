from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from decimal import Decimal
from typing import Any

from orders.models import Order


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
