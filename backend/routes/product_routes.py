from flask import Blueprint, request, jsonify, g
from sqlalchemy import or_, and_, desc, asc
from backend.models.database import db
from backend.models.product import Product
from backend.models.category import Category
from backend.models.review import ProductReview
from backend.models.user_activity import UserActivity
from backend.middleware.auth_middleware import jwt_required
from backend.services.recommendation_service import RecommendationService

product_bp = Blueprint('products', __name__, url_prefix='/api/products')

@product_bp.route('', methods=['GET'])
def get_products():
    page = int(request.args.get('page', 1))
    limit = int(request.args.get('limit', 12))
    search = request.args.get('q', '').strip()
    category = request.args.get('category', '').strip()
    brand = request.args.get('brand', '').strip()
    min_price = request.args.get('min_price', type=float)
    max_price = request.args.get('max_price', type=float)
    min_rating = request.args.get('rating', type=float)
    in_stock = request.args.get('in_stock', '').lower() == 'true'
    sort = request.args.get('sort', 'featured')

    query = Product.query

    # Search filter
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_pattern),
                Product.description.ilike(search_pattern),
                Product.brand.ilike(search_pattern)
            )
        )

    # Category filter (by slug or name or id)
    if category:
        if category.isdigit():
            query = query.filter(Product.category_id == int(category))
        else:
            cat = Category.query.filter(or_(Category.slug == category.lower(), Category.name.ilike(category))).first()
            if cat:
                query = query.filter(Product.category_id == cat.id)

    # Brand filter
    if brand:
        brand_list = [b.strip() for b in brand.split(',') if b.strip()]
        if len(brand_list) == 1:
            query = query.filter(Product.brand.ilike(brand_list[0]))
        else:
            query = query.filter(Product.brand.in_(brand_list))

    # Price filters
    if min_price is not None:
        query = query.filter(Product.final_price >= min_price)
    if max_price is not None:
        query = query.filter(Product.final_price <= max_price)

    # Rating filter
    if min_rating is not None and min_rating > 0:
        query = query.filter(Product.rating >= min_rating)

    # Stock filter
    if in_stock:
        query = query.filter(Product.stock_quantity > 0)

    # Sorting
    if sort == 'price_asc':
        query = query.order_by(asc(Product.final_price))
    elif sort == 'price_desc':
        query = query.order_by(desc(Product.final_price))
    elif sort == 'rating':
        query = query.order_by(desc(Product.rating), desc(Product.review_count))
    elif sort == 'newest':
        query = query.order_by(desc(Product.created_at))
    elif sort == 'discount':
        query = query.order_by(desc(Product.discount_percent))
    else: # default 'featured'
        query = query.order_by(desc(Product.is_featured), desc(Product.rating))

    total = query.count()
    products = query.offset((page - 1) * limit).limit(limit).all()

    return jsonify({
        'success': True,
        'products': [p.to_dict() for p in products],
        'total': total,
        'page': page,
        'limit': limit,
        'total_pages': (total + limit - 1) // limit if limit > 0 else 1
    }), 200

@product_bp.route('/<int:product_id>', methods=['GET'])
def get_product_by_id(product_id):
    product = Product.query.get_or_404(product_id)
    related = RecommendationService.get_related_products(product.id, limit=4)
    
    # Log anonymous or user activity if token provided
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        from backend.middleware.auth_middleware import decode_jwt_token
        payload = decode_jwt_token(auth_header.split(' ')[1])
        if payload and payload.get('sub'):
            activity = UserActivity(user_id=payload['sub'], product_id=product.id, activity_type='view')
            db.session.add(activity)
            db.session.commit()

    return jsonify({
        'success': True,
        'product': product.to_dict(include_reviews=True),
        'related_products': related
    }), 200

@product_bp.route('/slug/<string:slug>', methods=['GET'])
def get_product_by_slug(slug):
    product = Product.query.filter_by(slug=slug).first_or_404()
    related = RecommendationService.get_related_products(product.id, limit=4)
    return jsonify({
        'success': True,
        'product': product.to_dict(include_reviews=True),
        'related_products': related
    }), 200

@product_bp.route('/categories', methods=['GET'])
def get_categories():
    categories = Category.query.order_by(Category.name.asc()).all()
    return jsonify({
        'success': True,
        'categories': [c.to_dict(include_product_count=True) for c in categories]
    }), 200

@product_bp.route('/brands', methods=['GET'])
def get_brands():
    brands = db.session.query(Product.brand).distinct().order_by(Product.brand.asc()).all()
    brand_list = [b[0] for b in brands if b[0]]
    return jsonify({
        'success': True,
        'brands': brand_list
    }), 200

@product_bp.route('/featured', methods=['GET'])
def get_featured():
    products = Product.query.filter_by(is_featured=True).limit(8).all()
    return jsonify({
        'success': True,
        'products': [p.to_dict() for p in products]
    }), 200

@product_bp.route('/trending', methods=['GET'])
def get_trending():
    products = Product.query.filter_by(is_trending=True).limit(8).all()
    return jsonify({
        'success': True,
        'products': [p.to_dict() for p in products]
    }), 200

@product_bp.route('/<int:product_id>/reviews', methods=['POST'])
@jwt_required()
def add_review(product_id):
    product = Product.query.get_or_404(product_id)
    user = g.current_user
    data = request.get_json() or {}

    rating = data.get('rating', 5)
    comment = data.get('comment', '').strip()
    title = data.get('title', '').strip()

    if not comment:
        return jsonify({'success': False, 'message': 'Review comment is required'}), 400

    review = ProductReview(
        product_id=product.id,
        user_id=user.id,
        user_name=user.name,
        rating=int(rating),
        title=title,
        comment=comment,
        is_verified_purchase=True
    )
    db.session.add(review)

    # Recalculate average rating
    all_reviews = ProductReview.query.filter_by(product_id=product.id).all()
    new_count = len(all_reviews) + 1
    new_avg = (sum(r.rating for r in all_reviews) + int(rating)) / new_count
    product.rating = round(new_avg, 1)
    product.review_count = new_count

    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Review submitted successfully!',
        'review': review.to_dict(),
        'updated_rating': product.rating,
        'review_count': product.review_count
    }), 201
