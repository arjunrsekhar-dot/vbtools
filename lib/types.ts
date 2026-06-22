export type PricingType = "Free" | "Freemium" | "Paid" | "Open Source";

export type Platform =
  | "Web"
  | "Windows"
  | "macOS"
  | "Linux"
  | "Android"
  | "iOS"
  | "Chrome Extension"
  | "API";

export type Tool = {
  id: string;
  name: string;
  slug: string;
  logo: string;
  logoColor: string;
  logoUrl?: string;
  screenshots?: string[];
  category: string;
  subcategory: string;
  shortDescription: string;
  fullDescription: string;
  pricingType: PricingType;
  startingPrice: string;
  freeTrial: boolean;
  rating: number;
  ratingCount: number;
  platforms: Platform[];
  tags: string[];
  useCases: string[];
  bestFor: string;
  features: string[];
  pros: string[];
  cons: string[];
  alternatives: string[];
  websiteUrl: string;
  affiliateUrl?: string;
  couponCode?: string;
  discount?: string;
  featured?: boolean;
  sponsored?: boolean;
  verified?: boolean;
  isNew?: boolean;
  views: number;
  saves: number;
  clicks: number;
  updatedAt: string;
};

export type Category = {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  count: number;
  keywords: string[];
};

export type UserRole = "USER" | "DEVELOPER" | "ADMIN";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};
