/**
 * Theme Presets for Universal Store Schema
 * 
 * Instead of having many separate templates, we have ONE schema-driven renderer
 * (Shiro Hana) with multiple THEME PRESETS that change the look.
 * 
 * Each preset defines:
 * - Colors (primary, secondary, accent, background, text)
 * - Typography (fonts, sizes)
 * - Spacing (padding, gaps)
 * - Component styles (card shapes, hover effects, shadows)
 * - Hero layouts (which hero arrangement to use)
 * - Category/collection styles (icons, tabs, etc.)
 * 
 * The same Universal Schema can look like a fashion store, baby store,
 * electronics store, etc. just by applying different presets.
 */

import type { 
  StylesConfig, 
  ProductShape, 
  ProductStyle, 
  HoverEffect, 
  HeroLayout,
  HeroImageArrangement,
  CollectionLayout,
  GridLayout,
  ImageRatio 
} from './universal-store-schema';

// ============================================================================
// PRESET TYPE
// ============================================================================

export type ThemePreset = {
  id: string;
  name: string;
  description: string;
  category: string; // fashion, baby, electronics, food, etc.
  preview?: string; // Preview image URL
  
  // Style overrides
  styles: Partial<StylesConfig>;
  
  // Layout defaults
  defaults: {
    // Hero
    heroLayout?: HeroLayout;
    heroImageArrangement?: HeroImageArrangement;
    heroMinHeight?: number;
    heroOverlay?: boolean;
    
    // Products
    productShape?: ProductShape;
    productStyle?: ProductStyle;
    productImageRatio?: ImageRatio;
    hoverEffect?: HoverEffect;
    cardRadius?: number;
    cardShadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    
    // Grid
    gridLayout?: GridLayout;
    gridColumns?: number;
    gridGap?: number;
    
    // Collections/Categories
    collectionLayout?: CollectionLayout;
    categoryStyle?: 'cards' | 'icons' | 'tabs' | 'pills';
    
    // General
    showProductShadows?: boolean;
    enableAnimations?: boolean;
    sectionSpacing?: number;
  };
};

// ============================================================================
// PRESET DEFINITIONS
// ============================================================================

export const THEME_PRESETS: ThemePreset[] = [
  // -------------------------------------------------------------------------
  // MINIMAL / UNIVERSAL
  // -------------------------------------------------------------------------
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean, minimal design that works for any store type',
    category: 'universal',
    styles: {
      theme: 'light',
      primaryColor: '#000000',
      accentColor: '#3B82F6',
      backgroundColor: '#FFFFFF',
      textColor: '#111111',
      fonts: {
        heading: 'Inter',
        body: 'Inter',
      },
    },
    defaults: {
      heroLayout: 'centered',
      productShape: 'card',
      productStyle: 'flat',
      hoverEffect: 'lift',
      cardRadius: 8,
      cardShadow: 'sm',
      gridColumns: 4,
      enableAnimations: true,
    },
  },

  // -------------------------------------------------------------------------
  // FASHION
  // -------------------------------------------------------------------------
  {
    id: 'fashion-dark',
    name: 'Fashion Dark',
    description: 'Bold dark theme for fashion and apparel',
    category: 'fashion',
    styles: {
      theme: 'dark',
      primaryColor: '#F97316',
      accentColor: '#FED7AA',
      backgroundColor: '#09090F',
      textColor: '#F0F0F0',
      fonts: {
        heading: 'Playfair Display',
        body: 'Inter',
      },
    },
    defaults: {
      heroLayout: 'split',
      productShape: 'card',
      productStyle: 'flat',
      hoverEffect: 'zoom',
      cardRadius: 0,
      cardShadow: 'none',
      gridColumns: 3,
      enableAnimations: true,
    },
  },
  {
    id: 'fashion-light',
    name: 'Fashion Light',
    description: 'Elegant light theme for luxury fashion',
    category: 'fashion',
    styles: {
      theme: 'light',
      primaryColor: '#1A1A1A',
      accentColor: '#D4AF37',
      backgroundColor: '#FAFAFA',
      textColor: '#1A1A1A',
      fonts: {
        heading: 'Cormorant Garamond',
        body: 'Lato',
      },
    },
    defaults: {
      heroLayout: 'left-text',
      productShape: 'card',
      productStyle: 'border',
      hoverEffect: 'lift',
      cardRadius: 0,
      cardShadow: 'none',
      gridColumns: 4,
      enableAnimations: true,
    },
  },

  // -------------------------------------------------------------------------
  // BABY & KIDS
  // -------------------------------------------------------------------------
  {
    id: 'baby-soft',
    name: 'Baby Soft',
    description: 'Soft, playful theme for baby products',
    category: 'baby',
    styles: {
      theme: 'light',
      primaryColor: '#EC4899',
      accentColor: '#F9A8D4',
      backgroundColor: '#FFF5F7',
      textColor: '#4A1A2C',
      fonts: {
        heading: 'Quicksand',
        body: 'Nunito',
      },
    },
    defaults: {
      // Hero: text left, image right with floating shapes
      heroLayout: 'right-text',
      heroImageArrangement: 'single',
      heroOverlay: false,
      // Products: rounded, soft
      productShape: 'card',
      productStyle: 'shadow',
      productImageRatio: 'square',
      hoverEffect: 'lift',
      cardRadius: 16,
      cardShadow: 'md',
      // Grid
      gridLayout: 'grid',
      gridColumns: 3,
      gridGap: 24,
      // Categories: icons with emojis
      collectionLayout: 'icons',
      categoryStyle: 'icons',
      // General
      enableAnimations: true,
      sectionSpacing: 48,
    },
  },
  {
    id: 'baby-neutral',
    name: 'Baby Neutral',
    description: 'Neutral, modern theme for baby stores',
    category: 'baby',
    styles: {
      theme: 'light',
      primaryColor: '#8B7355',
      accentColor: '#D4C4B5',
      backgroundColor: '#FAF8F5',
      textColor: '#3D3D3D',
      fonts: {
        heading: 'Poppins',
        body: 'Open Sans',
      },
    },
    defaults: {
      heroLayout: 'left-text',
      productShape: 'card',
      productStyle: 'flat',
      hoverEffect: 'zoom',
      cardRadius: 12,
      cardShadow: 'sm',
      gridColumns: 4,
      enableAnimations: true,
    },
  },

  // -------------------------------------------------------------------------
  // ELECTRONICS
  // -------------------------------------------------------------------------
  {
    id: 'tech-dark',
    name: 'Tech Dark',
    description: 'Sleek dark theme for electronics and tech',
    category: 'electronics',
    styles: {
      theme: 'dark',
      primaryColor: '#00D4FF',
      accentColor: '#7C3AED',
      backgroundColor: '#0F172A',
      textColor: '#E2E8F0',
      fonts: {
        heading: 'Space Grotesk',
        body: 'Inter',
      },
    },
    defaults: {
      heroLayout: 'split',
      productShape: 'card',
      productStyle: 'elevated',
      hoverEffect: 'glow',
      cardRadius: 8,
      cardShadow: 'lg',
      gridColumns: 3,
      enableAnimations: true,
    },
  },
  {
    id: 'tech-minimal',
    name: 'Tech Minimal',
    description: 'Clean minimal theme for tech products',
    category: 'electronics',
    styles: {
      theme: 'light',
      primaryColor: '#2563EB',
      accentColor: '#60A5FA',
      backgroundColor: '#FFFFFF',
      textColor: '#1E293B',
      fonts: {
        heading: 'Inter',
        body: 'Inter',
      },
    },
    defaults: {
      heroLayout: 'centered',
      productShape: 'card',
      productStyle: 'border',
      hoverEffect: 'lift',
      cardRadius: 12,
      cardShadow: 'sm',
      gridColumns: 4,
      enableAnimations: true,
    },
  },

  // -------------------------------------------------------------------------
  // FOOD & CAFE
  // -------------------------------------------------------------------------
  {
    id: 'cafe-warm',
    name: 'Cafe Warm',
    description: 'Warm, cozy theme for cafes and food',
    category: 'food',
    styles: {
      theme: 'light',
      primaryColor: '#78350F',
      accentColor: '#F59E0B',
      backgroundColor: '#FFFBEB',
      textColor: '#451A03',
      fonts: {
        heading: 'Merriweather',
        body: 'Source Sans Pro',
      },
    },
    defaults: {
      heroLayout: 'fullscreen',
      productShape: 'card',
      productStyle: 'shadow',
      hoverEffect: 'zoom',
      cardRadius: 8,
      cardShadow: 'md',
      gridColumns: 3,
      enableAnimations: true,
    },
  },
  {
    id: 'restaurant-dark',
    name: 'Restaurant Dark',
    description: 'Elegant dark theme for restaurants',
    category: 'food',
    styles: {
      theme: 'dark',
      primaryColor: '#EF4444',
      accentColor: '#FCA5A5',
      backgroundColor: '#1C1917',
      textColor: '#FAFAF9',
      fonts: {
        heading: 'Playfair Display',
        body: 'Lato',
      },
    },
    defaults: {
      heroLayout: 'fullscreen',
      productShape: 'card',
      productStyle: 'flat',
      hoverEffect: 'reveal',
      cardRadius: 0,
      cardShadow: 'none',
      gridColumns: 2,
      enableAnimations: true,
    },
  },

  // -------------------------------------------------------------------------
  // JEWELRY & LUXURY
  // -------------------------------------------------------------------------
  {
    id: 'jewelry-gold',
    name: 'Jewelry Gold',
    description: 'Luxurious gold theme for jewelry',
    category: 'jewelry',
    styles: {
      theme: 'light',
      primaryColor: '#B8860B',
      accentColor: '#FFD700',
      backgroundColor: '#FFFEF7',
      textColor: '#1A1A1A',
      fonts: {
        heading: 'Cormorant Garamond',
        body: 'Montserrat',
      },
    },
    defaults: {
      heroLayout: 'split',
      productShape: 'card',
      productStyle: 'flat',
      hoverEffect: 'zoom',
      cardRadius: 0,
      cardShadow: 'none',
      gridColumns: 3,
      enableAnimations: true,
    },
  },
  {
    id: 'jewelry-dark',
    name: 'Jewelry Dark',
    description: 'Elegant dark theme for luxury jewelry',
    category: 'jewelry',
    styles: {
      theme: 'dark',
      primaryColor: '#D4AF37',
      accentColor: '#F5E6A3',
      backgroundColor: '#0A0A0A',
      textColor: '#FAFAFA',
      fonts: {
        heading: 'Didot',
        body: 'Lato',
      },
    },
    defaults: {
      heroLayout: 'centered',
      productShape: 'card',
      productStyle: 'border',
      hoverEffect: 'glow',
      cardRadius: 0,
      cardShadow: 'lg',
      gridColumns: 3,
      enableAnimations: true,
    },
  },

  // -------------------------------------------------------------------------
  // FURNITURE & HOME
  // -------------------------------------------------------------------------
  {
    id: 'furniture-scandinavian',
    name: 'Scandinavian',
    description: 'Clean Scandinavian style for furniture',
    category: 'furniture',
    styles: {
      theme: 'light',
      primaryColor: '#1E3A5F',
      accentColor: '#64748B',
      backgroundColor: '#F8FAFC',
      textColor: '#1E293B',
      fonts: {
        heading: 'DM Sans',
        body: 'Inter',
      },
    },
    defaults: {
      heroLayout: 'left-text',
      productShape: 'card',
      productStyle: 'flat',
      hoverEffect: 'lift',
      cardRadius: 4,
      cardShadow: 'sm',
      gridColumns: 3,
      enableAnimations: true,
    },
  },

  // -------------------------------------------------------------------------
  // BEAUTY & COSMETICS
  // -------------------------------------------------------------------------
  {
    id: 'beauty-pink',
    name: 'Beauty Pink',
    description: 'Soft pink theme for beauty products',
    category: 'beauty',
    styles: {
      theme: 'light',
      primaryColor: '#DB2777',
      accentColor: '#F9A8D4',
      backgroundColor: '#FDF2F8',
      textColor: '#831843',
      fonts: {
        heading: 'Playfair Display',
        body: 'Lato',
      },
    },
    defaults: {
      heroLayout: 'split',
      productShape: 'card',
      productStyle: 'shadow',
      hoverEffect: 'lift',
      cardRadius: 16,
      cardShadow: 'md',
      gridColumns: 4,
      enableAnimations: true,
    },
  },
  {
    id: 'beauty-minimal',
    name: 'Beauty Minimal',
    description: 'Clean minimal theme for cosmetics',
    category: 'beauty',
    styles: {
      theme: 'light',
      primaryColor: '#000000',
      accentColor: '#E5E5E5',
      backgroundColor: '#FFFFFF',
      textColor: '#171717',
      fonts: {
        heading: 'Bebas Neue',
        body: 'Open Sans',
      },
    },
    defaults: {
      heroLayout: 'centered',
      productShape: 'card',
      productStyle: 'flat',
      hoverEffect: 'zoom',
      cardRadius: 0,
      cardShadow: 'none',
      gridColumns: 4,
      enableAnimations: true,
    },
  },

  // -------------------------------------------------------------------------
  // PERFUME
  // -------------------------------------------------------------------------
  {
    id: 'perfume-luxury',
    name: 'Perfume Luxury',
    description: 'Luxurious dark theme for perfume',
    category: 'perfume',
    styles: {
      theme: 'dark',
      primaryColor: '#C084FC',
      accentColor: '#E9D5FF',
      backgroundColor: '#18181B',
      textColor: '#FAFAFA',
      fonts: {
        heading: 'Cormorant Garamond',
        body: 'Montserrat',
      },
    },
    defaults: {
      heroLayout: 'fullscreen',
      productShape: 'card',
      productStyle: 'elevated',
      hoverEffect: 'glow',
      cardRadius: 0,
      cardShadow: 'lg',
      gridColumns: 3,
      enableAnimations: true,
    },
  },

  // -------------------------------------------------------------------------
  // BAGS & ACCESSORIES
  // -------------------------------------------------------------------------
  {
    id: 'bags-classic',
    name: 'Bags Classic',
    description: 'Classic theme for bags and accessories',
    category: 'bags',
    styles: {
      theme: 'light',
      primaryColor: '#7C2D12',
      accentColor: '#FDBA74',
      backgroundColor: '#FFF7ED',
      textColor: '#431407',
      fonts: {
        heading: 'Libre Baskerville',
        body: 'Source Sans Pro',
      },
    },
    defaults: {
      heroLayout: 'split',
      productShape: 'card',
      productStyle: 'shadow',
      hoverEffect: 'zoom',
      cardRadius: 8,
      cardShadow: 'md',
      gridColumns: 3,
      enableAnimations: true,
    },
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a preset by ID
 */
export function getPreset(id: string): ThemePreset | undefined {
  return THEME_PRESETS.find(p => p.id === id);
}

/**
 * Get presets by category
 */
export function getPresetsByCategory(category: string): ThemePreset[] {
  return THEME_PRESETS.filter(p => p.category === category);
}

/**
 * Get all unique categories
 */
export function getPresetCategories(): string[] {
  return [...new Set(THEME_PRESETS.map(p => p.category))];
}

/**
 * Apply a preset to styles config
 */
export function applyPreset(preset: ThemePreset, existingStyles?: StylesConfig): StylesConfig {
  return {
    ...existingStyles,
    ...preset.styles,
  };
}

/**
 * Get default preset (minimal)
 */
export function getDefaultPreset(): ThemePreset {
  return THEME_PRESETS.find(p => p.id === 'minimal') || THEME_PRESETS[0];
}
