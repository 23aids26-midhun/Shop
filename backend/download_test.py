import os, urllib.request

os.makedirs('test_images', exist_ok=True)

test_urls = {
    'kurti1.jpg': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300&h=300&fit=crop&q=80',
    'kurti2.jpg': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=300&h=300&fit=crop&q=80',
    'chopping1.jpg': 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=300&h=300&fit=crop&q=80',
    'chopping2.jpg': 'https://images.unsplash.com/photo-1594998893017-36147cbcae05?w=300&h=300&fit=crop&q=80',
    'spatula1.jpg': 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=300&h=300&fit=crop&q=80',
    'spatula2.jpg': 'https://images.unsplash.com/photo-1591261730799-ee4e6c2d16d7?w=300&h=300&fit=crop&q=80',
    'vase1.jpg': 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=300&h=300&fit=crop&q=80',
    'vase2.jpg': 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=300&h=300&fit=crop&q=80',
    'wallart1.jpg': 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&h=300&fit=crop&q=80',
    'wallart2.jpg': 'https://images.unsplash.com/photo-1582561424760-0321d75e81fa?w=300&h=300&fit=crop&q=80',
    'headphones_banner.jpg': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=300&fit=crop&q=80',
    'fashion_banner.jpg': 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=500&h=300&fit=crop&q=80',
    'home_banner.jpg': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=300&fit=crop&q=80',
}

for name, url in test_urls.items():
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        data = urllib.request.urlopen(req, timeout=5).read()
        with open(os.path.join('test_images', name), 'wb') as f:
            f.write(data)
        print('Saved', name, len(data))
    except Exception as e:
        print('Failed', name, e)
