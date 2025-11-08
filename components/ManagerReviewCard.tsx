'use client';
import { CheckCircle, XCircle } from 'lucide-react';
import { renderStars, formatReviewDate } from '@/lib/utils';
import { Review } from '@/lib/types';

type Props = {
  review: Review;
  onToggleApproval: (id: number) => void;
};

export default function ManagerReviewCard({ review, onToggleApproval }: Props) {
  return (
    <div className="bg-white border rounded-xl shadow-sm p-5 hover:shadow-md transition">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-800">{review.guest}</h3>
          <p className="text-xs text-gray-500">
            {review.listing}{' '}
            <a
              href={`/property/${encodeURIComponent(review.listing)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#164f4c] hover:underline font-medium"
            >
              See property →
            </a>
          </p>
        </div>

        {/* Overall Rating */}
        <div className="flex flex-col items-end">
          {renderStars(review.rating, 14)}
          <span className="text-sm font-medium mt-1">{review.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Review Text */}
      <p className="text-gray-700 text-sm mt-2 line-clamp-4">“{review.review}”</p>

      {/* Category Ratings */}
      {review.categories && review.categories.length > 0 && (
        <div className="mt-4 space-y-2">
          {review.categories.map((c, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-sm text-gray-700"
            >
              <span className="font-medium">{c.name}</span>
              <div className="flex items-center gap-1">
                {renderStars(c.rating, 12)}
                <span className="text-gray-600 text-xs ml-1">{c.rating.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
        <span>{formatReviewDate(review.date)}</span>

        <button
          onClick={() => onToggleApproval(review.id)}
          className={`flex items-center gap-1 font-medium border rounded-full px-3 py-1 transition-all ${
            review.approved
              ? 'text-green-700 border-green-400 hover:bg-green-50'
              : 'text-red-600 border-red-300 hover:bg-red-50'
          }`}
        >
          {review.approved ? (
            <>
              <CheckCircle size={12} /> Approved
            </>
          ) : (
            <>
              <XCircle size={12} /> Pending
            </>
          )}
        </button>
      </div>
    </div>
  );
}
