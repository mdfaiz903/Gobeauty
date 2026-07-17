from django.db import models
from django.core.validators import MinValueValidator


class Category(models.Model):
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140, unique=True)
    parent = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        related_name='children',
        on_delete=models.PROTECT,
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name_plural = 'categories'
        indexes = [
            models.Index(fields=['parent', 'is_active'], name='category_parent_active_idx'),
            models.Index(fields=['slug'], name='category_slug_idx'),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['parent', 'name'],
                name='unique_category_name_per_parent',
            ),
        ]

    def __str__(self):
        return self.name

    @property
    def is_root(self):
        return self.parent_id is None


class Product(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'active', 'Active'
        INACTIVE = 'inactive', 'Inactive'

    category = models.ForeignKey(
        Category,
        related_name='products',
        on_delete=models.PROTECT,
    )
    name = models.CharField(max_length=180)
    sku = models.CharField(max_length=80, unique=True)
    brand = models.CharField(max_length=120, blank=True)
    description = models.TextField(blank=True)
    ingredients = models.TextField(blank=True)
    how_to_use = models.TextField(blank=True)
    image = models.ImageField(upload_to='products/', blank=True)
    regular_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
    )
    price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    average_rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)],
    )
    review_count = models.PositiveIntegerField(default=0)
    stock = models.PositiveIntegerField(default=0)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['sku'], name='product_sku_idx'),
            models.Index(fields=['category', 'status'], name='product_category_status_idx'),
            models.Index(fields=['status', 'stock'], name='product_status_stock_idx'),
        ]

    def __str__(self):
        return self.name

    @property
    def is_active(self):
        return self.status == self.Status.ACTIVE

    @property
    def discount_percent(self):
        if not self.regular_price or self.regular_price <= self.price:
            return 0

        discount = ((self.regular_price - self.price) / self.regular_price) * 100
        return round(discount)


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product,
        related_name='gallery_images',
        on_delete=models.CASCADE,
    )
    image = models.ImageField(upload_to='products/gallery/')
    alt_text = models.CharField(max_length=180, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['sort_order', 'id']
        indexes = [
            models.Index(fields=['product', 'sort_order'], name='product_image_order_idx'),
        ]

    def __str__(self):
        return self.alt_text or self.product.name


class HomepageSlide(models.Model):
    title = models.CharField(max_length=180)
    subtitle = models.CharField(max_length=220, blank=True)
    eyebrow = models.CharField(max_length=140, blank=True)
    image = models.ImageField(upload_to='home/slides/', blank=True)
    product = models.ForeignKey(
        Product,
        null=True,
        blank=True,
        related_name='homepage_slides',
        on_delete=models.SET_NULL,
    )
    primary_label = models.CharField(max_length=40, default='Shop now')
    secondary_label = models.CharField(max_length=40, blank=True)
    category_link = models.CharField(max_length=120, blank=True)
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['sort_order', 'id']
        indexes = [
            models.Index(fields=['is_active', 'sort_order'], name='home_slide_active_order_idx'),
        ]

    def __str__(self):
        return self.title
