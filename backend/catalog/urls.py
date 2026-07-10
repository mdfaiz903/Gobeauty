from django.urls import path

from catalog.views import (
    AdminProductCreateView,
    AdminProductDetailView,
    CategoryListView,
    ProductDetailView,
    ProductListView,
)

app_name = 'catalog'

urlpatterns = [
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('admin/products/', AdminProductCreateView.as_view(), name='admin-product-create'),
    path(
        'admin/products/<int:pk>/',
        AdminProductDetailView.as_view(),
        name='admin-product-detail',
    ),
]
