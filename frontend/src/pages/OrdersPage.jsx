import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Truck, ArrowRight, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { orderService } from '../services/orderService';
import { formatINR } from '../components/common/PriceTag';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await orderService.getOrders();
        if (res.success && res.orders) {
          setOrders(res.orders);
        }
      } catch (err) {
        console.error('Fetch orders error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Out for Delivery':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Shipped':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Packed':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-slate-500">Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 sm:p-12 bg-white rounded-3xl border border-slate-200/80 text-center space-y-4 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">No Orders Placed Yet</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          You haven't placed any orders yet. Discover our AI-recommended tech and essentials!
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
        >
          <span>Start Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          My Orders & Shipments
        </h1>
        <p className="text-xs text-slate-500 mt-1">View active orders, tracking timelines, and invoices</p>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4 hover:shadow-md transition-shadow"
          >
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 text-xs">
              <div className="space-y-0.5">
                <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                  #{order.order_number}
                </span>
                <p className="text-slate-400">Placed on {order.created_at}</p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
                <span className="text-sm font-extrabold text-slate-900">
                  {formatINR(order.total_amount)}
                </span>
              </div>
            </div>

            {/* Items Preview */}
            <div className="space-y-2">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product_image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=100&auto=format&fit=crop&q=80'}
                      alt={item.product_name}
                      className="w-12 h-12 rounded-xl object-contain bg-slate-50 p-1 border border-slate-100"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900">{item.product_name}</h4>
                      <span className="text-slate-500">Qty: {item.quantity} • {formatINR(item.price)}</span>
                    </div>
                  </div>
                  <span className="font-bold text-slate-800">
                    {formatINR(item.total_price)}
                  </span>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                Payment: <strong className="text-slate-700">{order.payment_method}</strong> ({order.payment_status})
              </span>

              <Link
                to={`/orders/${order.order_number}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl border border-indigo-200 transition-colors"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Track Timeline & Invoice</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default OrdersPage;
