from django.urls import path

from payments.views import PaymentInitiationView

app_name = 'payments'

urlpatterns = [
    path('initiate/', PaymentInitiationView.as_view(), name='payment-initiate'),
]
