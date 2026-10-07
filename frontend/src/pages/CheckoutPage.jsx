import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Check, 
  MapPin, 
  CreditCard, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  QrCode, 
  Banknote, 
  Sparkles,
  ArrowRight,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/orderService';
import { formatINR } from '../components/common/PriceTag';
import { useToast } from '../context/ToastContext';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { cart, refreshCart } = useCart();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1); // 1: Address, 2: Summary, 3: Payment
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // Address form fields
  const [addressForm, setAddressForm] = useState({
    full_name: user?.name || '',
    phone: user?.phone || '',
    street_address: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
  });

  // Payment method: 'UPI' | 'CARD' | 'COD' | 'DEMO'
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [cardDetails, setCardDetails] = useState({
    number: '4532 •••• •••• 8912',
    name: user?.name || 'Cardholder Name',
    expiry: '12/28',
    cvv: '•••'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState(null);

  // Coupon state passed from Cart
  const appliedCoupon = location.state?.appliedCoupon || '';
  const subtotal = cart.subtotal || 0;
  
  let discountAmount = location.state?.discountAmount || 0;
  if (!discountAmount && appliedCoupon) {
    if (appliedCoupon === 'SMART10') discountAmount = Math.round(subtotal * 0.10);
    else if (appliedCoupon === 'AIWELCOME') discountAmount = Math.min(500, subtotal);
  }

  const deliveryCharge = (subtotal - discountAmount >= 999 || subtotal === 0) ? 0 : 99;
  const finalTotal = Math.max(0, subtotal - discountAmount + deliveryCharge);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await orderService.getAddresses();
        if (res.success && res.addresses?.length > 0) {
          setSavedAddresses(res.addresses);
          setShowNewAddressForm(false);
        } else {
          setShowNewAddressForm(true);
        }
      } catch {
        setShowNewAddressForm(true);
      }
    };
    fetchAddresses();
  }, []);

  const handlePlaceOrder = async () => {
    let chosenAddress = null;
    if (savedAddresses.length > 0 && !showNewAddressForm) {
      chosenAddress = savedAddresses[selectedAddressIndex];
    } else {
      if (!addressForm.full_name || !addressForm.phone || !addressForm.street_address || !addressForm.pincode) {
        showToast('Please fill all required delivery address fields', 'warning');
        setCurrentStep(1);
        return;
      }
      chosenAddress = addressForm;
    }

    try {
      setIsSubmitting(true);
      const orderPayload = {
        shipping_address: chosenAddress,
        payment_method: paymentMethod,
        coupon_code: appliedCoupon,
      };

      const res = await orderService.createOrder(orderPayload);
      if (res.success && res.order) {
        // Trigger celebratory confetti!
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });

        setOrderSuccessData(res.order);
        showToast('Order placed successfully! 🎉', 'success');
        await refreshCart();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error creating order', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION SCREEN
  if (orderSuccessData) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 sm:p-12 bg-white rounded-3xl border border-slate-200/80 text-center space-y-6 shadow-xl animate-in zoom-in-95 duration-200">
        <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <Check className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Order Confirmed</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Thank You For Your Order!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Order <strong className="text-slate-900">#{orderSuccessData.order_number}</strong> has been placed and is being packed.
          </p>
        </div>

        {/* Order Details Brief Box */}
        <div className="bg-slate-50 rounded-2xl p-5 text-left text-xs space-y-3 border border-slate-200/80">
          <div className="flex justify-between font-semibold pb-2 border-b border-slate-200">
            <span>Payment Method: {orderSuccessData.payment_method}</span>
            <span className="text-emerald-600">Status: {orderSuccessData.payment_status}</span>
          </div>
          <div className="flex justify-between font-bold text-sm text-slate-900">
            <span>Amount Paid:</span>
            <span>{formatINR(orderSuccessData.total_amount)}</span>
          </div>
          <div className="text-slate-600 pt-1">
            <span className="font-bold text-slate-700">Delivering to: </span>
            {orderSuccessData.shipping_address?.full_name}, {orderSuccessData.shipping_address?.street_address}, {orderSuccessData.shipping_address?.city} ({orderSuccessData.shipping_address?.pincode})
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            to={`/orders/${orderSuccessData.order_number}`}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <Truck className="w-4 h-4" />
            <span>Track Order Timeline</span>
          </Link>
          <Link
            to="/products"
            className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Checkout Steps Stepper */}
      <div className="max-w-2xl mx-auto pb-4">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full bg-slate-200 -z-10" />

          {/* Step 1 */}
          <div className="flex flex-col items-center gap-1.5 bg-slate-50 px-2">
            <button
              onClick={() => setCurrentStep(1)}
              className={`w-9 h-9 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                currentStep >= 1 ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-200 text-slate-600'
              }`}
            >
              1
            </button>
            <span className="text-xs font-bold text-slate-700">Address</span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center gap-1.5 bg-slate-50 px-2">
            <button
              onClick={() => setCurrentStep(2)}
              className={`w-9 h-9 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                currentStep >= 2 ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-200 text-slate-600'
              }`}
            >
              2
            </button>
            <span className="text-xs font-bold text-slate-700">Summary</span>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center gap-1.5 bg-slate-50 px-2">
            <button
              onClick={() => setCurrentStep(3)}
              className={`w-9 h-9 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                currentStep >= 3 ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-200 text-slate-600'
              }`}
            >
              3
            </button>
            <span className="text-xs font-bold text-slate-700">Payment</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Multi-Step Content */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* STEP 1: ADDRESS */}
          {currentStep === 1 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-lg font-bold text-slate-900">Step 1: Delivery Address</h2>
                </div>
                {savedAddresses.length > 0 && (
                  <button
                    onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                    className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showNewAddressForm ? 'Use Saved Address' : 'Add New Address'}</span>
                  </button>
                )}
              </div>

              {/* Saved Addresses Picker */}
              {!showNewAddressForm && savedAddresses.length > 0 && (
                <div className="space-y-3">
                  {savedAddresses.map((addr, idx) => (
                    <div
                      key={addr.id || idx}
                      onClick={() => setSelectedAddressIndex(idx)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start justify-between ${
                        selectedAddressIndex === idx
                          ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{addr.full_name}</span>
                          <span className="text-slate-400">• {addr.phone}</span>
                        </div>
                        <p className="text-slate-600">{addr.street_address}</p>
                        <p className="text-slate-600">{addr.city}, {addr.state} - {addr.pincode}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          selectedAddressIndex === idx ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {selectedAddressIndex === idx && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* New Address Form */}
              {(showNewAddressForm || savedAddresses.length === 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={addressForm.full_name}
                      onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      placeholder="e.g. Rahul Sharma"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      placeholder="+91 9876543210"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-700 block mb-1">Street Address / Flat No *</label>
                    <input
                      type="text"
                      value={addressForm.street_address}
                      onChange={(e) => setAddressForm({ ...addressForm, street_address: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      placeholder="Flat 402, Sunshine Heights, Indiranagar"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">City *</label>
                    <input
                      type="text"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">State *</label>
                    <input
                      type="text"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">PIN Code *</label>
                    <input
                      type="text"
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      placeholder="560038"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2"
              >
                <span>Continue to Summary</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: SUMMARY */}
          {currentStep === 2 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <ShoppingBag className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900">Step 2: Order Items Summary</h2>
              </div>

              <div className="space-y-3 divide-y divide-slate-100">
                {cart.items.map((item) => (
                  <div key={item.id} className="pt-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product?.primary_image || item.product?.images?.[0]}
                        alt={item.product?.name}
                        className="w-12 h-12 rounded-xl object-contain bg-slate-50 p-1 border border-slate-100"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900">{item.product?.name}</h4>
                        <span className="text-slate-500">Qty: {item.quantity} • {formatINR(item.product?.final_price)}</span>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900">
                      {formatINR(item.product?.final_price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                >
                  ← Back to Address
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PAYMENT */}
          {currentStep === 3 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900">Step 3: Choose Payment Method</h2>
              </div>

              {/* Payment Methods Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'UPI', label: 'UPI (GPay/PhonePe)', icon: QrCode },
                  { id: 'CARD', label: 'Credit / Debit Card', icon: CreditCard },
                  { id: 'COD', label: 'Cash on Delivery', icon: Banknote },
                  { id: 'DEMO', label: 'Demo 1-Click Pay', icon: Sparkles },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-4 rounded-2xl border-2 text-center flex flex-col items-center justify-center gap-2 transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 font-bold shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-xs">{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Sub-view for UPI */}
              {paymentMethod === 'UPI' && (
                <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 text-center space-y-3">
                  <span className="text-xs font-bold text-indigo-950 block">Instant UPI QR Simulation</span>
                  <div className="w-32 h-32 bg-white rounded-xl border border-indigo-200 mx-auto p-2 flex items-center justify-center shadow-xs">
                    <QrCode className="w-24 h-24 text-slate-800" />
                  </div>
                  <p className="text-[11px] text-slate-500">Scan using any UPI App (GPay, PhonePe, Paytm, BHIM)</p>
                </div>
              )}

              {/* Sub-view for Card */}
              {paymentMethod === 'CARD' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-white max-w-sm mx-auto shadow-xl space-y-4">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>SmartCart Platinum Debit</span>
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <p className="text-lg tracking-widest font-mono font-bold">{cardDetails.number}</p>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>{cardDetails.name}</span>
                      <span>EXP: {cardDetails.expiry}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-view for COD */}
              {paymentMethod === 'COD' && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <span className="font-bold block">Cash on Delivery</span>
                  <p className="text-slate-600">Pay cash or scan QR when your package is delivered at your doorstep.</p>
                </div>
              )}

              {/* Sub-view for DEMO */}
              {paymentMethod === 'DEMO' && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> 1-Click Instant Demo Payment
                  </span>
                  <p className="text-slate-600">Instantly confirms order placement without any gateway redirection.</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                >
                  ← Back to Summary
                </button>

                <button
                  disabled={isSubmitting}
                  onClick={handlePlaceOrder}
                  className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Processing Order...</span>
                  ) : (
                    <>
                      <span>Confirm & Pay {formatINR(finalTotal)}</span>
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Right Column: Checkout Summary Box */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4 sticky top-24">
            <h3 className="font-extrabold text-slate-900 text-sm pb-3 border-b border-slate-100">
              Payment Breakdown
            </h3>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900">{formatINR(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Coupon Discount</span>
                  <span className="font-semibold">-{formatINR(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-semibold text-slate-900">
                  {deliveryCharge === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : formatINR(deliveryCharge)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-3 border-t border-slate-100">
                <span>Total Payable</span>
                <span className="text-indigo-600">{formatINR(finalTotal)}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 space-y-1">
              <p className="flex items-center gap-1.5 font-semibold text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>SmartCart Buyer Protection</span>
              </p>
              <p>Safe digital transactions & 7-day money-back guarantee.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default CheckoutPage;
