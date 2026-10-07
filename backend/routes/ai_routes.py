from flask import Blueprint, request, jsonify, g
from backend.models.database import db
from backend.models.product import Product
from backend.models.user_activity import UserActivity
from backend.services.ai_service import AIService
from backend.services.recommendation_service import RecommendationService
from backend.middleware.auth_middleware import jwt_required

ai_bp = Blueprint('ai', __name__, url_prefix='/api/ai')

@ai_bp.route('/recommend', methods=['POST'])
def recommend_products():
    data = request.get_json() or {}
    query = data.get('query', '').strip()

    if not query:
        return jsonify({'success': False, 'message': 'Please enter what you are looking for.'}), 400

    limit = int(data.get('limit', 6))
    result = AIService.recommend_products(query, limit=limit)

    # Log search activity if user is logged in
    auth_header = request.headers.get('Authorization')
    if auth_header and auth_header.startswith('Bearer '):
        from backend.middleware.auth_middleware import decode_jwt_token
        payload = decode_jwt_token(auth_header.split(' ')[1])
        if payload and payload.get('sub'):
            activity = UserActivity(user_id=payload['sub'], activity_type='search', query=query)
            db.session.add(activity)
            db.session.commit()

    return jsonify({
        'success': True,
        'data': result
    }), 200

@ai_bp.route('/compare', methods=['POST'])
def compare_products():
    data = request.get_json() or {}
    product_ids = data.get('product_ids', [])

    if not isinstance(product_ids, list) or len(product_ids) < 2:
        return jsonify({'success': False, 'message': 'Please select at least 2 products to compare.'}), 400

    if len(product_ids) > 4:
        product_ids = product_ids[:4]

    result = AIService.compare_products_ai(product_ids)
    return jsonify({
        'success': True,
        'data': result
    }), 200

@ai_bp.route('/why-this/<int:product_id>', methods=['GET'])
def get_why_this_product(product_id):
    product = Product.query.get_or_404(product_id)
    why_text = AIService.get_why_this_product(product)
    return jsonify({
        'success': True,
        'product_id': product.id,
        'product_name': product.name,
        'why_this_product': why_text
    }), 200

@ai_bp.route('/personalized', methods=['GET'])
@jwt_required(optional=True)
def get_personalized_recommendations():
    user = getattr(g, 'current_user', None)
    user_id = user.id if user else None
    limit = int(request.args.get('limit', 8))

    result = RecommendationService.get_personalized_recommendations(user_id=user_id, limit=limit)
    return jsonify({
        'success': True,
        'data': result
    }), 200

@ai_bp.route('/activity', methods=['POST'])
@jwt_required(optional=True)
def track_activity():
    user = getattr(g, 'current_user', None)
    user_id = user.id if user else None
    data = request.get_json() or {}

    product_id = data.get('product_id')
    activity_type = data.get('activity_type', 'view')
    query_str = data.get('query')

    activity = UserActivity(
        user_id=user_id,
        product_id=product_id,
        activity_type=activity_type,
        query=query_str
    )
    db.session.add(activity)
    db.session.commit()

    return jsonify({'success': True}), 200
