from drf_spectacular.utils import extend_schema
from rest_framework import generics, permissions

from orders.models import Order
from orders.serializers import OrderCreateSerializer, OrderSerializer


class OrderListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderCreateSerializer
    permission_classes = (permissions.IsAuthenticated,)

    @extend_schema(
        tags=['Orders'],
        summary='List current user orders',
        description='Returns only orders owned by the authenticated user.',
        responses=OrderSerializer(many=True),
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @extend_schema(
        tags=['Orders'],
        summary='Create order from cart',
        description='Creates an order from product IDs and quantities. Prices, subtotals, and totals are calculated only on the backend.',
        request=OrderCreateSerializer,
        responses={201: OrderSerializer},
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

    def get_queryset(self):
        return self.get_user_orders()

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return OrderCreateSerializer
        return OrderSerializer

    def get_user_orders(self):
        return (
            Order.objects.filter(user=self.request.user)
            .prefetch_related('items__product')
            .order_by('-created_at')
        )


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = (permissions.IsAuthenticated,)

    @extend_schema(
        tags=['Orders'],
        summary='Get current user order detail',
        description='Returns an authenticated user order with immutable item price snapshots.',
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items__product')
