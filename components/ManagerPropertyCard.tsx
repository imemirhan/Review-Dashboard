'use client';

import Link from 'next/link';
import { renderStars } from '@/lib/utils';
import { PropertyCardProps } from '@/lib/types';


export default function ManagerPropertyCard({
  listing,
  avgRating,
  approvedCount,
  totalReviews,
  categories = [],
}: PropertyCardProps) {
  return (
    <div className="bg-white border rounded-xl shadow-sm p-5 hover:shadow-md transition-all">
      {/* Header */}
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-gray-900">{listing}</h3>
        <div className="flex flex-col items-end">
          {renderStars(avgRating)}
          <span className="text-xs text-gray-500 mt-1">
            {approvedCount > 0 ? `${avgRating.toFixed(1)} / 5` : '—'}
          </span>
        </div>
      </div>

      {/* Review Counts */}
      <p className="text-sm text-gray-500 mt-1">
        {approvedCount} approved / {totalReviews} total
      </p>

      {/* Category breakdown */}
      {categories.length > 0 && (
        <div className="mt-3 space-y-2 text-sm text-gray-700">
          {categories.map((cat) => (
            <div key={cat.name} className="flex justify-between items-center">
              <span className="font-medium">{cat.name}</span>
              <div className="flex items-center gap-2">
                {renderStars(cat.avg)}
                <span className="text-gray-600 text-xs">{cat.avg.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Links */}
      <div className="flex flex-wrap items-center gap-3 mt-4">
        <Link
          target="_blank"
          href={`/property/${encodeURIComponent(listing)}`}
          className="flex-1 sm:flex-none text-center bg-[#164f4c] text-white px-4 py-2 rounded-lg font-medium
                    transition-all hover:bg-[#0f3a38] focus:ring-2 focus:ring-[#164f4c]/40 shadow-sm"
        >
          View Property
        </Link>
        <Link
          href={`/dashboard/property/${encodeURIComponent(listing)}`}
          className="flex-1 sm:flex-none text-center bg-blue-600 text-white px-4 py-2 rounded-lg font-medium
                    transition-all hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 shadow-sm"
        >
          See Reviews
        </Link>
      </div>
    </div>
  );
}
