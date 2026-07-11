from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from catalog.models import Category, Product
from orders.models import Order, OrderItem


def create_user(email='shopper@example.com'):
    return get_user_model().objects.create_user(
        email=email,
        password='StrongPass123!',
    )


def create_category():
    return Category.objects.create(name='Skincare', slug='skincare')


def create_product(category, **overrides):
    data = {
        'name': 'Glow Guard SPF 50',
        'sku': 'GBD-SUN-001',
        'description': 'Daily sunscreen.',
        'price': Decimal('1450.00'),
        'stock': 10,
        'status': Product.Status.ACTIVE,
    }
    data.update(overrides)
    return Product.objects.create(category=category, **data)


class OrderCreationApiTests(APITestCase):
    def setUp(self):
        self.user = create_user()
        self.category = create_category()
        self.product = create_product(self.category)
        self.client.force_authenticate(user=self.user)

    def test_order_create_calculates_totals_and_merges_duplicate_products(self):
        response = self.client.post(
            reverse('orders:order-list-create'),
            {
                'items': [
                    {'product_id': self.product.id, 'quantity': 1},
                    {'product_id': self.product.id, 'quantity': 2},
                ],
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Decimal(response.data['total_amount']), Decimal('4350.00'))
        self.assertEqual(len(response.data['items']), 1)
        self.assertEqual(response.data['items'][0]['quantity'], 3)
        self.assertEqual(Decimal(response.data['items'][0]['price']), self.product.price)
        self.assertEqual(Decimal(response.data['items'][0]['subtotal']), Decimal('4350.00'))

    def test_order_create_rejects_invalid_stock(self):
        response = self.client.post(
            reverse('orders:order-list-create'),
            {'items': [{'product_id': self.product.id, 'quantity': 99}]},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Insufficient stock', str(response.data))

    def test_order_create_rejects_inactive_product(self):
        inactive_product = create_product(
            self.category,
            name='Inactive Cleanser',
            sku='GBD-CLE-001',
            status=Product.Status.INACTIVE,
        )

        response = self.client.post(
            reverse('orders:order-list-create'),
            {'items': [{'product_id': inactive_product.id, 'quantity': 1}]},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('inactive', str(response.data).lower())


class OrderVisibilityApiTests(APITestCase):
    def setUp(self):
        self.user = create_user('shopper@example.com')
        self.other_user = create_user('other@example.com')
        self.category = create_category()
        self.product = create_product(self.category)
        self.order = self.create_order(self.user)
        self.other_order = self.create_order(self.other_user)
        self.client.force_authenticate(user=self.user)

    def create_order(self, user):
        order = Order.objects.create(user=user, total_amount=Decimal('1450.00'))
        OrderItem.objects.create(
            order=order,
            product=self.product,
            quantity=1,
            price=self.product.price,
            subtotal=self.product.price,
        )
        return order

    def test_order_list_only_returns_current_user_orders(self):
        response = self.client.get(reverse('orders:order-list-create'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        order_ids = {order['id'] for order in response.data}
        self.assertEqual(order_ids, {self.order.id})

    def test_order_detail_returns_current_user_order(self):
        response = self.client.get(
            reverse('orders:order-detail', kwargs={'pk': self.order.id}),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.order.id)

    def test_order_detail_hides_other_users_order(self):
        response = self.client.get(
            reverse('orders:order-detail', kwargs={'pk': self.other_order.id}),
        )

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
