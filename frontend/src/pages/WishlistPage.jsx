import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import PriceTag from '../components/common/PriceTag';
import RatingStars from '../components/common/RatingStars';

const WishlistPage = () => {
  const { wishlist, removeFromWishlist, moveToCart, wishlistCount } = useWishlist();

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 sm:p-12 bg-white rounded-3xl border border-slate-200/80 text-center space-y-4 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Your Wishlist is Empty</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          Save your favorite products to keep track of prices, specifications, and special deals.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
        >
          <span>Explore Products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          My Wishlist ({wishlistCount} items)
        </h1>
        <p className="text-xs text-slate-500 mt-1">Saved items you love</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {wishlist.map((item) => {
          const prod = item.product;
          if (!prod) return null;

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between hover:shadow-lg transition-all"
            >
              <div>
                <div className="relative aspect-square bg-slate-50 rounded-xl p-3 mb-3 flex items-center justify-center">
                  <img
                    src={prod.primary_image || prod.images?.[0]}
                    alt={prod.name}
                    className="max-h-full max-w-full object-contain"
                  />
                  <button
                    onClick={() => removeFromWishlist(prod.id)}
                    className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white text-slate-400 hover:text-red-500 rounded-full shadow-xs transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                  {prod.brand}
                </span>
                
                <Link
                  to={`/products/${prod.slug || prod.id}`}
                  className="text-xs sm:text-sm font-bold text-slate-900 hover:text-indigo-600 line-clamp-2 mt-0.5"
                >
                  {prod.name}
                </Link>

                <div className="my-2">
                  <RatingStars rating={prod.rating} count={prod.review_count} size="xs" />
                </div>

                <div className="mb-3">
                  <PriceTag
                    price={prod.final_price}
                    originalPrice={prod.price}
                    discountPercent={prod.discount_percent}
                    size="sm"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => moveToCart(prod)}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Move to Cart</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default WishlistPage;
