# 🛒 SmartCart AI — Intelligent E-Commerce Shopping Platform

[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styles-Tailwind%20CSS%20v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Flask](https://img.shields.io/badge/Backend-Python%20Flask%20REST-000000?style=flat&logo=flask)](https://flask.palletsprojects.com/)
[![Database](https://img.shields.io/badge/Database-MySQL%20%26%20SQLite%20Dual%20Mode-4479A1?style=flat&logo=mysql)](https://www.mysql.com/)
[![AI Powered](https://img.shields.io/badge/AI%20Engine-Gemini%20%2B%20Smart%20NLP%20Heuristic-7C3AED?style=flat&logo=google)](https://deepmind.google/technologies/gemini/)

**SmartCart AI** is a state-of-the-art, full-stack, AI-powered e-commerce web application designed for a modern Indian retail experience. It pairs a premium, responsive React user interface with a high-performance Python REST API backend, automated multi-faceted product filtering, side-by-side product comparisons, live order timeline tracking, an interactive administrative dashboard, and a dedicated **AI Shopping Assistant** that understands natural language shopping intents and scores matches based on budget, use case, hardware specifications, and verified buyer satisfaction.

---

## 🌟 Key Features

### 1. 🤖 Dedicated AI Shopping Assistant
- **Natural Language Intent Parsing**: Users can enter plain-English requirements (e.g. *"I need a laptop for programming and college projects under ₹50,000"* or *"Noise-cancelling headphones for office under ₹15,000"*).
- **Match Score & Technical Rationale**: Calculates a precise Match Percentage (e.g., `94% Match`) and outputs 4+ custom bulleted reasons explaining why the product fits the user's specific use case.
- **Spotlight Best Match & Alternatives**: Displays the primary recommendation alongside runner-up options with direct *Add to Cart* and *Compare* triggers.
- **Dual AI Engine**: Seamlessly connects to the **Google Gemini API** when an API key is configured, and gracefully falls back to the built-in offline **NLP Heuristic Engine** with zero external dependencies.

### 2. ⚖️ Interactive Product Comparison Matrix
- Compare **2 to 4 products side-by-side** in a clean, comprehensive specification matrix.
- **Visual Difference Highlighting**: Automatically highlights best prices (in green), highest ratings, and top RAM/storage.
- **AI "Which one should I choose?" Verdict**: Generates human-friendly guidance explaining trade-offs (e.g. Price-to-Performance vs. Peak Performance/Reliability).

### 3. 🛍️ E-Commerce Catalog & Filtering
- **30+ Realistic Indian Market Products** across 8 core categories: Laptops, Smartphones, Headphones & Audio, Smartwatches, Electronics & Gaming, Fashion, Home & Kitchen, and Accessories.
- **Indian Rupee (₹) Pricing** with discount percentages, strikethrough original prices, stock counters, and verified ratings.
- **Multi-faceted Filtering**: Search query, Category pills, Brand multi-select, Min-Max price range slider & quick presets, Customer rating (4★+, 3★+), and In-Stock toggle.
- **Sorting**: Featured, Price: Low to High, Price: High to Low, Rating, Highest Discount, Newest.

### 4. 🔍 Product Details & "Why this product?" AI Spotlight
- High-resolution product gallery with thumbnail switcher.
- **"✨ Why this product for you?"** AI insight pill tailored to the product's hardware strengths.
- Detailed technical specifications table and interactive Customer Reviews with rating submission form.
- Related products recommendation carousel.

### 5. 🛒 Shopping Cart & Wishlist
- Reactive cart calculations with instant quantity increment/decrement.
- **Promo Coupon System**: Active promo codes (`SMART10` for 10% off, `AIWELCOME` for ₹500 off, `FESTIVE20` for 20% off).
- **Free Delivery Progress Indicator**: Visual progress bar toward the ₹999 free shipping threshold.
- 1-Click Wishlist toggling and *Move to Cart* operations.

### 6. 💳 Multi-Step Checkout & Order Tracking Timeline
- **Step 1 Address**: Saved addresses manager or new address input with PIN code validation.
- **Step 2 Summary**: Itemized order review with coupon discount and delivery fee calculation.
- **Step 3 Payment**: UPI QR Simulation, Credit/Debit Card preview, Cash on Delivery (COD), and 1-Click Demo Pay.
- **Celebratory Confetti & Visual Shipment Timeline**:
  `Order Placed ➔ Packed ➔ Shipped ➔ Out for Delivery ➔ Delivered`
- Printable and downloadable formal tax invoices.

### 7. 👤 User Dashboard & Personalized AI Feed
- Profile management with customizable avatar, name, and phone number.
- KPI summary: Total Orders, Saved Items, Total Spent.
- Saved address book CRUD.
- **"Recommended For You"**: Personalized recommendation engine tailored to browsing history and category affinity.

### 8. 🛡️ Comprehensive Admin Control Panel
- **Analytics KPIs**: Total Revenue, Total Orders, Catalog Products, Registered Customers, Average Order Value.
- **Visual Charts (Recharts)**: Monthly Sales Revenue Trend & Category Distribution Pie Chart.
- **Product Management**: Add New Product (with JSON specifications & image URL), Edit Product, Delete Product, and real-time stock modifiers.
- **Order Management**: Filter by status and update order status (automatically syncs and updates the customer's visual tracking timeline).
- **Category & User Management**.

---

## 🏗️ Project Architecture

```
smartcart-ai/
│
├── frontend/                     # React 19 + Vite Frontend Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Navbar, Footer, PriceTag, RatingStars, SkeletonLoader, CompareFloatingBar
│   │   │   └── product/          # ProductCard, FilterSidebar
│   │   ├── context/              # AuthContext, CartContext, WishlistContext, CompareContext, ToastContext
│   │   ├── pages/                # HomePage, ProductsPage, ProductDetailPage, AIAssistantPage, ComparePage,
│   │   │                         # CartPage, WishlistPage, CheckoutPage, OrdersPage, OrderDetailPage,
│   │   │                         # UserDashboardPage, AdminDashboardPage, LoginPage, RegisterPage, NotFoundPage
│   │   ├── services/             # api.js, authService, productService, cartService, wishlistService, orderService, aiService, adminService
│   │   ├── App.jsx               # React Router configuration with Protected & Admin Route Guards
│   │   ├── main.jsx              # React DOM initialization
│   │   └── index.css             # Tailwind CSS & custom design tokens
│   ├── package.json
│   └── vite.config.js
│
├── backend/                      # Python Flask REST API Backend
│   ├── config/
│   │   └── settings.py           # JWT secrets, Database URI, Gemini API configuration
│   ├── models/                   # SQLAlchemy Models: User, Category, Product, Cart, Wishlist, Order, Review, UserActivity
│   │   ├── database.py
│   │   ├── user.py
│   │   ├── category.py
│   │   ├── product.py
│   │   ├── cart.py
│   │   ├── wishlist.py
│   │   ├── order.py
│   │   ├── review.py
│   │   └── user_activity.py
│   ├── routes/                   # REST API Blueprints: Auth, Products, Cart, Wishlist, Orders, AI, Admin
│   │   ├── auth_routes.py
│   │   ├── product_routes.py
│   │   ├── cart_routes.py
│   │   ├── wishlist_routes.py
│   │   ├── order_routes.py
│   │   ├── ai_routes.py
│   │   └── admin_routes.py
│   ├── services/                 # AI Engine, Recommendations, and Auto-seeding
│   │   ├── ai_service.py
│   │   ├── recommendation_service.py
│   │   └── seed_service.py
│   ├── middleware/
│   │   └── auth_middleware.py    # JWT token verification and Admin guards
│   ├── app.py                    # Flask application entry point with CORS & auto-seed
│   ├── test_suite.py             # Automated end-to-end integration test suite
│   └── requirements.txt
│
├── database/
│   └── schema.sql                # Complete MySQL DDL schema (12 tables with indexes & foreign keys)
│
├── .env.example                  # Environment configuration template
├── start.bat                     # Windows 1-click startup batch script
└── README.md                     # Documentation
```

---

## ⚡ Quick Start & Installation

### Prerequisites
- **Node.js**: v18+ (tested on v26)
- **Python**: v3.10+ (tested on Python 3.14)
- **Git** (optional)

---

### Step 1: Environment Configuration
Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```

Default `.env` settings:
```env
SECRET_KEY=smartcart-ai-super-secret-jwt-key-2026
JWT_SECRET_KEY=smartcart-jwt-auth-token-key-2026
JWT_EXPIRES_HOURS=72

# Set USE_MYSQL=true for local MySQL, or false for zero-config portable SQLite
USE_MYSQL=false
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=smartcart_db

# Optional Google Gemini AI API key
GEMINI_API_KEY=
PORT=5000
```

---

### Step 2: Backend Setup
Open a terminal in the project directory:

```bash
# 1. Create Python virtual environment
python -m venv backend/venv

# 2. Activate virtual environment
# Windows:
backend\venv\Scripts\activate
# macOS/Linux:
source backend/venv/bin/activate

# 3. Install dependencies
pip install -r backend/requirements.txt

# 4. Run the Backend Server
python backend/app.py
```
*The backend server will automatically initialize tables and seed 30+ products and demo accounts at `http://127.0.0.1:5000`.*

---

### Step 3: Frontend Setup
Open a new terminal window:

```bash
# 1. Navigate to frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. Start Frontend Development Server
npm run dev
```
*The frontend application will start immediately at `http://localhost:5173`.*

---

### Step 4: 1-Click Start on Windows
On Windows systems, simply double-click **`start.bat`** in the project root to launch both the backend and frontend servers simultaneously!

---

## 🔑 Demo Accounts & Test Credentials

The database comes pre-seeded with two demo accounts with 1-click login buttons on `/login`:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@smartcart.ai` | `Admin@123` | Full access to Admin Panel, Product CRUD, Order Status Modifiers, Analytics |
| **Customer** | `user@smartcart.ai` | `User@123` | Browsing, Cart, Wishlist, Multi-Step Checkout, Live Timeline Tracking, Profile |

---

## 📚 REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register new customer account
- `POST /api/auth/login` — Sign in and retrieve JWT access token
- `GET /api/auth/me` — Get current logged-in user profile
- `PUT /api/auth/profile` — Update name, phone, or avatar

### Catalog & Products (`/api/products`)
- `GET /api/products` — List products with search `q`, `category`, `brand`, `min_price`, `max_price`, `rating`, `in_stock`, `sort`, `page`, `limit`
- `GET /api/products/<id>` — Product details with reviews and related recommendations
- `GET /api/products/slug/<slug>` — Product details by slug
- `GET /api/products/categories` — All categories with product counts
- `GET /api/products/brands` — List of unique product brands
- `GET /api/products/featured` — Featured products
- `GET /api/products/trending` — Trending products
- `POST /api/products/<id>/reviews` — Submit verified customer review

### AI Recommendation Engine (`/api/ai`)
- `POST /api/ai/recommend` — Parse natural language query, match criteria, and score products with AI rationale
- `POST /api/ai/compare` — Compare 2-4 products with AI "Which one should I choose?" verdict
- `GET /api/ai/why-this/<id>` — Instant AI highlights for product detail page
- `GET /api/ai/personalized` — User-personalized product feed based on category affinity

### Cart & Wishlist (`/api/cart`, `/api/wishlist`)
- `GET /api/cart` — Get user's cart with live subtotal & shipping calculation
- `POST /api/cart/items` — Add product to cart
- `PUT /api/cart/items/<id>` — Update item quantity
- `DELETE /api/cart/items/<id>` — Remove item
- `DELETE /api/cart/clear` — Clear cart
- `GET /api/wishlist` — Get user's saved wishlist items
- `POST /api/wishlist/toggle` — Add/remove item from wishlist
- `POST /api/wishlist/<id>/move-to-cart` — Move wishlist product directly to cart

### Orders & Tracking (`/api/orders`)
- `POST /api/orders` — Place order with address, payment method, and coupon code
- `GET /api/orders` — Get user's order history
- `GET /api/orders/<id_or_number>` — Get detailed order tracking timeline and invoice data
- `PUT /api/orders/<id>/cancel` — Cancel active order
- `GET /api/orders/addresses` — Get saved shipping addresses
- `POST /api/orders/addresses` — Save new address
- `DELETE /api/orders/addresses/<id>` — Delete address

### Admin Control Panel (`/api/admin`) *(Admin Token Required)*
- `GET /api/admin/analytics` — KPI metrics, monthly sales trend, and category distribution
- `GET /api/admin/products` — Admin catalog list with stock indicators
- `POST /api/admin/products` — Create new product with JSON specifications
- `PUT /api/admin/products/<id>` — Edit product details, pricing, and stock
- `DELETE /api/admin/products/<id>` — Delete product
- `GET /api/admin/orders` — All orders with status filter
- `PUT /api/admin/orders/<id>/status` — Update order status and advance tracking timeline
- `GET /api/admin/users` — Registered customers list
- `POST /api/admin/categories` — Add category
- `DELETE /api/admin/categories/<id>` — Delete category

---

## 🗄️ MySQL Database Setup (Optional)

If you prefer to run against a live MySQL server instead of SQLite:

1. Create the database in MySQL:
   ```sql
   CREATE DATABASE smartcart_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Import the schema:
   ```bash
   mysql -u root -p smartcart_db < database/schema.sql
   ```
3. Update `.env`:
   ```env
   USE_MYSQL=true
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=smartcart_db
   ```
4. Restart the backend server.

---

## 🧪 Integration Testing

Run the automated 14-point test suite to verify all backend, database, and AI endpoints:

```bash
backend\venv\Scripts\python backend/test_suite.py
```

Sample output:
```
=== Testing SmartCart AI Full-Stack Endpoints ===
[OK] 1. Health Check OK
[OK] 2. Categories OK: Found 8 categories
[OK] 3. Products List OK: Total catalog items = 31
[OK] 4. Search Filter OK: Found 'Dell Inspiron 15 3520 Laptop' (48999.0 INR)
[OK] 5. Product Details OK: Specs & AI highlights populated
[OK] 6. AI Assistant Recommendation OK: (98% Match)
[OK] 7. AI Comparison OK
[OK] 8. Authentication OK: Logged in as Rahul Sharma
[OK] 9. Cart Operations OK
[OK] 10. Wishlist Operations OK
[OK] 11. Order Placement OK: Created #ORD-2026-XXXX
[OK] 12. Order Tracking Timeline OK: Status is 'Order Placed' with 5 timeline milestones
[OK] 13. Admin Analytics OK: Revenue & Orders verified
[OK] 14. Admin Status Updater OK: Order status updated to 'Packed'

[SUCCESS] ALL 14 TEST SCENARIOS PASSED WITH ZERO ERRORS! SmartCart AI is 100% operational.
```

---

## 📄 License
This project is open-source and created for portfolio, hackathon, and educational demonstrations.
