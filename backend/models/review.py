from datetime import datetime
from backend.models.database import db

class ProductReview(db.Model):
    __tablename__ = 'product_reviews'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True, index=True)
    user_name = db.Column(db.String(120), nullable=False, default='Verified Customer')
    rating = db.Column(db.Integer, nullable=False, default=5) # 1 to 5
    title = db.Column(db.String(200), nullable=True)
    comment = db.Column(db.Text, nullable=False)
    is_verified_purchase = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'product_id': self.product_id,
            'user_id': self.user_id,
            'user_name': self.user_name,
            'rating': self.rating,
            'title': self.title,
            'comment': self.comment,
            'is_verified_purchase': self.is_verified_purchase,
            'created_at': self.created_at.strftime('%b %d, %Y') if self.created_at else ''
        }
