from django.core.cache import cache

from catalog.models import Category, Product

CATEGORY_TREE_CACHE_KEY = 'catalog:active-category-tree:v1'
CATEGORY_TREE_CACHE_TIMEOUT = 60 * 60


class CategoryRecommendationService:
    def __init__(self, category_queryset=None):
        self.category_queryset = category_queryset or Category.objects.filter(is_active=True)

    def get_related_products(self, product, limit=4):
        category_ids = self.get_related_category_ids(product.category_id)
        return (
            Product.objects.filter(
                category_id__in=category_ids,
                status=Product.Status.ACTIVE,
                category__is_active=True,
            )
            .exclude(id=product.id)
            .select_related('category', 'category__parent')
            .order_by('name')[:limit]
        )

    def get_related_category_ids(self, category_id):
        child_map = self.build_child_map()
        root_id = self.find_root_category_id(category_id, child_map)
        return self.depth_first_category_ids(root_id, child_map)

    def build_child_map(self):
        cached_tree = cache.get(CATEGORY_TREE_CACHE_KEY)
        if cached_tree is not None:
            return cached_tree

        child_map = self.build_child_map_from_database()
        cache.set(CATEGORY_TREE_CACHE_KEY, child_map, CATEGORY_TREE_CACHE_TIMEOUT)
        return child_map

    def build_child_map_from_database(self):
        child_map = {}
        for category in self.category_queryset.only('id', 'parent_id'):
            child_map.setdefault(category.parent_id, []).append(category.id)
        return child_map

    def find_root_category_id(self, category_id, child_map):
        parent_by_child = self.build_parent_map(child_map)
        current_id = category_id
        while parent_by_child.get(current_id):
            current_id = parent_by_child[current_id]
        return current_id

    def build_parent_map(self, child_map):
        parent_by_child = {}
        for parent_id, child_ids in child_map.items():
            for child_id in child_ids:
                parent_by_child[child_id] = parent_id
        return parent_by_child

    def depth_first_category_ids(self, root_id, child_map):
        ordered_ids = []
        stack = [root_id]

        while stack:
            category_id = stack.pop()
            ordered_ids.append(category_id)
            children = child_map.get(category_id, [])
            stack.extend(reversed(children))

        return ordered_ids


def invalidate_category_tree_cache():
    cache.delete(CATEGORY_TREE_CACHE_KEY)
