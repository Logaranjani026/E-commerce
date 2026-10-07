from flask import Blueprint, request, jsonify, g
from backend.models.database import db
from backend.models.user import User
from backend.models.cart import Cart
from backend.middleware.auth_middleware import generate_jwt_token, jwt_required

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    confirm_password = data.get('confirm_password', '')
    phone = data.get('phone', '').strip()

    # Validations
    if not name or not email or not password:
        return jsonify({'success': False, 'message': 'Name, email, and password are required.'}), 400

    if '@' not in email or '.' not in email:
        return jsonify({'success': False, 'message': 'Please provide a valid email address.'}), 400

    if len(password) < 6:
        return jsonify({'success': False, 'message': 'Password must be at least 6 characters long.'}), 400

    if confirm_password and password != confirm_password:
        return jsonify({'success': False, 'message': 'Passwords do not match.'}), 400

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'success': False, 'message': 'An account with this email already exists. Please log in.'}), 409

    # Create new user
    new_user = User(
        name=name,
        email=email,
        role='customer',
        phone=phone
    )
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.flush()

    # Create empty cart for user
    new_cart = Cart(user_id=new_user.id)
    db.session.add(new_cart)
    db.session.commit()

    token = generate_jwt_token(new_user)

    return jsonify({
        'success': True,
        'message': 'Registration successful! Welcome to SmartCart AI.',
        'token': token,
        'user': new_user.to_dict()
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'success': False, 'message': 'Email and password are required.'}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({'success': False, 'message': 'Invalid email or password.'}), 401

    token = generate_jwt_token(user)

    return jsonify({
        'success': True,
        'message': 'Logged in successfully!',
        'token': token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user = g.current_user
    return jsonify({
        'success': True,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user = g.current_user
    data = request.get_json() or {}

    if 'name' in data and data['name'].strip():
        user.name = data['name'].strip()
    if 'phone' in data:
        user.phone = data['phone'].strip()
    if 'avatar' in data:
        user.avatar = data['avatar'].strip()

    db.session.commit()

    return jsonify({
        'success': True,
        'message': 'Profile updated successfully!',
        'user': user.to_dict()
    }), 200
