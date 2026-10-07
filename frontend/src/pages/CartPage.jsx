import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Trash2, 
  ArrowRight, 
  Tag, 
  ShieldCheck, 
  Truck, 
  CheckCircle2,
  PackageOpen
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatINR } from '../components/common/PriceTag';
import { useToast } from '../context/ToastContext';

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const subtotal = cart.subtotal || 0;
  
  // Calculate discount based on applied coupon
  let discountAmount = 0;
  if (appliedCoupon === 'SMART10') {
    discountAmount = Math.round(subtotal * 0.10);
  } else if (appliedCoupon === 'AIWELCOME') {
    discountAmount = Math.min(500, subtotal);
  } else if (appliedCoupon === 'FESTIVE20') {
    discountAmount = Math.round(subtotal * 0.20);
  }

  const deliveryCharge = (subtotal - discountAmount >= 999 || subtotal === 0) ? 0 : 99;
  const finalTotal = Math.max(0, subtotal - discountAmount + deliveryCharge);
  const amountNeededForFreeDelivery = Math.max(0, 999 - (subtotal - discountAmount));

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (['SMART10', 'AIWELCOME', 'FESTIVE20'].includes(code)) {
      setAppliedCoupon(code);
      showToast(`Coupon "${code}" applied successfully! 🎉`, 'success');
      setCouponCode('');
    } else {
      showToast('Invalid coupon code. Try SMART10, AIWELCOME, or FESTIVE20', 'error');
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 sm:p-12 bg-white rounded-3xl border border-slate-200/80 text-center space-y-4 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Your Shopping Cart is Empty</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          Looks like you haven't added any items to your cart yet. Explore our intelligent catalog and find top deals!
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
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Shopping Cart ({cart.total_items_count} items)
          </h1>
          <p className="text-xs text-slate-500 mt-1">Review your selections and proceed to secure checkout</p>
        </div>
        
        <button
          onClick={clearCart}
          className="text-xs text-slate-500 hover:text-red-600 font-semibold transition-colors"
        >
          Clear Cart
        </button>
      </div>

      {/* Free Delivery Progress Bar */}
      <div className="bg-indigo-50/80 border border-indigo-200/80 rounded-2xl p-4">
        <div className="flex items-center justify-between text-xs font-bold text-indigo-950 mb-2">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-indigo-600" />
            <span>
              {deliveryCharge === 0
                ? '🎉 You unlocked FREE Express Delivery!'
                : `Add ${formatINR(amountNeededForFreeDelivery)} more to qualify for FREE Delivery!`}
            </span>
          </div>
          <span className="text-[11px] text-indigo-700">Threshold: ₹999</span>
        </div>
        <div className="w-full h-2 bg-indigo-200/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${Math.min(100, ((subtotal - discountAmount) / 999) * 100)}%` }}
          />
        </div>
      </div>

      {/* Grid: Cart Items List + Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {cart.items.map((item) => {
            const prod = item.product;
            if (!prod) return null;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-between"
              >
                {/* Thumbnail & Title */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <Link
                    to={`/products/${prod.slug || prod.id}`}
                    className="w-20 h-20 rounded-xl bg-slate-50 p-2 border border-slate-100 flex items-center justify-center shrink-0"
                  >
                    <img
                      src={prod.primary_image || prod.images?.[0]}
                      alt={prod.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </Link>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                      {prod.brand}
                    </span>
                    <Link
                      to={`/products/${prod.slug || prod.id}`}
                      className="text-xs sm:text-sm font-bold text-slate-900 hover:text-indigo-600 line-clamp-2"
                    >
                      {prod.name}
                    </Link>
                    <div className="text-xs font-bold text-slate-800">
                      {formatINR(prod.final_price)} each
                    </div>
                  </div>
                </div>

                {/* Stepper, Subtotal & Actions */}
                <div className="flex items-center justify-between w-full sm:w-auto sm:gap-8 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  
                  {/* Quantity Stepper */}
                  <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-2xs">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 text-xs font-bold rounded-l-xl"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-bold text-slate-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 text-xs font-bold rounded-r-xl"
                    >
                      +
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-normal sm:hidden">Total:</span>
                    <span className="text-sm font-extrabold text-slate-900">
                      {formatINR(prod.final_price * item.quantity)}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Order Summary Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
            <h3 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-100">
              Order Summary
            </h3>

            {/* Coupon Box */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <span className="text-xs font-semibold text-slate-700">Apply Promo Code</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="SMART10, AIWELCOME"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors shrink-0"
                >
                  Apply
                </button>
              </div>

              {appliedCoupon && (
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                  <span>Coupon {appliedCoupon} Active</span>
                  <button
                    type="button"
                    onClick={() => setAppliedCoupon(null)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Remove
                  </button>
                </div>
              )}
            </form>

            {/* Price Breakdown */}
            <div className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900">{formatINR(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-600">
                  <span>Coupon Discount</span>
                  <span className="font-semibold">-{formatINR(discountAmount)}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span>Estimated Delivery</span>
                <span className="font-semibold text-slate-900">
                  {deliveryCharge === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    formatINR(deliveryCharge)
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-sm font-extrabold text-slate-900">
                <span>Total Amount</span>
                <span className="text-lg text-indigo-600">{formatINR(finalTotal)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => navigate('/checkout', { state: { appliedCoupon, discountAmount } })}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Safe & Secure 256-Bit Encrypted Checkout</span>
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

export default CartPage;
