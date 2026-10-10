import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ecommerce_backend.settings')
django.setup()
from products.models import Product

local_updates = {
    'Ethnic Kurti Set': '/images/products/ethnic-kurti-set.jpg',
    'Wooden Chopping Board': '/images/products/wooden-chopping-board.jpg',
    'Silicone Spatula Set (5pc)': '/images/products/silicone-spatula-set.jpg',
    'Ceramic Flower Vase Set': '/images/products/ceramic-flower-vase-set.jpg',
    'Wall Art Canvas Set (3pc)': '/images/products/wall-art-canvas-set.jpg',
    'Smart Watch': '/images/products/smart-watch.jpg',
    'Bluetooth Earbuds': '/images/products/bluetooth-earbuds.jpg',
    'LED Desk Lamp': '/images/products/led-desk-lamp.jpg',
    'Table Lamp': '/images/products/led-desk-lamp.jpg',
    'Citrus Cologne Spray': '/images/products/citrus-cologne.jpg',
    'Calvin Klein CK One': '/images/products/citrus-cologne.jpg',
    'Protein Powder': '/images/products/protein-powder.jpg',
    'Potatoes': '/images/products/potatoes.jpg',
    'Kiwi': '/images/products/kiwi.jpg',
    'Mulberry': '/images/products/mulberry.jpg',
    'Green Bell Pepper': '/images/products/green-bell-pepper.jpg',
    'Fish Steak': '/images/products/fish-steak.jpg',
    'Bamboo Spatula': '/images/products/bamboo-spatula.jpg',
    'Family Tree Photo Frame': '/images/products/family-tree-photo-frame.jpg',
}

for name, url in local_updates.items():
    cnt = Product.objects.filter(name=name).update(image_url=url)
    print(f"Updated {cnt} product(s) for '{name}' -> {url}")
