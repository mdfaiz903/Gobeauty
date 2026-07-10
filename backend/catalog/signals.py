from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from catalog.models import Category
from recommendations.services import invalidate_category_tree_cache


@receiver(post_delete, sender=Category)
@receiver(post_save, sender=Category)
def clear_category_tree_cache(sender, **kwargs):
    invalidate_category_tree_cache()
