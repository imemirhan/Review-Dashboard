'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';

type Review = {
  id: number;
  listing: string;
  guest: string;
  rating: number;
  review: string;
  date: string;
  approved: boolean;
};

type PropertySummary = {
  listing: string;
  avgRating: number | null;
  totalReviews: number;
  approvedCount: number;
};

export default function HomePage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [properties, setProperties] = useState<PropertySummary[]>([]);

  useEffect(() => {
    fetch('/api/reviews/hostaway')
      .then((res) => res.json())
      .then((data) => {
        const all: Review[] = data.data;

        // Group reviews by property
        const grouped: Record<string, Review[]> = all.reduce((acc, r) => {
          if (!acc[r.listing]) acc[r.listing] = [];
          acc[r.listing].push(r);
          return acc;
        }, {} as Record<string, Review[]>);

        // Create property summaries
        const summaries = Object.entries(grouped).map(([listing, reviews]) => {
          const approved = reviews.filter((r) => r.approved);
          const avgRating =
            approved.length > 0
              ? approved.reduce((a, b) => a + b.rating, 0) / approved.length
              : null;

          return {
            listing,
            avgRating,
            totalReviews: reviews.length,
            approvedCount: approved.length,
          };
        });

        setProperties(summaries);
        setReviews(all);
      });
  }, []);

  return (
    <main className="bg-gray-50 min-h-screen py-12">
      <h1 className="text-3xl font-bold text-center mb-10 text-gray-800">
        Our Top Properties
      </h1>

      <div className="max-w-6xl mx-auto grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((p, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden"
          >
            {/* 🏙️ Image section */}
            <div className="relative rounded-t-2xl overflow-hidden">
              <img
                src={`https://picsum.photos/seed/${encodeURIComponent(
                  p.listing
                )}/600/400`}
                alt={p.listing}
                className="w-full h-56 object-cover"
              />

              <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                All listings
              </div>

              {p.avgRating && (
                <div className="absolute top-3 right-3 bg-emerald-700 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  {p.avgRating.toFixed(2)} <Star size={12} className="fill-white" /> ({p.approvedCount})
                </div>
              )}
            </div>

            {/* 🏠 Property details */}
            <div className="p-5">
              <Link
                href={`/property/${encodeURIComponent(p.listing)}`}
                className="text-lg font-semibold text-gray-800 hover:underline block"
              >
                {p.listing}
              </Link>

              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-3 py-1 text-xs border rounded-full text-gray-600">
                  Free WiFi
                </span>
                <span className="px-3 py-1 text-xs border rounded-full text-gray-600">
                  Internet
                </span>
                <span className="px-3 py-1 text-xs border rounded-full text-gray-600">
                  Private living room
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
