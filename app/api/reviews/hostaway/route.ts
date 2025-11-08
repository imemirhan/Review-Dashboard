import { NextResponse } from 'next/server';
import mockData from '@/data/mockReviews.json';

let persistedReviews: Record<number, boolean> = {};
let cachedToken: string | null = null;
let tokenExpiry = 0;
let cachedReviews: any[] | null = null;
let reviewsExpiry = 0;

const HOSTAWAY_CLIENT_ID = process.env.HOSTAWAY_CLIENT_ID!;
const HOSTAWAY_CLIENT_SECRET = process.env.HOSTAWAY_CLIENT_SECRET!;
const HOSTAWAY_BASE_URL = process.env.HOSTAWAY_BASE_URL || 'https://api.hostaway.com/v1';

if (!HOSTAWAY_CLIENT_ID || !HOSTAWAY_CLIENT_SECRET) {
  throw new Error('❌ Missing Hostaway credentials in environment variables');
}

/** 
 * cache access token using Hostaway's `expires_in` TTL 
 */
async function getAccessToken() {
  const now = Date.now();

  // Use cached token if not expired
  if (cachedToken && now < tokenExpiry) return cachedToken;

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: HOSTAWAY_CLIENT_ID,
    client_secret: HOSTAWAY_CLIENT_SECRET,
    scope: 'general',
  });

  const res = await fetch(`${HOSTAWAY_BASE_URL}/accessTokens`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cache-Control': 'no-cache',
    },
    body,
  });

  if (!res.ok) throw new Error('Failed to obtain Hostaway token');
  const data = await res.json();

  // Cache token & expiry (subtract 1 min buffer)
  cachedToken = data.access_token;
  tokenExpiry = now + (data.expires_in - 60) * 1000;
  console.log(`Cached new Hostaway token, valid for ${data.expires_in}s`);
  return cachedToken;
}

/** 
 * Normalize Hostaway data for frontend 
 */
function normalizeReviews(data: any[]) {
  return data.map((r) => ({
    id: r.id,
    listing: r.listingName,
    guest: r.guestName,
    rating:
      r.reviewCategory?.length > 0
        ? Math.round(
            (r.reviewCategory.reduce((a: any, b: { rating: number }) => a + b.rating, 0) /
              r.reviewCategory.length) * 10
          ) / 10
        : null,
    categories: r.reviewCategory || [],
    review: r.publicReview || '',
    date: r.submittedAt || r.departureDate || '',
    approved: persistedReviews[r.id] ?? (r.status === 'published'),
    type: r.type || "host-to-guest",
    channelId: r.channelId,
  }));
}

/**
 * GET: Fetch and cache reviews (5-minute cache)
 */
export async function GET() {
  const now = Date.now();

  // Use cached data if recent
  if (cachedReviews && now < reviewsExpiry) {
    return NextResponse.json({
      source: 'cache',
      success: true,
      data: cachedReviews,
    });
  }

  try {
    const token = await getAccessToken();
    const res = await fetch(`${HOSTAWAY_BASE_URL}/reviews?limit=20`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Cache-Control': 'no-cache',
      },
    });

    if (!res.ok) throw new Error('Hostaway reviews API failed');
    const data = await res.json();
    const reviews = data.result?.length ? data.result : mockData.result;

    const normalized = normalizeReviews(reviews);
    cachedReviews = normalized;
    reviewsExpiry = now + 5 * 60 * 1000; // Cache for 5 minutes

    return NextResponse.json({
      source: 'hostaway',
      success: true,
      data: normalized,
    });
  } catch (err) {
    console.warn('⚠️ Hostaway unavailable, using mock data:', err);
    const normalized = normalizeReviews(mockData.result);
    cachedReviews = normalized;
    reviewsExpiry = now + 5 * 60 * 1000;
    return NextResponse.json({
      source: 'mock',
      success: true,
      data: normalized,
    });
  }
}

/**
 * POST: Persist approval changes locally
 */
export async function POST(req: Request) {
  const updates = await req.json();

  if (Array.isArray(updates)) {
    updates.forEach((u) => (persistedReviews[u.id] = u.approved));
  } else {
    persistedReviews[updates.id] = updates.approved;
  }

  // Invalidate cache to reflect new approval states
  cachedReviews = null;

  return NextResponse.json({ success: true, updated: persistedReviews });
}
