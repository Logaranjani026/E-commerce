import random
import string
from datetime import datetime
from flask import Blueprint, request, jsonify, g
from backend.models.database import db
from backend.models.order import Order, OrderItem, Address, Payment
from backend.models.cart import Cart, CartItem
from backend.models.product import Product
from backend.middleware.auth_middleware import jwt_required

order_bp = Blueprint('orders', __name__, url_prefix='/api/orders')

def generate_order_number():
    random_str = ''.join(random.choices(string.digits, k=6))
    return f"ORD-2026-{random_str}"

def generate_transaction_id(method):
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
    return f"{method}-TXN-{random_str}"

@order_bp.route('', methods=['POST'])
@jwt_required()
def create_order():
    user = g.current_user
    data = request.get_json() or {}

    shipping_address = data.get('shipping_address')
    payment_method = data.get('payment_method', 'COD').upper() # 'COD', 'UPI', 'CARD', 'DEMO'
    coupon_code = data.get('coupon_code', '').strip().upper()
    direct_buy_item = data.get('direct_buy_item') # Optional for "Buy Now" flow

    if not shipping_address:
        return jsonify({'success': False, 'message': 'Shipping address is required'}), 400

    order_items_to_create = []
    subtotal = 0.0

    if direct_buy_item:
        # Buy Now single item flow
        p = Product.query.get(direct_buy_item.get('product_id'))
        if not p or p.stock_quantity <= 0:
            return jsonify({'success': False, 'message': 'Product is out of stock'}), 400
        qty = int(direct_buy_item.get('quantity', 1))
        item_total = p.final_price * qty
        subtotal += item_total
        order_items_to_create.append({
            'product_id': p.id,
            'product_name': p.name,
            'product_image': p.images[0] if p.images else '',
            'price': p.final_price,
            'quantity': qty,
            'total_price': item_total
        })
        p.stock_quantity -= qty
    else:
        # Checkout from Cart
        cart = Cart.query.filter_by(user_id=user.id).first()
        if not cart or not cart.items.count():
            return jsonify({'success': False, 'message': 'Your cart is empty'}), 400

        for item in cart.items.all():
            p = item.product
            if not p or p.stock_quantity < item.quantity:
                return jsonify({'success': False, 'message': f'"{p.name if p else "Product"}" does not have enough stock.'}), 400
            item_total = p.final_price * item.quantity
            subtotal += item_total
            order_items_to_create.append({
                'product_id': p.id,
                'product_name': p.name,
                'product_image': p.images[0] if p.images else '',
                'price': p.final_price,
                'quantity': item.quantity,
                'total_price': item_total
            })
            # Deduct stock
            p.stock_quantity -= item.quantity

    # Discounts
    discount_amount = 0.0
    if coupon_code == 'SMART10':
        discount_amount = round(subtotal * 0.10, 2)
    elif coupon_code == 'AIWELCOME':
        discount_amount = min(500.0, subtotal)
    elif coupon_code == 'FESTIVE20':
        discount_amount = round(subtotal * 0.20, 2)

    # Shipping calculation: Free over ₹999
    delivery_charge = 0.0 if (subtotal - discount_amount) >= 999.0 else 99.0
    total_amount = max(0.0, round(subtotal - discount_amount + delivery_charge, 2))

    # Initial tracking timeline
    now_str = datetime.utcnow().strftime('%b %d, %Y %I:%M %p')
    timeline = [
        {'status': 'Order Placed', 'time': now_str, 'done': True, 'desc': 'Order successfully placed & payment initiated'},
        {'status': 'Packed', 'time': 'Pending', 'done': False, 'desc': 'SmartCart fulfillment center will verify & pack'},
        {'status': 'Shipped', 'time': 'Pending', 'done': False, 'desc': 'Dispatched via express logistics'},
        {'status': 'Out for Delivery', 'time': 'Pending', 'done': False, 'desc': 'Courier partner delivering to your door'},
        {'status': 'Delivered', 'time': 'Pending', 'done': False, 'desc': 'Delivered with OTP verification'}
    ]

    order = Order(
        order_number=generate_order_number(),
        user_id=user.id,
        status='Order Placed',
        subtotal=subtotal,
        discount_amount=discount_amount,
        delivery_charge=delivery_charge,
        total_amount=total_amount,
        payment_method=payment_method,
        payment_status='Paid' if payment_method in ('UPI', 'CARD', 'DEMO') else 'Pending',
        shipping_address=shipping_address,
        tracking_timeline=timeline
    )
    db.session.add(order)
    db.session.flush()

    for item_data in order_items_to_create:
        order_item = OrderItem(
            order_id=order.id,
            product_id=item_data['product_id'],
            product_name=item_data['product_name'],
            product_image=item_data['product_image'],
            price=item_data['price'],
            quantity=item_data['quantity'],
            total_price=item_data['total_price']
        )
        db.session.add(order_item)

    # Record Payment
    payment = Payment(
        order_id=order.id,
        payment_method=payment_method,
        transaction_id=generate_transaction_id(payment_method),
        amount=total_amount,
        status='Completed' if payment_method in ('UPI', 'CARD', 'DEMO') else 'Pending'
    )
    db.session.add(payment)

    # Save address to user address book if requested or not exists
    if shipping_address.get('save_to_profile', True):
        existing_addr = Address.query.filter_by(
            user_id=user.id,
            street_address=shipping_address.get('street_address'),
            pincode=shipping_address.get('pincode')
        ).first()
        if not existing_addr:
            new_addr = Address(
                user_id=user.id,
                full_name=shipping_address.get('full_name', user.name),
                phone=shipping_address.get('phone', user.phone or ''),
                street_address=shipping_address.get('street_address', ''),
                city=shipping_address.get('city', ''),
                state=shipping_address.get('state', ''),
                pincode=shipping_address.get('pincode', ''),
                is_default=Address.query.filter_by(user_id=user.id).count() == 0
            )
            db.session.add(new_addr)

    # Clear Cart if ordered from cart
    if not direct_buy_item:
        cart = Cart.query.filter_by(user_id=user.id).first()
        if cart:
            CartItem.query.filter_by(cart_id=cart.id).delete()

    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Order placed successfully!',
        'order': order.to_dict()
    }), 201

@order_bp.route('', methods=['GET'])
@jwt_required()
def get_user_orders():
    user = g.current_user
    orders = Order.query.filter_by(user_id=user.id).order_by(Order.created_at.desc()).all()
    return jsonify({
        'success': True,
        'orders': [o.to_dict() for o in orders]
    }), 200

@order_bp.route('/<order_identifier>', methods=['GET'])
@jwt_required()
def get_order_detail(order_identifier):
    user = g.current_user
    if order_identifier.isdigit():
        order = Order.query.get_or_404(int(order_identifier))
    else:
        order = Order.query.filter_by(order_number=order_identifier).first_or_404()

    # Allow user or admin to view
    if order.user_id != user.id and user.role != 'admin':
        return jsonify({'success': False, 'message': 'Unauthorized to view this order'}), 403

    return jsonify({
        'success': True,
        'order': order.to_dict()
    }), 200

@order_bp.route('/<int:order_id>/cancel', methods=['PUT'])
@jwt_required()
def cancel_order(order_id):
    user = g.current_user
    order = Order.query.get_or_404(order_id)

    if order.user_id != user.id and user.role != 'admin':
        return jsonify({'success': False, 'message': 'Unauthorized to cancel this order'}), 403

    if order.status in ('Shipped', 'Out for Delivery', 'Delivered'):
        return jsonify({'success': False, 'message': f'Cannot cancel order because it is already {order.status}.'}), 400

    order.status = 'Cancelled'
    
    # Restore product inventory
    for item in order.items.all():
        prod = Product.query.get(item.product_id)
        if prod:
            prod.stock_quantity += item.quantity

    # Update timeline
    timeline = order.tracking_timeline
    timeline.append({
        'status': 'Cancelled',
        'time': datetime.utcnow().strftime('%b %d, %Y %I:%M %p'),
        'done': True,
        'desc': 'Order was cancelled by customer. Refund process initiated.'
    })
    order.tracking_timeline = timeline

    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Order cancelled successfully.',
        'order': order.to_dict()
    }), 200

# Address management endpoints
@order_bp.route('/addresses', methods=['GET'])
@jwt_required()
def get_saved_addresses():
    user = g.current_user
    addresses = Address.query.filter_by(user_id=user.id).order_by(Address.is_default.desc()).all()
    return jsonify({
        'success': True,
        'addresses': [a.to_dict() for a in addresses]
    }), 200

@order_bp.route('/addresses', methods=['POST'])
@jwt_required()
def add_saved_address():
    user = g.current_user
    data = request.get_json() or {}

    new_addr = Address(
        user_id=user.id,
        full_name=data.get('full_name', user.name),
        phone=data.get('phone', user.phone or ''),
        street_address=data.get('street_address', ''),
        city=data.get('city', ''),
        state=data.get('state', ''),
        pincode=data.get('pincode', ''),
        is_default=data.get('is_default', False)
    )
    if new_addr.is_default:
        Address.query.filter_by(user_id=user.id).update({'is_default': False})

    db.session.add(new_addr)
    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Address saved successfully',
        'address': new_addr.to_dict()
    }), 201

@order_bp.route('/addresses/<int:address_id>', methods=['DELETE'])
@jwt_required()
def delete_saved_address(address_id):
    user = g.current_user
    addr = Address.query.filter_by(id=address_id, user_id=user.id).first()
    if addr:
        db.session.delete(addr)
        db.session.commit()
    return jsonify({'success': True, 'message': 'Address deleted'}), 200
