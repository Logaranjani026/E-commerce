import React from 'react';

export const formatINR = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const PriceTag = ({ price, originalPrice, discountPercent, size = 'md' }) => {
  const sizeClasses = {
    sm: { price: 'text-sm font-bold', original: 'text-xs', badge: 'text-[10px] px-1.5 py-0.5' },
    md: { price: 'text-base sm:text-lg font-bold', original: 'text-xs sm:text-sm', badge: 'text-xs px-2 py-0.5' },
    lg: { price: 'text-2xl sm:text-3xl font-extrabold', original: 'text-base sm:text-lg', badge: 'text-sm px-2.5 py-1' },
  }[size];

  const hasDiscount = discountPercent > 0 && originalPrice && originalPrice > price;

  return (
    <div className="flex items-baseline flex-wrap gap-2">
      <span className={`text-slate-900 ${sizeClasses.price}`}>
        {formatINR(price)}
      </span>
      {hasDiscount && (
        <>
          <span className={`text-slate-400 line-through ${sizeClasses.original}`}>
            {formatINR(originalPrice)}
          </span>
          <span className={`font-semibold bg-emerald-100 text-emerald-700 rounded-full ${sizeClasses.badge}`}>
            {Math.round(discountPercent)}% OFF
          </span>
        </>
      )}
    </div>
  );
};

export default PriceTag;
