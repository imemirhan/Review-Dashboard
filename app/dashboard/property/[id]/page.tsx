'use client';

import { useEffect, useState } from 'react';
import useAdminAuth from '@/hooks/useAdminAuth';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Star } from 'lucide-react';

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

  useEffect(() => {
    fetch('/api/reviews/hostaway')
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.data.filter((r: Review) => r.listing === listingName));
      });
  }, [listingName]);

  const handleToggle = (id: number) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, approved: !r.approved } : r))
    );
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
    <main className="p-8 bg-gray-50 min-h-screen">
      <button
        onClick={() => router.push('/dashboard')}
        className="flex items-center text-blue-600 hover:underline mb-4 text-sm"
      >
        <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
      </button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{listingName}</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`px-4 py-2 rounded-md text-white font-semibold ${
            isSaving ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {saved && (
        <p className="text-green-600 text-sm mb-3 font-medium">
          ✅ Changes saved successfully!
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between">
              <h3 className="font-semibold text-gray-800 text-lg">{r.guest}</h3>
              <div className="flex items-center">
                <Star
                  className="text-yellow-500 fill-yellow-500 mr-1"
                  size={16}
                />
                <span className="text-sm font-medium">{r.rating}</span>
              </div>
            </div>

            <p className="text-gray-700 italic text-sm mt-2">"{r.review}"</p>

            <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
              <span>{new Date(r.date.replace(' ', 'T')).toLocaleDateString()}</span>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={r.approved}
                  onChange={() => handleToggle(r.id)}
                  className="accent-blue-600"
                />
                <span
                  className={`font-medium ${
                    r.approved ? 'text-green-600' : 'text-red-500'
                  }`}
                >
                  {r.approved ? 'Approved' : 'Pending'}
                </span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
