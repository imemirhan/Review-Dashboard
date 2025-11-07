'use client';

import { useEffect, useState, useMemo } from 'react';
import { Star, Calendar, CheckCircle, XCircle, Save } from 'lucide-react';
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

const STORAGE_KEY = 'approvedReviewsStore';

export default function ReviewsPage() {
  useAdminAuth();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [sortDate, setSortDate] = useState<'desc' | 'asc'>('desc');
  const [saved, setSaved] = useState(false);

  // Load reviews
  useEffect(() => {
    fetch('/api/reviews/hostaway')
      .then((res) => res.json())
      .then((data) => {
        const savedStore = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const merged = data.data.map((r: Review) => {
          const match = savedStore.find((s: Review) => s.id === r.id);
          return match ? { ...r, approved: match.approved } : r;
        });
        setReviews(merged);
      })
      .catch(() => setReviews([]));
  }, []);

  // Toggle approval
  const toggleApproval = (id: number) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, approved: !r.approved } : r))
    );
    setSaved(false);
  };

  // Save to storage
  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Filters + sort
  const filtered = useMemo(() => {
    return reviews
      .filter((r) => r.rating >= minRating)
      .filter((r) => {
        if (statusFilter === 'approved') return r.approved;
        if (statusFilter === 'pending') return !r.approved;
        return true;
      })
      .sort((a, b) => {
        const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
        return sortDate === 'asc' ? diff : -diff;
      });
  }, [reviews, minRating, statusFilter, sortDate]);

  return (
    <div className="space-y-6">
      {/* Header + Save */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <h1 className="text-2xl font-bold" style={{ color: '#164f4c' }}>
          Review Management
        </h1>

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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="border rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-[#164f4c]/40"
          >
            <option value="all">All Reviews</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>

          <select
            value={sortDate}
            onChange={(e) => setSortDate(e.target.value as 'asc' | 'desc')}
            className="border rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-[#164f4c]/40"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 text-white font-semibold px-4 py-2 rounded-md shadow"
            style={{ backgroundColor: '#164f4c' }}
          >
            <Save size={16} /> {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Reviews Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="bg-white border rounded-xl shadow-sm p-5 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{r.guest}</h3>
                  <p className="text-xs text-gray-500">{r.listing}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium">{r.rating.toFixed(1)}</span>
                </div>
              </div>

              <p className="text-sm text-gray-700 italic mt-3 line-clamp-3">
                “{r.review}”
              </p>

              <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(r.date.replace(' ', 'T')).toLocaleDateString()}
                </span>

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
      ) : (
        <p className="text-center text-gray-500 mt-12 italic">
          No reviews match your filters.
        </p>
      )}
    </div>
  );
}
