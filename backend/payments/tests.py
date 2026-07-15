from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase

from orders.models import Order
from payments.models import Payment
from payments.strategies import (
    PaymentProviderStrategy,
    PaymentRequest,
    PaymentResult,
)


class FakePaymentStrategy(PaymentProviderStrategy):
    provider_name = Payment.Provider.STRIPE

    def initiate_payment(self, payment_request):
        return PaymentResult(
            provider=self.provider_name,
            status=Payment.Status.PENDING,
            transaction_id=f'fake_{payment_request.order.id}',
            redirect_url='https://payments.example.test/checkout',
            raw_response={'amount': str(payment_request.amount)},
        )

    def execute_payment(self, transaction_id):
        return PaymentResult(
            provider=self.provider_name,
            status=Payment.Status.SUCCEEDED,
            transaction_id=transaction_id,
            raw_response={'executed': True},
        )

    def query_payment(self, transaction_id):
        return PaymentResult(
            provider=self.provider_name,
            status=Payment.Status.PENDING,
            transaction_id=transaction_id,
            raw_response={'queried': True},
        )


class PaymentProviderStrategyTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email='payer@example.com',
            password='StrongPass123!',
        )
        self.order = Order.objects.create(
            user=self.user,
            total_amount=Decimal('1450.00'),
        )

    def test_strategy_initiates_payment_with_request_data(self):
        payment_request = PaymentRequest(
            order=self.order,
            amount=self.order.total_amount,
            success_url='https://frontend.example.test/success',
            cancel_url='https://frontend.example.test/cancel',
        )

        result = FakePaymentStrategy().initiate_payment(payment_request)

        self.assertEqual(result.provider, Payment.Provider.STRIPE)
        self.assertEqual(result.status, Payment.Status.PENDING)
        self.assertEqual(result.transaction_id, f'fake_{self.order.id}')
        self.assertEqual(result.raw_response['amount'], '1450.00')

    def test_strategy_executes_payment(self):
        result = FakePaymentStrategy().execute_payment('fake_123')

        self.assertEqual(result.status, Payment.Status.SUCCEEDED)
        self.assertEqual(result.transaction_id, 'fake_123')

    def test_strategy_queries_payment(self):
        result = FakePaymentStrategy().query_payment('fake_123')

        self.assertEqual(result.status, Payment.Status.PENDING)
        self.assertTrue(result.raw_response['queried'])
