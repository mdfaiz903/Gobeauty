from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from catalog.models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    parent = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Category
        fields = (
            'id',
            'name',
            'slug',
            'parent',
            'is_active',
            'created_at',
            'updated_at',
        )
        read_only_fields = fields


class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            'id',
            'category',
            'name',
            'sku',
            'image_url',
            'price',
            'stock',
            'status',
        )
        read_only_fields = fields

    @extend_schema_field(str)
    def get_image_url(self, product):
        if not product.image:
            return ''

        request = self.context.get('request')
        image_url = product.image.url
        if request:
            return request.build_absolute_uri(image_url)
        return image_url


class ProductDetailSerializer(ProductListSerializer):
    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + (
            'description',
            'created_at',
            'updated_at',
        )


class ProductAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = (
            'id',
            'category',
            'name',
            'sku',
            'description',
            'image',
            'price',
            'stock',
            'status',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_sku(self, value):
        return value.strip().upper()
