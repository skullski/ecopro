/**
 * Universal Template Data Hook
 * 
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                    UNIVERSAL TEMPLATE DATA LAYER                       │
 * │                                                                         │
 * │  This is the SINGLE SOURCE OF TRUTH for all template editable content. │
 * │                                                                         │
 * │  ┌──────────┐    ┌─────────────────┐    ┌──────────────────────┐        │
 * │  │ Settings │ → │ Universal Data  │ → │ ALL Templates        │        │
 * │  │ (stored) │    │ (standardized)  │    │ (render their way)  │        │
 * │  └──────────┘    └─────────────────┘    └──────────────────────┘        │
 * │                                                                         │
 * │  ADD A NEW FIELD HERE → IT WORKS IN ALL TEMPLATES AUTOMATICALLY        │
 * │                                                                         │
 * │  Example: Add "heroImageZoom" here                                     │
 * │  → All templates can now use data.heroImageZoom                        │
 * │  → Editor can edit it via data-edit-path="__settings.hero_image_zoom"  │
 * │  → Templates render zoom in their own visual style                     │
 * └─────────────────────────────────────────────────────────────────────────┘
 */

import { useMemo } from 'react';
import type { StoreSettings } from '@/pages/storefront/templates/types';

// ============================================================================
// UNIVERSAL EDITABLE FIELDS
// Add new fields here → ALL templates automatically get them
// ============================================================================

export interface UniversalTemplateData {
  // ─────────────────────────────────────────────────────────────────────────
  // STORE INFO
  // ─────────────────────────────────────────────────────────────────────────
  storeName: string;
  storeDescription: string;
  storeLogo: string;
  storeFavicon: string;
  
  // ─────────────────────────────────────────────────────────────────────────
  // HEADER
  // ─────────────────────────────────────────────────────────────────────────
  headerTagline: string;
  headerNavItems: string[];
  headerCtaText: string;
  headerCtaLink: string;
  
  // ─────────────────────────────────────────────────────────────────────────
  // HERO SECTION
  // ─────────────────────────────────────────────────────────────────────────
  heroKicker: string;           // Small text above title (e.g., "New Collection")
  heroTitle: string;            // Main hero heading
  heroSubtitle: string;         // Hero description
  heroImage: string;            // Hero background/main image URL
  heroImageAlt: string;         // Alt text for hero image
  heroImageScale: number;       // Image scale (1 = 100%)
  heroImagePositionX: number;   // Focal point X (0-1)
  heroImagePositionY: number;   // Focal point Y (0-1)
  heroVideo: string;            // Hero video URL (optional)
  heroVideoAutoplay: boolean;   // Autoplay video
  heroVideoLoop: boolean;       // Loop video
  heroCtaText: string;          // Primary CTA button text
  heroCtaLink: string;          // Primary CTA link
  heroSecondaryCtaText: string; // Secondary CTA button text
  heroSecondaryCtaLink: string; // Secondary CTA link
  
  // ─────────────────────────────────────────────────────────────────────────
  // COLORS (Theme)
  // ─────────────────────────────────────────────────────────────────────────
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  secondaryTextColor: string;
  backgroundColor: string;
  
  // ─────────────────────────────────────────────────────────────────────────
  // TYPOGRAPHY
  // ─────────────────────────────────────────────────────────────────────────
  fontFamily: string;
  headingFontFamily: string;
  fontSize: number;
  headingSizeMultiplier: number;
  
  // ─────────────────────────────────────────────────────────────────────────
  // LAYOUT & SPACING
  // ─────────────────────────────────────────────────────────────────────────
  borderRadius: number;
  sectionPadding: number;
  cardPadding: number;
  gridColumns: number;
  gridGap: number;
  
  // ─────────────────────────────────────────────────────────────────────────
  // EFFECTS & ANIMATIONS
  // ─────────────────────────────────────────────────────────────────────────
  enableAnimations: boolean;
  enableShadows: boolean;
  enableDarkMode: boolean;
  enableParallax: boolean;
  
  // ─────────────────────────────────────────────────────────────────────────
  // FEATURED SECTION
  // ─────────────────────────────────────────────────────────────────────────
  featuredTitle: string;
  featuredSubtitle: string;
  showFeaturedSection: boolean;
  featuredProductIds: string[];
  
  // ─────────────────────────────────────────────────────────────────────────
  // TESTIMONIALS
  // ─────────────────────────────────────────────────────────────────────────
  showTestimonials: boolean;
  testimonialsTitle: string;
  testimonials: Array<{
    name: string;
    text: string;
    rating: number;
    avatar?: string;
  }>;
  
  // ─────────────────────────────────────────────────────────────────────────
  // FOOTER
  // ─────────────────────────────────────────────────────────────────────────
  footerAbout: string;
  footerCopyright: string;
  footerLinks: Array<{ label: string; url: string }>;
  socialLinks: Array<{ platform: string; url: string }>;
  
  // ─────────────────────────────────────────────────────────────────────────
  // PRODUCT DISPLAY
  // ─────────────────────────────────────────────────────────────────────────
  productCardStyle: 'card' | 'tile' | 'minimal' | 'detailed';
  productImageRatio: 'square' | 'portrait' | 'landscape' | 'auto';
  showProductShadows: boolean;
  showQuickView: boolean;
  buyButtonText: string;
  addToCartText: string;
  
  // ─────────────────────────────────────────────────────────────────────────
  // RAW SETTINGS (for backward compatibility)
  // ─────────────────────────────────────────────────────────────────────────
  rawSettings: Record<string, any>;
}

// ============================================================================
// SETTINGS KEY MAPPING
// Maps universal field names to store settings keys
// ============================================================================

const SETTINGS_MAP: Record<keyof Omit<UniversalTemplateData, 'rawSettings'>, string> = {
  // Store Info
  storeName: 'store_name',
  storeDescription: 'store_description',
  storeLogo: 'store_logo',
  storeFavicon: 'store_favicon',
  
  // Header
  headerTagline: 'template_header_tagline',
  headerNavItems: 'template_header_nav',
  headerCtaText: 'template_header_cta_text',
  headerCtaLink: 'template_header_cta_link',
  
  // Hero
  heroKicker: 'template_hero_kicker',
  heroTitle: 'template_hero_heading',
  heroSubtitle: 'template_hero_subtitle',
  heroImage: 'banner_url',
  heroImageAlt: 'template_hero_image_alt',
  heroImageScale: 'template_hero_image_scale',
  heroImagePositionX: 'template_hero_image_pos_x',
  heroImagePositionY: 'template_hero_image_pos_y',
  heroVideo: 'hero_video_url',
  heroVideoAutoplay: 'template_hero_video_autoplay',
  heroVideoLoop: 'template_hero_video_loop',
  heroCtaText: 'template_button_text',
  heroCtaLink: 'template_button_link',
  heroSecondaryCtaText: 'template_secondary_cta',
  heroSecondaryCtaLink: 'template_secondary_cta_link',
  
  // Colors
  primaryColor: 'primary_color',
  secondaryColor: 'secondary_color',
  accentColor: 'accent_color',
  textColor: 'text_color',
  secondaryTextColor: 'secondary_text_color',
  backgroundColor: 'background_color',
  
  // Typography
  fontFamily: 'font_family',
  headingFontFamily: 'heading_font_family',
  fontSize: 'body_font_size',
  headingSizeMultiplier: 'heading_size_multiplier',
  
  // Layout
  borderRadius: 'border_radius',
  sectionPadding: 'section_padding',
  cardPadding: 'card_padding',
  gridColumns: 'grid_columns',
  gridGap: 'grid_gap',
  
  // Effects
  enableAnimations: 'enable_animations',
  enableShadows: 'show_product_shadows',
  enableDarkMode: 'enable_dark_mode',
  enableParallax: 'enable_parallax',
  
  // Featured
  featuredTitle: 'template_featured_title',
  featuredSubtitle: 'template_featured_subtitle',
  showFeaturedSection: 'show_featured_section',
  featuredProductIds: 'featured_product_ids',
  
  // Testimonials
  showTestimonials: 'show_testimonials',
  testimonialsTitle: 'template_testimonials_title',
  testimonials: 'testimonials',
  
  // Footer
  footerAbout: 'footer_about',
  footerCopyright: 'footer_copyright',
  footerLinks: 'footer_links',
  socialLinks: 'social_links',
  
  // Product Display
  productCardStyle: 'product_card_style',
  productImageRatio: 'product_image_ratio',
  showProductShadows: 'show_product_shadows',
  showQuickView: 'show_quick_view',
  buyButtonText: 'template_buy_now_label',
  addToCartText: 'template_add_to_cart_label',
};

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const DEFAULTS: UniversalTemplateData = {
  // Store Info
  storeName: 'My Store',
  storeDescription: 'Welcome to our store',
  storeLogo: '',
  storeFavicon: '',
  
  // Header
  headerTagline: 'Quality products, delivered fast',
  headerNavItems: ['Home', 'Shop', 'About', 'Contact'],
  headerCtaText: 'Shop Now',
  headerCtaLink: '#products',
  
  // Hero
  heroKicker: 'New Collection',
  heroTitle: 'Discover Our Latest Products',
  heroSubtitle: 'Shop the best selection of quality products at great prices.',
  heroImage: '',
  heroImageAlt: 'Hero image',
  heroImageScale: 1,
  heroImagePositionX: 0.5,
  heroImagePositionY: 0.5,
  heroVideo: '',
  heroVideoAutoplay: true,
  heroVideoLoop: true,
  heroCtaText: 'Shop Now',
  heroCtaLink: '#products',
  heroSecondaryCtaText: 'Learn More',
  heroSecondaryCtaLink: '#about',
  
  // Colors
  primaryColor: '#1F2937',
  secondaryColor: '#F3F4F6',
  accentColor: '#3B82F6',
  textColor: '#111827',
  secondaryTextColor: '#6B7280',
  backgroundColor: '#FFFFFF',
  
  // Typography
  fontFamily: 'Inter',
  headingFontFamily: 'Inter',
  fontSize: 16,
  headingSizeMultiplier: 1,
  
  // Layout
  borderRadius: 8,
  sectionPadding: 40,
  cardPadding: 16,
  gridColumns: 4,
  gridGap: 16,
  
  // Effects
  enableAnimations: true,
  enableShadows: true,
  enableDarkMode: false,
  enableParallax: false,
  
  // Featured
  featuredTitle: 'Featured Products',
  featuredSubtitle: 'Our most popular items',
  showFeaturedSection: true,
  featuredProductIds: [],
  
  // Testimonials
  showTestimonials: false,
  testimonialsTitle: 'What Our Customers Say',
  testimonials: [],
  
  // Footer
  footerAbout: '',
  footerCopyright: `© ${new Date().getFullYear()} All rights reserved.`,
  footerLinks: [],
  socialLinks: [],
  
  // Product Display
  productCardStyle: 'card',
  productImageRatio: 'square',
  showProductShadows: true,
  showQuickView: false,
  buyButtonText: 'Buy Now',
  addToCartText: 'Add to Cart',
  
  // Raw
  rawSettings: {},
};

// ============================================================================
// HELPER: Parse JSON safely
// ============================================================================

function parseJSON<T>(value: any, fallback: T): T {
  if (!value) return fallback;
  if (typeof value === 'object') return value as T;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useUniversalTemplateData(settings: Partial<StoreSettings> | Record<string, any> = {}): UniversalTemplateData {
  return useMemo(() => {
    const s = settings as Record<string, any>;
    
    return {
      // Store Info
      storeName: s.store_name || DEFAULTS.storeName,
      storeDescription: s.store_description || DEFAULTS.storeDescription,
      storeLogo: s.store_logo || s.logo_url || DEFAULTS.storeLogo,
      storeFavicon: s.store_favicon || DEFAULTS.storeFavicon,
      
      // Header
      headerTagline: s.template_header_tagline || DEFAULTS.headerTagline,
      headerNavItems: parseJSON(s.template_header_nav, DEFAULTS.headerNavItems),
      headerCtaText: s.template_header_cta_text || s.template_button_text || DEFAULTS.headerCtaText,
      headerCtaLink: s.template_header_cta_link || DEFAULTS.headerCtaLink,
      
      // Hero
      heroKicker: s.template_hero_kicker || DEFAULTS.heroKicker,
      heroTitle: s.template_hero_heading || DEFAULTS.heroTitle,
      heroSubtitle: s.template_hero_subtitle || DEFAULTS.heroSubtitle,
      heroImage: s.banner_url || s.template_hero_image || DEFAULTS.heroImage,
      heroImageAlt: s.template_hero_image_alt || DEFAULTS.heroImageAlt,
      heroImageScale: Number(s.template_hero_image_scale) || DEFAULTS.heroImageScale,
      heroImagePositionX: Number(s.template_hero_image_pos_x) || DEFAULTS.heroImagePositionX,
      heroImagePositionY: Number(s.template_hero_image_pos_y) || DEFAULTS.heroImagePositionY,
      heroVideo: s.hero_video_url || s.template_hero_video_url || DEFAULTS.heroVideo,
      heroVideoAutoplay: s.template_hero_video_autoplay !== false,
      heroVideoLoop: s.template_hero_video_loop !== false,
      heroCtaText: s.template_button_text || DEFAULTS.heroCtaText,
      heroCtaLink: s.template_button_link || DEFAULTS.heroCtaLink,
      heroSecondaryCtaText: s.template_secondary_cta || DEFAULTS.heroSecondaryCtaText,
      heroSecondaryCtaLink: s.template_secondary_cta_link || DEFAULTS.heroSecondaryCtaLink,
      
      // Colors
      primaryColor: s.primary_color || DEFAULTS.primaryColor,
      secondaryColor: s.secondary_color || DEFAULTS.secondaryColor,
      accentColor: s.accent_color || DEFAULTS.accentColor,
      textColor: s.text_color || DEFAULTS.textColor,
      secondaryTextColor: s.secondary_text_color || DEFAULTS.secondaryTextColor,
      backgroundColor: s.background_color || DEFAULTS.backgroundColor,
      
      // Typography
      fontFamily: s.font_family || DEFAULTS.fontFamily,
      headingFontFamily: s.heading_font_family || s.font_family || DEFAULTS.headingFontFamily,
      fontSize: Number(s.body_font_size) || DEFAULTS.fontSize,
      headingSizeMultiplier: Number(s.heading_size_multiplier) || DEFAULTS.headingSizeMultiplier,
      
      // Layout
      borderRadius: Number(s.border_radius) || DEFAULTS.borderRadius,
      sectionPadding: Number(s.section_padding) || DEFAULTS.sectionPadding,
      cardPadding: Number(s.card_padding) || DEFAULTS.cardPadding,
      gridColumns: Number(s.grid_columns) || DEFAULTS.gridColumns,
      gridGap: Number(s.grid_gap) || DEFAULTS.gridGap,
      
      // Effects
      enableAnimations: s.enable_animations !== false,
      enableShadows: s.show_product_shadows !== false,
      enableDarkMode: s.enable_dark_mode === true,
      enableParallax: s.enable_parallax === true,
      
      // Featured
      featuredTitle: s.template_featured_title || DEFAULTS.featuredTitle,
      featuredSubtitle: s.template_featured_subtitle || DEFAULTS.featuredSubtitle,
      showFeaturedSection: s.show_featured_section !== false,
      featuredProductIds: parseJSON(s.featured_product_ids, DEFAULTS.featuredProductIds),
      
      // Testimonials
      showTestimonials: s.show_testimonials === true,
      testimonialsTitle: s.template_testimonials_title || DEFAULTS.testimonialsTitle,
      testimonials: parseJSON(s.testimonials, DEFAULTS.testimonials),
      
      // Footer
      footerAbout: s.footer_about || DEFAULTS.footerAbout,
      footerCopyright: s.footer_copyright || DEFAULTS.footerCopyright,
      footerLinks: parseJSON(s.footer_links, DEFAULTS.footerLinks),
      socialLinks: parseJSON(s.social_links, DEFAULTS.socialLinks),
      
      // Product Display
      productCardStyle: s.product_card_style || DEFAULTS.productCardStyle,
      productImageRatio: s.product_image_ratio || DEFAULTS.productImageRatio,
      showProductShadows: s.show_product_shadows !== false,
      showQuickView: s.show_quick_view === true,
      buyButtonText: s.template_buy_now_label || DEFAULTS.buyButtonText,
      addToCartText: s.template_add_to_cart_label || DEFAULTS.addToCartText,
      
      // Raw settings for backward compatibility
      rawSettings: s,
    };
  }, [settings]);
}

// ============================================================================
// EXPORT SETTINGS MAP (for editor to know which settings keys to update)
// ============================================================================

export { SETTINGS_MAP, DEFAULTS };

// ============================================================================
// HELPER: Get settings key for a universal field
// ============================================================================

export function getSettingsKey(universalField: keyof UniversalTemplateData): string {
  return SETTINGS_MAP[universalField as keyof typeof SETTINGS_MAP] || universalField;
}

// ============================================================================
// HELPER: Create data-edit-path for a universal field
// ============================================================================

export function getEditPath(universalField: keyof UniversalTemplateData): string {
  const settingsKey = getSettingsKey(universalField);
  return `__settings.${settingsKey}`;
}

// ============================================================================
// TYPE: All available universal fields (for autocomplete)
// ============================================================================

export type UniversalField = keyof Omit<UniversalTemplateData, 'rawSettings'>;

// ============================================================================
// LIST OF ALL EDITABLE FIELDS (for editor to enumerate)
// ============================================================================

export const UNIVERSAL_EDITABLE_FIELDS: Array<{
  field: UniversalField;
  label: string;
  type: 'text' | 'color' | 'number' | 'boolean' | 'url' | 'textarea' | 'json';
  category: string;
}> = [
  // Store Info
  { field: 'storeName', label: 'Store Name', type: 'text', category: 'Store Info' },
  { field: 'storeDescription', label: 'Store Description', type: 'textarea', category: 'Store Info' },
  { field: 'storeLogo', label: 'Store Logo', type: 'url', category: 'Store Info' },
  { field: 'storeFavicon', label: 'Favicon', type: 'url', category: 'Store Info' },
  
  // Header
  { field: 'headerTagline', label: 'Header Tagline', type: 'text', category: 'Header' },
  { field: 'headerCtaText', label: 'Header CTA Text', type: 'text', category: 'Header' },
  { field: 'headerCtaLink', label: 'Header CTA Link', type: 'url', category: 'Header' },
  
  // Hero Section
  { field: 'heroKicker', label: 'Hero Kicker', type: 'text', category: 'Hero' },
  { field: 'heroTitle', label: 'Hero Title', type: 'text', category: 'Hero' },
  { field: 'heroSubtitle', label: 'Hero Subtitle', type: 'textarea', category: 'Hero' },
  { field: 'heroImage', label: 'Hero Image', type: 'url', category: 'Hero' },
  { field: 'heroImageScale', label: 'Hero Image Scale', type: 'number', category: 'Hero' },
  { field: 'heroImagePositionX', label: 'Hero Image X Position', type: 'number', category: 'Hero' },
  { field: 'heroImagePositionY', label: 'Hero Image Y Position', type: 'number', category: 'Hero' },
  { field: 'heroVideo', label: 'Hero Video URL', type: 'url', category: 'Hero' },
  { field: 'heroVideoAutoplay', label: 'Autoplay Video', type: 'boolean', category: 'Hero' },
  { field: 'heroVideoLoop', label: 'Loop Video', type: 'boolean', category: 'Hero' },
  { field: 'heroCtaText', label: 'Hero CTA Text', type: 'text', category: 'Hero' },
  { field: 'heroCtaLink', label: 'Hero CTA Link', type: 'url', category: 'Hero' },
  { field: 'heroSecondaryCtaText', label: 'Secondary CTA Text', type: 'text', category: 'Hero' },
  { field: 'heroSecondaryCtaLink', label: 'Secondary CTA Link', type: 'url', category: 'Hero' },
  
  // Colors
  { field: 'primaryColor', label: 'Primary Color', type: 'color', category: 'Colors' },
  { field: 'secondaryColor', label: 'Secondary Color', type: 'color', category: 'Colors' },
  { field: 'accentColor', label: 'Accent Color', type: 'color', category: 'Colors' },
  { field: 'textColor', label: 'Text Color', type: 'color', category: 'Colors' },
  { field: 'secondaryTextColor', label: 'Secondary Text Color', type: 'color', category: 'Colors' },
  { field: 'backgroundColor', label: 'Background Color', type: 'color', category: 'Colors' },
  
  // Typography
  { field: 'fontFamily', label: 'Font Family', type: 'text', category: 'Typography' },
  { field: 'headingFontFamily', label: 'Heading Font', type: 'text', category: 'Typography' },
  { field: 'fontSize', label: 'Base Font Size', type: 'number', category: 'Typography' },
  { field: 'headingSizeMultiplier', label: 'Heading Size Multiplier', type: 'number', category: 'Typography' },
  
  // Layout
  { field: 'borderRadius', label: 'Border Radius', type: 'number', category: 'Layout' },
  { field: 'sectionPadding', label: 'Section Padding', type: 'number', category: 'Layout' },
  { field: 'cardPadding', label: 'Card Padding', type: 'number', category: 'Layout' },
  { field: 'gridColumns', label: 'Grid Columns', type: 'number', category: 'Layout' },
  { field: 'gridGap', label: 'Grid Gap', type: 'number', category: 'Layout' },
  
  // Effects
  { field: 'enableAnimations', label: 'Enable Animations', type: 'boolean', category: 'Effects' },
  { field: 'enableShadows', label: 'Enable Shadows', type: 'boolean', category: 'Effects' },
  { field: 'enableDarkMode', label: 'Dark Mode', type: 'boolean', category: 'Effects' },
  { field: 'enableParallax', label: 'Parallax Effect', type: 'boolean', category: 'Effects' },
  
  // Featured
  { field: 'featuredTitle', label: 'Featured Section Title', type: 'text', category: 'Featured' },
  { field: 'featuredSubtitle', label: 'Featured Section Subtitle', type: 'text', category: 'Featured' },
  { field: 'showFeaturedSection', label: 'Show Featured Section', type: 'boolean', category: 'Featured' },
  
  // Testimonials
  { field: 'showTestimonials', label: 'Show Testimonials', type: 'boolean', category: 'Testimonials' },
  { field: 'testimonialsTitle', label: 'Testimonials Title', type: 'text', category: 'Testimonials' },
  
  // Footer
  { field: 'footerAbout', label: 'Footer About Text', type: 'textarea', category: 'Footer' },
  { field: 'footerCopyright', label: 'Copyright Text', type: 'text', category: 'Footer' },
  
  // Product Display
  { field: 'showProductShadows', label: 'Product Shadows', type: 'boolean', category: 'Products' },
  { field: 'showQuickView', label: 'Quick View', type: 'boolean', category: 'Products' },
  { field: 'buyButtonText', label: 'Buy Button Text', type: 'text', category: 'Products' },
  { field: 'addToCartText', label: 'Add to Cart Text', type: 'text', category: 'Products' },
];

// ============================================================================
// GET FIELDS BY CATEGORY (for editor UI)
// ============================================================================

export function getFieldsByCategory() {
  const categories: Record<string, typeof UNIVERSAL_EDITABLE_FIELDS> = {};
  
  for (const field of UNIVERSAL_EDITABLE_FIELDS) {
    if (!categories[field.category]) {
      categories[field.category] = [];
    }
    categories[field.category].push(field);
  }
  
  return categories;
}
