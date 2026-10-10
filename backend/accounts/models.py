from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model — extends Django's AbstractUser (so it keeps the
    "default id" auto-increment primary key, is_staff/is_superuser flags
    used for admin authorization, password hashing, etc.) with e-commerce
    shipping fields.
    """
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, blank=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username


class Address(models.Model):
    """
    A saved shipping address, the way Amazon/Flipkart let you keep several
    addresses (Home, Work, ...) and pick one at checkout instead of typing
    it every time. Scoped to its owner everywhere it's used.
    """
    LABEL_CHOICES = (
        ('home', 'Home'),
        ('work', 'Work'),
        ('other', 'Other'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    label = models.CharField(max_length=10, choices=LABEL_CHOICES, default='home')
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    line1 = models.CharField(max_length=255)
    line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100, default='India')
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_default', '-created_at']

    def __str__(self):
        return f'{self.full_name} — {self.city} ({self.get_label_display()})'

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Only one address per user can be the default - demoting the
        # others here means the API never has to coordinate this itself.
        if self.is_default:
            Address.objects.filter(user=self.user).exclude(id=self.id).update(is_default=False)
