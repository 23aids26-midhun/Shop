from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Address


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Shipping info', {'fields': ('phone', 'address', 'city', 'postal_code', 'country')}),
    )
    list_display = ('username', 'email', 'is_staff', 'is_active')


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'user', 'label', 'city', 'is_default')
    list_filter = ('label', 'is_default')
    search_fields = ('full_name', 'user__username', 'city')
