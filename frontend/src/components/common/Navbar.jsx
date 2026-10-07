import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  Search, 
  ShoppingCart, 
  Heart, 
  Scale, 
  User as UserIcon, 
  LogOut, 
  LayoutDashboard, 
  Package, 
  ShieldCheck, 
  Menu, 
  X, 
  ChevronDown,
  Sparkles,
  Percent,
  Truck,
  Headphones
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';
import { productService } from '../../services/productService';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { compareCount } = useCompare();
  
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userMenuRef = useRef(null);
  const catMenuRef = useRef(null);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await productService.getCategories();
        if (res.success) setCategories(res.categories);
      } catch {}
    };
    fetchCats();
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (catMenuRef.current && !catMenuRef.current.contains(event.target)) {
        setShowCategoryMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-xs transition-all">
      {/* Top announcement bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-slate-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
              Special Offer
            </span>
            <span>Free Express Delivery on orders over ₹999 | 7-Day Easy Returns</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-[11px] text-slate-400">
            <Link to="/products?sort=discount" className="hover:text-white transition-colors flex items-center gap-1">
              <Percent className="w-3 h-3 text-amber-400" />
              <span>Deal of the Day</span>
            </Link>
            <Link to="/ai-assistant" className="hover:text-white transition-colors flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>Shopping Guide</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4 sm:gap-8">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition-colors">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-2xl tracking-tight text-slate-900 leading-none">
                Smart<span className="text-blue-600">Cart</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase mt-1">
                Online Electronics Store
              </span>
            </div>
          </Link>

          {/* Search Bar (Desktop) */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xl relative">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search for laptops, smartphones, headphones, smartwatches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-24 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-3 focus:ring-blue-100 focus:outline-none transition-all placeholder:text-slate-400"
              />
              <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-3" />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
              >
                Search
              </button>
            </div>
          </form>

          {/* Nav Links & Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            
            {/* Compare Products */}
            <Link
              to="/compare"
              className="relative p-2.5 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5"
              title="Compare Products"
            >
              <Scale className="w-5 h-5" />
              <span className="hidden xl:inline text-xs font-semibold">Compare</span>
              {compareCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-slate-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {compareCount}
                </span>
              )}
            </Link>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2.5 text-slate-700 hover:text-red-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              <span className="hidden xl:inline text-xs font-semibold">Wishlist</span>
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart */}
            <Link
              to="/cart"
              className="relative p-2.5 text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-2"
              title="Shopping Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-bold text-slate-800">Cart</span>
            </Link>

            <div className="h-6 w-px bg-slate-200 hidden sm:block mx-1" />

            {/* User Account / Dropdown */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  />
                  <div className="hidden lg:flex flex-col items-start text-left">
                    <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[100px]">{user?.name}</span>
                    <span className="text-[10px] text-slate-500 leading-tight">My Account</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Account Dashboard</span>
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Package className="w-4 h-4" />
                      <span>My Orders & Tracking</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-purple-700 bg-purple-50/50 hover:bg-purple-100"
                      >
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        <span>Admin Control Panel</span>
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-block px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Secondary Navigation Bar (Desktop Categories) */}
        <nav className="hidden md:flex items-center justify-between border-t border-slate-100 py-2.5 text-xs font-semibold text-slate-600">
          <div className="flex items-center gap-6">
            
            {/* Category Dropdown */}
            <div className="relative" ref={catMenuRef}>
              <button
                onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors font-bold"
              >
                <Menu className="w-3.5 h-3.5 text-slate-600" />
                <span>All Categories</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showCategoryMenu && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 grid grid-cols-1 gap-1 p-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/products?category=${cat.slug}`}
                      onClick={() => setShowCategoryMenu(false)}
                      className="px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-between"
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                        {cat.product_count || 4} items
                      </span>
                    </Link>
                  ))}
                  <div className="border-t border-slate-100 pt-1 mt-1">
                    <Link
                      to="/products"
                      onClick={() => setShowCategoryMenu(false)}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50 block text-center"
                    >
                      View All Products →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link to="/products" className="hover:text-blue-600 transition-colors">
              All Products
            </Link>
            <Link to="/products?category=laptops" className="hover:text-blue-600 transition-colors">
              Laptops
            </Link>
            <Link to="/products?category=smartphones" className="hover:text-blue-600 transition-colors">
              Smartphones
            </Link>
            <Link to="/products?category=headphones" className="hover:text-blue-600 transition-colors">
              Headphones & Audio
            </Link>
            <Link to="/products?category=watches" className="hover:text-blue-600 transition-colors">
              Smartwatches
            </Link>
            <Link to="/products?category=electronics" className="hover:text-blue-600 transition-colors">
              Electronics
            </Link>
            <Link to="/products?sort=discount" className="text-amber-600 hover:text-amber-700 transition-colors flex items-center gap-1 font-bold">
              <span>Hot Deals</span>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-1.5 py-0.2 rounded">
                SALE
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <Link to="/ai-assistant" className="text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1.5 transition-colors">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Shopping Assistant</span>
            </Link>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 text-sm rounded-xl border border-slate-200"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </form>

          <div className="space-y-1 pt-2">
            <Link
              to="/products"
              className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              All Products
            </Link>
            <Link
              to="/products?sort=discount"
              className="block px-3 py-2 rounded-xl text-sm font-bold text-amber-600 hover:bg-amber-50"
            >
              Today's Deals & Discounts
            </Link>
            <Link
              to="/ai-assistant"
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Smart Shopping Assistant</span>
            </Link>
            <Link
              to="/compare"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <span>Product Comparison</span>
              {compareCount > 0 && (
                <span className="text-xs bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                  {compareCount}
                </span>
              )}
            </Link>
            <Link
              to="/wishlist"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <span>Wishlist</span>
              {wishlistCount > 0 && (
                <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
