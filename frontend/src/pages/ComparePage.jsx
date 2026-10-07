import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Scale, 
  Sparkles, 
  X, 
  ShoppingCart, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  Trophy, 
  Plus,
  ArrowRight
} from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';
import { aiService } from '../services/aiService';
import PriceTag, { formatINR } from '../components/common/PriceTag';
import RatingStars from '../components/common/RatingStars';
import { useToast } from '../context/ToastContext';

const ComparePage = () => {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [aiVerdict, setAiVerdict] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [highlightDifferences, setHighlightDifferences] = useState(true);

  // Fetch AI comparison verdict whenever compare items change
  const fetchAiComparison = async () => {
    if (compareItems.length < 2) {
      setAiVerdict(null);
      return;
    }

    try {
      setLoadingAI(true);
      const res = await aiService.compareProductsAI(compareItems.map((p) => p.id));
      if (res.success && res.data) {
        setAiVerdict(res.data);
      }
    } catch (err) {
      console.error('AI comparison error:', err);
    } finally {
      setLoadingAI(false);
    }
  };

  useEffect(() => {
    fetchAiComparison();
  }, [compareItems]);

  if (compareItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 sm:p-12 bg-white rounded-3xl border border-slate-200/80 text-center space-y-5 shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <Scale className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">No Products in Comparison</h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Add 2 to 4 products from the catalog or AI recommendations to compare their technical specifications side-by-side with AI assistance.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
        >
          <span>Browse Products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // Aggregate all unique specification keys across all products
  const allSpecKeys = Array.from(
    new Set(
      compareItems.flatMap((item) =>
        item.specifications ? Object.keys(item.specifications) : []
      )
    )
  );

  // Lowest price in comparison
  const minPrice = Math.min(...compareItems.map((p) => p.final_price || 0));
  // Highest rating in comparison
  const maxRating = Math.max(...compareItems.map((p) => p.rating || 0));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
            <Scale className="w-4 h-4" />
            <span>Product Comparison Matrix</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Compare ({compareItems.length}/4 Products)
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setHighlightDifferences(!highlightDifferences)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
              highlightDifferences
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            {highlightDifferences ? '✓ Highlighting Differences' : 'Highlight Differences'}
          </button>

          <button
            onClick={clearCompare}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Expert Comparison Summary & Recommendation Card */}
      {compareItems.length >= 2 && (
        <div className="bg-slate-50 text-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Comparison Summary & Recommendation
                </h3>
                <p className="text-xs text-slate-500">
                  Value-for-money and specification evaluation across selected items
                </p>
              </div>
            </div>

            <button
              onClick={fetchAiComparison}
              disabled={loadingAI}
              className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto transition-colors"
            >
              <span>{loadingAI ? 'Re-analyzing...' : 'Refresh Comparison'}</span>
            </button>
          </div>

          {loadingAI ? (
            <div className="py-6 text-center text-xs text-slate-500 animate-pulse">
              Evaluating specifications, price-to-performance ratio, and hardware features...
            </div>
          ) : aiVerdict ? (
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-slate-200">
                {aiVerdict.ai_verdict}
              </p>

              {/* Product specific recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                {aiVerdict.product_verdicts?.map((pv) => (
                  <div
                    key={pv.product_id}
                    className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-blue-700 truncate">{pv.product_name}</span>
                      <span className="text-slate-900 shrink-0">{formatINR(pv.price)}</span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      {pv.recommended_for}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

        </div>
      )}

      {/* SIDE-BY-SIDE SPECIFICATION TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            
            {/* Table Header with Product Cards */}
            <thead>
              <tr className="border-b border-slate-200">
                <th className="p-4 sm:p-6 w-48 min-w-[12rem] bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider align-top">
                  Product Overview
                </th>

                {compareItems.map((product) => {
                  const isLowestPrice = highlightDifferences && product.final_price === minPrice;
                  const isHighestRating = highlightDifferences && product.rating === maxRating;

                  return (
                    <th
                      key={product.id}
                      className="p-4 sm:p-6 min-w-[15rem] max-w-xs align-top relative border-l border-slate-200"
                    >
                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCompare(product.id)}
                        className="absolute top-3 right-3 p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Remove from comparison"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Product Thumbnail */}
                      <div className="w-24 h-24 rounded-2xl bg-slate-50 p-2 border border-slate-100 mx-auto mb-3 flex items-center justify-center">
                        <img
                          src={product.primary_image || product.images?.[0]}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>

                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                        {product.brand}
                      </span>
                      <Link
                        to={`/products/${product.slug || product.id}`}
                        className="text-xs sm:text-sm font-bold text-slate-900 hover:text-indigo-600 line-clamp-2 mt-0.5"
                      >
                        {product.name}
                      </Link>

                      {/* Price Pill */}
                      <div className="mt-2 mb-3">
                        <div className={`p-2 rounded-xl ${isLowestPrice ? 'bg-emerald-50 border border-emerald-200' : ''}`}>
                          <PriceTag
                            price={product.final_price}
                            originalPrice={product.price}
                            discountPercent={product.discount_percent}
                            size="md"
                          />
                          {isLowestPrice && (
                            <span className="text-[10px] font-bold text-emerald-700 block mt-0.5">
                              ✓ Best Price in Comparison
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="mb-4">
                        <RatingStars rating={product.rating} count={product.review_count} size="xs" />
                        {isHighestRating && (
                          <span className="text-[10px] font-bold text-amber-700 block mt-0.5">
                            ★ Top Rated
                          </span>
                        )}
                      </div>

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => addToCart(product, 1)}
                        className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    </th>
                  );
                })}

                {/* Placeholder if fewer than 4 items */}
                {compareItems.length < 4 && (
                  <th className="p-6 min-w-[12rem] align-middle text-center border-l border-slate-200 bg-slate-50/50">
                    <Link
                      to="/products"
                      className="inline-flex flex-col items-center gap-2 p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-400 text-slate-500 hover:text-indigo-600 transition-all group"
                    >
                      <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold">Add Another Product</span>
                    </Link>
                  </th>
                )}
              </tr>
            </thead>

            {/* Specifications Body */}
            <tbody className="text-xs divide-y divide-slate-100">
              
              {/* Category */}
              <tr>
                <td className="p-4 bg-slate-50 font-bold text-slate-700">Category</td>
                {compareItems.map((p) => (
                  <td key={p.id} className="p-4 font-semibold text-slate-800 border-l border-slate-100 capitalize">
                    {p.category_name}
                  </td>
                ))}
                {compareItems.length < 4 && <td className="p-4 bg-slate-50/30 border-l border-slate-100" />}
              </tr>

              {/* Stock Status */}
              <tr>
                <td className="p-4 bg-slate-50 font-bold text-slate-700">Stock Availability</td>
                {compareItems.map((p) => (
                  <td key={p.id} className="p-4 border-l border-slate-100">
                    <span
                      className={`font-semibold ${
                        p.in_stock ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {p.in_stock ? `In Stock (${p.stock_quantity} available)` : 'Out of Stock'}
                    </span>
                  </td>
                ))}
                {compareItems.length < 4 && <td className="p-4 bg-slate-50/30 border-l border-slate-100" />}
              </tr>

              {/* Dynamic Specs List */}
              {allSpecKeys.map((key, idx) => (
                <tr key={key} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}>
                  <td className="p-4 bg-slate-50 font-bold text-slate-700">
                    {key}
                  </td>

                  {compareItems.map((p) => {
                    const val = p.specifications?.[key] || '—';
                    return (
                      <td key={p.id} className="p-4 font-medium text-slate-800 border-l border-slate-100">
                        {val}
                      </td>
                    );
                  })}

                  {compareItems.length < 4 && <td className="p-4 bg-slate-50/30 border-l border-slate-100" />}
                </tr>
              ))}

            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default ComparePage;
