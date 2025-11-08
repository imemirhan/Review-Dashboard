import { Star } from 'lucide-react';
import { Review } from './types'

/** Calculate the average rating of an array of reviews */
export const calculateAverageRating = (reviews: { rating: number }[]) => {
  if (!reviews.length) return 0;
  const total = reviews.reduce((a, b) => a + b.rating, 0);
  return total / reviews.length;
};

/** Render star icons visually based on a rating */
export const renderStars = (rating: number, size = 14) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.25 && rating - fullStars < 0.75;

  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < fullStars) {
          return <Star key={i} size={size} className="fill-yellow-500 text-yellow-500" />;
        } else if (i === fullStars && hasHalfStar) {
          return (
            <div key={i} className="relative w-[14px] h-[14px]">
              <Star size={size} className="text-gray-300 absolute" />
              <Star
                size={size}
                className="fill-yellow-500 text-yellow-500 absolute overflow-hidden"
                style={{ clipPath: 'inset(0 50% 0 0)' }}
              />
            </div>
          );
        } else {
          return <Star key={i} size={size} className="text-gray-300" />;
        }
      })}
    </div>
  );
};

export function groupMonthlyRatings(reviews: Review[]) {
  const grouped: Record<string, number[]> = {};
  reviews
    .filter((r) => r.approved)
    .forEach((r) => {
      const d = new Date(r.date.replace(' ', 'T'));
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      (grouped[key] ||= []).push(r.rating);
    });
  return Object.entries(grouped)
    .map(([month, values]) => ({
      month,
      avgRating: values.reduce((a, b) => a + b, 0) / values.length,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

/** Format date for displaying in reviews */
export const formatReviewDate = (date: string) =>
  new Date(date.replace(' ', 'T')).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });
