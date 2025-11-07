'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, ArrowLeft, Images, X } from 'lucide-react';
import ReviewCard from '@/components/ReviewCard';

type Review = {
  id: number;
  listing: string;
  guest: string;
  rating: number;
  review: string;
  date: string;
  approved: boolean;
};

export default function PropertyPage() {
  const router = useRouter();
  const params = useParams();
  const listingName = decodeURIComponent(params.id as string);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  // Fetch approved reviews
  useEffect(() => {
    fetch('/api/reviews/hostaway')
      .then((res) => res.json())
      .then((data) => {
        const all: Review[] = data.data;
        const approved = all.filter(
          (r) => r.listing === listingName && r.approved
        );
        setReviews(approved);
      })
      .catch((err) => console.error('Failed to load reviews:', err));
  }, [listingName]);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((a, b) => a + b.rating, 0) / reviews.length
      : 0;

  const galleryImages = [0, 1, 2, 3, 4].map(
    (n) =>
      `https://picsum.photos/seed/${encodeURIComponent(listingName + n)}/800/600`
  );

  const openLightbox = (src: string) => {
    setActiveImage(src);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setActiveImage(null);
  };

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto p-8">
        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1 text-blue-600 mb-5 text-sm font-medium hover:underline"
        >
          <ArrowLeft size={16} /> Back to Listings
        </button>

        {/* Hero Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-8">
          {/* Main Image */}
          <div className="lg:col-span-2 relative rounded-xl overflow-hidden h-[300px] cursor-pointer">
            <img
              src={galleryImages[0]}
              alt="Main property image"
              className="w-full h-full object-cover"
              onClick={() => openLightbox(galleryImages[0])}
            />
            <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
              Featured
            </div>
            {avgRating > 0 && (
              <div className="absolute top-3 right-3 bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow">
                {avgRating.toFixed(2)} <Star size={12} className="fill-white" />
              </div>
            )}
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-2 grid-rows-2 gap-2 h-[300px]">
            {galleryImages.slice(1, 5).map((src, i) => (
              <div
                key={i}
                className="relative rounded-lg overflow-hidden cursor-pointer"
                onClick={() => openLightbox(src)}
              >
                <img
                  src={src}
                  alt={`Property thumbnail ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                {i === 3 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-medium">
                    <Images className="mr-1" size={14} /> +40 photos
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Property Details */}
        <section className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-12">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {listingName}
            </h1>
            <p className="text-sm text-gray-600 mb-3">
              Apartment · 5 guests · 2 bedrooms · 2 bathrooms
            </p>

            <p className="text-gray-700 leading-relaxed">
              This modern property offers everything you need for a comfortable
              stay. Close to cafes, parks, and public transport, it’s ideal for
              both leisure and business trips. Enjoy a cozy interior, bright
              rooms, and peaceful surroundings.
            </p>
          </div>

          {/* Inquiry Box */}
          <div className="bg-white border rounded-xl shadow-sm p-6 w-full lg:w-96">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Send Inquiry
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Choose your dates and number of guests to check availability.
            </p>
            <div className="space-y-3">
              <div className="border rounded-md p-3 text-gray-600 text-sm cursor-pointer">
                Select Dates
              </div>
              <div className="border rounded-md p-3 text-gray-600 text-sm cursor-pointer">
                1 Guest
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold">
                Send Inquiry
              </button>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
            Reviews
            {avgRating > 0 && (
            <>
                <Star className="text-yellow-500 fill-yellow-500" size={18} />
                <span className="text-lg font-semibold">{avgRating.toFixed(2)}</span>
                <span className="text-gray-600 text-sm font-normal">
                ({reviews.length})
                </span>
            </>
            )}
        </h2>

        {reviews.length === 0 ? (
            <p className="text-gray-500 italic">No reviews yet for this property.</p>
        ) : (
            <div className="mt-4">
            {reviews.map((r) => (
                <ReviewCard
                key={r.id}
                guest={r.guest}
                rating={r.rating}
                review={r.review}
                date={r.date}
                />
            ))}
            </div>
        )}
        </section>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && activeImage && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <button
            onClick={closeLightbox}
            className="absolute top-6 right-6 text-white hover:text-gray-300"
          >
            <X size={28} />
          </button>
          <img
            src={activeImage}
            alt="Enlarged property"
            className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg"
          />
        </div>
      )}
    </main>
  );
}
