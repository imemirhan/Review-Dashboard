'use client';

import { useState, useMemo } from 'react';
import { Star } from 'lucide-react';
import { ReviewCardProps } from '@/lib/types';
import { formatReviewDate, renderStars } from '@/lib/utils';

export default function ReviewCard({ guest, rating, review, date, categories = [] }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const formattedDate = useMemo(() => formatReviewDate(date), [date]);

  const shouldTruncate = review.length > 200;
  const displayText = expanded || !shouldTruncate ? review : review.slice(0, 200) + '...';

  return (
    <article className="border-b border-gray-200 pb-6 mb-6 last:border-none">
      {/* Main Review Header */}
      <header className="flex items-center flex-wrap gap-2 mb-2">
        <div className="flex">{renderStars(rating)}</div>
        <span className="text-gray-700 font-medium">· {guest}</span>
        <time dateTime={date} className="text-gray-400 text-sm">
          · {formattedDate}
        </time>
      </header>

      {/* Review Text */}
      <p className="text-gray-700 leading-relaxed text-sm mb-1">{displayText}</p>

      {shouldTruncate && (
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="text-blue-600 text-sm font-medium hover:underline focus:outline-none"
          aria-label={expanded ? 'Collapse review text' : 'Expand review text'}
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}

      {/* Category Ratings */}
      {categories.length > 0 && (
        <section className="mt-4 space-y-2 w-75">
          {categories.map((c, idx) => {
            const rounded = Math.round(c.rating);
            return (
              <div key={idx} className="flex items-center justify-between text-sm text-gray-700">
                <span className="font-medium">{c.name}</span>
                <div className="flex items-center gap-1">
                  {renderStars(rounded, 12)}
                  <span className="text-gray-600 text-xs ml-1">{c.rating.toFixed(1)}</span>
                </div>
              </div>
            );
          })}
        </section>
      )}
    </article>
  );
}
