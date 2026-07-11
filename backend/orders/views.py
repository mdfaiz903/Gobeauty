from rest_framework import generics, permissions

from orders.serializers import OrderCreateSerializer


class OrderCreateView(generics.CreateAPIView):
    serializer_class = OrderCreateSerializer
    permission_classes = (permissions.IsAuthenticated,)
