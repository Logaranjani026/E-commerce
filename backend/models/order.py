import json
from datetime import datetime
from backend.models.database import db

class Address(db.Model):
    __tablename__ = 'addresses'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    full_name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    street_address = db.Column(db.String(255), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    state = db.Column(db.String(100), nullable=False)
    pincode = db.Column(db.String(10), nullable=False)
    is_default = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'full_name': self.full_name,
            'phone': self.phone,
            'street_address': self.street_address,
            'city': self.city,
            'state': self.state,
            'pincode': self.pincode,
            'is_default': self.is_default,
        }

class Order(db.Model):
    __tablename__ = 'orders'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)
    
    # Status: 'Order Placed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'
    status = db.Column(db.String(50), default='Order Placed', nullable=False)
    
    subtotal = db.Column(db.Float, nullable=False)
    discount_amount = db.Column(db.Float, default=0.0)
    delivery_charge = db.Column(db.Float, default=0.0)
    total_amount = db.Column(db.Float, nullable=False)
    
    payment_method = db.Column(db.String(50), default='COD') # 'COD', 'UPI', 'CARD', 'DEMO'
    payment_status = db.Column(db.String(50), default='Pending') # 'Paid', 'Pending', 'Failed'
    
    _shipping_address = db.Column('shipping_address', db.Text, nullable=False) # JSON dict
    _tracking_timeline = db.Column('tracking_timeline', db.Text, nullable=True) # JSON list of events
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    items = db.relationship('OrderItem', backref='order', lazy='dynamic', cascade='all, delete-orphan')
    payment = db.relationship('Payment', backref='order', uselist=False, cascade='all, delete-orphan')

    @property
    def shipping_address(self):
        if not self._shipping_address:
            return {}
        try:
            return json.loads(self._shipping_address)
        except Exception:
            return {}

    @shipping_address.setter
    def shipping_address(self, val):
        if isinstance(val, dict):
            self._shipping_address = json.dumps(val)
        else:
            self._shipping_address = str(val)

    @property
    def tracking_timeline(self):
        if not self._tracking_timeline:
            return []
        try:
            return json.loads(self._tracking_timeline)
        except Exception:
            return []

    @tracking_timeline.setter
    def tracking_timeline(self, val):
        if isinstance(val, list):
            self._tracking_timeline = json.dumps(val)
        else:
            self._tracking_timeline = json.dumps([])

    def to_dict(self):
        return {
            'id': self.id,
            'order_number': self.order_number,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else 'Customer',
            'user_email': self.user.email if self.user else '',
            'status': self.status,
            'subtotal': round(self.subtotal, 2),
            'discount_amount': round(self.discount_amount, 2),
            'delivery_charge': round(self.delivery_charge, 2),
            'total_amount': round(self.total_amount, 2),
            'payment_method': self.payment_method,
            'payment_status': self.payment_status,
            'shipping_address': self.shipping_address,
            'tracking_timeline': self.tracking_timeline,
            'items': [item.to_dict() for item in self.items.all()],
            'item_count': sum(item.quantity for item in self.items.all()),
            'created_at': self.created_at.strftime('%b %d, %Y %I:%M %p') if self.created_at else '',
            'created_at_iso': self.created_at.isoformat() if self.created_at else None
        }

class OrderItem(db.Model):
    __tablename__ = 'order_items'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False, index=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=True)
    product_name = db.Column(db.String(200), nullable=False)
    product_image = db.Column(db.String(500), nullable=True)
    price = db.Column(db.Float, nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    total_price = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'product_id': self.product_id,
            'product_name': self.product_name,
            'product_image': self.product_image,
            'price': self.price,
            'quantity': self.quantity,
            'total_price': self.total_price
        }

class Payment(db.Model):
    __tablename__ = 'payments'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False, unique=True)
    payment_method = db.Column(db.String(50), nullable=False) # 'COD', 'UPI', 'CARD', 'DEMO'
    transaction_id = db.Column(db.String(100), unique=True, nullable=False)
    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default='Completed')
    payment_date = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'order_id': self.order_id,
            'payment_method': self.payment_method,
            'transaction_id': self.transaction_id,
            'amount': self.amount,
            'status': self.status,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None
        }
