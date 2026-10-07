from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from backend.models.database import db

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='customer') # 'customer' or 'admin'
    phone = db.Column(db.String(20), nullable=True)
    avatar = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    cart = db.relationship('Cart', backref='user', uselist=False, cascade='all, delete-orphan')
    wishlist_items = db.relationship('Wishlist', backref='user', cascade='all, delete-orphan')
    orders = db.relationship('Order', backref='user', lazy='dynamic')
    reviews = db.relationship('ProductReview', backref='user', lazy='dynamic')
    addresses = db.relationship('Address', backref='user', cascade='all, delete-orphan')
    activities = db.relationship('UserActivity', backref='user', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self, include_sensitive=False):
        data = {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'phone': self.phone,
            'avatar': self.avatar,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        return data
