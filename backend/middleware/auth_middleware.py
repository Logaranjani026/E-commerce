import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, g
from backend.config.settings import Config
from backend.models.user import User

def generate_jwt_token(user):
    payload = {
        'sub': user.id,
        'email': user.email,
        'role': user.role,
        'name': user.name,
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + timedelta(hours=Config.JWT_ACCESS_TOKEN_EXPIRES_HOURS)
    }
    return jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm='HS256')

def decode_jwt_token(token):
    try:
        payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def jwt_required(optional=False):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            auth_header = request.headers.get('Authorization')
            token = None
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1].strip()

            if not token:
                if optional:
                    g.current_user = None
                    return f(*args, **kwargs)
                return jsonify({'success': False, 'message': 'Authentication token is missing'}), 401

            payload = decode_jwt_token(token)
            if not payload:
                if optional:
                    g.current_user = None
                    return f(*args, **kwargs)
                return jsonify({'success': False, 'message': 'Token is invalid or expired'}), 401

            user = User.query.get(payload.get('sub'))
            if not user:
                if optional:
                    g.current_user = None
                    return f(*args, **kwargs)
                return jsonify({'success': False, 'message': 'User not found'}), 401

            g.current_user = user
            g.user_id = user.id
            g.user_role = user.role
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def admin_required():
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            auth_header = request.headers.get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({'success': False, 'message': 'Authentication token is required'}), 401

            token = auth_header.split(' ')[1].strip()
            payload = decode_jwt_token(token)
            if not payload:
                return jsonify({'success': False, 'message': 'Token is invalid or expired'}), 401

            user = User.query.get(payload.get('sub'))
            if not user or user.role != 'admin':
                return jsonify({'success': False, 'message': 'Admin privileges required for this action'}), 403

            g.current_user = user
            g.user_id = user.id
            g.user_role = user.role
            return f(*args, **kwargs)
        return decorated_function
    return decorator
