from django.core.cache import cache
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from catalog.models import Category, Product
from recommendations.services import CATEGORY_TREE_CACHE_KEY, CategoryRecommendationService


def create_category(name, slug, parent=None):
    return Category.objects.create(name=name, slug=slug, parent=parent)


def create_product(category, name, sku):
    return Product.objects.create(
        category=category,
        name=name,
        sku=sku,
        description='Recommendation fixture.',
        price='100.00',
        stock=5,
        status=Product.Status.ACTIVE,
    )


class CategoryRecommendationServiceTests(TestCase):
    def setUp(self):
        cache.clear()
        self.root = create_category('Skincare', 'skincare')
        self.serum = create_category('Serum', 'serum', self.root)
        self.sunscreen = create_category('Sunscreen', 'sunscreen', self.root)

    def test_depth_first_category_ids_include_siblings_and_descendants(self):
        service = CategoryRecommendationService()

        category_ids = service.get_related_category_ids(self.serum.id)

        self.assertEqual(category_ids, [self.root.id, self.serum.id, self.sunscreen.id])

    def test_category_tree_is_cached(self):
        service = CategoryRecommendationService()

        service.build_child_map()

        self.assertIsNotNone(cache.get(CATEGORY_TREE_CACHE_KEY))


class ProductRecommendationApiTests(APITestCase):
    def test_recommendation_endpoint_excludes_source_product(self):
        root = create_category('Skincare', 'skincare')
        serum = create_category('Serum', 'serum', root)
        sunscreen = create_category('Sunscreen', 'sunscreen', root)
        source = create_product(serum, 'Niacinamide Serum', 'GBD-SER-001')
        related = create_product(sunscreen, 'Glow Guard SPF', 'GBD-SUN-001')

        response = self.client.get(
            reverse('catalog:product-recommendations', kwargs={'pk': source.id}),
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['id'], related.id)
