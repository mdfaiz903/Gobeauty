from django.urls import path

from catalog.views import AdminProductCreateView, AdminProductDetailView

app_name = 'catalog'

urlpatterns = [
    path('admin/products/', AdminProductCreateView.as_view(), name='admin-product-create'),
    path(
        'admin/products/<int:pk>/',
        AdminProductDetailView.as_view(),
        name='admin-product-detail',
    ),
]
