from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from accounts.views import CurrentUserView, EmailTokenObtainPairView, RegisterView

app_name = 'accounts'

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', EmailTokenObtainPairView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('me/', CurrentUserView.as_view(), name='me'),
]
