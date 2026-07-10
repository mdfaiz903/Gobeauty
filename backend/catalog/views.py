from rest_framework import generics

from accounts.permissions import IsAdminRole
from catalog.models import Product
from catalog.serializers import ProductAdminSerializer


class AdminProductCreateView(generics.CreateAPIView):
    queryset = Product.objects.select_related('category')
    serializer_class = ProductAdminSerializer
    permission_classes = (IsAdminRole,)


class AdminProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.select_related('category')
    serializer_class = ProductAdminSerializer
    permission_classes = (IsAdminRole,)
