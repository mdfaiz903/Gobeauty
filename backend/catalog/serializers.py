from rest_framework import serializers

from catalog.models import Product


class ProductAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = (
            'id',
            'category',
            'name',
            'sku',
            'description',
            'price',
            'stock',
            'status',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_sku(self, value):
        return value.strip().upper()
