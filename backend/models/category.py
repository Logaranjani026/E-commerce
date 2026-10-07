from datetime import datetime
from backend.models.database import db

class Category(db.Model):
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    icon = db.Column(db.String(50), nullable=True)
    image_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    products = db.relationship('Product', backref='category', lazy='dynamic')

    def to_dict(self, include_product_count=True):
        data = {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'icon': self.icon,
            'image_url': self.image_url,
        }
        if include_product_count:
            data['product_count'] = self.products.count()
        return data
