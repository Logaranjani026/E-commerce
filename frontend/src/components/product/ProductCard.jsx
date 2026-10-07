import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Scale, Check } from 'lucide-react';
import RatingStars from '../common/RatingStars';
import PriceTag from '../common/PriceTag';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';

const ProductCard = ({ product, showCompare = true }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, addToCompare } = useCompare();

  const isFavorited = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);

  const imageSrc = product.primary_image || product.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80';

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-blue-300 transition-all duration-200 flex flex-col justify-between overflow-hidden">
      
      {/* Top Badges & Actions */}
      <div className="relative p-4 pb-0">
        
        {/* Discount & Trending Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
          {product.discount_percent > 0 && (
            <span className="bg-rose-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wider">
              {Math.round(product.discount_percent)}% OFF
            </span>
          )}
          {product.is_trending && (
            <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
              Trending
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all shadow-xs ${
            isFavorited
              ? 'bg-red-50 text-red-500 hover:bg-red-100'
              : 'bg-white/90 text-slate-400 hover:text-red-500 hover:bg-white'
          }`}
          title={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500' : ''}`} />
        </button>

        {/* Product Image */}
        <Link to={`/products/${product.slug || product.id}`} className="block overflow-hidden rounded-xl bg-slate-50 relative aspect-square">
          <img
            src={imageSrc}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-200"
          />
        </Link>
      </div>

      {/* Product Information */}
      <div className="p-4 pt-3 flex flex-col flex-1 justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            <span className="text-blue-600 font-bold">{product.brand}</span>
            <span className="text-slate-500 font-normal capitalize">{product.category_name}</span>
          </div>

          {/* Title */}
          <Link
            to={`/products/${product.slug || product.id}`}
            className="block text-sm font-semibold text-slate-800 hover:text-blue-600 transition-colors line-clamp-2 min-h-[2.5rem]"
            title={product.name}
          >
            {product.name}
          </Link>

          {/* Rating */}
          <div className="mt-2 mb-3">
            <RatingStars rating={product.rating} count={product.review_count} size="xs" />
          </div>
        </div>

        {/* Price & Action Row */}
        <div>
          <div className="mb-3">
            <PriceTag
              price={product.final_price}
              originalPrice={product.price}
              discountPercent={product.discount_percent}
              size="md"
            />
          </div>

          {/* Buttons: Add to Cart & Compare */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
            <button
              onClick={() => addToCart(product, 1)}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>

            {showCompare && (
              <button
                onClick={() => addToCompare(product)}
                className={`p-2 rounded-xl border text-xs font-medium transition-all ${
                  isCompared
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                }`}
                title={isCompared ? 'In Compare' : 'Add to Compare'}
              >
                {isCompared ? <Check className="w-4 h-4 text-blue-600" /> : <Scale className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProductCard;
