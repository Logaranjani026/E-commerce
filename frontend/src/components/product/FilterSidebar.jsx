import React from 'react';
import { Filter, RotateCcw, Check, Star } from 'lucide-react';
import { formatINR } from '../common/PriceTag';

const FilterSidebar = ({
  categories = [],
  brands = [],
  selectedCategory,
  onSelectCategory,
  selectedBrand,
  onSelectBrand,
  priceRange,
  onPriceChange,
  minRating,
  onRatingChange,
  inStockOnly,
  onInStockToggle,
  onReset,
}) => {
  const pricePresets = [
    { label: 'Under ₹5,000', min: 0, max: 5000 },
    { label: '₹5,000 - ₹25,000', min: 5000, max: 25000 },
    { label: '₹25,000 - ₹60,000', min: 25000, max: 60000 },
    { label: 'Above ₹60,000', min: 60000, max: 200000 },
  ];

  return (
    <aside aria-label="Product filters" className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span>Filters</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset All</span>
        </button>
      </div>

      {/* Category Filter */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Categories</h4>
        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
          <button
            onClick={() => onSelectCategory('')}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              !selectedCategory
                ? 'bg-indigo-50 text-indigo-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>All Categories</span>
            {!selectedCategory && <Check className="w-3.5 h-3.5 text-indigo-600" />}
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug || selectedCategory === cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{cat.name}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                    {cat.product_count}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Price Range</h4>
        
        {/* Quick Presets */}
        <div className="flex flex-col gap-1.5">
          {pricePresets.map((preset, idx) => {
            const isSelected = priceRange.min === preset.min && priceRange.max === preset.max;
            return (
              <button
                key={idx}
                onClick={() => onPriceChange(preset.min, preset.max)}
                className={`text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200'
                    : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Custom Price Inputs */}
        <div className="pt-2 flex items-center gap-2 text-xs">
          <input
            type="number"
            placeholder="Min ₹"
            value={priceRange.min || ''}
            onChange={(e) => onPriceChange(Number(e.target.value) || 0, priceRange.max)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
          <span className="text-slate-400 font-medium">to</span>
          <input
            type="number"
            placeholder="Max ₹"
            value={priceRange.max || ''}
            onChange={(e) => onPriceChange(priceRange.min, Number(e.target.value) || 200000)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>
      </div>

      {/* Brands Filter */}
      {brands.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Brands</h4>
          <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
            <button
              onClick={() => onSelectBrand('')}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                !selectedBrand ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>All Brands</span>
              {!selectedBrand && <Check className="w-3.5 h-3.5 text-indigo-600" />}
            </button>
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => onSelectBrand(b)}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  selectedBrand === b ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{b}</span>
                {selectedBrand === b && <Check className="w-3.5 h-3.5 text-indigo-600" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Customer Rating Filter */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Customer Rating</h4>
        <div className="space-y-1">
          {[4.5, 4.0, 3.5].map((stars) => (
            <button
              key={stars}
              onClick={() => onRatingChange(minRating === stars ? 0 : stars)}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                minRating === stars ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{stars}★ & above</span>
              </div>
              {minRating === stars && <Check className="w-3.5 h-3.5 text-indigo-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* In Stock Toggle */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-800">In Stock Only</span>
        <button
          onClick={onInStockToggle}
          className={`w-10 h-6 rounded-full transition-colors relative p-0.5 ${
            inStockOnly ? 'bg-indigo-600' : 'bg-slate-200'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white transition-transform ${
              inStockOnly ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

    </aside>
  );
};

export default FilterSidebar;
