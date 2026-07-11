from django.urls import path

from orders.views import OrderDetailView, OrderListCreateView

app_name = 'orders'

urlpatterns = [
    path('orders/', OrderListCreateView.as_view(), name='order-list-create'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
]
