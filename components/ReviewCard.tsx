'use client';
import { useState } from 'react';
import { Star } from 'lucide-react';

type ReviewCardProps = {
  guest: string;
  rating: number;
  review: string;
  date: string;
};

export default function ReviewCard({ guest, rating, review, date }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const formattedDate = new Date(date.replace(' ', 'T')).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const truncated = review.length > 200 && !expanded ? review.slice(0, 200) + '...' : review;
  const toggle = () => setExpanded((prev) => !prev);

  // ⭐ Calculate full and half stars properly
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
  const totalStars = 5;

  return (
    <div className="border-b border-gray-200 pb-6 mb-6 last:border-none">
      {/* Rating Stars + Guest Info */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex">
          {Array.from({ length: totalStars }).map((_, i) => {
            if (i < fullStars) {
              // full star
              return <Star key={i} size={14} className="fill-yellow-500 text-yellow-500" />;
            } else if (i === fullStars && hasHalfStar) {
              // half star (simulate by overlay)
              return (
                <div key={i} className="relative w-[14px] h-[14px]">
                  <Star size={14} className="text-gray-300 absolute" />
                  <Star
                    size={14}
                    className="fill-yellow-500 text-yellow-500 absolute overflow-hidden"
                    style={{ clipPath: 'inset(0 50% 0 0)' }}
                  />
                </div>
              );
            } else {
              // empty star
              return <Star key={i} size={14} className="text-gray-300" />;
            }
          })}
        </div>
        <span className="text-gray-700 font-medium">· {guest}</span>
        <span className="text-gray-400 text-sm">· {formattedDate}</span>
      </div>

      {/* Review Text */}
      <p className="text-gray-700 leading-relaxed text-sm mb-1">{truncated}</p>

      {review.length > 200 && (
        <button
          onClick={toggle}
          className="text-blue-600 text-sm font-medium hover:underline"
        >
          {expanded ? 'Hide' : 'Show more'}
        </button>
      )}
    </div>
  );
}
