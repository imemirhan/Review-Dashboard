'use client';

import { useEffect, useState, useMemo } from 'react';
import { Star, CheckCircle, XCircle } from 'lucide-react';
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

export default function ReviewsPage() {
  useAdminAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [afterDate, setAfterDate] = useState('');
  const [beforeDate, setBeforeDate] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [maxRating, setMaxRating] = useState(5);
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
        const inRatingRange = r.rating >= minRating && r.rating <= maxRating;
        const inStatus =
          statusFilter === 'all' ||
          (statusFilter === 'approved' && r.approved) ||
          (statusFilter === 'pending' && !r.approved);
        return inDateRange && inRatingRange && inStatus;
      })
      .sort((a, b) => {
        const da = new Date(a.date).getTime();
        const db = new Date(b.date).getTime();
        return sortOrder === 'newest' ? db - da : da - db;
      });
  }, [reviews, sortOrder, afterDate, beforeDate, minRating, maxRating, statusFilter]);

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
      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-md text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Approve All Pending Reviews?
            </h2>
            <p className="text-sm text-gray-600 mb-5">
              This will mark all pending reviews as approved. Are you sure you want to continue?
            </p>

            <div className="flex justify-center gap-3">
              <button
                onClick={handleApproveAll}
                className="bg-[#164f4c] text-white px-4 py-2 rounded-md hover:bg-[#0f3a38] transition font-medium"
              >
                Yes, Approve All
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header + Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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

          {/* Rating Filters */}
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
            <span className="text-gray-500">-</span>
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={maxRating}
              onChange={(e) => setMaxRating(parseFloat(e.target.value) || 5)}
              className="border rounded-md px-2 py-1 w-16 text-sm focus:ring-2 focus:ring-[#164f4c]/40"
            />
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
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((r) => (
          <div
            key={r.id}
            className="bg-white border rounded-xl shadow-sm p-5 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">{r.guest}</h3>
                <p className="text-xs text-gray-500">
                  {r.listing}{' '}
                  <a
                    href={`/property/${encodeURIComponent(r.listing)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#164f4c] hover:underline font-medium"
                  >
                    See property →
                  </a>
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium">{r.rating.toFixed(1)}</span>
              </div>
            </div>

            <p className="text-gray-700 text-sm mt-2 line-clamp-4">“{r.review}”</p>

            <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
              <span>{new Date(r.date).toLocaleDateString()}</span>

              <button
                onClick={() => toggleApproval(r.id)}
                className={`flex items-center gap-1 font-medium border rounded-full px-3 py-1 transition-all ${
                  r.approved
                    ? 'text-green-700 border-green-400 hover:bg-green-50'
                    : 'text-red-600 border-red-300 hover:bg-red-50'
                }`}
              >
                {r.approved ? (
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
