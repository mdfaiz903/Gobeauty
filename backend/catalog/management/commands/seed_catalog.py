from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from catalog.models import Category, HomepageSlide, Product


class Command(BaseCommand):
    help = 'Seed admin user, category hierarchy, and sample beauty products.'

    def add_arguments(self, parser):
        parser.add_argument('--admin-email', default='admin@gobeauty.test')
        parser.add_argument('--admin-password', default='AdminPass123!')

    @transaction.atomic
    def handle(self, *args, **options):
        self.create_admin_user(options['admin_email'], options['admin_password'])
        categories = self.create_categories()
        products = self.create_products(categories)
        self.create_homepage_slides(categories, products)
        self.stdout.write(self.style.SUCCESS('Seed data is ready.'))

    def create_admin_user(self, email, password):
        user_model = get_user_model()
        user, created = user_model.objects.get_or_create(
            email=email.lower(),
            defaults={
                'is_staff': True,
                'is_superuser': True,
                'role': user_model.Role.ADMIN,
            },
        )
        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(f'Created admin user: {email}')
            return user

        self.stdout.write(f'Admin user already exists: {email}')
        return user

    def create_categories(self):
        category_tree = {
            'skincare': ('Skincare', None),
            'cleanser': ('Cleanser', 'skincare'),
            'toner': ('Toner', 'skincare'),
            'serum': ('Serum', 'skincare'),
            'moisturizer': ('Moisturizer', 'skincare'),
            'sunscreen': ('Sunscreen', 'skincare'),
            'makeup': ('Makeup', None),
            'foundation': ('Foundation', 'makeup'),
            'lip-color': ('Lip Color', 'makeup'),
            'eye-makeup': ('Eye Makeup', 'makeup'),
            'tools': ('Tools', 'makeup'),
            'hair-body': ('Hair & Body', None),
            'hair-care': ('Hair Care', 'hair-body'),
            'body-lotion': ('Body Lotion', 'hair-body'),
            'body-mist': ('Body Mist', 'hair-body'),
            'hand-cream': ('Hand Cream', 'hair-body'),
        }
        categories = {}

        for slug, (name, parent_slug) in category_tree.items():
            parent = categories.get(parent_slug)
            category, _ = Category.objects.update_or_create(
                slug=slug,
                defaults={
                    'name': name,
                    'parent': parent,
                    'is_active': True,
                },
            )
            categories[slug] = category

        return categories

    def create_products(self, categories):
        products = {}
        for product_data in self.product_seed_data(categories):
            product, _ = Product.objects.update_or_create(
                sku=product_data['sku'],
                defaults=product_data,
            )
            products[product.sku] = product
        return products

    def create_homepage_slides(self, categories, products):
        slide_data = [
            {
                'title': 'Go Beauty Bangladesh',
                'eyebrow': 'Authentic beauty, delivered across Bangladesh',
                'subtitle': 'Curated skincare, makeup, and personal care at Gobeauty.bd.',
                'product': products.get('GBD-SUN-001'),
                'primary_label': 'Shop products',
                'secondary_label': 'Track order',
                'category_link': '',
                'sort_order': 1,
            },
            {
                'title': 'Sunscreen, serum, and barrier care',
                'eyebrow': 'Daily skincare essentials',
                'subtitle': 'Find humidity-friendly picks with backend-verified stock and current prices.',
                'product': products.get('GBD-SER-001'),
                'primary_label': 'Shop skincare',
                'secondary_label': 'See categories',
                'category_link': categories['skincare'].name,
                'sort_order': 2,
            },
            {
                'title': 'Soft color, easy checkout',
                'eyebrow': 'Makeup for every day',
                'subtitle': 'Browse makeup favorites and pay with bKash, card, or cash on delivery.',
                'product': products.get('GBD-LIP-001'),
                'primary_label': 'Shop makeup',
                'secondary_label': 'My account',
                'category_link': categories['makeup'].name,
                'sort_order': 3,
            },
        ]

        for slide in slide_data:
            HomepageSlide.objects.update_or_create(
                title=slide['title'],
                defaults={
                    **slide,
                    'is_active': True,
                },
            )

    def product_seed_data(self, categories):
        return [
            {
                'category': categories['sunscreen'],
                'name': 'Glow Guard SPF 50 PA++++',
                'sku': 'GBD-SUN-001',
                'brand': 'Go Beauty Lab',
                'description': 'Lightweight daily sunscreen with a soft no-white-cast finish.',
                'ingredients': 'Centella extract, hyaluronic acid, vitamin E, and UV filters.',
                'how_to_use': 'Apply as the last step of morning skincare. Reapply every 2-3 hours during sun exposure.',
                'regular_price': Decimal('1750.00'),
                'price': Decimal('1450.00'),
                'average_rating': Decimal('4.70'),
                'review_count': 31,
                'stock': 34,
                'status': Product.Status.ACTIVE,
            },
            {
                'category': categories['moisturizer'],
                'name': 'Rice Ceramide Barrier Cream',
                'sku': 'GBD-MOI-001',
                'brand': 'Rice Ritual',
                'description': 'Rich moisturizer for dry and sensitive skin barrier support.',
                'ingredients': 'Rice extract, ceramide NP, panthenol, and shea butter.',
                'how_to_use': 'Massage a small amount onto clean skin morning and night.',
                'regular_price': Decimal('2150.00'),
                'price': Decimal('1890.00'),
                'average_rating': Decimal('4.60'),
                'review_count': 18,
                'stock': 21,
                'status': Product.Status.ACTIVE,
            },
            {
                'category': categories['serum'],
                'name': 'Niacinamide 10% Clarity Serum',
                'sku': 'GBD-SER-001',
                'brand': 'Clear Theory',
                'description': 'Everyday serum for pores, oil balance, and uneven tone.',
                'ingredients': 'Niacinamide, zinc PCA, green tea extract, and allantoin.',
                'how_to_use': 'Apply 2-3 drops before moisturizer. Use sunscreen in the morning.',
                'regular_price': Decimal('1500.00'),
                'price': Decimal('1320.00'),
                'average_rating': Decimal('4.80'),
                'review_count': 42,
                'stock': 48,
                'status': Product.Status.ACTIVE,
            },
            {
                'category': categories['cleanser'],
                'name': 'Fresh Rose Cleansing Gel',
                'sku': 'GBD-CLE-001',
                'brand': 'Fresh Bloom',
                'description': 'Gentle gel cleanser for sweat, sunscreen, and daily buildup.',
                'ingredients': 'Rose water, amino-acid surfactants, glycerin, and aloe vera.',
                'how_to_use': 'Massage onto damp skin for 30 seconds and rinse well.',
                'regular_price': Decimal('1050.00'),
                'price': Decimal('890.00'),
                'average_rating': Decimal('4.40'),
                'review_count': 15,
                'stock': 0,
                'status': Product.Status.INACTIVE,
            },
            {
                'category': categories['lip-color'],
                'name': 'Velvet Matte Lip Tint',
                'sku': 'GBD-LIP-001',
                'brand': 'Tint House',
                'description': 'Soft blur lip color with comfortable pigment and long wear.',
                'ingredients': 'Dimethicone, vitamin E, iron oxides, and soft-focus powder.',
                'how_to_use': 'Apply from the center of lips and blend outward.',
                'regular_price': Decimal('1200.00'),
                'price': Decimal('980.00'),
                'average_rating': Decimal('4.50'),
                'review_count': 27,
                'stock': 39,
                'status': Product.Status.ACTIVE,
            },
            {
                'category': categories['hair-care'],
                'name': 'Keratin Repair Hair Mask',
                'sku': 'GBD-HAI-001',
                'brand': 'Hair Ritual',
                'description': 'Weekly treatment for dry, heat-styled, or colored hair.',
                'ingredients': 'Hydrolyzed keratin, argan oil, amino acids, and panthenol.',
                'how_to_use': 'Apply after shampoo, leave for 5-10 minutes, then rinse.',
                'regular_price': Decimal('1900.00'),
                'price': Decimal('1680.00'),
                'average_rating': Decimal('4.60'),
                'review_count': 22,
                'stock': 18,
                'status': Product.Status.ACTIVE,
            },
        ]
