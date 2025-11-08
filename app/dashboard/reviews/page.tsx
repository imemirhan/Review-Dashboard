'use client';

import { useEffect, useState, useMemo } from 'react';
import { Star, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import useAdminAuth from '@/hooks/useAdminAuth';
import ManagerReviewCard from '@/components/ManagerReviewCard';

type Review = {
  id: number;
  listing: string;
  guest: string;
  rating: number;
  review: string;
  date: string;
  approved: boolean;
};

export default function ReviewsPage() {
  useAdminAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [afterDate, setAfterDate] = useState('');
  const [beforeDate, setBeforeDate] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [maxRating, setMaxRating] = useState(5);
  const [ratingCategory, setRatingCategory] = useState<'overall' | 'Cleanliness' | 'Communication' | 'Value'>('overall');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetch('/api/reviews/hostaway')
      .then((res) => res.json())
      .then((data) => setReviews(data.data))
      .catch(() => setReviews([]));
  }, []);

  const filtered = useMemo(() => {
    const after = afterDate ? new Date(afterDate).getTime() : 0;
    const before = beforeDate ? new Date(beforeDate).getTime() : Infinity;

    return [...reviews]
      .filter((r) => {
        const t = new Date(r.date).getTime();
        const inDateRange = t >= after && t <= before;

        let categoryRating = r.rating;
        if (ratingCategory !== 'overall' && Array.isArray((r as any).categories)) {
          const cat = (r as any).categories.find((c: any) => c.name === ratingCategory);
          categoryRating = cat ? cat.rating : 0;
        }

        const meetsRating = categoryRating >= minRating;
        const inStatus =
          statusFilter === 'all' ||
          (statusFilter === 'approved' && r.approved) ||
          (statusFilter === 'pending' && !r.approved);

        return inDateRange && meetsRating && inStatus;
      })
      .sort((a, b) => {
        const da = new Date(a.date).getTime();
        const db = new Date(b.date).getTime();
        return sortOrder === 'newest' ? db - da : da - db;
      });
  }, [reviews, sortOrder, afterDate, beforeDate, minRating, statusFilter, ratingCategory]);

  const handleClearFilters = () => {
    setSortOrder('newest');
    setAfterDate('');
    setBeforeDate('');
    setMinRating(0);
    setMaxRating(5);
    setRatingCategory('overall');
    setStatusFilter('all');
  };

  const handleApproveAll = async () => {
    const pending = reviews.filter((r) => !r.approved);
    if (pending.length === 0) return;

    const updated = reviews.map((r) => ({ ...r, approved: true }));
    setReviews(updated);

    await fetch('/api/reviews/hostaway', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pending.map(({ id }) => ({ id, approved: true }))),
    });

    setShowConfirm(false);
  };

  const toggleApproval = async (id: number) => {
    const target = reviews.find((r) => r.id === id);
    if (!target) return;

    const updated = { ...target, approved: !target.approved };
    setReviews((prev) => prev.map((r) => (r.id === id ? updated : r)));

    await fetch('/api/reviews/hostaway', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ id, approved: updated.approved }]),
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters + Header */}
      <div
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4
                    bg-[#f8f8f8] fixed top-0 left-[250px] right-0 z-40 py-3 px-4 border-b border-gray-200 shadow-sm"
      >
        <div className="flex items-center justify-between w-full lg:w-auto">
          <h1 className="text-2xl font-bold" style={{ color: '#164f4c' }}>
            Reviews
          </h1>

          {/* Approve All Button */}
          {reviews.some((r) => !r.approved) && (
            <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-2 bg-[#164f4c] text-white ml-4 px-4 py-2 rounded-md text-sm font-medium hover:bg-[#0f3a38] transition"
            >
              <CheckCircle size={16} className="text-white" />
              Approve All Pending
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Sort */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
            className="border rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-[#164f4c]/40"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>

          {/* Date Filters */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 font-medium">After</label>
            <input
              type="date"
              value={afterDate}
              onChange={(e) => setAfterDate(e.target.value)}
              className="border rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-[#164f4c]/40"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 font-medium">Before</label>
            <input
              type="date"
              value={beforeDate}
              onChange={(e) => setBeforeDate(e.target.value)}
              className="border rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-[#164f4c]/40"
            />
          </div>

          {/* Rating Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 font-medium">Rating</label>
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={minRating}
              onChange={(e) => setMinRating(parseFloat(e.target.value) || 0)}
              className="border rounded-md px-2 py-1 w-16 text-sm focus:ring-2 focus:ring-[#164f4c]/40"
            />

            <select
              value={ratingCategory}
              onChange={(e) =>
                setRatingCategory(e.target.value as 'overall' | 'Cleanliness' | 'Communication' | 'Value')
              }
              className="border rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-[#164f4c]/40"
            >
              <option value="overall">Overall</option>
              <option value="Cleanliness">Cleanliness</option>
              <option value="Communication">Communication</option>
              <option value="Value">Value</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'approved' | 'pending')}
            className="border rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-[#164f4c]/40"
          >
            <option value="all">All Reviews</option>
            <option value="approved">Approved Only</option>
            <option value="pending">Pending Only</option>
          </select>

         {/* Clear Filters Button */}
        <button
        onClick={handleClearFilters}
        className="flex items-center gap-1 text-sm bg-[#164f4c] text-white px-3 py-1.5 rounded-md hover:bg-[#0f3a38] transition"
        >
        <RefreshCw size={14} className="text-white" /> Clear
        </button>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((r) => (
          <ManagerReviewCard key={r.id} review={r} onToggleApproval={toggleApproval} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-gray-500 text-center italic">
          No reviews match your selected filters.
        </p>
      )}
    </div>
  );
}
