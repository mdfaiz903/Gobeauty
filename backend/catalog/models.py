from django.db import models


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
