from django.urls import path

from payments.views import (
    BkashExecutePaymentView,
    BkashQueryPaymentView,
    PaymentInitiationView,
    StripeWebhookView,
)

app_name = 'payments'

urlpatterns = [
    path('initiate/', PaymentInitiationView.as_view(), name='payment-initiate'),
    path('stripe/webhook/', StripeWebhookView.as_view(), name='stripe-webhook'),
    path('bkash/execute/', BkashExecutePaymentView.as_view(), name='bkash-execute'),
    path('bkash/query/', BkashQueryPaymentView.as_view(), name='bkash-query'),
]
