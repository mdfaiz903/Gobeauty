from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import Q

from orders.models import Order


class Payment(models.Model):
    class Provider(models.TextChoices):
        STRIPE = 'stripe', 'Stripe'
        BKASH = 'bkash', 'bKash'

    class Status(models.TextChoices):
        INITIATED = 'initiated', 'Initiated'
        PENDING = 'pending', 'Pending'
        SUCCEEDED = 'succeeded', 'Succeeded'
        FAILED = 'failed', 'Failed'
        CANCELED = 'canceled', 'Canceled'

    order = models.ForeignKey(
        Order,
        related_name='payments',
        on_delete=models.PROTECT,
    )
    provider = models.CharField(
        max_length=30,
        choices=Provider.choices,
        db_index=True,
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
    )
    transaction_id = models.CharField(max_length=180, blank=True, db_index=True)
    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.INITIATED,
        db_index=True,
    )
    raw_response = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['order', 'status'], name='payment_order_status_idx'),
            models.Index(fields=['provider', 'status'], name='payment_provider_status_idx'),
            models.Index(fields=['transaction_id'], name='payment_transaction_idx'),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['provider', 'transaction_id'],
                condition=~Q(transaction_id=''),
                name='unique_provider_transaction',
            ),
        ]

    def __str__(self):
        return f'{self.provider} payment for order #{self.order_id}'
