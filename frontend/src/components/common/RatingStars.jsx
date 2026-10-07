import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating = 4.5, count, size = 'sm', interactive = false, onRatingChange }) => {
  const starSizes = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }[size];

  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center">
        {stars.map((star) => {
          const filled = rating >= star;
          const half = rating >= star - 0.5 && rating < star;

          return (
            <button
              key={star}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onRatingChange && onRatingChange(star)}
              className={`relative ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
            >
              <Star
                className={`${starSizes} ${
                  filled
                    ? 'fill-amber-400 text-amber-400'
                    : half
                    ? 'fill-amber-400/50 text-amber-400'
                    : 'fill-slate-200 text-slate-300'
                }`}
              />
            </button>
          );
        })}
      </div>
      {count !== undefined && (
        <span className="text-xs text-slate-500 font-medium">
          ({count})
        </span>
      )}
    </div>
  );
};

export default RatingStars;
