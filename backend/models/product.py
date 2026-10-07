import json
from datetime import datetime
from backend.models.database import db

class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(200), nullable=False, index=True)
    slug = db.Column(db.String(220), unique=True, nullable=False, index=True)
    description = db.Column(db.Text, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False, index=True)
    brand = db.Column(db.String(100), nullable=False, index=True)
    price = db.Column(db.Float, nullable=False) # Original Price (e.g. 54999.00)
    discount_percent = db.Column(db.Float, default=0.0) # e.g. 10.0 for 10%
    final_price = db.Column(db.Float, nullable=False, index=True) # Calculated final price
    stock_quantity = db.Column(db.Integer, default=10)
    rating = db.Column(db.Float, default=4.5)
    review_count = db.Column(db.Integer, default=0)
    _images = db.Column('images', db.Text, nullable=False) # JSON list of image URLs
    _specifications = db.Column('specifications', db.Text, nullable=False) # JSON dict of specs
    why_this_product = db.Column(db.Text, nullable=True) # AI generated highlight
    is_featured = db.Column(db.Boolean, default=False)
    is_trending = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    reviews = db.relationship('ProductReview', backref='product', lazy='dynamic', cascade='all, delete-orphan')
    cart_items = db.relationship('CartItem', backref='product', cascade='all, delete-orphan')
    wishlist_items = db.relationship('Wishlist', backref='product', cascade='all, delete-orphan')

    @property
    def images(self):
        if not self._images:
            return []
        try:
            return json.loads(self._images)
        except Exception:
            return [self._images]

    @images.setter
    def images(self, val):
        if isinstance(val, (list, dict)):
            self._images = json.dumps(val)
        else:
            self._images = json.dumps([str(val)])

    @property
    def specifications(self):
        if not self._specifications:
            return {}
        try:
            return json.loads(self._specifications)
        except Exception:
            return {}

    @specifications.setter
    def specifications(self, val):
        if isinstance(val, dict):
            self._specifications = json.dumps(val)
        elif isinstance(val, str):
            self._specifications = val
        else:
            self._specifications = json.dumps({})

    def to_dict(self, include_reviews=False):
        data = {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'category_id': self.category_id,
            'category_name': self.category.name if self.category else '',
            'brand': self.brand,
            'price': self.price,
            'discount_percent': self.discount_percent,
            'final_price': self.final_price,
            'stock_quantity': self.stock_quantity,
            'in_stock': self.stock_quantity > 0,
            'rating': round(self.rating, 1),
            'review_count': self.review_count,
            'images': self.images,
            'primary_image': self.images[0] if self.images else '',
            'specifications': self.specifications,
            'why_this_product': self.why_this_product,
            'is_featured': self.is_featured,
            'is_trending': self.is_trending,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        if include_reviews:
            try:
                data['reviews'] = [r.to_dict() for r in self.reviews.all()[:10]]
            except Exception:
                data['reviews'] = []
        return data
