'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Star, TrendingUp, CheckCircle } from 'lucide-react';
import StatCard from '@/components/StatCard';
import RatingTrend from '@/components/RatingTrend';
import useAdminAuth from '@/hooks/useAdminAuth';

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
  avgRating: number;
  totalReviews: number;
  approvedCount: number;
};

export default function DashboardPage() {
  useAdminAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  useEffect(() => {
    fetch('/api/reviews/hostaway')
      .then((r) => r.json())
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
      const avg = approved.length
        ? approved.reduce((a, b) => a + b.rating, 0) / approved.length
        : 0;
      return {
        listing,
        avgRating: avg,
        totalReviews: revs.length,
        approvedCount: approved.length,
      };
    });
  }, [reviews]);

  const kpis = useMemo(() => {
    const approved = reviews.filter((r) => r.approved);
    const avgRating = approved.length
      ? (approved.reduce((a, b) => a + b.rating, 0) / approved.length).toFixed(2)
      : '—';
    const totalReviews = reviews.length;
    const approvalRate = totalReviews
      ? Math.round((approved.length / totalReviews) * 100) + '%'
      : '—';
    return { avgRating, totalReviews, approvalRate, approvedCount: approved.length };
  }, [reviews]);

  const trend = useMemo(() => {
  const byMonth: Record<string, { total: number; count: number }> = {};
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

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
    avgRating: byMonth[m] ? +(byMonth[m].total / byMonth[m].count).toFixed(2) : 0,
  }));
}, [reviews]);

  const filtered = useMemo(() => {
    return properties
      .filter((p) => p.avgRating >= minRating)
      .sort((a, b) =>
        sortOrder === 'desc' ? b.avgRating - a.avgRating : a.avgRating - b.avgRating
      );
  }, [properties, minRating, sortOrder]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h1 className="text-2xl font-bold" style={{ color: '#164f4c' }}>
          Dashboard Overview
        </h1>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Average Rating"
          value={String(kpis.avgRating)}
          sub="Approved reviews only"
          icon={<Star size={18} />}
        />
        <StatCard
          label="Total Reviews"
          value={String(kpis.totalReviews)}
          sub="All sources"
          icon={<TrendingUp size={18} />}
        />
        <StatCard
          label="Approved Reviews"
          value={String(kpis.approvedCount)}
          sub="Shown publicly"
          icon={<CheckCircle size={18} />}
        />
        <StatCard
          label="Approval Rate"
          value={String(kpis.approvalRate)}
          sub="Approved / Total"
        />
      </div>

      {/* Ratings Trend Chart */}
      <RatingTrend data={trend} />

      {/* Properties grid */}
        <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-800">Properties</h2>

            {/* Filters moved here */}
            <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600 font-medium">Min Rating</label>
                <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value) || 0)}
                className="border rounded-md px-3 py-1 w-20 focus:ring-2 focus:ring-[#164f4c]/40"
                />
            </div>

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
            <div
                key={p.listing}
                className="bg-white border rounded-xl shadow-sm p-5 hover:shadow-md transition-all"
                >
                <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-gray-900">{p.listing}</h3>
                    <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">
                        {p.approvedCount > 0 ? p.avgRating.toFixed(2) : '—'}
                    </span>
                    </div>
                </div>

                <p className="text-sm text-gray-500 mt-1">
                    {p.approvedCount} approved / {p.totalReviews} total
                </p>

                <div className="flex items-center gap-4 mt-4">
                    <Link
                    href={`/property/${encodeURIComponent(p.listing)}`}
                    className="text-sm font-medium hover:underline"
                    style={{ color: '#164f4c' }}
                    >
                    View property →
                    </Link>

                    <Link
                    href={`/dashboard/property/${encodeURIComponent(p.listing)}`}
                    className="text-sm font-medium hover:underline text-blue-600"
                    >
                    See reviews →
                    </Link>
                </div>
                </div>

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
