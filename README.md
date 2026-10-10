# Shop — Full-Stack E-Commerce (React + Django REST API + JWT + MySQL)

A decoupled full-stack project, structured the way the example you shared
was: a separate `backend/` (Django REST Framework API) and `frontend/`
(React app), talking to each other over HTTP with JWT authentication.

## Architecture

- **Backend** — Django REST Framework, `djangorestframework-simplejwt` for
  JWT auth, `django-filter` for search/ordering, `django-cors-headers` so
  the React dev server (port 3000) can call the API (port 8000).
  - `accounts` — custom `User` model (email-unique + shipping fields),
    register/login/refresh/profile endpoints. Login embeds the user object
    in the response so the frontend doesn't need a second call.
  - `products` — Category & Product, slug-based lookups, public read,
    **admin-only write** (`IsAdminUser`, i.e. Django's `is_staff` flag).
  - `cart` — one cart per user, ownership-scoped (a user can never touch
    another user's cart, even by guessing an item id).
  - `orders` — checkout runs in **one atomic transaction**: check stock →
    create order → decrement stock → empty cart, all-or-nothing.
- **Frontend** — React 18 + React Router v6, Context API for auth/cart/
  toast state (`AuthContext`, `CartContext`, `ToastContext`), a shared
  `axios` instance that attaches the JWT to every request and silently
  refreshes it on a 401.
- **Database** — MySQL (configured for MySQL Workbench / WAMP on
  `localhost:3306`, user `root`). An SQLite fallback block is included in
  `backend/ecommerce_backend/settings.py`.

## Project layout

```
shopsphere/
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── ecommerce_backend/   # settings (DRF, JWT, CORS, MySQL-ready), urls
│   ├── accounts/            # custom User, register/login/profile
│   ├── products/            # Category, Product, seed command
│   ├── cart/                # Cart, CartItem
│   └── orders/               # Order, OrderItem, checkout
└── frontend/
    ├── package.json
    ├── public/index.html
    └── src/
        ├── api/axios.js       # JWT-aware axios instance (auto-refresh)
        ├── context/            # AuthContext, CartContext, ToastContext
        ├── components/         # Navbar, ProductCard, Pagination, ProtectedRoute
        ├── pages/               # Home, ProductDetail, Cart, Checkout, Orders,
        │                          Profile, SignIn, SignUp, ManageProducts
        └── styles/App.css       # theme
```

## API endpoints

| Method | URL | Auth | Notes |
|---|---|---|---|
| POST | `/api/accounts/register/` | none | creates User (default auto id) |
| POST | `/api/accounts/login/` | none | returns `{access, refresh, user}` |
| POST | `/api/accounts/refresh/` | none | refresh → new access token |
| GET/PUT | `/api/accounts/profile/` | JWT | current user's own profile |
| GET | `/api/products/categories/` | none | list |
| GET | `/api/products/products/` | none | `?search=`, `?category=`, `?ordering=`, `?page=` |
| GET | `/api/products/products/<slug>/` | none | detail |
| POST/PUT/PATCH/DELETE | `/api/products/products/<slug>/` | JWT, `is_staff` | manage catalog |
| GET | `/api/cart/` | JWT | your own cart |
| POST | `/api/cart/add/` | JWT | `{product_id, quantity}` |
| PUT/DELETE | `/api/cart/items/<id>/` | JWT | change qty / remove |
| GET | `/api/orders/` | JWT | your own orders (staff sees all) |
| GET | `/api/orders/<id>/` | JWT | one order (yours, or any if staff) |
| POST | `/api/orders/checkout/` | JWT | cart → Order, atomic, stock-checked |

## Setup

### Backend
```bash
cd shopsphere/backend
python -m venv venv
source venv/bin/activate        # venv\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py seed              # adds 20 sample products (5 pages of 4)
python manage.py createsuperuser   # optional, for /admin/
python manage.py runserver
```
Backend runs at `http://127.0.0.1:8000/`.

### Frontend
In a second terminal:
```bash
cd shopsphere/frontend
npm install
npm start
```
Frontend runs at `http://localhost:3000/` and talks to the backend via CORS.

### Making yourself an admin (to manage products)
Every sign-up is a regular customer. To promote one to staff/admin:
```bash
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
u = User.objects.get(username='YOUR_USERNAME')
u.is_staff = True
u.save()
"
```
Sign out and back in afterwards (the JWT/localStorage user object needs to
be refetched), and the "Manage" link will appear in the navbar.

## MySQL setup (already configured in settings.py)

1. In MySQL Workbench, run:
   ```sql
   CREATE DATABASE shopsphere_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. `pip install mysqlclient`
3. `python manage.py migrate` then `python manage.py seed`
4. Check in Workbench: `USE shopsphere_db; SHOW TABLES;`

To run without MySQL, comment the MySQL `DATABASES` block and uncomment the
SQLite one below it.

## What was verified before shipping this

- `python manage.py check` — no issues
- Full backend flow via DRF's `APIClient`: register → login (correct
  `is_staff` claim) → non-admin blocked (403) from creating a product,
  admin allowed (201) → add to cart → checkout (stock correctly
  decremented, cart emptied) → a second user gets **404** on someone
  else's order, not a data leak → refresh token issues a new access
  token → garbage token and wrong password both rejected with 401
- Same flow re-verified over **real HTTP** (`curl` against the actual dev
  server), including CORS headers for `http://localhost:3000`
- `npm run build` on the React app — **compiled successfully**, no errors

## How this maps to your course notes

| Feature | Course file |
|---|---|
| Sessions/cookies background | `18_Sessions_Cookies_and_User_Tracking` |
| REST API design | `19_REST_Api` |
| JWT auth | `20_JWT_Authentication` |
| MySQL connection | `7_MySQL_Connectivity` |
| Models / Foreign Keys | `4_Models`, `6_Foreign_Key_Model` |
| React components/hooks/forms | `4_COMPONENT`–`13_FORM` |

## Product pictures & pagination (v2)

- **20 products, 4 per page = 5 pages.** Page size lives in
  `backend/ecommerce_backend/pagination.py` (`page_size = 4`) and must match
  `PAGE_SIZE` in `frontend/src/pages/Home.js`.
- **Pictures:** every product without a photo gets a colourful illustrated tile
  (gradient + emoji) from `frontend/src/utils/productVisuals.js`. To show a real
  photo, paste an image URL into the product's `image_url` (Manage page, Django
  admin, or the `IMAGE_URLS` dict at the top of `products/management/commands/seed.py`,
  then re-run `python manage.py seed`).
- Re-running `seed` on an existing database only adds the missing products.
- Quick test without MySQL: set `USE_SQLITE=1` before running manage.py.

## v3 — Marketplace redesign (Amazon/Flipkart-style UI)

The frontend was restructured to look and behave like a real marketplace
instead of a generic demo grid:

- **Header** — dark navy top bar with a big search box, "Hello, {user} /
  Account" flyout (Your Profile, Your Orders, Manage Products for admins,
  Sign out), "Returns & Orders" shortcut, and a cart icon with a live count
  badge — same pattern as Amazon's header.
- **Category rail** — horizontal scrollable category icons below the header
  (All / Electronics / Books / Fashion / Home & Kitchen), each a filter.
- **Hero carousel** — auto-advancing promotional banners with manual
  arrows/dots, each linking into a category.
- **Product cards** — MRP shown struck through next to the selling price
  with a computed discount %, a star rating badge with a formatted review
  count (e.g. "4.6 ★ (7,430)"), a "Only N left" / "Currently unavailable"
  stock line, and separate **Add** / **Buy Now** buttons (Buy Now adds the
  item and jumps straight to checkout, like the real thing).
- **Product detail page** — breadcrumb trail, large price block with
  discount %, an "About this item" bullet list generated from the product
  description, a free-delivery estimate banner, and a quantity stepper
  capped at available stock.
- **Footer** — Amazon-style five-column footer (About / Help / Policy /
  Social / brand blurb with payment method badges).

None of this changes the underlying REST API, JWT auth, or authorization —
it's the same `accounts`/`products`/`cart`/`orders` backend as before, with
two additions to the `Product` model: `mrp` (for the discount display) and
`rating_count`. Run `python manage.py seed` to load 20 products that already
have realistic MRP/rating data filled in.

### Verified before shipping this version
Walked the entire flow in a real headless browser (not just the API):
home page → product detail → sign up → add to cart → cart page → checkout
→ place order → order confirmation on the Orders page, with a screenshot
taken at every step. `npm run build` also compiles with zero errors.

## v4 — Fixed missing images, added every category's products, real Account Settings

### What was broken, and the fix
- **"Electronics: No products"** — the category existed but had no products
  attached (and several categories you'd added yourself - beauty,
  fragrances, furniture, groceries, home-decoration, kitchen-accessories,
  Women's Fashion - had none either). `products/management/commands/seed.py`
  now ships realistic products (price, MRP, rating, rating count) for
  **every** category shown in the storefront - 48 products across 11
  categories in total. Re-running `python manage.py seed` is safe - it only
  adds what's missing, never duplicates or deletes.
- **Broken category icon** — the category strip was pointing at individual
  hand-picked photo URLs, and one had gone dead (a 404 from the photo
  host). Every category image and product photo now comes from a
  **deterministic, seeded URL** (`https://picsum.photos/seed/<slug>/...`)
  that can't be deleted by anyone, *and* there's an `onError` handler on
  every single image in the app that swaps to a colourful illustrated tile
  if a photo ever fails to load for any reason (e.g. no internet) - so a
  broken-image icon is no longer possible, full stop.

### New: a real "Your Account" settings area (Amazon-style)
`/profile` is now a full account settings page with a left-hand nav, just
like Amazon's "Your Account":
- **Profile Info** — your default contact details.
- **Login & Security** — change your password (current password required).
- **Your Addresses** — save multiple addresses (Home/Work/Other), edit or
  delete them, and mark one as default. Backed by a new `Address` model,
  scoped to you alone (verified: a second account gets a 404 trying to
  view, edit or delete someone else's address).

**Checkout now uses your saved addresses** — pick one with a radio button
(your default is pre-selected) instead of retyping your address every
time, with a "Use a different address" fallback for a one-off order.

### New API endpoints
| Method | URL | Notes |
|---|---|---|
| GET/POST | `/api/accounts/addresses/` | your own saved addresses |
| GET/PUT/PATCH/DELETE | `/api/accounts/addresses/<id>/` | one address (yours only) |
| POST | `/api/accounts/change-password/` | requires your current password |

### Verified before shipping this version
- Backend: address CRUD, ownership isolation (second user → 404), "only
  one default address at a time" logic, and password change (wrong old
  password rejected, correct one works and old password stops working) -
  all tested directly against the API.
- Frontend: walked the entire flow in a real headless browser - home page
  (all 12 category chips load, zero broken images), clicking "Electronics"
  (now shows 6 products instead of none), sign up, add an address, change
  password, add an item to cart, checkout with the saved address
  pre-selected, and a completed order showing up on the Orders page.
  `npm run build` compiles with zero errors.
