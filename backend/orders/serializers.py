from rest_framework import serializers

from orders.models import Order, OrderItem
from orders.services import OrderCreationService


class CartItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(min_value=1)
    quantity = serializers.IntegerField(min_value=1)


class OrderItemSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(source='product.id', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)

    class Meta:
        model = OrderItem
        fields = (
            'id',
            'product_id',
            'product_name',
            'product_sku',
            'quantity',
            'price',
            'subtotal',
        )
        read_only_fields = fields


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = (
            'id',
            'total_amount',
            'status',
            'items',
            'created_at',
            'updated_at',
        )
        read_only_fields = fields


class OrderCreateSerializer(serializers.Serializer):
    items = CartItemSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError('At least one cart item is required.')
        return value

    def create(self, validated_data):
        request = self.context['request']
        return OrderCreationService(request.user).create_order(validated_data['items'])

    def to_representation(self, instance):
        return OrderSerializer(instance).data
