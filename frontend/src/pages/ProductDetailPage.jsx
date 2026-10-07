import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ShoppingCart, 
  Zap, 
  Heart, 
  Scale, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Check, 
  Share2, 
  Star,
  CheckCircle2,
  Package
} from 'lucide-react';
import { productService } from '../services/productService';
import { aiService } from '../services/aiService';
import RatingStars from '../components/common/RatingStars';
import PriceTag, { formatINR } from '../components/common/PriceTag';
import ProductCard from '../components/product/ProductCard';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ProductDetailPage = () => {
  const { slugOrId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isInCompare, addToCompare } = useCompare();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('specs'); // 'specs' or 'reviews'
  const [loading, setLoading] = useState(true);

  // Review Form state
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        let res;
        if (!isNaN(slugOrId)) {
          res = await productService.getProductById(slugOrId);
        } else {
          res = await productService.getProductBySlug(slugOrId);
        }

        if (res.success && res.product) {
          setProduct(res.product);
          setActiveImage(res.product.primary_image || res.product.images?.[0] || '');
          setRelatedProducts(res.related_products || []);
        }
      } catch (err) {
        console.error('Fetch detail error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slugOrId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-500">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
        <Package className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500">The product you are looking for might have been removed or is unavailable.</p>
        <Link to="/products" className="inline-block px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);

  const handleBuyNow = async () => {
    const added = await addToCart(product, quantity);
    if (added || isAuthenticated) {
      navigate('/checkout');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Please sign in to write a review', 'info');
      return;
    }
    if (!newComment.trim()) {
      showToast('Please enter your review text', 'warning');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await productService.addReview(product.id, {
        rating: newRating,
        title: newTitle.trim(),
        comment: newComment.trim(),
      });
      if (res.success) {
        showToast('Review posted successfully! Thank you.', 'success');
        setProduct((prev) => ({
          ...prev,
          rating: res.updated_rating,
          review_count: res.review_count,
          reviews: [res.review, ...(prev.reviews || [])],
        }));
        setNewComment('');
        setNewTitle('');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error submitting review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link to="/" className="hover:text-indigo-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-indigo-600">Products</Link>
        <span>/</span>
        <Link to={`/products?category=${product.category_name?.toLowerCase()}`} className="hover:text-indigo-600 capitalize">
          {product.category_name}
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        
        {/* Left: Gallery */}
        <div className="space-y-4">
          <div className="relative bg-white rounded-3xl border border-slate-200/80 p-6 flex items-center justify-center aspect-square shadow-xs overflow-hidden group">
            <img
              src={activeImage || product.primary_image}
              alt={product.name}
              className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
            {product.discount_percent > 0 && (
              <span className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow-xs uppercase">
                {Math.round(product.discount_percent)}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((imgUrl, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(imgUrl)}
                  className={`w-20 h-20 rounded-2xl bg-white p-2 border transition-all shrink-0 ${
                    activeImage === imgUrl
                      ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & AI Highlight */}
        <div className="space-y-6">
          
          {/* Brand & Stock */}
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-extrabold uppercase tracking-wider rounded-lg">
              {product.brand}
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                product.in_stock
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${product.in_stock ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              {product.in_stock ? `In Stock (${product.stock_quantity} units)` : 'Out of Stock'}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
            {product.name}
          </h1>

          {/* Rating Summary */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-amber-900">{product.rating}</span>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Based on {product.review_count} verified customer reviews
            </span>
          </div>

          {/* Price Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <PriceTag
              price={product.final_price}
              originalPrice={product.price}
              discountPercent={product.discount_percent}
              size="lg"
            />
            <p className="text-[11px] text-slate-500">Inclusive of all taxes • Free shipping on orders over ₹999</p>
          </div>

          {/* Product Highlights & Key Benefits */}
          <div className="rounded-2xl bg-blue-50/60 border border-blue-200/80 p-5 space-y-2">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              <span>Product Highlights & Key Features</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              {product.why_this_product || `Engineered for superior reliability and everyday performance with verified high-tier specifications from ${product.brand}.`}
            </p>
          </div>

          {/* Quantity & Actions */}
          <div className="space-y-4 pt-2">
            
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700">Quantity:</span>
              <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-2xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 text-xs font-bold rounded-l-xl"
                >
                  -
                </button>
                <span className="px-4 text-xs font-bold text-slate-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_quantity || 10, quantity + 1))}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 text-xs font-bold rounded-r-xl"
                >
                  +
                </button>
              </div>
            </div>

            {/* Buttons Row */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                disabled={!product.in_stock}
                onClick={() => addToCart(product, quantity)}
                className="w-full sm:flex-1 py-3.5 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                disabled={!product.in_stock}
                onClick={handleBuyNow}
                className="w-full sm:flex-1 py-3.5 px-6 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Buy Now</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-3.5 rounded-2xl border transition-all flex-1 sm:flex-none flex items-center justify-center ${
                    isFavorited
                      ? 'bg-red-50 text-red-500 border-red-200'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                  }`}
                  title={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-red-500' : ''}`} />
                </button>

                <button
                  onClick={() => addToCompare(product)}
                  className={`p-3.5 rounded-2xl border transition-all flex-1 sm:flex-none flex items-center justify-center ${
                    isCompared
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                  }`}
                  title={isCompared ? 'In Compare List' : 'Compare Product'}
                >
                  {isCompared ? <Check className="w-5 h-5 text-purple-600" /> : <Scale className="w-5 h-5" />}
                </button>
              </div>
            </div>

          </div>

          {/* Delivery & Assurance Pills */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-center text-xs">
            <div className="p-3 bg-white rounded-xl border border-slate-200/80">
              <Truck className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
              <span className="font-semibold text-slate-800 block">Fast Delivery</span>
              <span className="text-[10px] text-slate-400">2-3 Business Days</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200/80">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <span className="font-semibold text-slate-800 block">Brand Warranty</span>
              <span className="text-[10px] text-slate-400">100% Genuine</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200/80">
              <RotateCcw className="w-4 h-4 text-purple-600 mx-auto mb-1" />
              <span className="font-semibold text-slate-800 block">Easy Returns</span>
              <span className="text-[10px] text-slate-400">7-Day Guarantee</span>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs: Specifications & Customer Reviews */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-6 border-b border-slate-100 pb-3 text-sm font-bold">
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'specs'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Technical Specifications
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === 'reviews'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Customer Reviews ({product.review_count})
          </button>
        </div>

        {/* Specs Table Tab */}
        {activeTab === 'specs' && (
          <div className="space-y-6">
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <tbody>
                  {product.specifications &&
                    Object.entries(product.specifications).map(([key, val], idx) => (
                      <tr
                        key={idx}
                        className={`border-b border-slate-100 ${
                          idx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'
                        }`}
                      >
                        <td className="py-3 px-4 font-bold text-slate-600 w-1/3 sm:w-1/4">
                          {key}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {val}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Customer Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-8">
            
            {/* Add Review Form */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
              <h4 className="text-sm font-bold text-slate-900">Write a Customer Review</h4>
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-700">Your Rating:</span>
                  <RatingStars rating={newRating} interactive onRatingChange={(r) => setNewRating(r)} size="md" />
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Review headline (e.g. Great build quality!)"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <textarea
                    rows={3}
                    placeholder="Share your experience with this product..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>

            {/* Existing Reviews List */}
            <div className="space-y-4">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl border border-slate-100 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{rev.user_name}</span>
                        {rev.is_verified_purchase && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-md font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Verified Purchase
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400">{rev.created_at}</span>
                    </div>

                    <RatingStars rating={rev.rating} size="xs" />

                    {rev.title && <h5 className="text-xs font-bold text-slate-800">{rev.title}</h5>}
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">No reviews yet. Be the first to review this product!</p>
              )}
            </div>

          </div>
        )}
      </div>

      {/* Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">Similar Products You May Like</h3>
            <Link to={`/products?category=${product.category_name?.toLowerCase()}`} className="text-xs font-bold text-indigo-600 hover:underline">
              See more in {product.category_name}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default ProductDetailPage;
