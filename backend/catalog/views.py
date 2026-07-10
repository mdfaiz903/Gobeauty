from rest_framework import generics, permissions

from accounts.permissions import IsAdminRole
from catalog.models import Category, Product
from catalog.serializers import (
    CategorySerializer,
    ProductAdminSerializer,
    ProductDetailSerializer,
    ProductListSerializer,
)


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


class AdminProductCreateView(generics.CreateAPIView):
    queryset = Product.objects.select_related('category')
    serializer_class = ProductAdminSerializer
    permission_classes = (IsAdminRole,)


class AdminProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.select_related('category')
    serializer_class = ProductAdminSerializer
    permission_classes = (IsAdminRole,)
