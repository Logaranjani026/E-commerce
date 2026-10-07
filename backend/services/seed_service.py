import json
from datetime import datetime
from backend.models.database import db
from backend.models.user import User
from backend.models.category import Category
from backend.models.product import Product
from backend.models.review import ProductReview
from backend.models.order import Address, Order, OrderItem, Payment

def seed_database():
    """Seeds initial categories, products, demo users, reviews, and mock orders."""
    # Check if already seeded
    if Category.query.first() and Product.query.count() >= 30:
        return

    print("[SeedService] Seeding database with realistic categories and 30+ products...")

    # 1. Create Demo Users
    admin = User.query.filter_by(email='admin@smartcart.ai').first()
    if not admin:
        admin = User(
            name='SmartCart Admin',
            email='admin@smartcart.ai',
            role='admin',
            phone='+91 9876543210',
            avatar='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        )
        admin.set_password('Admin@123')
        db.session.add(admin)

    user = User.query.filter_by(email='user@smartcart.ai').first()
    if not user:
        user = User(
            name='Rahul Sharma',
            email='user@smartcart.ai',
            role='customer',
            phone='+91 9811223344',
            avatar='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
        )
        user.set_password('User@123')
        db.session.add(user)

    db.session.commit()

    # 2. Categories
    categories_data = [
        {
            'name': 'Laptops',
            'slug': 'laptops',
            'description': 'Powerful laptops for coding, college, gaming, and business',
            'icon': 'Laptop',
            'image_url': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80'
        },
        {
            'name': 'Smartphones',
            'slug': 'smartphones',
            'description': 'Latest 5G smartphones with pro cameras and fast processors',
            'icon': 'Smartphone',
            'image_url': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'
        },
        {
            'name': 'Headphones',
            'slug': 'headphones',
            'description': 'Immersive wireless audio, noise cancelling headphones, and TWS earbuds',
            'icon': 'Headphones',
            'image_url': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'
        },
        {
            'name': 'Watches',
            'slug': 'watches',
            'description': 'Smartwatches & fitness trackers with health monitors & AMOLED displays',
            'icon': 'Watch',
            'image_url': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80'
        },
        {
            'name': 'Electronics',
            'slug': 'electronics',
            'description': 'Gaming consoles, ultra-wide 4K monitors, and productivity peripherals',
            'icon': 'Tv',
            'image_url': 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80'
        },
        {
            'name': 'Fashion',
            'slug': 'fashion',
            'description': 'Modern apparel, tailored blazers, sneakers, and premium streetwear',
            'icon': 'Shirt',
            'image_url': 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop&q=80'
        },
        {
            'name': 'Home & Kitchen',
            'slug': 'home-kitchen',
            'description': 'Smart kitchen appliances, espresso makers, air fryers, and vacuums',
            'icon': 'Home',
            'image_url': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80'
        },
        {
            'name': 'Accessories',
            'slug': 'accessories',
            'description': 'GaN fast chargers, rugged sleeves, portable SSDs, and cables',
            'icon': 'HardDrive',
            'image_url': 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=600&auto=format&fit=crop&q=80'
        }
    ]

    cat_map = {}
    for cat in categories_data:
        existing = Category.query.filter_by(slug=cat['slug']).first()
        if not existing:
            existing = Category(
                name=cat['name'],
                slug=cat['slug'],
                description=cat['description'],
                icon=cat['icon'],
                image_url=cat['image_url']
            )
            db.session.add(existing)
            db.session.flush()
        cat_map[cat['name']] = existing.id

    db.session.commit()

    # 3. Comprehensive Realistic Products (32+ items with INR pricing & rich specs)
    products_data = [
        # --- LAPTOPS ---
        {
            'name': 'Dell Inspiron 15 3520 Laptop',
            'slug': 'dell-inspiron-15-3520',
            'category_name': 'Laptops',
            'brand': 'Dell',
            'price': 56990.0,
            'discount_percent': 14.0,
            'final_price': 48999.0,
            'stock_quantity': 18,
            'rating': 4.5,
            'review_count': 142,
            'is_featured': True,
            'is_trending': True,
            'why_this_product': 'Ideal for college students and software programming. Features 16 GB RAM, 512 GB NVMe SSD, and 12th Gen Intel i5 for under ₹50,000.',
            'description': 'The Dell Inspiron 15 delivers dependable day-to-day performance with an Intel Core i5-1235U processor, 16 GB DDR4 RAM, and a crisp 15.6" FHD 120Hz anti-glare display. Perfect for coding, multitasking, and remote work.',
            'images': [
                'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80'
            ],
            'specifications': {
                'Processor': 'Intel Core i5-1235U 12th Gen (up to 4.40 GHz)',
                'RAM': '16 GB DDR4 3200MHz',
                'Storage': '512 GB M.2 PCIe NVMe SSD',
                'Display': '15.6" Full HD (1920x1080) 120Hz WVA Display',
                'Graphics': 'Intel Iris Xe Graphics',
                'Operating System': 'Windows 11 Home + MS Office 2021',
                'Weight': '1.65 kg',
                'Battery Life': 'Up to 7 Hours (41Whr)',
                'Warranty': '1 Year Onsite Warranty'
            }
        },
        {
            'name': 'Apple MacBook Air M2 (13.6-inch)',
            'slug': 'apple-macbook-air-m2',
            'category_name': 'Laptops',
            'brand': 'Apple',
            'price': 99900.0,
            'discount_percent': 10.0,
            'final_price': 89900.0,
            'stock_quantity': 12,
            'rating': 4.9,
            'review_count': 380,
            'is_featured': True,
            'is_trending': True,
            'why_this_product': 'Unbeatable 18-hour battery life, silent fanless aluminum design, and revolutionary Apple M2 silicon for development and creative work.',
            'description': 'Redesigned around the next-generation M2 chip, MacBook Air is strikingly thin and brings exceptional speed and power efficiency within an all-aluminum enclosure. Liquid Retina display, 1080p FaceTime HD camera, and MagSafe 3 charging.',
            'images': [
                'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80'
            ],
            'specifications': {
                'Processor': 'Apple M2 chip with 8-core CPU and 8-core GPU',
                'RAM': '8 GB Unified Memory',
                'Storage': '256 GB High-speed SSD',
                'Display': '13.6" Liquid Retina Display with True Tone (500 nits)',
                'Battery Life': 'Up to 18 Hours',
                'Weight': '1.24 kg',
                'Ports': 'MagSafe 3, 2x Thunderbolt / USB 4, 3.5mm headphone jack',
                'Warranty': '1 Year Apple Limited Warranty'
            }
        },
        {
            'name': 'ASUS ROG Strix G16 Gaming Laptop',
            'slug': 'asus-rog-strix-g16',
            'category_name': 'Laptops',
            'brand': 'ASUS',
            'price': 139990.0,
            'discount_percent': 12.0,
            'final_price': 122990.0,
            'stock_quantity': 8,
            'rating': 4.7,
            'review_count': 89,
            'is_featured': True,
            'is_trending': False,
            'why_this_product': 'High FPS gaming & heavy AI model training powerhouse equipped with RTX 4060, Intel i7-13650HX, and ROG Intelligent Cooling.',
            'description': 'Dominate competitive esports and modern AAA gaming with the ROG Strix G16. Featuring NVIDIA GeForce RTX 4060 GPU with 140W max TGP, 16-inch 165Hz FHD+ display, and Conductonaut Extreme liquid metal cooling.',
            'images': [
                'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80'
            ],
            'specifications': {
                'Processor': 'Intel Core i7-13650HX 13th Gen (14 Cores, 24MB Cache)',
                'Graphics': 'NVIDIA GeForce RTX 4060 8GB GDDR6 (140W TGP)',
                'RAM': '16 GB DDR5 4800MHz (Expandable to 32GB)',
                'Storage': '1 TB PCIe 4.0 NVMe M.2 SSD',
                'Display': '16" FHD+ 165Hz 100% sRGB IPS ROG Nebula Display',
                'Keyboard': '4-Zone RGB Backlit Chiclet Keyboard',
                'Weight': '2.50 kg',
                'Battery': '90WHrs 4-cell Li-ion'
            }
        },
        {
            'name': 'Lenovo IdeaPad Slim 5 (14-inch OLED)',
            'slug': 'lenovo-ideapad-slim-5-oled',
            'category_name': 'Laptops',
            'brand': 'Lenovo',
            'price': 72990.0,
            'discount_percent': 15.0,
            'final_price': 61990.0,
            'stock_quantity': 15,
            'rating': 4.6,
            'review_count': 110,
            'is_featured': False,
            'is_trending': True,
            'why_this_product': 'Vibrant WUXGA OLED screen with 100% DCI-P3 color accuracy, AMD Ryzen 7 processor, and lightweight all-metal chassis.',
            'description': 'Thin, light, and military-grade durable. The Lenovo IdeaPad Slim 5 combines AMD Ryzen 7 7730U power with an eye-popping OLED display for entertainment, content creation, and programming.',
            'images': [
                'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80'
            ],
            'specifications': {
                'Processor': 'AMD Ryzen 7 7730U (8C / 16T, up to 4.5 GHz)',
                'RAM': '16 GB LPDDR4x-4266 soldered',
                'Storage': '512 GB SSD M.2 2242 PCIe 4.0x4 NVMe',
                'Display': '14" WUXGA (1920x1200) OLED 400nits 100% DCI-P3',
                'Weight': '1.46 kg',
                'Audio': 'Stereo speakers, 2W x2, Dolby Audio'
            }
        },
        {
            'name': 'HP Pavilion 14 Lightweight Laptop',
            'slug': 'hp-pavilion-14-laptop',
            'category_name': 'Laptops',
            'brand': 'HP',
            'price': 62500.0,
            'discount_percent': 12.0,
            'final_price': 54990.0,
            'stock_quantity': 20,
            'rating': 4.4,
            'review_count': 94,
            'is_featured': False,
            'is_trending': False,
            'why_this_product': 'Compact 14-inch form factor, HP Fast Charge, backlit keyboard, and Intel Core i5 13th Gen for daily productivity.',
            'description': 'The HP Pavilion 14 packs more performance into a smaller profile. Premium sound by B&O, micro-edge bezel display, and fast charging up to 50% in 30 minutes.',
            'images': [
                'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&auto=format&fit=crop&q=80'
            ],
            'specifications': {
                'Processor': 'Intel Core i5-1335U (up to 4.6 GHz with Intel Turbo Boost)',
                'RAM': '16 GB DDR4-3200 SDRAM',
                'Storage': '512 GB PCIe NVMe M.2 SSD',
                'Display': '14" diagonal FHD IPS micro-edge anti-glare (250 nits)',
                'Weight': '1.41 kg',
                'Camera': 'HP Wide Vision 720p HD with temporal noise reduction'
            }
        },

        # --- SMARTPHONES ---
        {
            'name': 'Apple iPhone 15 Pro (128 GB)',
            'slug': 'apple-iphone-15-pro',
            'category_name': 'Smartphones',
            'brand': 'Apple',
            'price': 134900.0,
            'discount_percent': 5.0,
            'final_price': 127900.0,
            'stock_quantity': 14,
            'rating': 4.9,
            'review_count': 520,
            'is_featured': True,
            'is_trending': True,
            'why_this_product': 'Aerospace-grade Titanium design, industry-leading A17 Pro 3nm gaming chip, Action button, and 48MP Pro camera system with 4K60 ProRes log.',
            'description': 'iPhone 15 Pro forged in titanium featuring the groundbreaking A17 Pro chip, customizable Action button, 120Hz ProMotion Super Retina XDR display, and versatile 48MP camera setup with USB-C 3.0 speeds.',
            'images': [
                'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80'
            ],
            'specifications': {
                'Processor': 'A17 Pro chip (6-core CPU, 6-core GPU, Hardware-accelerated Ray Tracing)',
                'Display': '6.1" Super Retina XDR OLED 120Hz ProMotion',
                'Main Camera': '48 MP Main + 12 MP Ultra Wide + 12 MP 3x Telephoto',
                'Front Camera': '12 MP TrueDepth with Autofocus',
                'Storage': '128 GB NVMe',
                'Build': 'Grade 5 Titanium frame with Ceramic Shield front',
                'Port': 'USB-C with USB 3.0 support (up to 10Gb/s)',
                'OS': 'iOS 17'
            }
        },
        {
            'name': 'Samsung Galaxy S24 5G AI Phone',
            'slug': 'samsung-galaxy-s24-5g',
            'category_name': 'Smartphones',
            'brand': 'Samsung',
            'price': 79999.0,
            'discount_percent': 10.0,
            'final_price': 71999.0,
            'stock_quantity': 16,
            'rating': 4.8,
            'review_count': 230,
            'is_featured': True,
            'is_trending': True,
            'why_this_product': 'Built-in Galaxy AI with Live Call Translate, Circle to Search, 2600 nits Dynamic AMOLED 2X, and 7 years of Android OS updates.',
            'description': 'Welcome to the era of mobile AI. Samsung Galaxy S24 unleashes new levels of creativity and productivity with Circle to Search with Google, 50MP ProVisual camera engine, and armor aluminum frame.',
            'images': [
                'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80'
            ],
            'specifications': {
                'Processor': 'Exynos 2400 Deca-Core 4nm AI processor',
                'Display': '6.2" FHD+ Dynamic AMOLED 2X (1-120Hz LTPO, 2600 nits peak)',
                'RAM': '8 GB LPDDR5X',
                'Storage': '256 GB UFS 4.0',
                'Camera': '50 MP Dual Pixel OIS + 12 MP Ultra-wide + 10 MP 3x Telephoto',
                'Battery': '4000 mAh with 25W fast charging & Fast Wireless 2.0',
                'OS': 'Android 14 with One UI 6.1 (7 Years OS Upgrades)'
            }
        },
        {
            'name': 'OnePlus 12R 5G (16GB RAM + 256GB)',
            'slug': 'oneplus-12r-5g',
            'category_name': 'Smartphones',
            'brand': 'OnePlus',
            'price': 45999.0,
            'discount_percent': 8.0,
            'final_price': 42499.0,
            'stock_quantity': 22,
            'rating': 4.7,
            'review_count': 310,
            'is_featured': False,
            'is_trending': True,
            'why_this_product': 'Flagship Snapdragon 8 Gen 2 processor, massive 5500 mAh battery with ultra-fast 100W SUPERVOOC charging (1 to 100% in 26 mins).',
            'description': 'The performance powerhouse OnePlus 12R combines a 4th Gen LTPO 120Hz ProXDR display with flagship cooling, Sony IMX890 50MP OIS camera, and smooth OxygenOS.',
            'images': [
                'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80'
            ],
            'specifications': {
                'Processor': 'Qualcomm Snapdragon 8 Gen 2 (4nm)',
                'RAM': '16 GB LPDDR5X',
                'Storage': '256 GB UFS 3.1',
                'Display': '6.78" 1.5K 120Hz ProXDR AMOLED (4500 nits peak)',
                'Battery': '5500 mAh with 100W SUPERVOOC Power Adapter in box',
                'Main Camera': '50 MP Sony IMX890 with OIS + 8 MP Ultra-Wide',
                'Weight': '207 g'
            }
        },
        {
            'name': 'Google Pixel 8a 5G',
            'slug': 'google-pixel-8a',
            'category_name': 'Smartphones',
            'brand': 'Google',
            'price': 52999.0,
            'discount_percent': 10.0,
            'final_price': 47699.0,
            'stock_quantity': 19,
            'rating': 4.6,
            'review_count': 160,
            'is_featured': False,
            'is_trending': False,
            'why_this_product': 'Best-in-class computational photography with Magic Editor, Best Take, Google Tensor G3 AI processor, and clean stock Android.',
            'description': 'Pixel 8a gives you delightful AI capabilities powered by Google Tensor G3. 64MP quad-PD main camera, IP67 water resistance, and 7 years of guaranteed security updates.',
            'images': [
                'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80'
            ],
            'specifications': {
                'Processor': 'Google Tensor G3 with Titan M2 security coprocessor',
                'Display': '6.1" Actua OLED 120Hz (up to 2000 nits)',
                'RAM': '8 GB LPDDR5x',
                'Storage': '128 GB UFS 3.1',
                'Camera': '64 MP Quad PD wide + 13 MP ultra-wide',
                'Battery': '4492 mAh with 24-hour battery life & Wireless Charging'
            }
        },
        {
            'name': 'Redmi Note 13 Pro+ 5G',
            'slug': 'redmi-note-13-pro-plus',
            'category_name': 'Smartphones',
            'brand': 'Xiaomi',
            'price': 33999.0,
            'discount_percent': 12.0,
            'final_price': 29999.0,
            'stock_quantity': 25,
            'rating': 4.5,
            'review_count': 210,
            'is_featured': False,
            'is_trending': True,
            'why_this_product': 'Flagship 200MP OIS camera, 3D Curved 1.5K 120Hz AMOLED display, IP68 water resistance, and insane 120W HyperCharge under ₹30,000.',
            'description': 'SuperNotes redefining the mid-range smartphone segment. 200MP Samsung ISOCELL HP3 camera sensor, MediaTek Dimensity 7200-Ultra processor, and vegan leather luxury design.',
            'images': [
                'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=80'
            ],
            'specifications': {
                'Processor': 'MediaTek Dimensity 7200-Ultra (4nm)',
                'RAM': '12 GB LPDDR5',
                'Storage': '256 GB UFS 3.1',
                'Camera': '200 MP Ultra-clear OIS + 8 MP Wide + 2 MP Macro',
                'Charging': '120W HyperCharge (100% in 19 mins)',
                'Durability': 'IP68 Dust & Water Resistance'
            }
        },

        # --- HEADPHONES & AUDIO ---
        {
            'name': 'Sony WH-1000XM5 Wireless ANC Headphones',
            'slug': 'sony-wh-1000xm5',
            'category_name': 'Headphones',
            'brand': 'Sony',
            'price': 34990.0,
            'discount_percent': 20.0,
            'final_price': 27990.0,
            'stock_quantity': 15,
            'rating': 4.8,
            'review_count': 410,
            'is_featured': True,
            'is_trending': True,
            'why_this_product': 'Gold standard industry-leading Active Noise Cancellation with dual processors, 8 microphones, 30-hour battery, and Hi-Res LDAC audio.',
            'description': 'Sony WH-1000XM5 noise cancelling headphones rewrite the rules for distraction-free listening. Two processors control 8 microphones for unprecedented noise cancellation and crystal-clear hands-free calling with Speak-to-Chat.',
            'images': [
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80'
            ],
            'specifications': {
                'Noise Cancellation': 'Industry-leading Auto NC Optimizer with Dual Processor V1 & QN1',
                'Driver Unit': '30mm Carbon Fiber composite dome',
                'Battery Life': '30 Hours with ANC ON (40 Hours ANC OFF)',
                'Quick Charge': '3 mins charge gives 3 hours playback',
                'Microphones': '8 Mics with Precise Voice Pickup & AI beamforming',
                'Bluetooth': 'v5.2 with LDAC, AAC, SBC, Multipoint pairing',
                'Weight': '250 g'
            }
        },
        {
            'name': 'Apple AirPods Pro (2nd Generation with USB-C)',
            'slug': 'apple-airpods-pro-2nd-gen',
            'category_name': 'Headphones',
            'brand': 'Apple',
            'price': 24900.0,
            'discount_percent': 8.0,
            'final_price': 22900.0,
            'stock_quantity': 20,
            'rating': 4.9,
            'review_count': 640,
            'is_featured': True,
            'is_trending': True,
            'why_this_product': 'Custom Apple H2 audio chip, 2x stronger Active Noise Cancellation, Adaptive Audio, Personalized Spatial Audio with dynamic head tracking.',
            'description': 'AirPods Pro 2 feature next-level active noise cancellation, Transparency mode, and Adaptive Audio that dynamically tailors noise control to your environment. MagSafe Charging Case with speaker and lanyard loop.',
            'images': [
                'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80'
            ],
            'specifications': {
                'Chip': 'Apple H2 headphone chip + Apple U1 chip in case',
                'Audio Tech': 'Custom high-excursion driver & high dynamic range amplifier',
                'Noise Control': 'Active Noise Cancellation, Adaptive Audio, Conversation Awareness',
                'Battery Life': 'Up to 6 hours listening (up to 30 hours with case)',
                'Sweat/Water Resistance': 'IP54 dust, sweat, and water resistant'
            }
        },
        {
            'name': 'Bose QuietComfort 45 Bluetooth Headphones',
            'slug': 'bose-quietcomfort-45',
            'category_name': 'Headphones',
            'brand': 'Bose',
            'price': 29900.0,
            'discount_percent': 16.0,
            'final_price': 24990.0,
            'stock_quantity': 11,
            'rating': 4.7,
            'review_count': 180,
            'is_featured': False,
            'is_trending': False,
            'why_this_product': 'Iconic plush comfort, world-class Quiet Mode, TriPort acoustic architecture, and deep, balanced bass.',
            'description': 'The perfect balance of quiet, comfort, and sound. Bose QC45 wireless headphones deliver proprietary acoustic technology for deep, clear sound with adjustable EQ in the Bose Music app.',
            'images': [
                'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80'
            ],
            'specifications': {
                'Type': 'Over-Ear Wireless ANC',
                'Battery Life': '24 Hours per charge',
                'Charging': 'USB-C (15-min charge gives 3 hours)',
                'Connectivity': 'Bluetooth 5.1 with Multi-Point'
            }
        },
        {
            'name': 'boAt Rockerz 550 Over-Ear Wireless Headphones',
            'slug': 'boat-rockerz-550',
            'category_name': 'Headphones',
            'brand': 'boAt',
            'price': 4999.0,
            'discount_percent': 62.0,
            'final_price': 1899.0,
            'stock_quantity': 45,
            'rating': 4.3,
            'review_count': 820,
            'is_featured': False,
            'is_trending': True,
            'why_this_product': 'Deep boAt Signature Bass with 50mm dynamic drivers, 20 hours playback, and ultra-comfortable earcups under ₹2,000.',
            'description': 'Designed for bass lovers. boAt Rockerz 550 features 50mm dynamic drivers, ergonomic over-ear design, physical controls, and dual connectivity via Bluetooth v5.0 and 3.5mm AUX.',
            'images': [
                'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80'
            ],
            'specifications': {
                'Driver Size': '50 mm Dynamic Drivers',
                'Battery Life': 'Up to 20 Hours playback',
                'Battery Capacity': '500 mAh',
                'Connectivity': 'Bluetooth v5.0 + AUX cable support',
                'Weight': '245 g'
            }
        },
        {
            'name': 'JBL Flip 6 Portable Waterproof Bluetooth Speaker',
            'slug': 'jbl-flip-6-speaker',
            'category_name': 'Headphones',
            'brand': 'JBL',
            'price': 13999.0,
            'discount_percent': 29.0,
            'final_price': 9999.0,
            'stock_quantity': 25,
            'rating': 4.6,
            'review_count': 340,
            'is_featured': False,
            'is_trending': False,
            'why_this_product': 'IP67 waterproof and dustproof design, 2-way speaker system with racetrack woofer, and 12 hours of playtime for outdoor parties.',
            'description': 'Bold sound for every adventure. JBL Flip 6 delivers powerful JBL Original Pro Sound with exceptional clarity thanks to its 2-way speaker system and dual passive radiators.',
            'images': [
                'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80'
            ],
            'specifications': {
                'Output Power': '30W (20W Woofer + 10W Tweeter)',
                'Durability': 'IP67 Waterproof & Dustproof',
                'Battery': '12 Hours Playtime (4800 mAh)',
                'Special Feature': 'JBL PartyBoost (pair 2+ speakers)'
            }
        },

        # --- WATCHES & WEARABLES ---
        {
            'name': 'Apple Watch Series 9 GPS (45mm)',
            'slug': 'apple-watch-series-9-45mm',
            'category_name': 'Watches',
            'brand': 'Apple',
            'price': 44900.0,
            'discount_percent': 7.0,
            'final_price': 41900.0,
            'stock_quantity': 16,
            'rating': 4.8,
            'review_count': 290,
            'is_featured': True,
            'is_trending': True,
            'why_this_product': 'Double Tap gesture control, S9 SiP chip, 2000 nits edge-to-edge Retina display, ECG, Blood Oxygen, and Crash Detection.',
            'description': 'Smarter. Brighter. Mightier. Apple Watch Series 9 introduces the magical Double Tap gesture for one-handed control, precision on-device Siri, and advanced health sensors.',
            'images': [
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80'
            ],
            'specifications': {
                'Case Size': '45mm Aluminum Case with Sport Band',
                'Processor': 'S9 SiP with 64-bit dual-core & 4-core Neural Engine',
                'Display': 'Always-On Retina OLED (up to 2000 nits, down to 1 nit)',
                'Health Sensors': 'ECG app, Blood Oxygen, Temperature sensing, Heart Rate alerts',
                'Battery': '18 Hours normal (up to 36 Hours in Low Power Mode)',
                'Water Resistance': '50m Swimproof (WR50)'
            }
        },
        {
            'name': 'Samsung Galaxy Watch 6 Bluetooth (44mm)',
            'slug': 'samsung-galaxy-watch-6-44mm',
            'category_name': 'Watches',
            'brand': 'Samsung',
            'price': 33999.0,
            'discount_percent': 24.0,
            'final_price': 25999.0,
            'stock_quantity': 18,
            'rating': 4.6,
            'review_count': 175,
            'is_featured': False,
            'is_trending': True,
            'why_this_product': 'Advanced sleep coaching, Body Composition (BIA) sensor, Sapphire Crystal glass, and Google WearOS with Google Maps on your wrist.',
            'description': 'Start your daily wellness journey with Samsung Galaxy Watch 6. 20% larger screen with 30% slimmer bezel, personalized HR zones, and comprehensive body composition analysis.',
            'images': [
                'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80'
            ],
            'specifications': {
                'Display': '1.5" Super AMOLED Sapphire Crystal (480x480)',
                'OS': 'Wear OS Powered by Samsung (One UI 5 Watch)',
                'Sensors': 'BioActive Sensor (Optical HR + Electrical Heart + Bioelectrical Impedance)',
                'Battery': '425 mAh with fast wireless charging',
                'Durability': '5ATM + IP68 / MIL-STD-810H'
            }
        },
        {
            'name': 'Noise ColorFit Ultra 3 Smartwatch (1.96" AMOLED)',
            'slug': 'noise-colorfit-ultra-3',
            'category_name': 'Watches',
            'brand': 'Noise',
            'price': 8999.0,
            'discount_percent': 67.0,
            'final_price': 2999.0,
            'stock_quantity': 40,
            'rating': 4.4,
            'review_count': 450,
            'is_featured': False,
            'is_trending': True,
            'why_this_product': 'Largest 1.96" AMOLED Always-On Display, Bluetooth calling with TruSync, metallic finish, and 7-day battery life for under ₹3,000.',
            'description': 'Noise ColorFit Ultra 3 features a premium metallic finish, functional digital crown, 100+ sports modes, 24x7 heart rate and SpO2 tracking, and crystal clear Bluetooth calling.',
            'images': [
                'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80'
            ],
            'specifications': {
                'Screen': '1.96" AMOLED (410x502 px, 500 nits)',
                'Battery': 'Up to 7 Days (2 Days with BT Calling)',
                'Sports Modes': '100+ Sports Modes with Auto Detection',
                'Calling': 'Bluetooth Calling with dial pad & favorite contacts',
                'Water Resistance': 'IP68'
            }
        },

        # --- ELECTRONICS & GAMING ---
        {
            'name': 'Sony PlayStation 5 Console (Slim Disc Edition)',
            'slug': 'sony-playstation-5-slim',
            'category_name': 'Electronics',
            'brand': 'Sony',
            'price': 54990.0,
            'discount_percent': 9.0,
            'final_price': 49990.0,
            'stock_quantity': 10,
            'rating': 4.9,
            'review_count': 560,
            'is_featured': True,
            'is_trending': True,
            'why_this_product': 'Ultra-high speed 1TB SSD, 4K 120fps gaming, Ray Tracing, and immersive DualSense wireless controller with haptic feedback.',
            'description': 'Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with haptic feedback, adaptive triggers, and 3D Audio, and an all-new generation of incredible PlayStation games.',
            'images': [
                'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80'
            ],
            'specifications': {
                'Storage': '1 TB Custom NVMe SSD',
                'Processor': 'AMD Zen 2 8-core CPU up to 3.5GHz',
                'Graphics': 'AMD RDNA 2 GPU engine with Ray Tracing (10.28 TFLOPs)',
                'Video Output': 'Supports 4K 120Hz TVs, 8K TVs, VRR',
                'Audio': 'Tempest 3D AudioTech',
                'Controller': 'DualSense Wireless Controller with Haptic Feedback'
            }
        },
        {
            'name': 'Samsung 32-inch 4K UHD Curved Smart Monitor (M8)',
            'slug': 'samsung-32-inch-4k-monitor',
            'category_name': 'Electronics',
            'brand': 'Samsung',
            'price': 48000.0,
            'discount_percent': 27.0,
            'final_price': 34999.0,
            'stock_quantity': 12,
            'rating': 4.6,
            'review_count': 110,
            'is_featured': False,
            'is_trending': False,
            'why_this_product': 'Crisp 4K UHD HDR10+ resolution, built-in Smart TV apps (Netflix, YouTube), detachable SlimFit magnetic camera, and 65W USB-C hub.',
            'description': 'Watch, work and chat all without connecting a separate PC. The Samsung M8 Smart Monitor combines a stylish minimalist aesthetic with 4K UHD clarity and USB-C connectivity.',
            'images': [
                'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80'
            ],
            'specifications': {
                'Screen Size': '32 Inch (80 cm) 16:9 Aspect Ratio',
                'Resolution': '4K UHD (3840 x 2160) HDR10+',
                'Connectivity': 'USB Type-C (65W charging), Micro HDMI, Bluetooth, WiFi',
                'Features': 'Smart TV OS, SlimFit Camera, AirPlay 2, Built-in Speakers'
            }
        },
        {
            'name': 'Logitech MX Master 3S Wireless Performance Mouse',
            'slug': 'logitech-mx-master-3s',
            'category_name': 'Electronics',
            'brand': 'Logitech',
            'price': 10995.0,
            'discount_percent': 18.0,
            'final_price': 8995.0,
            'stock_quantity': 30,
            'rating': 4.9,
            'review_count': 420,
            'is_featured': True,
            'is_trending': False,
            'why_this_product': 'Quiet Click buttons with 90% less noise, MagSpeed electromagnetic scrolling (1,000 lines/sec), and 8K DPI glass-tracking sensor.',
            'description': 'An icon remastered for coders, designers, and power users. Logitech MX Master 3S features Quiet Clicks, 8K DPI any-surface tracking, and seamless Flow cross-computer control.',
            'images': [
                'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80'
            ],
            'specifications': {
                'Sensor': 'Darkfield high precision 8000 DPI (tracks on glass)',
                'Scroll Wheel': 'MagSpeed electromagnetic scroll with SmartShift',
                'Battery': '500 mAh Li-Po (Up to 70 days on full charge)',
                'Connectivity': 'Bluetooth Low Energy & Logi Bolt USB Receiver',
                'Ergonomics': 'Sculpted palm support with thumb wheel & gesture button'
            }
        },
        {
            'name': 'Keychron K2 Wireless Mechanical Keyboard (RGB)',
            'slug': 'keychron-k2-wireless-keyboard',
            'category_name': 'Electronics',
            'brand': 'Keychron',
            'price': 9999.0,
            'discount_percent': 20.0,
            'final_price': 7999.0,
            'stock_quantity': 22,
            'rating': 4.8,
            'review_count': 180,
            'is_featured': False,
            'is_trending': True,
            'why_this_product': 'Compact 75% layout, hot-swappable Gateron G Pro Brown switches, dual Mac/Windows compatibility, and 4000 mAh battery.',
            'description': 'The favorite mechanical keyboard of developers worldwide. Keychron K2 offers wireless Bluetooth 5.1 connectivity with up to 3 devices, aluminum frame, and vibrant RGB backlighting.',
            'images': [
                'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80'
            ],
            'specifications': {
                'Layout': '75% (84 Keys) Compact Layout',
                'Switches': 'Gateron G Pro Mechanical Brown Switches (Tactile)',
                'Frame': 'Aluminum Bezel with ABS Bottom',
                'Battery': '4000 mAh Rechargeable (Up to 240 hours without backlight)'
            }
        },

        # --- FASHION ---
        {
            'name': 'Levi\'s Men\'s 511 Slim Fit Stretch Jeans',
            'slug': 'levis-511-slim-fit-jeans',
            'category_name': 'Fashion',
            'brand': 'Levi\'s',
            'price': 3999.0,
            'discount_percent': 35.0,
            'final_price': 2599.0,
            'stock_quantity': 35,
            'rating': 4.5,
            'review_count': 320,
            'is_featured': False,
            'is_trending': True,
            'why_this_product': 'Timeless modern slim cut with Levi\'s Flex advanced stretch denim for maximum comfort and mobility.',
            'description': 'A modern slim with room to move. The 511 Slim Fit Jeans are a classic since right now. These jeans are slim through the thigh with a straight leg opening.',
            'images': [
                'https://images.unsplash.com/photo-1542272604-780c96856592?w=800&auto=format&fit=crop&q=80'
            ],
            'specifications': {
                'Fit': 'Slim from hip to ankle',
                'Fabric': '99% Cotton, 1% Elastane (Levi\'s Flex Stretch)',
                'Rise': 'Mid Rise with zip fly and 5-pocket styling',
                'Care': 'Machine wash cold'
            }
        },
        {
            'name': 'Nike Air Max 270 Men\'s Casual Sneakers',
            'slug': 'nike-air-max-270-sneakers',
            'category_name': 'Fashion',
            'brand': 'Nike',
            'price': 13995.0,
            'discount_percent': 21.0,
            'final_price': 10995.0,
            'stock_quantity': 18,
            'rating': 4.7,
            'review_count': 260,
            'is_featured': True,
            'is_trending': True,
            'why_this_product': 'Nike\'s iconic large Max Air unit in the heel delivers responsive cushioning and head-turning sporty street style.',
            'description': 'Nike Air Max 270 brings all-day comfort with the largest Max Air 270 unit yet. Woven and synthetic fabric on the upper provides a lightweight fit and airy feel.',
            'images': [
                'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
                'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&auto=format&fit=crop&q=80'
            ],
            'specifications': {
                'Upper': 'Breathable engineered mesh with synthetic overlays',
                'Cushioning': '270-degree visible Max Air heel unit + dual-density foam',
                'Outsole': 'Durable solid rubber outsole with waffle pattern',
                'Style': 'Lifestyle / Athleisure Sneaker'
            }
        },
        {
            'name': 'Zara Premium Wool Blend Tailored Blazer',
            'slug': 'zara-tailored-blazer',
            'category_name': 'Fashion',
            'brand': 'Zara',
            'price': 8990.0,
            'discount_percent': 22.0,
            'final_price': 6990.0,
            'stock_quantity': 14,
            'rating': 4.6,
            'review_count': 90,
            'is_featured': False,
            'is_trending': False,
            'why_this_product': 'Structured notched lapel silhouette crafted with Italian wool-blend fabric for business meetings and formal evenings.',
            'description': 'Tailored blazer made of spun wool-blend yarn. Features notched lapel collar, long sleeves with buttoned cuffs, chest welt pocket, and double back vents.',
            'images': [
                'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80'
            ],
            'specifications': {
                'Material': '60% Wool, 38% Polyester, 2% Elastane',
                'Lining': '100% Viscose silky lining',
                'Closure': 'Two-button front fastening',
                'Pockets': 'Flap pockets at hip, interior jet pocket'
            }
        },

        # --- HOME & KITCHEN ---
        {
            'name': 'Philips Digital Air Fryer HD9252 (4.1L)',
            'slug': 'philips-digital-air-fryer',
            'category_name': 'Home & Kitchen',
            'brand': 'Philips',
            'price': 11995.0,
            'discount_percent': 33.0,
            'final_price': 7999.0,
            'stock_quantity': 28,
            'rating': 4.7,
            'review_count': 380,
            'is_featured': True,
            'is_trending': True,
            'why_this_product': 'Rapid Air Technology for 90% less oil cooking, digital touch screen with 7 preset menus, and NutriU recipe app integration.',
            'description': 'Enjoy healthy food that\'s crispy on the outside and tender on the inside with Rapid Air Technology. Digital touch screen with 7 presets for frozen snacks, fresh fries, meat, fish, and cake.',
            'images': [
                'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80'
            ],
            'specifications': {
                'Capacity': '4.1 Litres (0.8 kg food capacity)',
                'Power': '1400 Watts',
                'Technology': 'Rapid Air Technology with Starfish bottom design',
                'Presets': '7 Preset cooking programs + Keep Warm function',
                'Cleaning': 'Dishwasher safe removable basket'
            }
        },
        {
            'name': 'Nespresso Vertuo Pop Coffee Machine',
            'slug': 'nespresso-vertuo-pop',
            'category_name': 'Home & Kitchen',
            'brand': 'Nespresso',
            'price': 18500.0,
            'discount_percent': 19.0,
            'final_price': 14999.0,
            'stock_quantity': 15,
            'rating': 4.6,
            'review_count': 140,
            'is_featured': False,
            'is_trending': False,
            'why_this_product': 'Centrifusion extraction technology spins 4,000 RPM to craft barista-level crema for 4 coffee cup sizes at the touch of a button.',
            'description': 'Add a pop of color to your morning routine. Nespresso Vertuo Pop brews espresso, double espresso, gran lungo, and mug with rich natural crema using smart barcode recognition capsules.',
            'images': [
                'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80'
            ],
            'specifications': {
                'Extraction': 'Centrifusion Barcode Capsule Recognition (4,000 RPM)',
                'Cup Sizes': 'Espresso (40ml), Double Espresso (80ml), Gran Lungo (150ml), Mug (230ml)',
                'Water Tank': '0.6 Litres removable tank',
                'Heat-up Time': '30 seconds fast heat-up'
            }
        },
        {
            'name': 'Dyson V8 Absolute Cordless Vacuum Cleaner',
            'slug': 'dyson-v8-absolute-vacuum',
            'category_name': 'Home & Kitchen',
            'brand': 'Dyson',
            'price': 39900.0,
            'discount_percent': 25.0,
            'final_price': 29900.0,
            'stock_quantity': 12,
            'rating': 4.8,
            'review_count': 210,
            'is_featured': False,
            'is_trending': True,
            'why_this_product': 'Dyson Digital Motor V8 spins at 110,000 RPM, advanced whole-machine filtration capturing 99.99% of microscopic particles.',
            'description': 'Engineered for homes with pets. Up to 40 minutes of fade-free powerful suction, de-tangling Motorbar cleaner head, and converts quickly to a handheld.',
            'images': [
                'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80'
            ],
            'specifications': {
                'Suction Power': '115 Air Watts in Max Mode',
                'Run Time': 'Up to 40 minutes fade-free suction',
                'Filtration': 'Advanced whole-machine filtration captures allergens',
                'Bin Volume': '0.54 Litres with point-and-shoot hygienic emptying'
            }
        },

        # --- ACCESSORIES ---
        {
            'name': 'Anker 735 65W GaN Fast Charger (3-Port)',
            'slug': 'anker-735-65w-gan-charger',
            'category_name': 'Accessories',
            'brand': 'Anker',
            'price': 4999.0,
            'discount_percent': 30.0,
            'final_price': 3499.0,
            'stock_quantity': 50,
            'rating': 4.8,
            'review_count': 320,
            'is_featured': False,
            'is_trending': True,
            'why_this_product': 'Gallium Nitride (GaN II) tech charges phone, tablet, and USB-C laptop simultaneously at full speed from a palm-sized plug.',
            'description': 'Power 3 devices at once. With 2 USB-C ports and 1 USB-A port, you can charge your MacBook Air, iPhone, and AirPods simultaneously with Anker Dynamic Power Distribution.',
            'images': [
                'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=800&auto=format&fit=crop&q=80'
            ],
            'specifications': {
                'Total Wattage': '65W Max Output',
                'Ports': '2x USB-C Power Delivery + 1x USB-A PowerIQ',
                'Tech': 'GaNPrime with ActiveShield 2.0 Temperature Monitoring',
                'Compatibility': 'MacBooks, Dell XPS, iPhone 15/14, Galaxy S24, iPads'
            }
        },
        {
            'name': 'Western Digital 2TB My Passport Portable External SSD',
            'slug': 'wd-2tb-portable-ssd',
            'category_name': 'Accessories',
            'brand': 'Western Digital',
            'price': 18990.0,
            'discount_percent': 32.0,
            'final_price': 12999.0,
            'stock_quantity': 28,
            'rating': 4.7,
            'review_count': 190,
            'is_featured': False,
            'is_trending': False,
            'why_this_product': 'Blazing fast NVMe read speeds up to 1050 MB/s, 256-bit AES hardware encryption, and 2-meter drop resistance.',
            'description': 'Save, access and protect the content that matters with My Passport SSD. Blazing fast transfer speeds, rugged metal design with shock and vibration resistance.',
            'images': [
                'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80'
            ],
            'specifications': {
                'Capacity': '2 TB NVMe Solid State Drive',
                'Speed': 'Up to 1050 MB/s Read, 1000 MB/s Write',
                'Interface': 'USB 3.2 Gen-2 Type-C (USB-A adapter included)',
                'Security': 'Password enabled 256-bit AES Hardware Encryption',
                'Durability': 'Drop resistant up to 6.5ft (1.98m)'
            }
        },
        {
            'name': 'DailyObjects Genuine Leather 14" Laptop Sleeve',
            'slug': 'dailyobjects-leather-laptop-sleeve',
            'category_name': 'Accessories',
            'brand': 'DailyObjects',
            'price': 2999.0,
            'discount_percent': 33.0,
            'final_price': 1999.0,
            'stock_quantity': 35,
            'rating': 4.6,
            'review_count': 130,
            'is_featured': False,
            'is_trending': True,
            'why_this_product': 'Handcrafted premium vegan leather with magnetic flap closure, plush microfiber scratch-proof lining, and slim profile.',
            'description': 'Elevate your daily carry with the DailyObjects envelope laptop sleeve. Features a snug silhouette, magnetic closure, and ultra-soft microfiber interior lining.',
            'images': [
                'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80'
            ],
            'specifications': {
                'Compatibility': 'Fits 13" - 14" Laptops (MacBook Air/Pro, Dell XPS 13)',
                'Material': 'Handcrafted Vegan Leather with Microfiber lining',
                'Closure': 'Dual Magnetic Snaps',
                'Color': 'Vintage Tan Brown'
            }
        }
    ]

    for p_data in products_data:
        existing = Product.query.filter_by(slug=p_data['slug']).first()
        if not existing:
            cat_id = cat_map.get(p_data['category_name'])
            new_prod = Product(
                name=p_data['name'],
                slug=p_data['slug'],
                category_id=cat_id,
                brand=p_data['brand'],
                price=p_data['price'],
                discount_percent=p_data['discount_percent'],
                final_price=p_data['final_price'],
                stock_quantity=p_data['stock_quantity'],
                rating=p_data['rating'],
                review_count=p_data['review_count'],
                is_featured=p_data.get('is_featured', False),
                is_trending=p_data.get('is_trending', False),
                why_this_product=p_data.get('why_this_product', ''),
                description=p_data['description'],
                images=p_data['images'],
                specifications=p_data['specifications']
            )
            db.session.add(new_prod)
            db.session.flush()

            # Add sample reviews for this product
            reviews = [
                {
                    'user_name': 'Amit Verma',
                    'rating': 5,
                    'title': 'Exceeded expectations!',
                    'comment': f"Fantastic purchase! The performance of the {p_data['brand']} is super smooth, build quality is top tier, and delivery was remarkably fast."
                },
                {
                    'user_name': 'Pooja Iyer',
                    'rating': 4,
                    'title': 'Great value for money',
                    'comment': f"SmartCart AI recommended this for my use case and it hit the bullseye. Battery life and specs are exactly as advertised."
                }
            ]
            for r in reviews:
                rev = ProductReview(
                    product_id=new_prod.id,
                    user_id=user.id if user else None,
                    user_name=r['user_name'],
                    rating=r['rating'],
                    title=r['title'],
                    comment=r['comment'],
                    is_verified_purchase=True
                )
                db.session.add(rev)

    # 4. Create sample initial address and order for the demo user
    if user:
        addr = Address.query.filter_by(user_id=user.id).first()
        if not addr:
            addr = Address(
                user_id=user.id,
                full_name='Rahul Sharma',
                phone='+91 9811223344',
                street_address='Flat 402, Sunshine Heights, Indiranagar',
                city='Bengaluru',
                state='Karnataka',
                pincode='560038',
                is_default=True
            )
            db.session.add(addr)
            db.session.flush()

        # Demo order
        sample_order = Order.query.filter_by(user_id=user.id).first()
        if not sample_order:
            p1 = Product.query.filter_by(slug='dell-inspiron-15-3520').first()
            p2 = Product.query.filter_by(slug='boat-rockerz-550').first()
            if p1 and p2:
                timeline = [
                    {'status': 'Order Placed', 'time': 'Oct 02, 2026 10:30 AM', 'done': True, 'desc': 'Order successfully placed & verified'},
                    {'status': 'Packed', 'time': 'Oct 02, 2026 03:15 PM', 'done': True, 'desc': 'Item packed securely at SmartCart warehouse'},
                    {'status': 'Shipped', 'time': 'Oct 03, 2026 08:45 AM', 'done': True, 'desc': 'Dispatched via BlueDart Express (AWB #BD78912)'},
                    {'status': 'Out for Delivery', 'time': 'Oct 04, 2026 09:00 AM', 'done': True, 'desc': 'Courier executive is on the way'},
                    {'status': 'Delivered', 'time': 'Expected Today by 8 PM', 'done': False, 'desc': 'Package arriving at delivery address'}
                ]
                order = Order(
                    order_number='ORD-2026-89412',
                    user_id=user.id,
                    status='Out for Delivery',
                    subtotal=p1.final_price + p2.final_price,
                    discount_amount=500.0,
                    delivery_charge=0.0,
                    total_amount=p1.final_price + p2.final_price - 500.0,
                    payment_method='UPI',
                    payment_status='Paid',
                    shipping_address={
                        'full_name': addr.full_name,
                        'phone': addr.phone,
                        'street_address': addr.street_address,
                        'city': addr.city,
                        'state': addr.state,
                        'pincode': addr.pincode
                    },
                    tracking_timeline=timeline
                )
                db.session.add(order)
                db.session.flush()

                item1 = OrderItem(
                    order_id=order.id,
                    product_id=p1.id,
                    product_name=p1.name,
                    product_image=p1.images[0] if p1.images else '',
                    price=p1.final_price,
                    quantity=1,
                    total_price=p1.final_price
                )
                item2 = OrderItem(
                    order_id=order.id,
                    product_id=p2.id,
                    product_name=p2.name,
                    product_image=p2.images[0] if p2.images else '',
                    price=p2.final_price,
                    quantity=1,
                    total_price=p2.final_price
                )
                payment = Payment(
                    order_id=order.id,
                    payment_method='UPI',
                    transaction_id='UPI-TXN-9988776655',
                    amount=order.total_amount,
                    status='Completed'
                )
                db.session.add_all([item1, item2, payment])

    db.session.commit()
    print("[SeedService] Successfully seeded database with products, users, categories, and sample order.")
