import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User as UserIcon, 
  Package, 
  Heart, 
  MapPin, 
  Sparkles, 
  Edit3, 
  Check, 
  Truck, 
  ArrowRight,
  Plus,
  Trash2,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { orderService } from '../services/orderService';
import { aiService } from '../services/aiService';
import ProductCard from '../components/product/ProductCard';
import { formatINR } from '../components/common/PriceTag';
import { useToast } from '../context/ToastContext';

const UserDashboardPage = () => {
  const { user, updateProfile } = useAuth();
  const { wishlistCount } = useWishlist();
  const { showToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [recommendedData, setRecommendedData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit profile modal state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');

  // Add Address modal state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({
    full_name: user?.name || '',
    phone: user?.phone || '',
    street_address: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [ordersRes, addrsRes, recoRes] = await Promise.all([
          orderService.getOrders(),
          orderService.getAddresses(),
          aiService.getPersonalizedRecommendations(4),
        ]);

        if (ordersRes.success) setOrders(ordersRes.orders);
        if (addrsRes.success) setAddresses(addrsRes.addresses);
        if (recoRes?.success) setRecommendedData(recoRes.data);
      } catch (err) {
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ name: editName, phone: editPhone });
      showToast('Profile updated successfully', 'success');
      setIsEditingProfile(false);
    } catch {
      showToast('Failed to update profile', 'error');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await orderService.addAddress(newAddr);
      if (res.success) {
        setAddresses([res.address, ...addresses]);
        showToast('Address saved successfully', 'success');
        setIsAddingAddress(false);
        setNewAddr({
          full_name: user?.name || '',
          phone: user?.phone || '',
          street_address: '',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560038',
        });
      }
    } catch {
      showToast('Failed to add address', 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await orderService.deleteAddress(id);
      setAddresses(addresses.filter((a) => a.id !== id));
      showToast('Address deleted', 'info');
    } catch {
      showToast('Failed to delete address', 'error');
    }
  };

  const totalSpent = orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.total_amount : 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Profile Overview Card */}
      <div className="bg-white text-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt={user?.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-200 shadow-xs"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{user?.name}</h1>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider border border-blue-200">
                  {user?.role}
                </span>
              </div>
              <p className="text-xs text-slate-600">{user?.email} • {user?.phone || 'No phone added'}</p>
              <p className="text-[11px] text-slate-400">SmartCart Member since {user?.created_at?.slice(0, 10) || '2026'}</p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditName(user?.name || '');
              setEditPhone(user?.phone || '');
              setIsEditingProfile(true);
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 self-start sm:self-auto transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-slate-600" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* 3 KPI Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 mt-6 border-t border-slate-100">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Orders</p>
              <p className="text-lg sm:text-xl font-extrabold text-slate-900">{orders.length}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Wishlist Items</p>
              <p className="text-lg sm:text-xl font-extrabold text-slate-900">{wishlistCount}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Spent</p>
              <p className="text-lg sm:text-xl font-extrabold text-slate-900">{formatINR(totalSpent)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Recent Orders Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Recent Orders</h2>
          <Link to="/orders" className="text-xs font-bold text-indigo-600 hover:underline">
            View All ({orders.length})
          </Link>
        </div>

        {orders.length > 0 ? (
          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">#{order.order_number}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {order.status}
                    </span>
                  </div>
                  <p className="text-slate-500">
                    {order.item_count} items • {order.created_at} • Total: <strong className="text-slate-800">{formatINR(order.total_amount)}</strong>
                  </p>
                </div>

                <Link
                  to={`/orders/${order.order_number}`}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors self-start sm:self-auto"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Track Timeline</span>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 bg-white p-6 rounded-2xl border border-slate-200 text-center">
            No orders placed yet.
          </p>
        )}
      </section>

      {/* Saved Addresses Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Saved Addresses</h2>
          <button
            onClick={() => setIsAddingAddress(true)}
            className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Address</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs text-xs space-y-2 relative group"
            >
              <div className="flex justify-between items-start">
                <span className="font-bold text-slate-900">{addr.full_name}</span>
                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="text-slate-400 hover:text-red-500 p-1 rounded-md"
                  title="Delete address"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-slate-600 leading-relaxed">{addr.street_address}</p>
              <p className="text-slate-600">{addr.city}, {addr.state} - {addr.pincode}</p>
              <p className="text-slate-400 pt-1">Phone: {addr.phone}</p>
            </div>
          ))}

          {addresses.length === 0 && (
            <div className="sm:col-span-3 bg-white p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
              No saved addresses yet.
            </div>
          )}
        </div>
      </section>

      {/* Personalized AI Recommendations */}
      {recommendedData && recommendedData.products?.length > 0 && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> AI Personalized Feed
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
                {recommendedData.reason || 'Recommended For You'}
              </h2>
            </div>
            <Link to="/ai-assistant" className="text-xs font-bold text-indigo-600 hover:underline">
              Ask AI Assistant
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {recommendedData.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">Edit Profile Details</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 text-slate-600 text-xs font-semibold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Address Modal */}
      {isAddingAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">Add New Delivery Address</h3>
            <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={newAddr.full_name}
                  onChange={(e) => setNewAddr({ ...newAddr, full_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Phone</label>
                <input
                  type="tel"
                  value={newAddr.phone}
                  onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Street Address</label>
                <input
                  type="text"
                  value={newAddr.street_address}
                  onChange={(e) => setNewAddr({ ...newAddr, street_address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={newAddr.pincode}
                    onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddingAddress(false)}
                  className="px-4 py-2 text-slate-600 text-xs font-semibold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserDashboardPage;
