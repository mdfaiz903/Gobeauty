from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from catalog.models import Category, Product


class Command(BaseCommand):
    help = 'Seed admin user, category hierarchy, and sample beauty products.'

    def add_arguments(self, parser):
        parser.add_argument('--admin-email', default='admin@gobeauty.test')
        parser.add_argument('--admin-password', default='AdminPass123!')

    @transaction.atomic
    def handle(self, *args, **options):
        self.create_admin_user(options['admin_email'], options['admin_password'])
        categories = self.create_categories()
        self.create_products(categories)
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
        for product_data in self.product_seed_data(categories):
            Product.objects.update_or_create(
                sku=product_data['sku'],
                defaults=product_data,
            )

    def product_seed_data(self, categories):
        return [
            {
                'category': categories['sunscreen'],
                'name': 'Glow Guard SPF 50 PA++++',
                'sku': 'GBD-SUN-001',
                'description': 'Lightweight daily sunscreen with a soft no-white-cast finish.',
                'price': Decimal('1450.00'),
                'stock': 34,
                'status': Product.Status.ACTIVE,
            },
            {
                'category': categories['moisturizer'],
                'name': 'Rice Ceramide Barrier Cream',
                'sku': 'GBD-MOI-001',
                'description': 'Rich moisturizer for dry and sensitive skin barrier support.',
                'price': Decimal('1890.00'),
                'stock': 21,
                'status': Product.Status.ACTIVE,
            },
            {
                'category': categories['serum'],
                'name': 'Niacinamide 10% Clarity Serum',
                'sku': 'GBD-SER-001',
                'description': 'Everyday serum for pores, oil balance, and uneven tone.',
                'price': Decimal('1320.00'),
                'stock': 48,
                'status': Product.Status.ACTIVE,
            },
            {
                'category': categories['cleanser'],
                'name': 'Fresh Rose Cleansing Gel',
                'sku': 'GBD-CLE-001',
                'description': 'Gentle gel cleanser for sweat, sunscreen, and daily buildup.',
                'price': Decimal('890.00'),
                'stock': 0,
                'status': Product.Status.INACTIVE,
            },
            {
                'category': categories['lip-color'],
                'name': 'Velvet Matte Lip Tint',
                'sku': 'GBD-LIP-001',
                'description': 'Soft blur lip color with comfortable pigment and long wear.',
                'price': Decimal('980.00'),
                'stock': 39,
                'status': Product.Status.ACTIVE,
            },
            {
                'category': categories['hair-care'],
                'name': 'Keratin Repair Hair Mask',
                'sku': 'GBD-HAI-001',
                'description': 'Weekly treatment for dry, heat-styled, or colored hair.',
                'price': Decimal('1680.00'),
                'stock': 18,
                'status': Product.Status.ACTIVE,
            },
        ]
