import urllib.request, re

def get_info(photo_id):
    url = f"https://unsplash.com/photos/{photo_id}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        html = urllib.request.urlopen(req, timeout=4).read().decode('utf-8', errors='ignore')
        m = re.search(r'<title>([^<]+)</title>', html)
        title = m.group(1) if m else 'No title'
        return title
    except Exception as e:
        return f"Error: {e}"

for pid in [
    'photo-1610030469983-98e550d6193c',
    'photo-1617627143750-d86bc21e42bb',
    'photo-1583391733956-3750e0ff4e8b',
    'photo-1590794056226-79ef3a8147e1',
    'photo-1594998893017-36147cbcae05',
    'photo-1544816155-12df9643f363',
    'photo-1584269600464-37b1b58a9fe7',
    'photo-1591261730799-ee4e6c2d16d7',
    'photo-1578749556568-bc2c40e68b61',
    'photo-1612196808214-b8e1d6145a8c',
    'photo-1579783900882-c0d3dad7b119',
    'photo-1582561424760-0321d75e81fa'
]:
    print(pid, '->', get_info(pid))
