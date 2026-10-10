import os, shutil, urllib.request

brain_dir = r"C:\Users\midhu\.gemini\antigravity-ide\brain\7e4c928f-a24f-4039-aa80-2ffc23baf7b2"
frontend_public = r"m:\shop\shopsphere\frontend\public"
products_dir = os.path.join(frontend_public, "images", "products")
banners_dir = os.path.join(frontend_public, "images", "banners")

os.makedirs(products_dir, exist_ok=True)
os.makedirs(banners_dir, exist_ok=True)

# 1. Copy generated images from brain
brain_copies = {
    "wooden_chopping_board_1791309033686.jpg": (products_dir, "wooden-chopping-board.jpg"),
    "silicone_spatula_set_1791309243929.jpg": (products_dir, "silicone-spatula-set.jpg"),
    "ceramic_flower_vase_set_1791309325220.jpg": (products_dir, "ceramic-flower-vase-set.jpg"),
    "wall_art_canvas_set_1791309361937.jpg": (products_dir, "wall-art-canvas-set.jpg"),
    "ethnic_kurti_set_1791309395047.jpg": (products_dir, "ethnic-kurti-set.jpg"),
    "smart_watch_1791309450316.jpg": (products_dir, "smart-watch.jpg"),
    "bluetooth_earbuds_1791309513315.jpg": (products_dir, "bluetooth-earbuds.jpg"),
    "led_desk_lamp_1791309560932.jpg": (products_dir, "led-desk-lamp.jpg"),
    "citrus_cologne_1791309602078.jpg": (products_dir, "citrus-cologne.jpg"),
    # Banners
    "banner_electronics_1791309075327.jpg": (banners_dir, "banner-electronics.jpg"),
    "banner_fashion_sneaker_1791309176014.jpg": (banners_dir, "banner-fashion.jpg"),
    "banner_home_decor_1791309205650.jpg": (banners_dir, "banner-home.jpg"),
}

for src_name, (dest_folder, dest_name) in brain_copies.items():
    src_path = os.path.join(brain_dir, src_name)
    if os.path.exists(src_path):
        shutil.copyfile(src_path, os.path.join(dest_folder, dest_name))
        print(f"Copied {src_name} -> {dest_name}")
    else:
        print(f"Missing {src_path}")

# 2. Copy test_images
test_copies = {
    "test_images/real_potatoes.jpg": (products_dir, "potatoes.jpg"),
    "test_images/batch2/protein_powder_photo-157972282.jpg": (products_dir, "protein-powder.jpg"),
    "test_images/batch2/kiwi_photo-161889799.jpg": (products_dir, "kiwi.jpg"),
    "test_images/batch2/bell_pepper_photo-160164876.jpg": (products_dir, "green-bell-pepper.jpg"),
    "test_images/batch2/fish_steak_photo-151970822.jpg": (products_dir, "fish-steak.jpg"),
    "test_images/batch2/spatula_photo-158426960.jpg": (products_dir, "bamboo-spatula.jpg"),
    "test_images/batch2/wall_art_set_photo-158256142.jpg": (products_dir, "family-tree-photo-frame.jpg"),
}

for src_path, (dest_folder, dest_name) in test_copies.items():
    if os.path.exists(src_path):
        shutil.copyfile(src_path, os.path.join(dest_folder, dest_name))
        print(f"Copied {src_path} -> {dest_name}")
    else:
        print(f"Missing {src_path}")

# 3. Download mulberry
mulberry_url = "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dc/Mulberries_on_tree_1.jpg/960px-Mulberries_on_tree_1.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=thumbnail"
try:
    req = urllib.request.Request(mulberry_url, headers={'User-Agent': 'ShopSphereBot/1.0'})
    data = urllib.request.urlopen(req, timeout=5).read()
    with open(os.path.join(products_dir, "mulberry.jpg"), "wb") as f:
        f.write(data)
    print("Downloaded mulberry.jpg")
except Exception as e:
    print("Failed mulberry", e)
