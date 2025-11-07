import mockData from '@/data/mockReviews.json';

let persistedReviews: Record<number, boolean> = {};

export async function GET() {
  const normalized = mockData.result.map((r) => ({
    id: r.id,
    listing: r.listingName,
    guest: r.guestName,
    rating:
      Math.round(
        (r.reviewCategory.reduce((a, b) => a + b.rating, 0) /
          r.reviewCategory.length) *
          10
      ) / 10,
    categories: r.reviewCategory,
    review: r.publicReview,
    date: r.submittedAt,
    approved: persistedReviews[r.id] ?? (r.status === 'published'),
  }));

  return Response.json({ success: true, data: normalized });
}

export async function POST(req: Request) {
  const updates = await req.json();

  // If single update
  if (Array.isArray(updates)) {
    updates.forEach((u) => (persistedReviews[u.id] = u.approved));
  } else {
    persistedReviews[updates.id] = updates.approved;
  }

  return Response.json({ success: true, updated: persistedReviews });
}
