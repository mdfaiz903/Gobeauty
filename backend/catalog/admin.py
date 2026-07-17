from django.contrib import admin

from catalog.models import Category, HomepageSlide, Product, ProductImage


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'parent', 'is_active', 'updated_at')
    list_filter = ('is_active', 'parent')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ('image', 'alt_text', 'sort_order', 'is_primary')


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'sku',
        'brand',
        'category',
        'regular_price',
        'price',
        'stock',
        'status',
        'has_image',
        'updated_at',
    )
    list_filter = ('status', 'category')
    search_fields = ('name', 'sku', 'brand', 'description')
    autocomplete_fields = ('category',)
    inlines = (ProductImageInline,)

    def has_image(self, product):
        return bool(product.image)

    has_image.boolean = True


@admin.register(HomepageSlide)
class HomepageSlideAdmin(admin.ModelAdmin):
    list_display = ('title', 'product', 'category_link', 'sort_order', 'is_active', 'updated_at')
    list_filter = ('is_active',)
    search_fields = ('title', 'subtitle', 'eyebrow', 'product__name')
    autocomplete_fields = ('product',)
