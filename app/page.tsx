'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import PublicPropertyCard from '@/components/UserPropertyCard';
import { Review, PropertySummary } from '@/lib/types';
import { DEFAULT_IMAGE_URL } from '@/lib/constants';
import { calculateAverageRating } from '@/lib/utils';

export default function HomePage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [properties, setProperties] = useState<PropertySummary[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/reviews/hostaway');
        const data = await res.json();
        const all: Review[] = data.data;

        // Group reviews by listing
        const grouped: Record<string, Review[]> = all.reduce((acc, r) => {
          (acc[r.listing] ||= []).push(r);
          return acc;
        }, {} as Record<string, Review[]>);

        // Compute property summaries
        const summaries = Object.entries(grouped).map(([listing, reviews]) => {
          const approved = reviews.filter((r) => r.approved);
          const avgRating = calculateAverageRating(approved);
          return {
            listing,
            avgRating,
            totalReviews: reviews.length,
            approvedCount: approved.length,
            categories: [], // could extend later for homepage category preview
          };
        });

        setReviews(all);
        setProperties(summaries);
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <PublicLayout>
      <main className="bg-gray-50 min-h-screen flex flex-col">
        {/* ===== Hero Section ===== */}
        <section className="relative h-[70vh] flex items-center justify-center text-center text-white">
          <Image
            src={`${DEFAULT_IMAGE_URL}seed/flexhero/1920/1080`}
            alt="Hero"
            fill
            className="object-cover brightness-75"
            priority
          />
          <div className="relative z-10 max-w-3xl px-6">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Book Beautiful Stays</h1>
            <p className="text-lg mb-6 text-gray-100">
              Discover furnished homes and serviced apartments across the world.
            </p>
            <Link
              href="#properties"
              className="bg-white text-[#164f4c] px-6 py-3 rounded-lg font-semibold shadow hover:bg-gray-100"
            >
              Explore Properties
            </Link>
          </div>
        </section>

        {/* ===== Property Section ===== */}
        <section id="properties" className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
            Our Top Properties
          </h2>
                    
          <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((p) => (
              <PublicPropertyCard
                key={p.listing}
                listing={p.listing}
                avgRating={p.avgRating || 0}
                approvedCount={p.approvedCount}
                totalReviews={p.totalReviews}
              />
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
