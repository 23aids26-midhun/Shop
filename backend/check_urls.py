import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
django.setup()
from products.models import Product

for p in Product.objects.all().order_by('id'):
    print(f"{p.id:3d} | {p.name:35s} | {p.image_url}")
