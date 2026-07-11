from django.db import transaction
from rest_framework.exceptions import ValidationError

from catalog.models import Product
from orders.models import Order, OrderItem


class OrderCreationService:
    def __init__(self, user):
        self.user = user

    @transaction.atomic
    def create_order(self, cart_items):
        products = self.get_products_by_id(cart_items)
        order_items = self.build_order_items(cart_items, products)
        order = Order.objects.create(
            user=self.user,
            total_amount=self.calculate_total(order_items),
        )
        self.save_order_items(order, order_items)
        return order

    def get_products_by_id(self, cart_items):
        product_ids = [item['product_id'] for item in cart_items]
        products = Product.objects.in_bulk(product_ids)
        missing_ids = set(product_ids) - set(products.keys())
        if missing_ids:
            raise ValidationError({'items': f'Products not found: {sorted(missing_ids)}'})
        return products

    def build_order_items(self, cart_items, products):
        return [
            self.build_order_item_data(products[item['product_id']], item['quantity'])
            for item in cart_items
        ]

    def build_order_item_data(self, product, quantity):
        if product.status != Product.Status.ACTIVE:
            raise ValidationError({'items': f'Product is inactive: {product.sku}'})

        subtotal = product.price * quantity
        return {
            'product': product,
            'quantity': quantity,
            'price': product.price,
            'subtotal': subtotal,
        }

    def calculate_total(self, order_items):
        return sum(item['subtotal'] for item in order_items)

    def save_order_items(self, order, order_items):
        OrderItem.objects.bulk_create(
            OrderItem(order=order, **item)
            for item in order_items
        )
