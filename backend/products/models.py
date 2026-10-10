from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=110, unique=True)

    class Meta:
        verbose_name_plural = 'categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Product(models.Model):
    category = models.ForeignKey(Category, related_name='products', on_delete=models.CASCADE)
    name = models.CharField(max_length=150)
    slug = models.SlugField(max_length=160, unique=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    mrp = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text='Original "Maximum Retail Price" shown struck through, like on Amazon/Flipkart. '
                   'Leave blank if this product has no discount.',
    )
    stock = models.PositiveIntegerField(default=0)
    image_url = models.URLField(blank=True)
    rating = models.DecimalField(max_digits=2, decimal_places=1, default=0)
    rating_count = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def in_stock(self):
        return self.stock > 0

    @property
    def discount_percent(self):
        if self.mrp and self.mrp > self.price:
            return round((1 - (self.price / self.mrp)) * 100)
        return 0
