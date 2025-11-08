'use client';

import { useEffect, useMemo, useState } from 'react';
import { Star, TrendingUp, CheckCircle } from 'lucide-react';
import { REVIEW_CATEGORIES, DEFAULT_MIN_RATING } from '@/lib/constants';
import { calculateAverageRating } from '@/lib/utils';
import { Review } from '@/lib/types';
import StatCard from '@/components/StatCard';
import RatingTrend from '@/components/RatingTrend';
import ManagerPropertyCard from '@/components/ManagerPropertyCard';
import useAdminAuth from '@/hooks/useAdminAuth';

type PropertySummary = {
  listing: string;
  avgRating: number;
  totalReviews: number;
  approvedCount: number;
  categories: { name: string; avg: number }[];
};

export default function DashboardPage() {
  useAdminAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [minRating, setMinRating] = useState(DEFAULT_MIN_RATING);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [ratingCategory, setRatingCategory] = useState<
    'overall' | 'Cleanliness' | 'Communication' | 'Value'
  >('overall');

  useEffect(() => {
    fetch('/api/reviews/hostaway')
      .then((res) => res.json())
      .then((data) => setReviews(data.data))
      .catch(() => setReviews([]));
  }, []);

  const properties = useMemo<PropertySummary[]>(() => {
    const grouped: Record<string, Review[]> = reviews.reduce((acc, r) => {
      (acc[r.listing] ||= []).push(r);
      return acc;
    }, {} as Record<string, Review[]>);

    return Object.entries(grouped).map(([listing, revs]) => {
      const approved = revs.filter((r) => r.approved);
      const avgRating = calculateAverageRating(approved);

      const categories = REVIEW_CATEGORIES.map((name) => {
        const categoryRatings = approved
          .flatMap((r) => r.categories || [])
          .filter((c) => c.name === name);
        return { name, avg: calculateAverageRating(categoryRatings) };
      });

      return {
        listing,
        avgRating,
        totalReviews: revs.length,
        approvedCount: approved.length,
        categories,
      };
    });
  }, [reviews]);

  const kpis = useMemo(() => {
    const approved = reviews.filter((r) => r.approved);
    const avgRating = calculateAverageRating(approved).toFixed(1);
    const totalReviews = reviews.length;
    const approvalRate = totalReviews
      ? `${Math.round((approved.length / totalReviews) * 100)}%`
      : '—';

    return { avgRating, totalReviews, approvalRate, approvedCount: approved.length };
  }, [reviews]);

  // Monthly rating trend
  const trend = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const byMonth: Record<string, { total: number; count: number }> = {};

    reviews
      .filter((r) => r.approved)
      .forEach((r) => {
        const d = new Date(r.date.replace(' ', 'T'));
        const key = months[d.getMonth()];
        if (!byMonth[key]) byMonth[key] = { total: 0, count: 0 };
        byMonth[key].total += r.rating;
        byMonth[key].count += 1;
      });

    return months.map((m) => ({
      month: m,
      avgRating: byMonth[m] ? +(byMonth[m].total / byMonth[m].count).toFixed(1) : 0,
    }));
  }, [reviews]);

  // Apply filters
  const filtered = useMemo(() => {
    return properties
      .filter((p) => {
        const rating =
          ratingCategory === 'overall'
            ? p.avgRating
            : p.categories.find((c) => c.name === ratingCategory)?.avg || 0;
        return rating >= minRating;
      })
      .sort((a, b) => {
        const aVal =
          ratingCategory === 'overall'
            ? a.avgRating
            : a.categories.find((c) => c.name === ratingCategory)?.avg || 0;
        const bVal =
          ratingCategory === 'overall'
            ? b.avgRating
            : b.categories.find((c) => c.name === ratingCategory)?.avg || 0;
        return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
      });
  }, [properties, minRating, sortOrder, ratingCategory]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#164f4c]">Dashboard Overview</h1>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Average Rating" value={String(kpis.avgRating)} sub="Approved reviews only" icon={<Star size={18} />} />
        <StatCard label="Total Reviews" value={String(kpis.totalReviews)} sub="All sources" icon={<TrendingUp size={18} />} />
        <StatCard label="Approved Reviews" value={String(kpis.approvedCount)} sub="Shown publicly" icon={<CheckCircle size={18} />} />
        <StatCard label="Approval Rate" value={String(kpis.approvalRate)} sub="Approved / Total" />
      </div>

      {/* Rating Trend */}
      <RatingTrend data={trend} />

      {/* Properties Section */}
      <section className="space-y-3">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-800">Properties</h2>
          <div className="flex flex-wrap items-center gap-3">

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 font-medium">Category</label>
              <select
                value={ratingCategory}
                onChange={(e) => setRatingCategory(e.target.value as typeof ratingCategory)}
                className="border rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-[#164f4c]/40"
              >
                <option value="overall">Overall</option>
                {REVIEW_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Min Rating Slider */}
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600 font-medium whitespace-nowrap">Min Rating</label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value))}
                className="w-40 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#164f4c]"
              />
              <span className="text-sm font-medium text-gray-700 w-6 text-right">{minRating.toFixed(1)}</span>
            </div>

            {/* Sort Order */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="border rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-[#164f4c]/40"
            >
              <option value="desc">Highest Rating</option>
              <option value="asc">Lowest Rating</option>
            </select>
          </div>
        </div>

        {/* Property Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <ManagerPropertyCard
              key={p.listing}
              listing={p.listing}
              avgRating={p.avgRating}
              approvedCount={p.approvedCount}
              totalReviews={p.totalReviews}
              categories={p.categories}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-gray-500 mt-8 italic">
            No properties match your filters.
          </p>
        )}
      </section>
    </div>
  );
}
