export interface StoreSettings {
  id: string;
  name: string;
  owner: string;
  domain?: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
  };
  layout: {
    columns: number;
    showCategories: boolean;
    showFeatured: boolean;
    showSearch: boolean;
  };
  features: {
    reviews: boolean;
    wishlist: boolean;
    compare: boolean;
    quickView: boolean;
  };
  subscription: {
    level: 'free' | 'pro' | 'enterprise';
    features: string[];
    maxProducts: number;
  };
}

export interface Product {
  id: string;
  storeId: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  featured: boolean;
  inStock: boolean;
  createdAt: number;
  // Optional fields kept for compatibility with vendor/legacy flows
  vendorId?: string;
  published?: boolean;
  visibilitySource?: string;
  ownerKey?: string;
  ownerEmail?: string;
  views?: number;
  favorites?: number;
  quantity?: number;
  status?: string;
  updatedAt?: number;
}
// Multi-vendor vendor types
export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  businessName: string;
  storeSlug: string; // URL-friendly store identifier (e.g., "johns-electronics")
  description?: string;
  logo?: string;
  coverImage?: string;
  rating: number;
  totalSales: number;
  totalProducts: number;
  verified: boolean;
  // All vendors are free tier; no premium logic
  joinedAt: number;
  location?: {
    city: string;
    country: string;
    address?: string;
  };
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
  };
}
// Use `Product` and `Vendor` for storefront and vendor flows.