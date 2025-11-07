'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Star, CheckCircle, XCircle } from 'lucide-react';
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

export default function DashboardPropertyPage() {
  useAdminAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const params = useParams();
  const router = useRouter();
  const listingName = decodeURIComponent(params.id as string);

  // Fetch reviews for this listing
  useEffect(() => {
    fetch('/api/reviews/hostaway')
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.data.filter((r: Review) => r.listing === listingName));
      });
  }, [listingName]);

  const handleToggle = async (id: number) => {
    const updated = reviews.map((r) =>
      r.id === id ? { ...r, approved: !r.approved } : r
    );
    setReviews(updated);

    const toggled = updated.find((r) => r.id === id);
    await fetch('/api/reviews/hostaway', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ id, approved: toggled?.approved }]),
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    await fetch('/api/reviews/hostaway', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reviews.map(({ id, approved }) => ({ id, approved }))),
    });
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="p-8 bg-[#f8f8f8] min-h-screen">
      {/* Back Button */}
      <button
        onClick={() => router.push('/dashboard')}
        className="flex items-center text-[#164f4c] hover:underline mb-6 text-sm font-medium"
      >
        <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
      </button>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{listingName}</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`px-4 py-2 rounded-md text-white font-semibold shadow-sm transition ${
            isSaving
              ? 'bg-gray-400'
              : 'bg-[#164f4c] hover:bg-[#0f3a38]'
          }`}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {saved && (
        <p className="text-green-600 text-sm mb-4 font-medium">
          ✅ Changes saved successfully!
        </p>
      )}

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-800">{r.guest}</h3>
                <p className="text-xs text-gray-500">{new Date(r.date).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-1">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium">{r.rating.toFixed(1)}</span>
              </div>
            </div>

            <p className="text-gray-700 text-sm mt-3 line-clamp-4 italic">
              “{r.review}”
            </p>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => handleToggle(r.id)}
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

      {reviews.length === 0 && (
        <p className="text-center text-gray-500 italic mt-10">
          No reviews found for this property.
        </p>
      )}
    </main>
  );
}
