from flask import Blueprint, request, jsonify, g
from backend.models.database import db
from backend.models.cart import Cart, CartItem
from backend.models.product import Product
from backend.models.user_activity import UserActivity
from backend.middleware.auth_middleware import jwt_required

cart_bp = Blueprint('cart', __name__, url_prefix='/api/cart')

def _get_or_create_user_cart(user_id):
    cart = Cart.query.filter_by(user_id=user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.session.add(cart)
        db.session.commit()
    return cart

@cart_bp.route('', methods=['GET'])
@jwt_required()
def get_cart():
    user = g.current_user
    cart = _get_or_create_user_cart(user.id)
    return jsonify({
        'success': True,
        'cart': cart.to_dict()
    }), 200

@cart_bp.route('/items', methods=['POST'])
@jwt_required()
def add_to_cart():
    user = g.current_user
    data = request.get_json() or {}
    product_id = data.get('product_id')
    quantity = int(data.get('quantity', 1))

    if not product_id:
        return jsonify({'success': False, 'message': 'Product ID is required'}), 400

    product = Product.query.get(product_id)
    if not product:
        return jsonify({'success': False, 'message': 'Product not found'}), 404

    if product.stock_quantity < quantity:
        return jsonify({'success': False, 'message': f'Only {product.stock_quantity} units available in stock'}), 400

    cart = _get_or_create_user_cart(user.id)
    cart_item = CartItem.query.filter_by(cart_id=cart.id, product_id=product.id).first()

    if cart_item:
        cart_item.quantity += quantity
    else:
        cart_item = CartItem(cart_id=cart.id, product_id=product.id, quantity=quantity)
        db.session.add(cart_item)

    # Log activity for recommendation engine
    activity = UserActivity(user_id=user.id, product_id=product.id, activity_type='cart_add')
    db.session.add(activity)

    db.session.commit()

    return jsonify({
        'success': True,
        'message': f'"{product.name}" added to your cart!',
        'cart': cart.to_dict()
    }), 200

@cart_bp.route('/items/<int:item_id>', methods=['PUT'])
@jwt_required()
def update_cart_item(item_id):
    user = g.current_user
    cart = _get_or_create_user_cart(user.id)
    item = CartItem.query.filter_by(id=item_id, cart_id=cart.id).first_or_404()

    data = request.get_json() or {}
    quantity = int(data.get('quantity', 1))

    if quantity <= 0:
        db.session.delete(item)
    else:
        if item.product and item.product.stock_quantity < quantity:
            return jsonify({'success': False, 'message': f'Only {item.product.stock_quantity} units available'}), 400
        item.quantity = quantity

    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Cart updated successfully',
        'cart': cart.to_dict()
    }), 200

@cart_bp.route('/items/<int:item_id>', methods=['DELETE'])
@jwt_required()
def remove_cart_item(item_id):
    user = g.current_user
    cart = _get_or_create_user_cart(user.id)
    item = CartItem.query.filter_by(id=item_id, cart_id=cart.id).first()

    if item:
        db.session.delete(item)
        db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Item removed from cart',
        'cart': cart.to_dict()
    }), 200

@cart_bp.route('/clear', methods=['DELETE'])
@jwt_required()
def clear_cart():
    user = g.current_user
    cart = _get_or_create_user_cart(user.id)
    CartItem.query.filter_by(cart_id=cart.id).delete()
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Cart cleared',
        'cart': cart.to_dict()
    }), 200
