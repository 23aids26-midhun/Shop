"""
Seeds the store with realistic sample products across every category,
each with a price, an MRP (so the UI can show a struck-through "was"
price and a discount %), a rating and a rating_count - the way
Amazon/Flipkart product cards actually look.

Every product gets a real photograph from Unsplash (stable, hotlink-safe
URLs). ProductImage/CategoryStrip still fall back to an illustrated tile
if an image ever fails to load for any reason (e.g. no internet), so a
broken-image icon should never be possible.

Safe to re-run: existing products (matched by name) always get their
image_url updated to the correct photo - so running this again on an
existing database fixes any product that has a wrong or missing picture.

    python manage.py seed
"""

from django.core.management.base import BaseCommand
from django.utils.text import slugify
from products.models import Category, Product


# Helper – Unsplash image with crop parameters
def _u(photo_id, w=600, h=600):
    return f'https://images.unsplash.com/{photo_id}?w={w}&h={h}&fit=crop&auto=format&q=80'


# (name, price, mrp_or_None, stock, rating, rating_count, description, image_url)
SAMPLE_DATA = {
    'Electronics': [
        ('Wireless Mouse', 499, 999, 40, 4.3, 2184,
         'Ergonomic 2.4GHz wireless mouse with silent clicks and a 1600 DPI sensor.',
         _u('photo-1527864550417-7fd91fc51a46')),
        ('Mechanical Keyboard', 2499, 3999, 15, 4.6, 876,
         'Hot-swappable RGB mechanical keyboard with tactile blue switches.',
         _u('photo-1595225476474-87563907a212')),
        ('USB-C Hub (7-in-1)', 1299, 1999, 25, 4.1, 1532,
         'HDMI 4K, 2x USB-A, SD/microSD card reader, Ethernet, 100W USB-C PD passthrough.',
         _u('photo-1625842268584-8f3296236761')),
        ('Bluetooth Earbuds', 1799, 3499, 30, 4.4, 9043,
         'Active noise cancellation, 24-hour battery life with the charging case, IPX5 rated.',
         _u('photo-1590658268037-6bf12f032f55')),
        ('Power Bank 20000mAh', 1599, 2299, 28, 4.5, 5120,
         '22.5W fast-charging power bank with dual USB output and USB-C input.',
         _u('photo-1609091839311-d5365f9ff1c5')),
        ('Smart Watch', 3499, 6999, 12, 4.2, 3310,
         'Heart-rate, SpO2 and sleep tracking with a 7-day battery and AMOLED display.',
         _u('photo-1546868871-af0de0ae72be')),
    ],
    'Books': [
        ('Clean Code', 599, None, 20, 4.7, 412,
         'A handbook of agile software craftsmanship.',
         _u('photo-1532012197267-da84d127e765')),
        ('Atomic Habits', 399, 699, 35, 4.8, 18650,
         'Tiny changes, remarkable results.',
         _u('photo-1544947950-fa07a98d237f')),
        ('The Pragmatic Programmer', 649, 899, 12, 4.6, 701,
         '20th anniversary edition.',
         _u('photo-1589998059171-988d887df646')),
        ('Deep Work', 449, 599, 18, 4.5, 2290,
         'Rules for focused success in a distracted world.',
         _u('photo-1512820790803-83ca734da794')),
    ],
    'Home & Kitchen': [
        ('Stainless Steel Water Bottle', 349, 599, 50, 4.2, 6340,
         '1-litre double-wall insulated bottle, keeps drinks cold for 24 hours.',
         _u('photo-1602143407151-7111542de6e8')),
        ('Non-stick Frying Pan', 899, 1499, 18, 4.0, 1875,
         '28cm, induction compatible, 2-year warranty.',
         _u('photo-1585515320310-259814833e62')),
        ('LED Desk Lamp', 799, 1299, 22, 4.3, 964,
         'Adjustable brightness and colour temperature, USB rechargeable.',
         _u('photo-1507473885765-e6ed057ab6fe')),
        ('Electric Kettle', 1099, 1799, 26, 4.4, 4205,
         '1.5L stainless steel kettle with auto shut-off.',
         _u('photo-1556228578-0d85b1a4d571')),
        ('Ceramic Mug Set', 549, None, 40, 4.1, 532,
         'Set of 4 glazed 350ml coffee mugs, microwave safe.',
         _u('photo-1514228742587-6b1558fcca3d')),
    ],
    'Fashion': [
        ('Cotton T-Shirt', 449, 999, 60, 4.1, 2860,
         'Regular fit, breathable cotton, machine washable.',
         _u('photo-1521572163474-6864f9cf17ab')),
        ('Canvas Backpack', 1499, 2499, 20, 4.5, 1120,
         '15-inch laptop compartment, water-resistant canvas.',
         _u('photo-1553062407-98eeb64c6a62')),
        ('Leather Wallet', 699, 1199, 0, 4.4, 845,
         'Slim bifold wallet in genuine leather.',
         _u('photo-1627123424574-724758594e93')),
        ('Running Shoes', 2799, 4999, 16, 4.6, 7430,
         'Lightweight breathable mesh upper, cushioned sole.',
         _u('photo-1542291026-7eec264c27ff')),
        ('Denim Jacket', 1899, 2999, 14, 4.3, 390,
         'Classic fit washed denim jacket.',
         _u('photo-1576995853123-5a10305d93c0')),
    ],
    'beauty': [
        ('Vitamin C Face Serum', 599, 999, 45, 4.4, 6210,
         '20% Vitamin C + Hyaluronic Acid for brighter skin.',
         _u('photo-1620916566398-39f1143ab7be')),
        ('Matte Lipstick Set (4pc)', 799, 1299, 30, 4.3, 2140,
         'Long-stay matte finish, 4 everyday shades.',
         _u('photo-1586495777744-4413f21062fa')),
        ('Argan Hair Oil', 399, 699, 50, 4.5, 3985,
         'Cold-pressed argan oil for frizz-free, shiny hair.',
         _u('photo-1608248543803-ba4f8c70ae0b')),
        ('Charcoal Face Wash', 249, 399, 60, 4.2, 5410,
         'Deep-cleansing activated charcoal face wash, 150ml.',
         _u('photo-1556228720-195a672e8a03')),
    ],
    'fragrances': [
        ('Eau de Parfum - Oud Noir', 1499, 2499, 20, 4.5, 1340,
         'Rich oud and amber, 100ml long-lasting EDP.',
         _u('photo-1541643600914-78b084683601')),
        ('Citrus Cologne Spray', 899, 1499, 25, 4.2, 920,
         'Fresh citrus and bergamot, 100ml, everyday wear.',
         _u('photo-1594035910387-fea081ae7180')),
        ('Rose Attar 12ml', 599, None, 35, 4.6, 540,
         'Alcohol-free concentrated rose attar.',
         _u('photo-1588405748880-12d1d2a59f75')),
        ('Travel Perfume Set (3x20ml)', 1199, 1899, 18, 4.3, 610,
         'Three signature scents in travel-friendly bottles.',
         _u('photo-1592945403244-b3fbafd7f539')),
    ],
    'furniture': [
        ('3-Seater Fabric Sofa', 24999, 34999, 6, 4.3, 312,
         'Solid wood frame, high-density foam cushions.',
         _u('photo-1555041469-a586c61ea9bc')),
        ('Study Table with Drawer', 3499, 5499, 14, 4.2, 480,
         'Engineered wood desk with a storage drawer.',
         _u('photo-1518455027359-f3f8164ba6bd')),
        ('Wooden Bookshelf (5-Tier)', 2799, 3999, 16, 4.4, 265,
         'Open-shelf bookcase, easy tool-free assembly.',
         _u('photo-1594620302200-9a762244a156')),
        ('Ergonomic Office Chair', 5999, 8999, 10, 4.5, 1120,
         'Adjustable height, lumbar support, mesh back.',
         _u('photo-1580480055273-228ff5388ef8')),
    ],
    'groceries': [
        ('Organic Basmati Rice 5kg', 599, 799, 80, 4.5, 2410,
         'Aged long-grain basmati, naturally aromatic.',
         _u('photo-1586201375761-83865001e31c')),
        ('Cold-Pressed Groundnut Oil 1L', 249, 349, 70, 4.3, 1680,
         'Chemical-free, traditionally extracted.',
         _u('photo-1474979266404-7eaacbcd87c5')),
        ('Mixed Dry Fruits 500g', 449, 699, 45, 4.6, 1990,
         'Almonds, cashews, raisins and pistachios.',
         _u('photo-1599599810694-b5b37304c041')),
        ('Assam Tea Leaves 500g', 199, 299, 90, 4.4, 3120,
         'Strong, malty everyday chai blend.',
         _u('photo-1564890369478-c89ca6d9cde9')),
    ],
    'home-decoration': [
        ('Macrame Wall Hanging', 699, 1199, 24, 4.4, 410,
         'Handwoven cotton macrame, 60cm, boho style.',
         _u('photo-1615529151169-7b1ff50dc7f2')),
        ('Fairy String Lights (10m)', 349, 599, 60, 4.2, 2860,
         'Warm white LED string lights, USB powered.',
         _u('photo-1513836279014-a89f7a76ae86')),
        ('Ceramic Flower Vase Set', 799, 1299, 20, 4.3, 530,
         'Set of 2 minimalist ceramic vases.',
         _u('photo-1581783898377-1c85bf937427')),
        ('Wall Art Canvas Set (3pc)', 1299, 1999, 16, 4.5, 690,
         'Abstract 3-panel canvas print, ready to hang.',
         _u('photo-1513519245088-0e12902e35ca')),
    ],
    'kitchen-accessories': [
        ('Stainless Steel Knife Set', 899, 1499, 30, 4.4, 1760,
         '6-piece kitchen knife set with wooden block.',
         _u('photo-1593618998160-e34014e67546')),
        ('Silicone Spatula Set (5pc)', 349, 599, 55, 4.3, 1420,
         'Heat-resistant, non-stick safe silicone tools.',
         _u('photo-1556909114-44e3e70034e2')),
        ('Glass Food Storage (6pc)', 999, 1599, 28, 4.5, 2040,
         'Airtight borosilicate glass containers with lids.',
         _u('photo-1584568694244-14fbdf83bd30')),
        ('Wooden Chopping Board', 449, 699, 40, 4.2, 980,
         'Solid acacia wood, reversible, juice groove.',
         _u('photo-1594226801341-41427b4e5c22')),
    ],
    "Women's Fashion": [
        ('Floral Wrap Dress', 1299, 2199, 22, 4.4, 1340,
         'A-line wrap dress in breathable rayon fabric.',
         _u('photo-1572804013309-59a88b7e92f1')),
        ('High-Waist Denim Jeans', 1599, 2599, 25, 4.3, 2210,
         'Stretchable slim-fit high-waist denim.',
         _u('photo-1541099649105-f69ad21f3246')),
        ('Ethnic Kurti Set', 999, 1699, 30, 4.5, 1680,
         'Cotton kurti with matching palazzo, block print.',
         _u('photo-1583391733956-6c78276477e2')),
        ('Quilted Sling Bag', 1199, 1999, 18, 4.4, 860,
         'Vegan leather sling bag with gold-tone hardware.',
         _u('photo-1590874103328-eac38a683ce7')),
    ],
}


class Command(BaseCommand):
    help = 'Seeds the catalog with realistic sample products (price, MRP, ratings, real photos) across every category.'

    def handle(self, *args, **options):
        new_cats = new_products = updated_images = 0

        for cat_name, items in SAMPLE_DATA.items():
            category, created = Category.objects.get_or_create(
                name=cat_name, defaults={'slug': slugify(cat_name)})
            new_cats += created

            for name, price, mrp, stock, rating, rating_count, desc, img in items:
                slug = slugify(name)
                product, created = Product.objects.get_or_create(
                    name=name,
                    defaults={
                        'category': category, 'slug': slug, 'price': price,
                        'mrp': mrp, 'stock': stock, 'rating': rating,
                        'rating_count': rating_count, 'description': desc,
                        'image_url': img, 'is_active': True,
                    },
                )
                new_products += created
                # Always update image_url to the correct curated photo
                if not created and product.image_url != img:
                    product.image_url = img
                    product.save(update_fields=['image_url'])
                    updated_images += 1

        # Any category that exists in the database but isn't in SAMPLE_DATA
        # above (e.g. one you created yourself through Manage Products) is
        # left untouched - this command only ever adds, never deletes.

        self.stdout.write(self.style.SUCCESS(
            f'Done. Added {new_cats} new categories and {new_products} new products '
            f'(updated photos on {updated_images} existing products). '
            f'Total products: {Product.objects.count()}, total categories: {Category.objects.count()}.'
        ))
