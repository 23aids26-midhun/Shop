import os, urllib.request

candidates = {
    'chopping_board': [
        'photo-1512058564366-18510be2db19',
        'photo-1584269600464-37b1b58a9fe7',
        'photo-1544816155-12df9643f363',
        'photo-1588854337221-4cf9fa96059c',
        'photo-1590794056226-79ef3a8147e1',
        'photo-1590794056291-c19b024b8923',
    ],
    'spatula': [
        'photo-1584269600464-37b1b58a9fe7',
        'photo-1556911220-e15b29be8c8f',
        'photo-1589182373726-e4f658ab50f0',
        'photo-1507048331197-7d4ac70811cf',
    ],
    'smartwatch': [
        'photo-1523275335684-37898b6baf30', # watch
        'photo-1508685096489-7aacd43bd3b1',
        'photo-1510017803434-a899398421b3',
        'photo-1579586337278-3befd40fd17a',
    ],
    'earbuds': [
        'photo-1572536147248-ac59a8abfa4b',
        'photo-1598331668826-20cecc596b86',
        'photo-1606220588913-b3aacb4d2f46',
        'photo-1590658002979-7fa3452243d4',
    ],
    'desk_lamp': [
        'photo-1534349762230-e0cadf78f5da',
        'photo-1513506003901-1e6a229e2d15',
        'photo-1507473885765-e6ed057ab6fe',
    ],
    'cologne': [
        'photo-1523293182086-7651a899d37f', # perfume
        'photo-1592945403244-b3fbafd7f539',
        'photo-1541643600914-78b084683601',
    ],
    'wall_art_set': [
        'photo-1579783900882-c0d3dad7b119',
        'photo-1582561424760-0321d75e81fa',
        'photo-1536924940846-227afb31e2a5',
        'photo-1513519245088-0e12902e35ca',
    ],
    'protein_powder': [
        'photo-1579722820308-d74e571900a9',
        'photo-1593095948071-474c5cc2c730',
        'photo-1517838277536-f5f99be501cd',
    ],
    'potatoes': [
        'photo-1518977676601-b28d490e69e7',
        'photo-1508313880080-c5bef0730395',
        'photo-1568584711271-6c929fb49b70',
    ],
    'kiwi': [
        'photo-1585059895524-72f0a0a657e8',
        'photo-1618897996318-5a901fa6ca71',
        'photo-1518492104633-130d0cc84637',
    ],
    'berries': [
        'photo-1577003811926-53b288df44c0',
        'photo-1563746914561-9c60e0a588b3',
        'photo-1464965911861-746a04b4bca6',
    ],
    'bell_pepper': [
        'photo-1563565375-3a42b1e00e58',
        'photo-1526346698789-22fd84314424',
        'photo-1601648764658-cf37e8c89b70',
    ],
    'fish_steak': [
        'photo-1510130113700-56b4ae9bd28f',
        'photo-1519708227418-c8fd9a32b7a2',
        'photo-1534422298391-e4f8c172dddb',
    ],
}

os.makedirs('test_images/batch2', exist_ok=True)
for item, ids in candidates.items():
    print(f'=== {item} ===')
    for pid in ids:
        url = f'https://images.unsplash.com/{pid}?w=300&h=300&fit=crop&q=80'
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            data = urllib.request.urlopen(req, timeout=4).read()
            filename = f'test_images/batch2/{item}_{pid[:15]}.jpg'
            with open(filename, 'wb') as f:
                f.write(data)
            print(f'  OK: {pid} -> {filename} ({len(data)} bytes)')
        except Exception as e:
            print(f'  FAIL: {pid} -> {e}')
