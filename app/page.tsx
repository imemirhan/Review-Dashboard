'use client';

import PublicLayout from "@/components/PublicLayout";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import Image from 'next/image';

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

        const grouped: Record<string, Review[]> = all.reduce((acc, r) => {
          if (!acc[r.listing]) acc[r.listing] = [];
          acc[r.listing].push(r);
          return acc;
        }, {} as Record<string, Review[]>);

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
    <PublicLayout>
    <main className="bg-gray-50 min-h-screen flex flex-col">
      {/* ✅ Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center text-center text-white">
        <Image
          src="https://picsum.photos/seed/flexhero/1920/1080"
          alt="Hero"
          fill
          className="object-cover brightness-75"
          priority
        />
        <div className="relative z-10 max-w-3xl px-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Book Beautiful Stays
          </h1>
          <p className="text-lg mb-6 text-gray-100">
            Discover furnished homes and serviced apartments across the world.
          </p>
          <button className="bg-white text-[#164f4c] px-6 py-3 rounded-lg font-semibold shadow hover:bg-gray-100">
            Explore Properties
          </button>
        </div>
      </section>

      {/* ✅ Property Section */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
          Our Top Properties
        </h2>

        <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((p, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden"
            >
              <div className="relative rounded-t-2xl overflow-hidden">
                <img
                  src={`https://picsum.photos/seed/${encodeURIComponent(
                    p.listing
                  )}/600/400`}
                  alt={p.listing}
                  className="w-full h-56 object-cover"
                />

                <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Featured
                </div>

                {p.avgRating && (
                  <div className="absolute top-3 right-3 bg-emerald-700 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    {p.avgRating.toFixed(1)}{' '}
                    <Star size={12} className="fill-white" /> (
                    {p.approvedCount})
                  </div>
                )}
              </div>

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

        {properties.length === 0 && (
          <p className="text-center text-gray-500 italic mt-10">
            No properties found.
          </p>
        )}
      </section>
    </main>
    </PublicLayout>
  );
}
