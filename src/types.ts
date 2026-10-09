export type ListingStatus = "available" | "sold";

export type Listing = {
  id: string;
  title: string;
  price: number;
  category: string;
  seller: string;
  sellerId?: string;
  campus: string;
  condition: string;
  image: string;
  description?: string;
  status?: ListingStatus;
  reportedCount?: number;
  createdAt?: any;
};

export type ListingReport = {
  listingId: string;
  reason: string;
  details?: string;
  createdAt: string;
};

export type Tab = "Explore" | "Saved" | "Messages" | "Profile" | "MyListings" | "Dashboard";

