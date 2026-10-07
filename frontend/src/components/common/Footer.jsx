import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ShieldCheck, Truck, RotateCcw, Headphones, Heart, CreditCard, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Value Proposition Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-slate-800">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Free Express Shipping</h4>
              <p className="text-xs text-slate-400 mt-0.5">On all qualifying orders above ₹999</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Genuine Products</h4>
              <p className="text-xs text-slate-400 mt-0.5">Direct from verified brand distributors</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">7-Day Easy Returns</h4>
              <p className="text-xs text-slate-400 mt-0.5">Hassle-free replacement guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">24/7 Dedicated Support</h4>
              <p className="text-xs text-slate-400 mt-0.5">Quick resolutions via chat & phone</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 py-12">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-2xl text-white tracking-tight">SmartCart</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed pr-6">
              SmartCart is your premier destination for genuine consumer electronics, premium laptops, smartphones, and audio gear. We bring verified brand warranties, doorstep express delivery, and transparent pricing.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-slate-400">
              <span>Customer Care: support@smartcart.store • Mon-Sat 9AM-8PM</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Shop & Explore</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/products" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/products?sort=discount" className="hover:text-white transition-colors text-amber-400 font-semibold">Special Deals & Offers</Link></li>
              <li><Link to="/compare" className="hover:text-white transition-colors">Product Comparison</Link></li>
              <li><Link to="/ai-assistant" className="hover:text-white transition-colors">Smart Buying Guide</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition-colors">Saved Wishlist</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Categories</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/products?category=laptops" className="hover:text-white transition-colors">Laptops & PCs</Link></li>
              <li><Link to="/products?category=smartphones" className="hover:text-white transition-colors">Smartphones</Link></li>
              <li><Link to="/products?category=headphones" className="hover:text-white transition-colors">Headphones & Audio</Link></li>
              <li><Link to="/products?category=watches" className="hover:text-white transition-colors">Smartwatches</Link></li>
              <li><Link to="/products?category=electronics" className="hover:text-white transition-colors">Electronics & Gaming</Link></li>
            </ul>
          </div>

          {/* Customer & Policy */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Customer Support</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/orders" className="hover:text-white transition-colors">Track Your Order</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Account Settings</Link></li>
              <li><span className="text-slate-400">Shipping Policy</span></li>
              <li><span className="text-slate-400">Returns & Warranty</span></li>
              <li><span className="text-slate-400">Privacy & Terms</span></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar with payment options */}
        <div className="pt-8 mt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SmartCart Online Store. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400">100% Safe Payments:</span>
            <div className="flex items-center gap-2 text-slate-300 font-bold text-[10px]">
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">UPI</span>
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">VISA</span>
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">MASTERCARD</span>
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">RUPAY</span>
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">COD</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
