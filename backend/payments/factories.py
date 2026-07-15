from payments.models import Payment
from payments.strategies import (
    BkashPaymentStrategy,
    PaymentProviderStrategy,
    StripePaymentStrategy,
)


class UnsupportedPaymentProviderError(ValueError):
    pass


class PaymentProviderFactory:
    strategies = {
        Payment.Provider.STRIPE: StripePaymentStrategy,
        Payment.Provider.BKASH: BkashPaymentStrategy,
    }

    @classmethod
    def create(cls, provider: str) -> PaymentProviderStrategy:
        provider_key = provider.strip().lower()
        strategy_class = cls.strategies.get(provider_key)
        if not strategy_class:
            raise UnsupportedPaymentProviderError(
                f'Unsupported payment provider: {provider}',
            )
        return strategy_class()
