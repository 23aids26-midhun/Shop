import os, django, urllib.request
from urllib.parse import urlparse

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
django.setup()
from products.models import Product, Category

products_dir = r"m:\shop\shopsphere\frontend\public\images\products"
os.makedirs(products_dir, exist_ok=True)

# Update products
products = Product.objects.filter(image_url__startswith='https://images.unsplash.com')
for p in products:
    filename = p.slug + ".jpg"
    local_path = os.path.join(products_dir, filename)
    url = p.image_url
    
    if not os.path.exists(local_path):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            data = urllib.request.urlopen(req, timeout=10).read()
            with open(local_path, "wb") as f:
                f.write(data)
            print(f"Downloaded {filename}")
        except Exception as e:
            print(f"Failed {filename}: {e}")
            continue
    else:
        print(f"Already exists {filename}")

    p.image_url = f"/images/products/{filename}"
    p.save(update_fields=['image_url'])

print("Done updating product images.")
