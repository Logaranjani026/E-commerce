from backend.models.product import Product
from backend.models.user_activity import UserActivity
from backend.models.order import OrderItem, Order
from backend.models.wishlist import Wishlist
from backend.models.database import db

class RecommendationService:
    @staticmethod
    def get_personalized_recommendations(user_id=None, limit=8):
        """
        Calculates personalized recommendations for a user based on:
        1. Recently viewed categories & products
        2. Cart & Wishlist items
        3. Past orders
        4. Fallback to trending/featured products if anonymous or new user
        """
        recommended_products = []
        context_reason = "Trending & Popular Right Now"

        if user_id:
            # 1. Check recent activity
            recent_activities = UserActivity.query.filter_by(user_id=user_id)\
                .order_by(UserActivity.created_at.desc()).limit(10).all()

            viewed_product_ids = [a.product_id for a in recent_activities if a.product_id]
            viewed_categories = set()

            for pid in viewed_product_ids:
                p = Product.query.get(pid)
                if p and p.category_id:
                    viewed_categories.add(p.category_id)

            # Check wishlist categories
            wishlist_items = Wishlist.query.filter_by(user_id=user_id).all()
            for w in wishlist_items:
                if w.product and w.product.category_id:
                    viewed_categories.add(w.product.category_id)

            if viewed_categories:
                # Find products in these categories that user hasn't bought yet
                prods = Product.query.filter(
                    Product.category_id.in_(list(viewed_categories)),
                    ~Product.id.in_(viewed_product_ids[:4]) # Avoid repeating recently clicked items
                ).order_by(Product.rating.desc()).limit(limit).all()

                if prods:
                    # Get primary category name
                    cat = Product.query.get(viewed_product_ids[0]).category if viewed_product_ids else None
                    cat_name = cat.name if cat else "your favorite categories"
                    context_reason = f"Because you explored {cat_name}"
                    recommended_products = [p.to_dict() for p in prods]

        # Fallback if not enough recommendations
        if len(recommended_products) < 4:
            fallback_prods = Product.query.filter(
                (Product.is_featured == True) | (Product.is_trending == True)
            ).order_by(Product.rating.desc()).limit(limit).all()
            
            existing_ids = {p['id'] for p in recommended_products}
            for p in fallback_prods:
                if p.id not in existing_ids:
                    recommended_products.append(p.to_dict())

        return {
            'reason': context_reason,
            'products': recommended_products[:limit]
        }

    @staticmethod
    def get_related_products(product_id, limit=4):
        """
        Fetches related products in the same category or brand.
        """
        product = Product.query.get(product_id)
        if not product:
            return []

        related = Product.query.filter(
            Product.category_id == product.category_id,
            Product.id != product.id
        ).order_by(Product.rating.desc()).limit(limit).all()

        # If not enough, fetch same brand or popular
        if len(related) < limit:
            more = Product.query.filter(
                Product.id != product.id,
                ~Product.id.in_([p.id for p in related])
            ).order_by(Product.rating.desc()).limit(limit - len(related)).all()
            related.extend(more)

        return [p.to_dict() for p in related]
