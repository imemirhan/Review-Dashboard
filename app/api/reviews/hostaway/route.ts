import { NextResponse } from 'next/server';
import { HostawayReview, NormalizedReview } from '@/lib/types';
import mockData from '@/data/mockReviews.json';

let cachedToken: string | null = null;
let persistedReviews: Record<number, boolean> = {};
let cachedReviews: NormalizedReview[] | null = null;
let tokenExpiry = 0;
let reviewsExpiry = 0;

const HOSTAWAY_CLIENT_ID = process.env.HOSTAWAY_CLIENT_ID!;
const HOSTAWAY_CLIENT_SECRET = process.env.HOSTAWAY_CLIENT_SECRET!;
const HOSTAWAY_BASE_URL = process.env.HOSTAWAY_BASE_URL || 'https://api.hostaway.com/v1';

if (!HOSTAWAY_CLIENT_ID || !HOSTAWAY_CLIENT_SECRET) {
  throw new Error('Missing Hostaway credentials in environment variables');
}

async function getAccessToken(retry = 1): Promise<string> {
  const now = Date.now();

  if (cachedToken && now < tokenExpiry) return cachedToken;

  try {
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: HOSTAWAY_CLIENT_ID,
      client_secret: HOSTAWAY_CLIENT_SECRET,
      scope: 'general',
    });

    const res = await fetch(`${HOSTAWAY_BASE_URL}/accessTokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });

    if (!res.ok) throw new Error(`Token fetch failed: ${res.statusText}`);
    const data = await res.json();
    const token = String(data.access_token);

    cachedToken = token;
    tokenExpiry = now + (Number(data.expires_in) - 60) * 1000;
    return token;
  } catch (err) {
    if (retry > 0) return getAccessToken(retry - 1);
    console.error('Hostaway token fetch failed after retry:', err);
    throw err;
  }
}

function normalizeReviews(data: HostawayReview[]): NormalizedReview[] {
  return data.map((r) => {
    const categories = r.reviewCategory || [];
    const rating =
      categories.length > 0
        ? +(categories.reduce((a, b) => a + b.rating, 0) / categories.length).toFixed(1)
        : null;

    return {
      id: r.id,
      listing: r.listingName,
      guest: r.guestName,
      rating,
      categories,
      review: r.publicReview || '',
      date: r.submittedAt || r.departureDate || '',
      approved: persistedReviews[r.id] ?? (r.status === 'published'),
      type: r.type || 'host-to-guest',
      channelId: r.channelId ?? null,
    };
  });
}

//Get 
export async function GET() {
  const now = Date.now();

  // Serve cached reviews if still valid
  if (cachedReviews && now < reviewsExpiry) {
    return NextResponse.json({
      source: 'cache',
      cachedAt: new Date(reviewsExpiry - 5 * 60 * 1000).toISOString(),
      success: true,
      data: cachedReviews,
    });
  }

  try {
    const token = await getAccessToken();
    const res = await fetch(`${HOSTAWAY_BASE_URL}/reviews?limit=20`, {
      headers: { Authorization: `Bearer ${token}`, 'Cache-Control': 'no-cache' },
    });

    if (!res.ok) throw new Error(`Hostaway API failed with status ${res.status}`);

    const data = await res.json();
    const reviews = data.result?.length ? data.result : mockData.result;

    const normalized = normalizeReviews(reviews);
    cachedReviews = normalized;
    reviewsExpiry = now + 5 * 60 * 1000;

    return NextResponse.json({
      source: 'hostaway',
      success: true,
      data: normalized,
    });
  } catch (err) {
    console.warn('Hostaway unavailable, falling back to mock data:', err);

    const normalized = normalizeReviews(mockData.result);
    cachedReviews = normalized;
    reviewsExpiry = now + 5 * 60 * 1000;

    const source = process.env.NODE_ENV === 'development' ? 'mock' : 'fallback';
    return NextResponse.json({
      source,
      success: true,
      data: normalized,
    });
  }
}

//Post
export async function POST(req: Request) {
  try {
    const updates = await req.json();
    const updateArray = Array.isArray(updates) ? updates : [updates];

    updateArray.forEach((u) => {
      if (typeof u.id === 'number' && typeof u.approved === 'boolean') {
        persistedReviews[u.id] = u.approved;
      }
    });

    // Invalidate cache so new approval states reflect on next GET
    cachedReviews = null;

    return NextResponse.json({ success: true, updated: persistedReviews });
  } catch (err) {
    console.error('Failed to process POST /reviews:', err);
    return NextResponse.json(
      { success: false, error: 'Invalid request payload' },
      { status: 400 }
    );
  }
}
