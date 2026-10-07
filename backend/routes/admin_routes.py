import re
from datetime import datetime
from flask import Blueprint, request, jsonify, g
from sqlalchemy import func
from backend.models.database import db
from backend.models.user import User
from backend.models.product import Product
from backend.models.category import Category
from backend.models.order import Order, OrderItem
from backend.middleware.auth_middleware import admin_required

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    return re.sub(r'[-\s]+', '-', text)

@admin_bp.route('/analytics', methods=['GET'])
@admin_required()
def get_analytics():
    total_users = User.query.filter_by(role='customer').count()
    total_products = Product.query.count()
    total_orders = Order.query.count()
    
    # Revenue calculations
    revenue_sum = db.session.query(func.sum(Order.total_amount)).filter(Order.status != 'Cancelled').scalar() or 0.0
    
    # Recent orders
    recent_orders = Order.query.order_by(Order.created_at.desc()).limit(6).all()
    
    # Category sales breakdown
    category_data = []
    categories = Category.query.all()
    for cat in categories:
        prod_count = cat.products.count()
        category_data.append({
            'name': cat.name,
            'products_count': prod_count
        })

    # Best selling products
    best_sellers = db.session.query(
        OrderItem.product_name,
        func.sum(OrderItem.quantity).label('total_sold'),
        func.sum(OrderItem.total_price).label('total_revenue')
    ).group_by(OrderItem.product_name).order_by(func.sum(OrderItem.quantity).desc()).limit(5).all()

    best_sellers_list = [
        {'name': b[0], 'units_sold': int(b[1]), 'revenue': float(b[2])}
        for b in best_sellers
    ]

    # Mock/calculated monthly trend
    monthly_sales = [
        {'month': 'May', 'revenue': round(revenue_sum * 0.12, 2), 'orders': 18},
        {'month': 'Jun', 'revenue': round(revenue_sum * 0.15, 2), 'orders': 24},
        {'month': 'Jul', 'revenue': round(revenue_sum * 0.18, 2), 'orders': 29},
        {'month': 'Aug', 'revenue': round(revenue_sum * 0.22, 2), 'orders': 35},
        {'month': 'Sep', 'revenue': round(revenue_sum * 0.25, 2), 'orders': 42},
        {'month': 'Oct', 'revenue': round(revenue_sum * 0.08, 2), 'orders': 15}
    ]

    return jsonify({
        'success': True,
        'metrics': {
            'total_revenue': round(revenue_sum, 2),
            'total_orders': total_orders,
            'total_products': total_products,
            'total_users': total_users,
            'avg_order_value': round(revenue_sum / total_orders, 2) if total_orders > 0 else 0.0
        },
        'category_breakdown': category_data,
        'best_sellers': best_sellers_list,
        'monthly_sales': monthly_sales,
        'recent_orders': [o.to_dict() for o in recent_orders]
    }), 200

# Products Management
@admin_bp.route('/products', methods=['GET'])
@admin_required()
def admin_get_products():
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 50))
    search = request.args.get('q', '').strip()

    query = Product.query
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))

    total = query.count()
    products = query.order_by(Product.id.desc()).offset((page - 1) * limit).limit(limit).all()

    return jsonify({
        'success': True,
        'products': [p.to_dict() for p in products],
        'total': total,
        'page': page
    }), 200

@admin_bp.route('/products', methods=['POST'])
@admin_required()
def admin_create_product():
    data = request.get_json() or {}

    name = data.get('name', '').strip()
    category_id = data.get('category_id')
    brand = data.get('brand', '').strip()
    price = float(data.get('price', 0))
    discount_percent = float(data.get('discount_percent', 0))
    stock_quantity = int(data.get('stock_quantity', 10))
    description = data.get('description', '').strip()
    images = data.get('images', [])
    specifications = data.get('specifications', {})
    why_this_product = data.get('why_this_product', '')
    is_featured = bool(data.get('is_featured', False))
    is_trending = bool(data.get('is_trending', False))

    if not name or not category_id or not brand or price <= 0:
        return jsonify({'success': False, 'message': 'Name, valid category, brand, and positive price are required'}), 400

    base_slug = slugify(name)
    slug = base_slug
    counter = 1
    while Product.query.filter_by(slug=slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    final_price = round(price * (1 - (discount_percent / 100.0)), 2)

    new_prod = Product(
        name=name,
        slug=slug,
        category_id=category_id,
        brand=brand,
        price=price,
        discount_percent=discount_percent,
        final_price=final_price,
        stock_quantity=stock_quantity,
        description=description,
        images=images if images else ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80'],
        specifications=specifications,
        why_this_product=why_this_product,
        is_featured=is_featured,
        is_trending=is_trending
    )
    db.session.add(new_prod)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Product created successfully',
        'product': new_prod.to_dict()
    }), 201

@admin_bp.route('/products/<int:product_id>', methods=['PUT'])
@admin_required()
def admin_update_product(product_id):
    product = Product.query.get_or_404(product_id)
    data = request.get_json() or {}

    if 'name' in data and data['name'].strip():
        product.name = data['name'].strip()
    if 'category_id' in data:
        product.category_id = data['category_id']
    if 'brand' in data:
        product.brand = data['brand'].strip()
    if 'price' in data:
        product.price = float(data['price'])
    if 'discount_percent' in data:
        product.discount_percent = float(data['discount_percent'])
    if 'price' in data or 'discount_percent' in data:
        product.final_price = round(product.price * (1 - (product.discount_percent / 100.0)), 2)
    if 'stock_quantity' in data:
        product.stock_quantity = int(data['stock_quantity'])
    if 'description' in data:
        product.description = data['description']
    if 'images' in data:
        product.images = data['images']
    if 'specifications' in data:
        product.specifications = data['specifications']
    if 'why_this_product' in data:
        product.why_this_product = data['why_this_product']
    if 'is_featured' in data:
        product.is_featured = bool(data['is_featured'])
    if 'is_trending' in data:
        product.is_trending = bool(data['is_trending'])

    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Product updated successfully',
        'product': product.to_dict()
    }), 200

@admin_bp.route('/products/<int:product_id>', methods=['DELETE'])
@admin_required()
def admin_delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    return jsonify({'success': True, 'message': f'Product "{product.name}" deleted'}), 200

# Orders Management
@admin_bp.route('/orders', methods=['GET'])
@admin_required()
def admin_get_orders():
    status = request.args.get('status', '').strip()
    query = Order.query
    if status and status != 'All':
        query = query.filter(Order.status == status)

    orders = query.order_by(Order.created_at.desc()).all()
    return jsonify({
        'success': True,
        'orders': [o.to_dict() for o in orders]
    }), 200

@admin_bp.route('/orders/<int:order_id>/status', methods=['PUT'])
@admin_required()
def admin_update_order_status(order_id):
    order = Order.query.get_or_404(order_id)
    data = request.get_json() or {}
    new_status = data.get('status')

    valid_statuses = ['Order Placed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled']
    if new_status not in valid_statuses:
        return jsonify({'success': False, 'message': 'Invalid status'}), 400

    order.status = new_status
    if new_status == 'Delivered':
        order.payment_status = 'Paid'

    # Update timeline
    timeline = order.tracking_timeline or []
    now_str = datetime.utcnow().strftime('%b %d, %Y %I:%M %p')

    # Update state in timeline
    status_order = ['Order Placed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered']
    if new_status in status_order:
        current_idx = status_order.index(new_status)
        for i, item in enumerate(timeline):
            if i <= current_idx:
                item['done'] = True
                if item['time'] == 'Pending':
                    item['time'] = now_str
    elif new_status == 'Cancelled':
        timeline.append({
            'status': 'Cancelled',
            'time': now_str,
            'done': True,
            'desc': 'Order marked as cancelled by admin.'
        })

    order.tracking_timeline = timeline
    db.session.commit()

    return jsonify({
        'success': True,
        'message': f'Order status updated to {new_status}',
        'order': order.to_dict()
    }), 200

# Users List
@admin_bp.route('/users', methods=['GET'])
@admin_required()
def admin_get_users():
    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify({
        'success': True,
        'users': [u.to_dict() for u in users]
    }), 200

# Category Management
@admin_bp.route('/categories', methods=['POST'])
@admin_required()
def admin_create_category():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    description = data.get('description', '').strip()
    image_url = data.get('image_url', '').strip()

    if not name:
        return jsonify({'success': False, 'message': 'Category name is required'}), 400

    slug = slugify(name)
    existing = Category.query.filter_by(slug=slug).first()
    if existing:
        return jsonify({'success': False, 'message': 'Category already exists'}), 400

    new_cat = Category(name=name, slug=slug, description=description, image_url=image_url)
    db.session.add(new_cat)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Category created successfully',
        'category': new_cat.to_dict()
    }), 201

@admin_bp.route('/categories/<int:cat_id>', methods=['DELETE'])
@admin_required()
def admin_delete_category(cat_id):
    cat = Category.query.get_or_404(cat_id)
    if cat.products.count() > 0:
        return jsonify({'success': False, 'message': 'Cannot delete category containing active products'}), 400
    db.session.delete(cat)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Category deleted'}), 200
