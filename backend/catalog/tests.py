from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.db import IntegrityError
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from catalog.models import Category, Product, ProductImage
from recommendations.services import CATEGORY_TREE_CACHE_KEY


def create_category(name='Skincare', slug='skincare', parent=None, is_active=True):
    return Category.objects.create(
        name=name,
        slug=slug,
        parent=parent,
        is_active=is_active,
    )


def create_product(category, **overrides):
    data = {
        'name': 'Glow Guard SPF 50',
        'sku': 'GBD-SUN-001',
        'brand': 'Go Beauty Lab',
        'description': 'Daily sunscreen.',
        'ingredients': 'Centella, vitamin E, and UV filters.',
        'how_to_use': 'Apply every morning as the last skincare step.',
        'regular_price': '1750.00',
        'price': '1450.00',
        'average_rating': '4.70',
        'review_count': 31,
        'stock': 10,
        'status': Product.Status.ACTIVE,
    }
    data.update(overrides)
    return Product.objects.create(category=category, **data)


def response_items(response):
    if isinstance(response.data, list):
        return response.data
    return response.data['results']


class CategoryModelTests(TestCase):
    def test_category_can_have_parent(self):
        parent = create_category()
        child = create_category('Sunscreen', 'sunscreen', parent)

        self.assertEqual(child.parent, parent)
        self.assertFalse(child.is_root)
        self.assertTrue(parent.is_root)

    def test_category_name_is_unique_per_parent(self):
        parent = create_category()
        create_category('Sunscreen', 'sunscreen', parent)

        with self.assertRaises(IntegrityError):
            create_category('Sunscreen', 'sun-care', parent)


class ProductModelTests(TestCase):
    def test_product_uses_active_status_helper(self):
        category = create_category()
        product = create_product(category)

        self.assertTrue(product.is_active)


class CatalogApiTests(APITestCase):
    def setUp(self):
        self.category = create_category()
        self.product = create_product(self.category)

    def test_public_category_list_only_returns_active_categories(self):
        create_category('Hidden', 'hidden', is_active=False)

        response = self.client.get(reverse('catalog:category-list'))
        items = response_items(response)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]['slug'], 'skincare')

    def test_public_product_list_only_returns_active_products(self):
        create_product(
            self.category,
            name='Inactive Product',
            sku='GBD-HID-001',
            status=Product.Status.INACTIVE,
        )

        response = self.client.get(reverse('catalog:product-list'))
        items = response_items(response)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]['sku'], 'GBD-SUN-001')
        self.assertIn('image_url', items[0])
        self.assertEqual(items[0]['brand'], 'Go Beauty Lab')
        self.assertEqual(items[0]['discount_percent'], 17)
        self.assertEqual(items[0]['review_count'], 31)

    def test_public_product_detail_returns_gallery_and_content_sections(self):
        self.product.image = 'products/main.jpg'
        self.product.save(update_fields=['image'])
        ProductImage.objects.create(
            product=self.product,
            image='products/gallery/secondary.jpg',
            alt_text='Secondary product view',
            sort_order=1,
        )

        response = self.client.get(reverse('catalog:product-detail', args=[self.product.id]))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['brand'], 'Go Beauty Lab')
        self.assertEqual(response.data['regular_price'], '1750.00')
        self.assertEqual(response.data['average_rating'], '4.70')
        self.assertEqual(response.data['review_count'], 31)
        self.assertEqual(response.data['ingredients'], 'Centella, vitamin E, and UV filters.')
        self.assertEqual(response.data['how_to_use'], 'Apply every morning as the last skincare step.')
        self.assertEqual(len(response.data['gallery']), 2)

    def test_admin_product_create_requires_admin_role(self):
        response = self.client.post(
            reverse('catalog:admin-product-create'),
            {
                'category': self.category.id,
                'name': 'Admin Product',
                'sku': 'admin-sku-001',
                'brand': 'Admin Brand',
                'description': 'Created by admin.',
                'regular_price': '1200.00',
                'price': '990.00',
                'stock': 4,
                'status': Product.Status.ACTIVE,
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_product_create_normalizes_sku(self):
        user = get_user_model().objects.create_user(
            email='admin@example.com',
            password='StrongPass123!',
            role=get_user_model().Role.ADMIN,
        )
        self.client.force_authenticate(user=user)

        response = self.client.post(
            reverse('catalog:admin-product-create'),
            {
                'category': self.category.id,
                'name': 'Admin Product',
                'sku': 'admin-sku-001',
                'brand': 'Admin Brand',
                'description': 'Created by admin.',
                'regular_price': '1200.00',
                'price': '990.00',
                'stock': 4,
                'status': Product.Status.ACTIVE,
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['sku'], 'ADMIN-SKU-001')
        self.assertEqual(response.data['brand'], 'Admin Brand')

    def test_category_save_invalidates_tree_cache(self):
        cache.set(CATEGORY_TREE_CACHE_KEY, {None: [self.category.id]}, 60)

        self.category.name = 'Updated Skincare'
        self.category.save()

        self.assertIsNone(cache.get(CATEGORY_TREE_CACHE_KEY))
