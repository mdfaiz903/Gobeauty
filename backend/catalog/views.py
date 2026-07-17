from drf_spectacular.utils import extend_schema
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

    @extend_schema(
        tags=['Catalog'],
        summary='List active categories',
        description='Returns active categories with parent references for building the storefront category tree.',
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        return Category.objects.filter(is_active=True).select_related('parent')


class ProductListView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = (permissions.AllowAny,)

    @extend_schema(
        tags=['Catalog'],
        summary='List active products',
        description='Returns public products that are active and belong to active categories.',
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        return Product.objects.filter(
            status=Product.Status.ACTIVE,
            category__is_active=True,
        ).select_related('category', 'category__parent')


class ProductDetailView(generics.RetrieveAPIView):
    serializer_class = ProductDetailSerializer
    permission_classes = (permissions.AllowAny,)

    @extend_schema(
        tags=['Catalog'],
        summary='Get product detail',
        description='Returns public product detail with image URL, category, description, and stock.',
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        return Product.objects.filter(
            status=Product.Status.ACTIVE,
            category__is_active=True,
        ).select_related('category', 'category__parent')


class ProductRecommendationListView(generics.ListAPIView):
    serializer_class = ProductListSerializer
    permission_classes = (permissions.AllowAny,)

    @extend_schema(
        tags=['Recommendations'],
        summary='List related products',
        description='Uses DFS over the cached category tree to recommend sibling and descendant category products.',
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

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

    @extend_schema(
        tags=['Catalog'],
        summary='Create product as admin',
        description='Admin-only endpoint for adding catalog products, including SKU, image, stock, and status.',
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class AdminProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.select_related('category')
    serializer_class = ProductAdminSerializer
    permission_classes = (IsAdminRole,)

    @extend_schema(
        tags=['Catalog'],
        summary='Get product as admin',
        description='Admin-only product detail endpoint.',
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        tags=['Catalog'],
        summary='Update product as admin',
        description='Admin-only endpoint for changing product catalog, stock, image, or status fields.',
    )
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)

    @extend_schema(
        tags=['Catalog'],
        summary='Partially update product as admin',
        description='Admin-only partial product update endpoint.',
    )
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    @extend_schema(
        tags=['Catalog'],
        summary='Delete product as admin',
        description='Admin-only product delete endpoint. Protected relationships still follow database constraints.',
    )
    def delete(self, request, *args, **kwargs):
        return super().delete(request, *args, **kwargs)
