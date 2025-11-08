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
