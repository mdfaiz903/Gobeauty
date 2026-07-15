from rest_framework import serializers

from orders.models import Order
from payments.models import Payment


class PaymentInitiationSerializer(serializers.Serializer):
    order_id = serializers.IntegerField(min_value=1)
    provider = serializers.ChoiceField(choices=Payment.Provider.choices)
    success_url = serializers.URLField(required=False, allow_blank=True)
    cancel_url = serializers.URLField(required=False, allow_blank=True)

    def validate_order_id(self, value):
        order = self._get_user_order(value)
        if order.status != Order.Status.PENDING:
            raise serializers.ValidationError('Only pending orders can be paid.')
        self.context['order'] = order
        return value

    def _get_user_order(self, order_id):
        request = self.context['request']
        order = Order.objects.filter(id=order_id, user=request.user).first()
        if not order:
            raise serializers.ValidationError('Order not found.')
        return order


class PaymentSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source='order.id', read_only=True)

    class Meta:
        model = Payment
        fields = (
            'id',
            'order_id',
            'provider',
            'amount',
            'transaction_id',
            'status',
            'created_at',
            'updated_at',
        )
        read_only_fields = fields


class BkashTransactionSerializer(serializers.Serializer):
    transaction_id = serializers.CharField(required=False, allow_blank=True)
    payment_id = serializers.CharField(required=False, allow_blank=True)
    paymentID = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        transaction_id = (
            attrs.get('transaction_id')
            or attrs.get('payment_id')
            or attrs.get('paymentID')
        )
        if not transaction_id:
            raise serializers.ValidationError('transaction_id or paymentID is required.')
        attrs['transaction_id'] = transaction_id
        return attrs
