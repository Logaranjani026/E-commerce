from datetime import datetime
from backend.models.database import db

class UserActivity(db.Model):
    __tablename__ = 'user_activity'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=True, index=True)
    activity_type = db.Column(db.String(50), nullable=False) # 'view', 'search', 'cart_add', 'wishlist_add'
    query = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    product = db.relationship('Product', foreign_keys=[product_id])

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'product_id': self.product_id,
            'activity_type': self.activity_type,
            'query': self.query,
            'product': self.product.to_dict() if self.product else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
