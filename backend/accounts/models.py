from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    def normalize_email_address(self, email):
        return self.normalize_email(email).lower()

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must provide an email address.')
        user = self.model(
            email=self.normalize_email_address(email),
            **extra_fields,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', User.Role.ADMIN)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superusers must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superusers must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        CUSTOMER = 'customer', 'Customer'
        ADMIN = 'admin', 'Admin'

    email = models.EmailField(unique=True, db_index=True)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CUSTOMER,
        db_index=True,
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        ordering = ['email']
        indexes = [
            models.Index(fields=['email'], name='accounts_user_email_idx'),
        ]

    def __str__(self):
        return self.email

    def save(self, *args, **kwargs):
        if self.is_superuser or self.is_staff:
            self.role = self.Role.ADMIN
        super().save(*args, **kwargs)

    @property
    def full_name(self):
        return f'{self.first_name} {self.last_name}'.strip()

    @property
    def is_admin_role(self):
        return self.role == self.Role.ADMIN
