from backend.routes.auth_routes import auth_bp
from backend.routes.product_routes import product_bp
from backend.routes.cart_routes import cart_bp
from backend.routes.wishlist_routes import wishlist_bp
from backend.routes.order_routes import order_bp
from backend.routes.ai_routes import ai_bp
from backend.routes.admin_routes import admin_bp

def register_blueprints(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(product_bp)
    app.register_blueprint(cart_bp)
    app.register_blueprint(wishlist_bp)
    app.register_blueprint(order_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(admin_bp)
