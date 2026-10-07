from datetime import datetime
from backend.models.database import db

class Cart(db.Model):
    __tablename__ = 'cart'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    items = db.relationship('CartItem', backref='cart', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        items_list = [item.to_dict() for item in self.items.all()]
        subtotal = sum(item['product']['final_price'] * item['quantity'] for item in items_list if item['product'])
        
        # Calculate discount and shipping logic
        # Free delivery over ₹999, else ₹99
        delivery_charge = 0.0 if subtotal >= 999.0 or subtotal == 0 else 99.0
        total_amount = subtotal + delivery_charge

        return {
            'id': self.id,
            'user_id': self.user_id,
            'items': items_list,
            'total_items_count': sum(item['quantity'] for item in items_list),
            'subtotal': round(subtotal, 2),
            'delivery_charge': round(delivery_charge, 2),
            'total_amount': round(total_amount, 2),
            'free_delivery_threshold': 999.0,
            'qualifies_for_free_delivery': subtotal >= 999.0
        }

class CartItem(db.Model):
    __tablename__ = 'cart_items'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    cart_id = db.Column(db.Integer, db.ForeignKey('cart.id'), nullable=False, index=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False, index=True)
    quantity = db.Column(db.Integer, default=1, nullable=False)
    added_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'cart_id': self.cart_id,
            'product_id': self.product_id,
            'quantity': self.quantity,
            'added_at': self.added_at.isoformat() if self.added_at else None,
            'product': self.product.to_dict() if self.product else None
        }
