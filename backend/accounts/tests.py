from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.test import RequestFactory, TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.permissions import IsAdminRole, IsAdminRoleOrReadOnly


class UserManagerTests(TestCase):
    def test_create_user_normalizes_email_and_hashes_password(self):
        user = get_user_model().objects.create_user(
            email='USER@Example.COM',
            password='StrongPass123!',
        )

        self.assertEqual(user.email, 'user@example.com')
        self.assertTrue(user.check_password('StrongPass123!'))
        self.assertEqual(user.role, get_user_model().Role.CUSTOMER)

    def test_create_user_requires_email(self):
        with self.assertRaises(ValueError):
            get_user_model().objects.create_user(
                email='',
                password='StrongPass123!',
            )

    def test_create_superuser_gets_admin_role(self):
        user = get_user_model().objects.create_superuser(
            email='admin@example.com',
            password='StrongPass123!',
        )

        self.assertTrue(user.is_staff)
        self.assertTrue(user.is_superuser)
        self.assertEqual(user.role, get_user_model().Role.ADMIN)


class AuthApiTests(APITestCase):
    def test_register_creates_user(self):
        response = self.client.post(
            reverse('accounts:register'),
            {
                'email': 'SHOPPER@Example.COM',
                'first_name': 'Beauty',
                'last_name': 'Shopper',
                'password': 'StrongPass123!',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['email'], 'shopper@example.com')
        self.assertNotIn('password', response.data)

    def test_login_returns_tokens_and_user(self):
        get_user_model().objects.create_user(
            email='shopper@example.com',
            password='StrongPass123!',
        )

        response = self.client.post(
            reverse('accounts:login'),
            {
                'email': 'SHOPPER@Example.COM',
                'password': 'StrongPass123!',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['email'], 'shopper@example.com')

    def test_refresh_returns_access_token(self):
        get_user_model().objects.create_user(
            email='shopper@example.com',
            password='StrongPass123!',
        )
        login_response = self.client.post(
            reverse('accounts:login'),
            {
                'email': 'shopper@example.com',
                'password': 'StrongPass123!',
            },
            format='json',
        )

        response = self.client.post(
            reverse('accounts:refresh'),
            {'refresh': login_response.data['refresh']},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_me_returns_authenticated_user(self):
        user = get_user_model().objects.create_user(
            email='shopper@example.com',
            password='StrongPass123!',
            first_name='Beauty',
        )
        self.client.force_authenticate(user=user)

        response = self.client.get(reverse('accounts:me'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'shopper@example.com')
        self.assertEqual(response.data['first_name'], 'Beauty')


class PermissionTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()

    def make_request(self, method, user):
        request = getattr(self.factory, method)('/protected/')
        request.user = user
        return request

    def test_admin_role_allows_mutation(self):
        user = get_user_model().objects.create_user(
            email='admin@example.com',
            password='StrongPass123!',
            role=get_user_model().Role.ADMIN,
        )
        request = self.make_request('post', user)

        self.assertTrue(IsAdminRole().has_permission(request, None))
        self.assertTrue(IsAdminRoleOrReadOnly().has_permission(request, None))

    def test_customer_role_denies_mutation(self):
        user = get_user_model().objects.create_user(
            email='customer@example.com',
            password='StrongPass123!',
        )
        request = self.make_request('post', user)

        self.assertFalse(IsAdminRole().has_permission(request, None))
        self.assertFalse(IsAdminRoleOrReadOnly().has_permission(request, None))

    def test_read_only_permission_allows_anonymous_safe_methods(self):
        request = self.make_request('get', AnonymousUser())

        self.assertTrue(IsAdminRoleOrReadOnly().has_permission(request, None))
