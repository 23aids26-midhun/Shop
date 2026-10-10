import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
django.setup()
from products.models import Product

for p in Product.objects.all().order_by('id'):
    cat = p.category.name if p.category else 'None'
    print(f"{p.id:3d} | {cat:22s} | {p.name}")
