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
}

// Multi-vendor marketplace types
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

export interface MarketplaceProduct {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  condition: 'new' | 'used' | 'refurbished';
  quantity: number;
  featured: boolean;
  status: 'active' | 'pending' | 'sold' | 'inactive';
  published: boolean; // True if product is visible in main /marketplace (public listing)
  ownerKey?: string; // Temporary token for anonymous sellers
  ownerEmail?: string; // Email associated with anonymous listing
  views: number;
  favorites: number;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
  specifications?: Record<string, string>;
  shippingOptions?: {
    freeShipping: boolean;
    domesticShipping: boolean;
    internationalShipping: boolean;
    estimatedDays: number;
  };
}

export interface MarketplaceOrder {
  id: string;
  productId: string;
  vendorId: string;
  buyerId: string;
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    country: string;
    postalCode?: string;
  };
  createdAt: number;
  updatedAt: number;
}