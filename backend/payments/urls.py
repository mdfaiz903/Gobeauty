from django.urls import path

from payments.views import PaymentInitiationView, StripeWebhookView

app_name = 'payments'

urlpatterns = [
    path('initiate/', PaymentInitiationView.as_view(), name='payment-initiate'),
    path('stripe/webhook/', StripeWebhookView.as_view(), name='stripe-webhook'),
]
