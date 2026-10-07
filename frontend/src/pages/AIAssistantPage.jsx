import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Sparkles, 
  Send, 
  CheckCircle2, 
  ShoppingCart, 
  Scale, 
  ArrowRight, 
  Zap, 
  Tag, 
  Cpu, 
  SlidersHorizontal,
  RotateCcw,
  Check
} from 'lucide-react';
import { aiService } from '../services/aiService';
import RatingStars from '../components/common/RatingStars';
import PriceTag, { formatINR } from '../components/common/PriceTag';
import { useCart } from '../context/CartContext';
import { useCompare } from '../context/CompareContext';
import { useToast } from '../context/ToastContext';

const AIAssistantPage = () => {
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const { isInCompare, addToCompare } = useCompare();
  const { showToast } = useToast();

  const initialQuery = searchParams.get('q') || '';
  const [inputQuery, setInputQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [recommendationResult, setRecommendationResult] = useState(null);

  const presetQueries = [
    {
      title: "Programming Student Laptop",
      query: "I need a laptop for programming and college projects under ₹50,000",
      badge: "Laptops • Budget ₹50K"
    },
    {
      title: "Noise Cancelling Audio",
      query: "Recommend wireless noise cancelling headphones for office and travel under ₹15,000",
      badge: "Audio • Under ₹15K"
    },
    {
      title: "Flagship Camera Phone",
      query: "Best camera smartphone under ₹70,000 with good battery life",
      badge: "Smartphones • Under ₹70K"
    },
    {
      title: "Fitness & Battery Smartwatch",
      query: "Fitness smartwatch with battery backup over 5 days and AMOLED screen under ₹5,000",
      badge: "Watches • Under ₹5K"
    },
    {
      title: "Developer Workstation Gear",
      query: "Ergonomic wireless mouse and mechanical keyboard for coding setup",
      badge: "Electronics"
    },
  ];

  const handleSearch = async (queryText) => {
    const q = queryText || inputQuery;
    if (!q.trim()) {
      showToast('Please type your requirements or choose a preset prompt', 'warning');
      return;
    }

    try {
      setLoading(true);
      const res = await aiService.askAIAssistant(q.trim());
      if (res.success && res.data) {
        setRecommendationResult(res.data);
      }
    } catch (err) {
      showToast('Error generating AI recommendation. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    } else {
      // Auto-run first preset for great first impression
      handleSearch(presetQueries[0].query);
      setInputQuery(presetQueries[0].query);
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Interactive Product Finder</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Smart Shopping Guide & Advisor
        </h1>
        
        <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
          Looking for something specific? Describe your budget, preferred brands, or intended use, and we'll instantly find the best matching gear from our catalog.
        </p>
      </div>

      {/* Query Bar & Presets */}
      <div className="max-w-3xl mx-auto space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(inputQuery);
          }}
          className="relative bg-white rounded-2xl border border-slate-300 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 shadow-sm p-1.5 flex items-center gap-2 transition-all"
        >
          <div className="pl-3 text-slate-400">
            <Search className="w-5 h-5 text-slate-400" />
          </div>

          <input
            type="text"
            placeholder="e.g. 'Laptop for programming and college projects under ₹50,000'"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="w-full text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none py-2"
          />

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 shrink-0 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <span>Find Matches</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Preset Prompt Pills */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center sm:text-left">
            Popular Example Prompts:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {presetQueries.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputQuery(item.query);
                  handleSearch(item.query);
                }}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 text-xs font-semibold shrink-0 transition-all text-left flex items-center gap-2 shadow-2xs"
              >
                <span>{item.title}</span>
                <span className="text-[10px] text-slate-400 font-normal">({item.badge})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI Processing Animation */}
      {loading && (
        <div className="max-w-xl mx-auto p-12 text-center space-y-4 bg-white rounded-3xl border border-indigo-100 shadow-md animate-pulse">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-inner">
            <Cpu className="w-8 h-8 animate-spin" />
          </div>
          <h3 className="text-base font-bold text-slate-900">AI Engine is Evaluating Specifications...</h3>
          <p className="text-xs text-slate-500">
            Parsing price bounds, matching hardware architectures, and scoring verified buyer satisfaction...
          </p>
        </div>
      )}

      {/* Results Display */}
      {!loading && recommendationResult && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Extracted Intent Summary Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Understood Intent</span>
                <h3 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                  "{recommendationResult.query}"
                </h3>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-slate-300 border border-white/10">
                  Target: {recommendationResult.extracted_intent?.category}
                </span>
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold text-slate-300 border border-white/10">
                  Budget: {recommendationResult.extracted_intent?.budget}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {recommendationResult.summary_text}
            </p>
          </div>

          {/* BEST MATCH SPOTLIGHT (Section 9 Requirement) */}
          {recommendationResult.best_match && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-xl font-extrabold text-slate-900">Top Recommended Match</h3>
              </div>

              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs relative overflow-hidden">
                
                {/* Match Score Badge in Top Right */}
                <div className="absolute top-6 right-6 flex flex-col items-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-600 text-white flex flex-col items-center justify-center shadow-sm">
                    <span className="text-lg sm:text-2xl font-black">
                      {recommendationResult.best_match.match_percentage}%
                    </span>
                    <span className="text-[10px] uppercase font-bold text-blue-100">Match</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  
                  {/* Image */}
                  <div className="md:col-span-4 flex items-center justify-center bg-white rounded-2xl p-6 border border-indigo-100 aspect-square">
                    <img
                      src={
                        recommendationResult.best_match.product.primary_image ||
                        recommendationResult.best_match.product.images?.[0]
                      }
                      alt={recommendationResult.best_match.product.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  {/* Details & Why We Recommend This */}
                  <div className="md:col-span-8 space-y-5 pr-0 sm:pr-20">
                    <div>
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                        {recommendationResult.best_match.product.brand}
                      </span>
                      <h4 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                        {recommendationResult.best_match.product.name}
                      </h4>
                      
                      <div className="flex items-center gap-3 mt-2">
                        <PriceTag
                          price={recommendationResult.best_match.product.final_price}
                          originalPrice={recommendationResult.best_match.product.price}
                          discountPercent={recommendationResult.best_match.product.discount_percent}
                          size="md"
                        />
                        <span className="text-slate-300">•</span>
                        <RatingStars
                          rating={recommendationResult.best_match.product.rating}
                          count={recommendationResult.best_match.product.review_count}
                          size="xs"
                        />
                      </div>
                    </div>

                    {/* Key Specs Pill Highlights */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {Object.entries(recommendationResult.best_match.product.specifications || {})
                        .slice(0, 3)
                        .map(([k, v], i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-white border border-indigo-200/80 rounded-lg text-slate-700 font-medium"
                          >
                            <strong>{k}:</strong> {v}
                          </span>
                        ))}
                    </div>

                    {/* "Why we recommend this" List */}
                    <div className="bg-white/80 rounded-2xl p-4 border border-indigo-100/80 space-y-2">
                      <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Why we recommend this product:
                      </span>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {recommendationResult.best_match.reasons.map((reason, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-emerald-600 font-bold">✓</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <Link
                        to={`/products/${recommendationResult.best_match.product.slug || recommendationResult.best_match.product.id}`}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                      >
                        View Full Details
                      </Link>

                      <button
                        onClick={() => addToCart(recommendationResult.best_match.product, 1)}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/20 flex items-center gap-1.5 transition-all"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>

                      <button
                        onClick={() => addToCompare(recommendationResult.best_match.product)}
                        className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                          isInCompare(recommendationResult.best_match.product.id)
                            ? 'bg-purple-100 text-purple-800 border-purple-300'
                            : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>
                          {isInCompare(recommendationResult.best_match.product.id) ? 'In Compare' : 'Compare'}
                        </span>
                      </button>
                    </div>

                  </div>

                </div>

              </div>
            </div>
          )}

          {/* ALTERNATIVE MATCHES / RUNNER UPS */}
          {recommendationResult.alternatives && recommendationResult.alternatives.length > 0 && (
            <div className="space-y-6 pt-6">
              <h3 className="text-xl font-bold text-slate-900">Alternative Good Options</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendationResult.alternatives.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.product.primary_image || item.product.images?.[0]}
                            alt={item.product.name}
                            className="w-16 h-16 rounded-xl object-contain bg-slate-50 p-1 border border-slate-100 shrink-0"
                          />
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {item.product.brand}
                            </span>
                            <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                              {item.product.name}
                            </h4>
                            <div className="mt-1">
                              <PriceTag
                                price={item.product.final_price}
                                originalPrice={item.product.price}
                                discountPercent={item.product.discount_percent}
                                size="sm"
                              />
                            </div>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                          {item.match_percentage}% Match
                        </span>
                      </div>

                      {/* Rationale */}
                      <ul className="space-y-1 text-xs text-slate-600">
                        {item.reasons.slice(0, 3).map((r, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-indigo-500 font-bold">•</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <Link
                        to={`/products/${item.product.slug || item.product.id}`}
                        className="text-xs font-bold text-indigo-600 hover:underline"
                      >
                        View Details
                      </Link>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => addToCompare(item.product)}
                          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                          title="Add to compare"
                        >
                          <Scale className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => addToCart(item.product, 1)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1"
                        >
                          <ShoppingCart className="w-3 h-3" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default AIAssistantPage;
