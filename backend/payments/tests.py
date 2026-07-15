from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from orders.models import Order
from payments.factories import (
    PaymentProviderFactory,
    UnsupportedPaymentProviderError,
)
from payments.models import Payment
from payments.strategies import (
    BkashPaymentStrategy,
    PaymentProviderStrategy,
    PaymentRequest,
    PaymentResult,
    StripePaymentStrategy,
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


class FakeStripeClient:
    def create_checkout_session(self, payment_request):
        return {
            'id': f'cs_test_{payment_request.order.id}',
            'url': 'https://checkout.stripe.test/session',
            'amount': str(payment_request.amount),
        }


class StripePaymentStrategyTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email='stripe-payer@example.com',
            password='StrongPass123!',
        )
        self.order = Order.objects.create(
            user=self.user,
            total_amount=Decimal('1890.00'),
        )
        self.payment_request = PaymentRequest(
            order=self.order,
            amount=self.order.total_amount,
            success_url='https://frontend.example.test/success',
            cancel_url='https://frontend.example.test/cancel',
            metadata={'source': 'unit-test'},
        )

    def test_stripe_strategy_initiates_test_payment(self):
        result = StripePaymentStrategy().initiate_payment(self.payment_request)

        self.assertEqual(result.provider, Payment.Provider.STRIPE)
        self.assertEqual(result.status, Payment.Status.PENDING)
        self.assertEqual(result.transaction_id, f'stripe_test_order_{self.order.id}')
        self.assertIn(result.transaction_id, result.redirect_url)
        self.assertEqual(result.raw_response['amount'], '1890.00')
        self.assertTrue(result.raw_response['simulated'])

    def test_stripe_strategy_uses_injected_client(self):
        result = StripePaymentStrategy(client=FakeStripeClient()).initiate_payment(
            self.payment_request,
        )

        self.assertEqual(result.transaction_id, f'cs_test_{self.order.id}')
        self.assertEqual(result.redirect_url, 'https://checkout.stripe.test/session')
        self.assertEqual(result.raw_response['amount'], '1890.00')

    def test_stripe_strategy_execute_returns_success_result(self):
        result = StripePaymentStrategy().execute_payment('stripe_test_order_1')

        self.assertEqual(result.status, Payment.Status.SUCCEEDED)
        self.assertTrue(result.raw_response['simulated'])

    def test_stripe_strategy_query_returns_pending_result(self):
        result = StripePaymentStrategy().query_payment('stripe_test_order_1')

        self.assertEqual(result.status, Payment.Status.PENDING)
        self.assertTrue(result.raw_response['simulated'])


class FakeBkashClient:
    def create_payment(self, payment_request):
        return {
            'paymentID': f'bkash_{payment_request.order.id}',
            'bkashURL': 'https://bkash.test/checkout',
            'amount': str(payment_request.amount),
        }

    def execute_payment(self, transaction_id):
        return {
            'paymentID': transaction_id,
            'status': Payment.Status.SUCCEEDED,
        }

    def query_payment(self, transaction_id):
        return {
            'paymentID': transaction_id,
            'status': Payment.Status.PENDING,
        }


class BkashPaymentStrategyTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email='bkash-payer@example.com',
            password='StrongPass123!',
        )
        self.order = Order.objects.create(
            user=self.user,
            total_amount=Decimal('980.00'),
        )
        self.payment_request = PaymentRequest(
            order=self.order,
            amount=self.order.total_amount,
            metadata={'source': 'unit-test'},
        )

    def test_bkash_strategy_initiates_sandbox_payment(self):
        result = BkashPaymentStrategy().initiate_payment(self.payment_request)

        self.assertEqual(result.provider, Payment.Provider.BKASH)
        self.assertEqual(result.status, Payment.Status.PENDING)
        self.assertEqual(result.transaction_id, f'bkash_sandbox_order_{self.order.id}')
        self.assertIn(result.transaction_id, result.redirect_url)
        self.assertEqual(result.raw_response['amount'], '980.00')
        self.assertTrue(result.raw_response['simulated'])

    def test_bkash_strategy_uses_injected_client(self):
        result = BkashPaymentStrategy(client=FakeBkashClient()).initiate_payment(
            self.payment_request,
        )

        self.assertEqual(result.transaction_id, f'bkash_{self.order.id}')
        self.assertEqual(result.redirect_url, 'https://bkash.test/checkout')
        self.assertEqual(result.raw_response['amount'], '980.00')

    def test_bkash_strategy_executes_payment(self):
        result = BkashPaymentStrategy().execute_payment('bkash_sandbox_order_1')

        self.assertEqual(result.status, Payment.Status.SUCCEEDED)
        self.assertTrue(result.raw_response['simulated'])

    def test_bkash_strategy_queries_payment(self):
        result = BkashPaymentStrategy().query_payment('bkash_sandbox_order_1')

        self.assertEqual(result.status, Payment.Status.PENDING)
        self.assertTrue(result.raw_response['simulated'])

    def test_bkash_strategy_maps_client_execute_response(self):
        result = BkashPaymentStrategy(client=FakeBkashClient()).execute_payment('bkash_123')

        self.assertEqual(result.status, Payment.Status.SUCCEEDED)
        self.assertEqual(result.transaction_id, 'bkash_123')


class PaymentProviderFactoryTests(TestCase):
    def test_factory_creates_stripe_strategy(self):
        strategy = PaymentProviderFactory.create(Payment.Provider.STRIPE)

        self.assertIsInstance(strategy, StripePaymentStrategy)

    def test_factory_creates_bkash_strategy(self):
        strategy = PaymentProviderFactory.create(Payment.Provider.BKASH)

        self.assertIsInstance(strategy, BkashPaymentStrategy)

    def test_factory_accepts_case_insensitive_provider(self):
        strategy = PaymentProviderFactory.create('  StRiPe  ')

        self.assertIsInstance(strategy, StripePaymentStrategy)

    def test_factory_rejects_unsupported_provider(self):
        with self.assertRaises(UnsupportedPaymentProviderError):
            PaymentProviderFactory.create('paypal')


class PaymentInitiationApiTests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            email='api-payer@example.com',
            password='StrongPass123!',
        )
        self.other_user = get_user_model().objects.create_user(
            email='other-payer@example.com',
            password='StrongPass123!',
        )
        self.order = Order.objects.create(
            user=self.user,
            total_amount=Decimal('1275.00'),
        )
        self.url = reverse('payments:payment-initiate')

    def test_authenticated_user_can_initiate_stripe_payment(self):
        self.client.force_authenticate(self.user)

        response = self.client.post(
            self.url,
            {
                'order_id': self.order.id,
                'provider': Payment.Provider.STRIPE,
                'success_url': 'https://frontend.example.test/success',
                'cancel_url': 'https://frontend.example.test/cancel',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Payment.objects.count(), 1)
        payment = Payment.objects.get()
        self.assertEqual(payment.order, self.order)
        self.assertEqual(payment.provider, Payment.Provider.STRIPE)
        self.assertEqual(payment.amount, self.order.total_amount)
        self.assertEqual(payment.status, Payment.Status.PENDING)
        self.assertIn(payment.transaction_id, response.data['redirect_url'])

    def test_payment_initiation_is_idempotent_for_provider_transaction(self):
        self.client.force_authenticate(self.user)
        payload = {
            'order_id': self.order.id,
            'provider': Payment.Provider.BKASH,
        }

        first_response = self.client.post(self.url, payload, format='json')
        second_response = self.client.post(self.url, payload, format='json')

        self.assertEqual(first_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(second_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Payment.objects.count(), 1)

    def test_anonymous_user_cannot_initiate_payment(self):
        response = self.client.post(
            self.url,
            {
                'order_id': self.order.id,
                'provider': Payment.Provider.STRIPE,
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_user_cannot_pay_another_users_order(self):
        other_order = Order.objects.create(
            user=self.other_user,
            total_amount=Decimal('800.00'),
        )
        self.client.force_authenticate(self.user)

        response = self.client.post(
            self.url,
            {
                'order_id': other_order.id,
                'provider': Payment.Provider.STRIPE,
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Payment.objects.count(), 0)

    def test_user_cannot_pay_non_pending_order(self):
        self.order.status = Order.Status.PAID
        self.order.save(update_fields=['status'])
        self.client.force_authenticate(self.user)

        response = self.client.post(
            self.url,
            {
                'order_id': self.order.id,
                'provider': Payment.Provider.STRIPE,
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Payment.objects.count(), 0)

    def test_unsupported_provider_returns_validation_error(self):
        self.client.force_authenticate(self.user)

        response = self.client.post(
            self.url,
            {
                'order_id': self.order.id,
                'provider': 'paypal',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
