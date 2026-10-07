import React from 'react';

export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-2xl p-4 border border-slate-200/80 animate-pulse shadow-sm flex flex-col justify-between">
    <div>
      <div className="w-full h-48 bg-slate-200 rounded-xl mb-4" />
      <div className="h-3 bg-slate-200 rounded w-1/3 mb-2" />
      <div className="h-4 bg-slate-200 rounded w-4/5 mb-3" />
      <div className="h-3 bg-slate-200 rounded w-1/4 mb-4" />
    </div>
    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
      <div className="h-6 bg-slate-200 rounded w-1/3" />
      <div className="h-9 bg-slate-200 rounded-xl w-1/3" />
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);
