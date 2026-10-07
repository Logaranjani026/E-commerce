import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  CreditCard, 
  Printer, 
  XCircle, 
  ArrowLeft,
  ShieldCheck,
  Package,
  Sparkles
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { formatINR } from '../components/common/PriceTag';
import { useToast } from '../context/ToastContext';

const OrderDetailPage = () => {
  const { orderIdOrNumber } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await orderService.getOrderDetail(orderIdOrNumber);
        if (res.success && res.order) {
          setOrder(res.order);
        }
      } catch (err) {
        console.error('Fetch order detail error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderIdOrNumber]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order? Stock will be released and refund initiated.')) {
      return;
    }

    try {
      setCancelling(true);
      const res = await orderService.cancelOrder(order.id);
      if (res.success) {
        showToast('Order cancelled successfully', 'info');
        setOrder(res.order);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel order', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-slate-500">Loading order timeline & tracking...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-xs">
        <Package className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Order Not Found</h2>
        <Link to="/orders" className="inline-block px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl">
          Back to Orders
        </Link>
      </div>
    );
  }

  const isCancellable = ['Order Placed', 'Packed'].includes(order.status);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <Link to="/orders" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:underline mb-2">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Orders</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900">
              Order #{order.order_number}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                order.status === 'Delivered'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : order.status === 'Cancelled'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200'
              }`}
            >
              {order.status}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Placed on {order.created_at}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintInvoice}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Tax Invoice</span>
          </button>

          {isCancellable && (
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>{cancelling ? 'Cancelling...' : 'Cancel Order'}</span>
            </button>
          )}
        </div>
      </div>

      {/* VISUAL ORDER TRACKING TIMELINE (Section 14 Requirement) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
          <Truck className="w-4 h-4" />
          <span>Live Shipment Tracking Timeline</span>
        </div>

        {order.status === 'Cancelled' ? (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <strong className="block font-bold">Order Cancelled</strong>
              <span>This order was cancelled. Any pre-paid payments will be credited within 3-5 working days.</span>
            </div>
          </div>
        ) : (
          <div className="relative pt-4 pb-2">
            
            {/* Desktop Horizontal Timeline */}
            <div className="grid grid-cols-5 gap-2 relative">
              {order.tracking_timeline?.map((step, idx) => {
                const isCompleted = step.done;
                const isCurrent = order.status === step.status;

                return (
                  <div key={idx} className="flex flex-col items-center text-center space-y-2 relative">
                    
                    {/* Circle Node */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all z-10 ${
                        isCompleted
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                          : isCurrent
                          ? 'bg-indigo-100 text-indigo-700 ring-4 ring-indigo-500/20'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </div>

                    {/* Step Title & Timestamp */}
                    <div className="space-y-0.5">
                      <span className={`text-xs font-bold block ${isCompleted || isCurrent ? 'text-slate-900' : 'text-slate-400'}`}>
                        {step.status}
                      </span>
                      <span className="text-[10px] text-slate-400 block max-w-[7rem] truncate">
                        {step.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Description of current step */}
            <div className="mt-8 p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-xs text-indigo-950 flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                <strong>Latest Status: </strong> 
                {order.tracking_timeline?.find((t) => t.status === order.status)?.desc || 'Package being processed by logistics network.'}
              </span>
            </div>

          </div>
        )}
      </div>

      {/* Grid: Ordered Items & Shipping Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Items List */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm pb-3 border-b border-slate-100">
            Items in this Order ({order.item_count})
          </h3>

          <div className="space-y-3 divide-y divide-slate-100">
            {order.items?.map((item) => (
              <div key={item.id} className="pt-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={item.product_image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=100&auto=format&fit=crop&q=80'}
                    alt={item.product_name}
                    className="w-14 h-14 rounded-xl object-contain bg-slate-50 p-1 border border-slate-100"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{item.product_name}</h4>
                    <span className="text-slate-500">Unit Price: {formatINR(item.price)} • Qty: {item.quantity}</span>
                  </div>
                </div>

                <span className="font-extrabold text-slate-900 text-sm">
                  {formatINR(item.total_price)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Address & Price Breakdown */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Shipping Address */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3 text-xs">
            <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-100 pb-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span>Delivery Address</span>
            </div>
            <div className="space-y-1 text-slate-600">
              <strong className="block text-slate-900">{order.shipping_address?.full_name}</strong>
              <p>{order.shipping_address?.street_address}</p>
              <p>{order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.pincode}</p>
              <p className="text-slate-500 pt-1">Phone: {order.shipping_address?.phone}</p>
            </div>
          </div>

          {/* Payment & Invoice Summary */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3 text-xs">
            <div className="flex items-center gap-2 text-slate-900 font-bold border-b border-slate-100 pb-2">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <span>Payment Summary</span>
            </div>

            <div className="space-y-2 text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">{formatINR(order.subtotal)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span className="font-semibold">-{formatINR(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-semibold text-slate-900">
                  {order.delivery_charge === 0 ? 'FREE' : formatINR(order.delivery_charge)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100 text-sm font-extrabold text-slate-900">
                <span>Total Paid</span>
                <span className="text-indigo-600">{formatINR(order.total_amount)}</span>
              </div>
              <div className="pt-2 text-[11px] text-slate-400">
                Method: <strong>{order.payment_method}</strong> • Status: <strong>{order.payment_status}</strong>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default OrderDetailPage;
