import { Dispatch, SetStateAction } from 'react';
import type { UniversalStoreSchema } from '@/../../shared/universal-store-schema';

export interface StoreProduct {
  id: number;
  title: string;
  name?: string; // Alias for title
  description?: string;
  price: number;
  original_price?: number;
  images?: string[];
  category?: string;
  stock_quantity: number;
  is_featured: boolean;
  slug: string;
  views: number;
  seller_name?: string;
  short_spec?: string;
}

export interface StoreSettings {
  [key: string]: any;
  store_name?: string;
  store_description?: string;
  store_logo?: string;
  store_city?: string;
  primary_color?: string;
  secondary_color?: string;
  template?: string;
  banner_url?: string | null;
  hero_video_url?: string | null; // Video for hero section (overrides banner_url when set)
  currency_code?: string;
  hero_main_url?: string | null;
  hero_tile1_url?: string | null;
  hero_tile2_url?: string | null;
  owner_name?: string; // Store owner display name
  owner_email?: string; // Store owner email
  // Template customization fields
  template_hero_heading?: string;
  template_hero_subtitle?: string;
  template_button_text?: string;
  template_accent_color?: string;
  // Universal Store Schema (for schema-driven templates)
  store_schema?: UniversalStoreSchema;
}

export interface TemplateProps {
  storeSlug: string;
  products: StoreProduct[];
  filtered: StoreProduct[];
  settings: StoreSettings;
  categories: string[];
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  categoryFilter: string;
  setCategoryFilter: Dispatch<SetStateAction<string>>;
  sortOption: 'featured' | 'price-asc' | 'price-desc' | 'views-desc' | 'newest';
  setSortOption: Dispatch<SetStateAction<'featured' | 'price-asc' | 'price-desc' | 'views-desc' | 'newest'>>;
  viewMode: 'grid' | 'list';
  setViewMode: Dispatch<SetStateAction<'grid' | 'list'>>;
  formatPrice: (n: number) => string;
  primaryColor: string;
  secondaryColor: string;
  bannerUrl: string | null;
  navigate: (to: string | number) => void;
  canManage?: boolean;
  /** Force a specific breakpoint for preview mode (overrides window.innerWidth detection) */
  forcedBreakpoint?: 'mobile' | 'tablet' | 'desktop';
}

/**
 * Re-export Universal Store Schema types for convenience
 */
export type { UniversalStoreSchema } from '@/../../shared/universal-store-schema';
