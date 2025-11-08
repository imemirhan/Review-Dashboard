export type ReviewCategory = { name: string; rating: number };

export type Review = {
  id: number;
  listing: string;
  guest: string;
  rating: number;
  review: string;
  date: string;
  approved: boolean;
  categories?: ReviewCategory[];
};

export type PropertySummary = {
  categories?: never[];
  listing: string;
  avgRating: number | null;
  totalReviews: number;
  approvedCount: number;
};

export type PropertyCategory = {
  name: string;
  avg: number;
};

export type PropertyCardProps = {
  listing: string;
  avgRating: number;
  approvedCount: number;
  totalReviews: number;
  categories?: PropertyCategory[];
};

export type ReviewCardProps = {
  guest: string;
  rating: number;
  review: string;
  date: string;
  categories?: ReviewCategory[];
};

export type HostawayReview = {
  id: number;
  listingName: string;
  guestName: string;
  publicReview: string;
  reviewCategory?: { name: string; rating: number }[];
  submittedAt?: string;
  departureDate?: string;
  status?: string;
  channelId?: number;
  type?: string;
};

export type NormalizedReview = {
  id: number;
  listing: string;
  guest: string;
  rating: number | null;
  categories: { name: string; rating: number }[];
  review: string;
  date: string;
  approved: boolean;
  type: string;
  channelId: number | null;
};
