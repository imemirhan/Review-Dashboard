'use client';

import Link from 'next/link';
import { Star } from 'lucide-react';
import { DEFAULT_IMAGE_URL } from '@/lib/constants';
import { PropertySummary } from '@/lib/types';

export default function PublicPropertyCard({
  listing,
  avgRating,
  approvedCount,
  totalReviews,
}: PropertySummary) {
  return (
    <Link
      href={`/property/${encodeURIComponent(listing)}`}
      className="block bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden hover:-translate-y-1"
    >
      {/* Image Section */}
      <div className="relative rounded-t-2xl overflow-hidden">
        <img
          src={`${DEFAULT_IMAGE_URL}seed/${encodeURIComponent(listing)}/600/400`}
          alt={listing}
          className="w-full h-56 object-cover"
        />

        {/* Featured Badge */}
        <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
          Featured
        </div>

        {/* Rating Badge */}
        {(avgRating ?? 0) > 0 && (
          <div className="absolute top-3 right-3 bg-emerald-700 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
            {(avgRating ?? 0).toFixed(1)} <Star size={12} className="fill-white" /> ({approvedCount})
          </div>
        )}
      </div>

      {/* Details Section */}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{listing}</h3>

        <p className="text-sm text-gray-500 mb-3">
          {approvedCount} approved / {totalReviews} total reviews
        </p>

        {/* Dummy tags */}
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 text-xs border rounded-full text-gray-600">
            Free WiFi
          </span>
          <span className="px-3 py-1 text-xs border rounded-full text-gray-600">
            Private Living Room
          </span>
          <span className="px-3 py-1 text-xs border rounded-full text-gray-600">
            24/7 Support
          </span>
        </div>
      </div>
    </Link>
  );
}
