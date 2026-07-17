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
    discount_percent = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = (
            'id',
            'category',
            'name',
            'sku',
            'brand',
            'image_url',
            'regular_price',
            'price',
            'discount_percent',
            'average_rating',
            'review_count',
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
    gallery = serializers.SerializerMethodField()

    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + (
            'description',
            'ingredients',
            'how_to_use',
            'gallery',
            'created_at',
            'updated_at',
        )

    @extend_schema_field(list[str])
    def get_gallery(self, product):
        images = []
        if product.image:
            images.append(self.build_image_url(product.image.url))

        for product_image in product.gallery_images.all():
            images.append(self.build_image_url(product_image.image.url))

        return images

    def build_image_url(self, image_url):
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(image_url)
        return image_url


class ProductAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = (
            'id',
            'category',
            'name',
            'sku',
            'brand',
            'description',
            'ingredients',
            'how_to_use',
            'image',
            'regular_price',
            'price',
            'average_rating',
            'review_count',
            'stock',
            'status',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_sku(self, value):
        return value.strip().upper()
