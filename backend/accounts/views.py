from drf_spectacular.utils import extend_schema
from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView

from accounts.serializers import (
    EmailTokenObtainPairSerializer,
    UserRegistrationSerializer,
    UserSerializer,
)


class RegisterView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = (permissions.AllowAny,)

    @extend_schema(
        tags=['Auth'],
        summary='Register a customer account',
        description='Creates a customer user with unique email login credentials.',
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer

    @extend_schema(
        tags=['Auth'],
        summary='Login with email and password',
        description='Returns JWT access and refresh tokens plus the authenticated user profile.',
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class CurrentUserView(generics.RetrieveAPIView):
    serializer_class = UserSerializer

    @extend_schema(
        tags=['Auth'],
        summary='Get current user',
        description='Returns the authenticated user profile from the JWT bearer token.',
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_object(self):
        return self.request.user
