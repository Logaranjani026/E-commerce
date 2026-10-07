from flask import Blueprint, request, jsonify, g
from backend.models.database import db
from backend.models.wishlist import Wishlist
from backend.models.product import Product
from backend.models.cart import Cart, CartItem
from backend.models.user_activity import UserActivity
from backend.middleware.auth_middleware import jwt_required

wishlist_bp = Blueprint('wishlist', __name__, url_prefix='/api/wishlist')

@wishlist_bp.route('', methods=['GET'])
@jwt_required()
def get_wishlist():
    user = g.current_user
    items = Wishlist.query.filter_by(user_id=user.id).all()
    return jsonify({
        'success': True,
        'wishlist': [item.to_dict() for item in items if item.product]
    }), 200

@wishlist_bp.route('/toggle', methods=['POST'])
@jwt_required()
def toggle_wishlist():
    user = g.current_user
    data = request.get_json() or {}
    product_id = data.get('product_id')

    if not product_id:
        return jsonify({'success': False, 'message': 'Product ID is required'}), 400

    product = Product.query.get(product_id)
    if not product:
        return jsonify({'success': False, 'message': 'Product not found'}), 404

    existing = Wishlist.query.filter_by(user_id=user.id, product_id=product.id).first()
    if existing:
        db.session.delete(existing)
        db.session.commit()
        return jsonify({
            'success': True,
            'is_in_wishlist': False,
            'message': f'"{product.name}" removed from wishlist'
        }), 200
    else:
        new_item = Wishlist(user_id=user.id, product_id=product.id)
        db.session.add(new_item)
        activity = UserActivity(user_id=user.id, product_id=product.id, activity_type='wishlist_add')
        db.session.add(activity)
        db.session.commit()
        return jsonify({
            'success': True,
            'is_in_wishlist': True,
            'message': f'"{product.name}" added to wishlist!'
        }), 200

@wishlist_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
def remove_from_wishlist(product_id):
    user = g.current_user
    item = Wishlist.query.filter_by(user_id=user.id, product_id=product_id).first()
    if item:
        db.session.delete(item)
        db.session.commit()
    return jsonify({'success': True, 'message': 'Item removed from wishlist'}), 200

@wishlist_bp.route('/<int:product_id>/move-to-cart', methods=['POST'])
@jwt_required()
def move_to_cart(product_id):
    user = g.current_user
    product = Product.query.get_or_404(product_id)

    # Remove from wishlist
    wishlist_item = Wishlist.query.filter_by(user_id=user.id, product_id=product.id).first()
    if wishlist_item:
        db.session.delete(wishlist_item)

    # Add to cart
    cart = Cart.query.filter_by(user_id=user.id).first()
    if not cart:
        cart = Cart(user_id=user.id)
        db.session.add(cart)
        db.session.flush()

    cart_item = CartItem.query.filter_by(cart_id=cart.id, product_id=product.id).first()
    if cart_item:
        cart_item.quantity += 1
    else:
        cart_item = CartItem(cart_id=cart.id, product_id=product.id, quantity=1)
        db.session.add(cart_item)

    db.session.commit()

    return jsonify({
        'success': True,
        'message': f'"{product.name}" moved to cart successfully!',
        'cart': cart.to_dict()
    }), 200
