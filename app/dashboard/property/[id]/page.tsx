'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import useAdminAuth from '@/hooks/useAdminAuth';
import ManagerReviewCard from '@/components/ManagerReviewCard';
import { Review } from '@/lib/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function DashboardPropertyPage() {
  useAdminAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const params = useParams();
  const router = useRouter();
  const listingName = decodeURIComponent(params.id as string);

  // Fetch reviews for this property
  useEffect(() => {
    fetch('/api/reviews/hostaway')
      .then((res) => res.json())
      .then((data) => {
        const propertyReviews = data.data.filter(
          (r: Review) => r.listing === listingName
        );
        setReviews(propertyReviews);
      });
  }, [listingName]);

  // Toggle approval for a review
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

  // Save all changes
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

  // Monthly average ratings data
  const monthlyRatings = useMemo(() => {
    const grouped: Record<string, number[]> = {};
    reviews
      .filter((r) => r.approved)
      .forEach((r) => {
        const d = new Date(r.date.replace(' ', 'T'));
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(r.rating);
      });

    return Object.entries(grouped)
      .map(([month, values]) => ({
        month,
        avgRating: values.reduce((a, b) => a + b, 0) / values.length,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [reviews]);

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

        <a
          href={`/property/${encodeURIComponent(listingName)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#164f4c] hover:underline text-sm font-medium"
        >
          Go to property page →
        </a>
      </div>

      {/* Performance Chart */}
      <div className="bg-white border rounded-xl shadow-sm p-6 mb-10">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Performance Overview
        </h2>
        {monthlyRatings.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRatings}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                stroke="#6b7280"
                tickFormatter={(m) => {
                  const [y, mo] = m.split('-');
                  return new Date(Number(y), Number(mo) - 1).toLocaleString('default', {
                    month: 'short',
                    year: '2-digit',
                  });
                }}
              />
              <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} stroke="#6b7280" />
              <Tooltip
                formatter={(value: number) => value.toFixed(1)}
                labelFormatter={(m) =>
                  new Date(m + '-01').toLocaleString('default', {
                    month: 'long',
                    year: 'numeric',
                  })
                }
              />
              <Line
                type="monotone"
                dataKey="avgRating"
                stroke="#164f4c"
                strokeWidth={2.5}
                dot={{ r: 5, fill: '#164f4c' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-sm italic">
            Not enough approved reviews to display performance data.
          </p>
        )}
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {reviews.map((r) => (
          <ManagerReviewCard
            key={r.id}
            review={r}
            onToggleApproval={handleToggle}
          />
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
