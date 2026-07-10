from rest_framework import generics, permissions

from accounts.permissions import IsAdminRole
from catalog.models import Category, Product
from catalog.serializers import (
    CategorySerializer,
    ProductAdminSerializer,
    ProductDetailSerializer,
    ProductListSerializer,
)
from recommendations.services import CategoryRecommendationService


class CategoryListView(generics.ListAPIView):
    serializer_class = CategorySerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        return Category.objects.filter(is_active=True).select_related('parent')


class ProductListView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        return Product.objects.filter(
            status=Product.Status.ACTIVE,
            category__is_active=True,
        ).select_related('category', 'category__parent')


class ProductDetailView(generics.RetrieveAPIView):
    serializer_class = ProductDetailSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        return Product.objects.filter(
            status=Product.Status.ACTIVE,
            category__is_active=True,
        ).select_related('category', 'category__parent')


class ProductRecommendationListView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        product = self.get_product()
        return CategoryRecommendationService().get_related_products(product)

    def get_product(self):
        return generics.get_object_or_404(
            Product.objects.filter(
                status=Product.Status.ACTIVE,
                category__is_active=True,
            ).select_related('category'),
            pk=self.kwargs['pk'],
        )


class AdminProductCreateView(generics.CreateAPIView):
    queryset = Product.objects.select_related('category')
    serializer_class = ProductAdminSerializer
    permission_classes = (IsAdminRole,)


class AdminProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.select_related('category')
    serializer_class = ProductAdminSerializer
    permission_classes = (IsAdminRole,)
