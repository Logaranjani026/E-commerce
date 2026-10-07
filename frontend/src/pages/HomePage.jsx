import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Laptop, 
  Smartphone, 
  Headphones, 
  Watch, 
  Tv, 
  Shirt, 
  Home as HomeIcon, 
  HardDrive,
  CheckCircle2,
  Zap,
  TrendingUp,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  Percent,
  Search,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { productService } from '../services/productService';
import { aiService } from '../services/aiService';
import ProductCard from '../components/product/ProductCard';
import { ProductGridSkeleton } from '../components/common/SkeletonLoader';

const categoryIcons = {
  'Laptops': Laptop,
  'Smartphones': Smartphone,
  'Headphones': Headphones,
  'Watches': Watch,
  'Electronics': Tv,
  'Fashion': Shirt,
  'Home & Kitchen': HomeIcon,
  'Accessories': HardDrive,
};

const HomePage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [personalizedData, setPersonalizedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [catsRes, featRes, trendRes, personRes] = await Promise.all([
          productService.getCategories(),
          productService.getFeatured(),
          productService.getTrending(),
          aiService.getPersonalizedRecommendations(4),
        ]);

        if (catsRes.success) setCategories(catsRes.categories);
        if (featRes.success) setFeaturedProducts(featRes.products);
        if (trendRes.success) setTrendingProducts(trendRes.products);
        if (personRes?.success) setPersonalizedData(personRes.data);
      } catch (err) {
        console.error("Home data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <div className="space-y-12 pb-20">
      
      {/* 1. HERO RETAIL PROMO BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white overflow-hidden shadow-xl border border-slate-800">
          
          {/* Subtle geometric pattern overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center p-8 sm:p-12 lg:p-16">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
                <Percent className="w-3.5 h-3.5 text-amber-400" />
                <span>Great Electronics Sale 2026 • Up to 50% Off</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                Top Brands, <br className="hidden sm:inline" />
                <span className="text-blue-400">Everyday Low Prices.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed mx-auto lg:mx-0">
                Shop premium laptops, flagship smartphones, noise-cancelling headphones, and lifestyle tech with 100% verified genuine brand warranty.
              </p>

              {/* Instant Search Bar */}
              <form onSubmit={handleSearchSubmit} className="pt-2 max-w-lg mx-auto lg:mx-0">
                <div className="relative flex items-center bg-white rounded-2xl p-1.5 shadow-lg border border-slate-200">
                  <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search laptops, iPhone, Sony, smartwatches..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/products"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center gap-2"
                >
                  <span>Explore All Products</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/products?sort=discount"
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl border border-slate-700 transition-all"
                >
                  View Today's Deals
                </Link>
                <Link
                  to="/ai-assistant"
                  className="px-4 py-3 text-xs font-semibold text-blue-300 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Buying Assistant</span>
                </Link>
              </div>
            </div>

            {/* Right Promo Card Spotlight */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/15 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-4 h-4" /> Deal of the Day
                  </span>
                  <span className="text-xs font-extrabold bg-rose-500 text-white px-2 py-0.5 rounded-full">
                    28% OFF
                  </span>
                </div>

                <div className="relative aspect-video rounded-2xl bg-white p-4 flex items-center justify-center overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=80"
                    alt="Featured MacBook"
                    className="max-h-full max-w-full object-contain hover:scale-105 transition-transform"
                  />
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">Apple MacBook Air (M2)</h3>
                  <p className="text-xs text-slate-300 mt-1">13.6-inch Liquid Retina Display • 256GB SSD • 8GB Unified Memory</p>
                  
                  <div className="flex items-baseline gap-2 mt-3">
                    <span className="text-xl font-extrabold text-white">₹84,990</span>
                    <span className="text-xs text-slate-400 line-through">₹1,14,900</span>
                    <span className="text-xs font-bold text-emerald-400">Save ₹29,910</span>
                  </div>
                </div>

                <Link
                  to="/products?category=laptops"
                  className="w-full block py-2.5 px-4 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs rounded-xl text-center transition-colors"
                >
                  Shop Laptop Deals
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. TRUST & VALUE PROPOSITIONS BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 sm:p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          
          <div className="flex items-center gap-3.5 p-2">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Free Express Shipping</h4>
              <p className="text-[11px] text-slate-500">On all qualifying orders above ₹999</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">100% Genuine Products</h4>
              <p className="text-[11px] text-slate-500">Direct from authorized brand distributors</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">7-Day Easy Returns</h4>
              <p className="text-[11px] text-slate-500">Hassle-free replacement policy</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-2">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">100% Secure Payments</h4>
              <p className="text-[11px] text-slate-500">Cards, UPI, NetBanking & COD</p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. CATEGORIES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Explore Collections</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">Shop by Category</h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {categories.map((cat) => {
            const IconComponent = categoryIcons[cat.name] || Laptop;
            return (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="group flex flex-col items-center p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all duration-200 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-blue-50 text-slate-600 group-hover:text-blue-600 flex items-center justify-center mb-2.5 transition-colors">
                  <IconComponent className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 line-clamp-1">
                  {cat.name}
                </span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                  {cat.product_count} items
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS / BEST DEALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-0.5">
              <Zap className="w-3.5 h-3.5" />
              <span>Handpicked Highlights</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Featured Products</h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
          >
            <span>Browse All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 5. COMMERCIAL PROMOTIONAL BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-100 border border-slate-200 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-bold text-xs uppercase tracking-wider">
              Student & Work Essentials
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Upgrade Your Setup with High Performance Tech
            </h3>
            <p className="text-sm text-slate-600 max-w-xl">
              Get an additional 10% instant discount on coding laptops, high-res monitors, and noise-cancelling audio with code <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300">SMART10</span>.
            </p>
          </div>
          <Link
            to="/products?category=laptops"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shrink-0 transition-colors shadow-sm"
          >
            Shop Student Laptops
          </Link>
        </div>
      </section>

      {/* 6. RECOMMENDED FOR YOU */}
      {personalizedData && personalizedData.products?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Customer Recommendations</span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
                {personalizedData.reason || 'Recommended For You'}
              </h2>
            </div>
            <Link
              to="/products"
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              See More Recommendations
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {personalizedData.products.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 7. TRENDING PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 uppercase tracking-wider mb-0.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Customer Favorites</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Trending Now</h2>
          </div>
          <Link
            to="/products?sort=rating"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group"
          >
            <span>Top Rated</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {trendingProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default HomePage;
