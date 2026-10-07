import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  FolderTree, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  X,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { adminService } from '../services/adminService';
import { productService } from '../services/productService';
import { formatINR } from '../components/common/PriceTag';
import { useToast } from '../context/ToastContext';

const COLORS = ['#4f46e5', '#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];

const AdminDashboardPage = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'products' | 'orders' | 'categories' | 'users'
  
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Search & Filter
  const [productSearch, setProductSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');

  // Product Form state
  const [prodForm, setProdForm] = useState({
    name: '',
    category_id: 1,
    brand: '',
    price: 999,
    discount_percent: 10,
    stock_quantity: 15,
    description: '',
    image_url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80',
    why_this_product: '',
    specs_json: '{\n  "Processor": "High Performance",\n  "RAM": "16 GB",\n  "Storage": "512 GB SSD"\n}',
    is_featured: false,
    is_trending: false
  });

  // Category Form state
  const [catForm, setCatForm] = useState({
    name: '',
    description: '',
    image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [anRes, prodRes, catRes, ordRes, usrRes] = await Promise.all([
        adminService.getAnalytics(),
        adminService.getAdminProducts(),
        productService.getCategories(),
        adminService.getAdminOrders(),
        adminService.getAdminUsers(),
      ]);

      if (anRes.success) setAnalytics(anRes);
      if (prodRes.success) setProducts(prodRes.products);
      if (catRes.success) setCategories(catRes.categories);
      if (ordRes.success) setOrders(ordRes.orders);
      if (usrRes.success) setUsersList(usrRes.users);
    } catch (err) {
      console.error('Admin data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // PRODUCT CRUD HANDLERS
  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setProdForm({
      name: '',
      category_id: categories[0]?.id || 1,
      brand: '',
      price: 999,
      discount_percent: 10,
      stock_quantity: 15,
      description: '',
      image_url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80',
      why_this_product: '',
      specs_json: '{\n  "Specification 1": "Value 1",\n  "Specification 2": "Value 2"\n}',
      is_featured: false,
      is_trending: false
    });
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (p) => {
    setEditingProduct(p);
    setProdForm({
      name: p.name,
      category_id: p.category_id,
      brand: p.brand,
      price: p.price,
      discount_percent: p.discount_percent,
      stock_quantity: p.stock_quantity,
      description: p.description,
      image_url: p.primary_image || p.images?.[0] || '',
      why_this_product: p.why_this_product || '',
      specs_json: JSON.stringify(p.specifications || {}, null, 2),
      is_featured: p.is_featured,
      is_trending: p.is_trending
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    let parsedSpecs = {};
    try {
      parsedSpecs = JSON.parse(prodForm.specs_json);
    } catch {
      showToast('Specifications must be valid JSON', 'error');
      return;
    }

    const payload = {
      name: prodForm.name,
      category_id: Number(prodForm.category_id),
      brand: prodForm.brand,
      price: Number(prodForm.price),
      discount_percent: Number(prodForm.discount_percent),
      stock_quantity: Number(prodForm.stock_quantity),
      description: prodForm.description,
      images: [prodForm.image_url],
      specifications: parsedSpecs,
      why_this_product: prodForm.why_this_product,
      is_featured: prodForm.is_featured,
      is_trending: prodForm.is_trending
    };

    try {
      if (editingProduct) {
        const res = await adminService.updateProduct(editingProduct.id, payload);
        if (res.success) {
          showToast('Product updated successfully', 'success');
          setProducts(products.map((p) => (p.id === editingProduct.id ? res.product : p)));
        }
      } else {
        const res = await adminService.createProduct(payload);
        if (res.success) {
          showToast('Product added to catalog', 'success');
          setProducts([res.product, ...products]);
        }
      }
      setShowProductModal(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving product', 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await adminService.deleteProduct(id);
      showToast('Product deleted', 'info');
      setProducts(products.filter((p) => p.id !== id));
    } catch {
      showToast('Failed to delete product', 'error');
    }
  };

  // ORDER STATUS HANDLER
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await adminService.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        showToast(`Order status updated to "${newStatus}"`, 'success');
        setOrders(orders.map((o) => (o.id === orderId ? res.order : o)));
      }
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  // CATEGORY CRUD
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await adminService.createCategory(catForm);
      if (res.success) {
        showToast('Category created', 'success');
        setCategories([...categories, res.category]);
        setShowCategoryModal(false);
        setCatForm({ name: '', description: '', image_url: '' });
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create category', 'error');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Delete category? Ensure no products are linked.')) return;
    try {
      await adminService.deleteCategory(id);
      showToast('Category deleted', 'info');
      setCategories(categories.filter((c) => c.id !== id));
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete category', 'error');
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.brand.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter((o) =>
    orderStatusFilter === 'All' ? true : o.status === orderStatusFilter
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Administrative Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            SmartCart Admin Panel
          </h1>
        </div>

        {/* Tab Switcher Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto">
          {[
            { id: 'analytics', label: 'Analytics', icon: LayoutDashboard },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'orders', label: 'Orders', icon: ShoppingCart },
            { id: 'categories', label: 'Categories', icon: FolderTree },
            { id: 'users', label: 'Users', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. ANALYTICS VIEW */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-8 animate-in fade-in duration-150">
          
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Revenue</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                  {formatINR(analytics.metrics?.total_revenue)}
                </h3>
                <span className="text-[10px] text-emerald-600 font-bold">● Active E-Commerce</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Orders</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                  {analytics.metrics?.total_orders}
                </h3>
                <span className="text-[10px] text-slate-500 font-semibold">Avg Val: {formatINR(analytics.metrics?.avg_order_value)}</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShoppingCart className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Catalog Products</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                  {analytics.metrics?.total_products}
                </h3>
                <span className="text-[10px] text-indigo-600 font-semibold">Across 8 Categories</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Registered Users</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                  {analytics.metrics?.total_users}
                </h3>
                <span className="text-[10px] text-emerald-600 font-semibold">Verified Customers</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Monthly Sales Revenue Chart */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Monthly Revenue Overview</span>
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.monthly_sales}>
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      formatter={(val) => [formatINR(val), 'Revenue']}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="revenue" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Breakdown Pie */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900">
                Products Distribution by Category
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.category_breakdown}
                      dataKey="products_count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {analytics.category_breakdown?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Best Sellers & Recent Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Best Sellers */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900">Top Selling Products</h3>
              <div className="divide-y divide-slate-100 text-xs">
                {analytics.best_sellers?.map((b, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between">
                    <span className="font-semibold text-slate-800 line-clamp-1 max-w-[16rem]">{b.name}</span>
                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-slate-500">{b.units_sold} units</span>
                      <span className="font-bold text-slate-900">{formatINR(b.revenue)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900">Recent Customer Orders</h3>
              <div className="divide-y divide-slate-100 text-xs">
                {analytics.recent_orders?.map((o) => (
                  <div key={o.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <strong className="text-slate-900">#{o.order_number}</strong>
                      <p className="text-[10px] text-slate-400">{o.user_name} • {o.created_at}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 block">{formatINR(o.total_amount)}</span>
                      <span className="text-[10px] text-indigo-600 font-semibold">{o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 2. PRODUCTS MANAGEMENT VIEW */}
      {activeTab === 'products' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <input
                type="text"
                placeholder="Search products by title or brand..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <button
              onClick={handleOpenCreateProduct}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 self-start sm:self-auto transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Product</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={p.primary_image || p.images?.[0]}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-contain bg-slate-50 p-1 border border-slate-100 shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-slate-900 line-clamp-1">{p.name}</h4>
                          <span className="text-[10px] text-slate-400">{p.brand}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 capitalize">{p.category_name}</td>
                      <td className="p-4 font-bold text-slate-900">{formatINR(p.final_price)}</td>
                      <td className="p-4">
                        <span
                          className={`font-semibold px-2 py-0.5 rounded-full ${
                            p.stock_quantity > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {p.stock_quantity} in stock
                        </span>
                      </td>
                      <td className="p-4 text-slate-700 font-semibold">{p.rating}★ ({p.review_count})</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditProduct(p)}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. ORDERS MANAGEMENT VIEW */}
      {activeTab === 'orders' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700">Filter by Status:</span>
            <select
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl px-3 py-2"
            >
              <option value="All">All Orders</option>
              <option value="Order Placed">Order Placed</option>
              <option value="Packed">Packed</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Status & Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-900">#{ord.order_number}</td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-800 block">{ord.user_name}</span>
                        <span className="text-[10px] text-slate-400">{ord.user_email}</span>
                      </td>
                      <td className="p-4 text-slate-600">{ord.created_at}</td>
                      <td className="p-4 font-bold text-slate-900">{formatINR(ord.total_amount)}</td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-700">{ord.payment_method}</span>
                        <span className="text-[10px] text-emerald-600 block">({ord.payment_status})</span>
                      </td>
                      <td className="p-4">
                        <select
                          value={ord.status}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500/20"
                        >
                          <option value="Order Placed">Order Placed</option>
                          <option value="Packed">Packed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. CATEGORIES VIEW */}
      {activeTab === 'categories' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex justify-end">
            <button
              onClick={() => setShowCategoryModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 relative group">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-900 text-sm">{cat.name}</h4>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="text-slate-400 hover:text-red-500 p-1 rounded-md"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{cat.description || 'No description'}</p>
                <div className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg inline-block">
                  {cat.product_count || 0} active products
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. USERS VIEW */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Registered Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover border"
                        />
                        <span className="font-bold text-slate-900">{u.name}</span>
                      </td>
                      <td className="p-4 text-slate-600">{u.email}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                            u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600">{u.phone || '—'}</td>
                      <td className="p-4 text-slate-400">{u.created_at?.slice(0, 10) || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-4 my-8 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product to Catalog'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Product Title *</label>
                  <input
                    type="text"
                    value={prodForm.name}
                    onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Brand *</label>
                  <input
                    type="text"
                    value={prodForm.brand}
                    onChange={(e) => setProdForm({ ...prodForm, brand: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category *</label>
                  <select
                    value={prodForm.category_id}
                    onChange={(e) => setProdForm({ ...prodForm, category_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Discount (%)</label>
                  <input
                    type="number"
                    value={prodForm.discount_percent}
                    onChange={(e) => setProdForm({ ...prodForm, discount_percent: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={prodForm.stock_quantity}
                    onChange={(e) => setProdForm({ ...prodForm, stock_quantity: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Primary Image URL</label>
                <input
                  type="url"
                  value={prodForm.image_url}
                  onChange={(e) => setProdForm({ ...prodForm, image_url: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">AI Highlight (Why this product?)</label>
                <input
                  type="text"
                  placeholder="e.g. 16GB RAM for programming and college under ₹50,000"
                  value={prodForm.why_this_product}
                  onChange={(e) => setProdForm({ ...prodForm, why_this_product: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Specifications (JSON Format)</label>
                <textarea
                  rows={4}
                  value={prodForm.specs_json}
                  onChange={(e) => setProdForm({ ...prodForm, specs_json: e.target.value })}
                  className="w-full font-mono text-[11px] px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={prodForm.is_featured}
                    onChange={(e) => setProdForm({ ...prodForm, is_featured: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span>Featured Product</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={prodForm.is_trending}
                    onChange={(e) => setProdForm({ ...prodForm, is_trending: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span>Trending Product</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CATEGORY MODAL */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900">Add Category</h3>
            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Category Name *</label>
                <input
                  type="text"
                  value={catForm.name}
                  onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <input
                  type="text"
                  value={catForm.description}
                  onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-xs"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboardPage;
