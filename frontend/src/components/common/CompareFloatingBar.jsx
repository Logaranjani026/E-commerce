import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, X, ArrowRight } from 'lucide-react';
import { useCompare } from '../../context/CompareContext';
import { formatINR } from './PriceTag';

const CompareFloatingBar = () => {
  const { compareItems, removeFromCompare, clearCompare } = useCompare();

  if (compareItems.length === 0) return null;

  return (
    <aside aria-label="Product comparison bar" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-slate-700/80 p-3 sm:p-4 flex items-center justify-between gap-4">
        
        {/* Left: Indicator & Thumbnails */}
        <div className="flex items-center gap-3 overflow-x-auto py-1">
          <div className="hidden sm:flex items-center gap-2 pr-2 border-r border-slate-700">
            <Scale className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-bold whitespace-nowrap">Compare ({compareItems.length}/4)</span>
          </div>

          <div className="flex items-center gap-2">
            {compareItems.map((product) => (
              <div
                key={product.id}
                className="relative group w-12 h-12 rounded-xl bg-white p-1 border border-slate-600 shrink-0"
              >
                <img
                  src={product.primary_image || product.images?.[0]}
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={() => removeFromCompare(product.id)}
                  className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] shadow-xs"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {Array.from({ length: 4 - compareItems.length }).map((_, i) => (
              <div
                key={i}
                className="w-12 h-12 rounded-xl border border-dashed border-slate-700 flex items-center justify-center text-[10px] text-slate-500 shrink-0"
              >
                +
              </div>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={clearCompare}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 transition-colors"
          >
            Clear
          </button>
          
          <Link
            to="/compare"
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              compareItems.length >= 2
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                : 'bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Compare Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </aside>
  );
};

export default CompareFloatingBar;
