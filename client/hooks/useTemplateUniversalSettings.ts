import { useMemo } from 'react';
import { useTemplateSettings } from './useTemplateData';

/**
 * Hook to extract universal template settings with proper defaults
 * Use this in ALL template components to get consistent styling
 */
export function useTemplateUniversalSettings() {
  const universalSettings = useTemplateSettings() || {};

  return useMemo(() => ({
    ...UNIVERSAL_DEFAULTS,

    // Colors
    primary_color: (universalSettings as any).primary_color ?? UNIVERSAL_DEFAULTS.primary_color,
    secondary_color: (universalSettings as any).secondary_color ?? UNIVERSAL_DEFAULTS.secondary_color,
    accent_color: (universalSettings as any).accent_color ?? UNIVERSAL_DEFAULTS.accent_color,
    text_color: (universalSettings as any).text_color ?? UNIVERSAL_DEFAULTS.text_color,
    secondary_text_color: (universalSettings as any).secondary_text_color ?? UNIVERSAL_DEFAULTS.secondary_text_color,

    // Typography
    font_family: (universalSettings as any).font_family ?? UNIVERSAL_DEFAULTS.font_family,
    heading_size_multiplier: (universalSettings as any).heading_size_multiplier ?? UNIVERSAL_DEFAULTS.heading_size_multiplier,
    body_font_size: (universalSettings as any).body_font_size ?? UNIVERSAL_DEFAULTS.body_font_size,

    // Layout
    section_padding: (universalSettings as any).section_padding ?? UNIVERSAL_DEFAULTS.section_padding,
    grid_columns: (universalSettings as any).grid_columns ?? UNIVERSAL_DEFAULTS.grid_columns,
    border_radius: (universalSettings as any).border_radius ?? UNIVERSAL_DEFAULTS.border_radius,

    // Dots / indicators (universal)
    carousel_dot_size: (universalSettings as any).carousel_dot_size ?? UNIVERSAL_DEFAULTS.carousel_dot_size,
    carousel_dot_gap: (universalSettings as any).carousel_dot_gap ?? UNIVERSAL_DEFAULTS.carousel_dot_gap,
    carousel_dot_color: (universalSettings as any).carousel_dot_color ?? UNIVERSAL_DEFAULTS.carousel_dot_color,
    carousel_dot_active_color: (universalSettings as any).carousel_dot_active_color ?? UNIVERSAL_DEFAULTS.carousel_dot_active_color,
    carousel_dot_border_color: (universalSettings as any).carousel_dot_border_color ?? UNIVERSAL_DEFAULTS.carousel_dot_border_color,

    // Theme
    enable_dark_mode: (universalSettings as any).enable_dark_mode ?? UNIVERSAL_DEFAULTS.enable_dark_mode,
    default_theme: (universalSettings as any).default_theme ?? UNIVERSAL_DEFAULTS.default_theme,
    show_product_shadows: (universalSettings as any).show_product_shadows ?? UNIVERSAL_DEFAULTS.show_product_shadows,
    enable_animations: (universalSettings as any).enable_animations ?? UNIVERSAL_DEFAULTS.enable_animations,

    // Features
    show_featured_section: (universalSettings as any).show_featured_section ?? UNIVERSAL_DEFAULTS.show_featured_section,
    featured_product_ids: (universalSettings as any).featured_product_ids ?? UNIVERSAL_DEFAULTS.featured_product_ids,
    show_testimonials: (universalSettings as any).show_testimonials ?? UNIVERSAL_DEFAULTS.show_testimonials,
    testimonials: (universalSettings as any).testimonials ?? UNIVERSAL_DEFAULTS.testimonials,
    show_faq: (universalSettings as any).show_faq ?? UNIVERSAL_DEFAULTS.show_faq,
    faq_items: (universalSettings as any).faq_items ?? UNIVERSAL_DEFAULTS.faq_items,
    footer_about: (universalSettings as any).footer_about ?? UNIVERSAL_DEFAULTS.footer_about,
    social_links: (universalSettings as any).social_links ?? UNIVERSAL_DEFAULTS.social_links,
    footer_contact: (universalSettings as any).footer_contact ?? UNIVERSAL_DEFAULTS.footer_contact,
  }), [universalSettings]);
}

export const UNIVERSAL_DEFAULTS = {
  // Colors
  primary_color: '#f97316',
  secondary_color: '#ffffff',
  accent_color: '#fed7aa',
  text_color: '#1f2937',
  secondary_text_color: '#6b7280',

  // Typography
  font_family: 'Inter',
  heading_size_multiplier: 'Large',
  body_font_size: 15,

  // Layout
  section_padding: 24,
  grid_columns: 4,
  border_radius: 8,

  // Dots / indicators
  carousel_dot_size: 10,
  carousel_dot_gap: 8,
  carousel_dot_color: 'rgba(255,255,255,0.18)',
  carousel_dot_active_color: '#00f0ff',
  carousel_dot_border_color: 'rgba(255,255,255,0.06)',

  // Theme
  enable_dark_mode: false,
  default_theme: 'Light',
  show_product_shadows: true,
  enable_animations: true,

  // Features
  show_featured_section: false,
  featured_product_ids: '',
  show_testimonials: false,
  testimonials: '[]',
  show_faq: false,
  faq_items: '[]',
  footer_about: '',
  social_links: '[]',
  footer_contact: '',
} as const;

/**
 * Get heading sizes based on multiplier
 */
export const getHeadingSizes = (multiplier: string) => {
  const headingSizeMap: Record<string, { h1: string; h2: string; h3: string }> = {
    Small: { h1: '20px', h2: '16px', h3: '14px' },
    Medium: { h1: '28px', h2: '20px', h3: '16px' },
    Large: { h1: '32px', h2: '24px', h3: '18px' },
    'Extra Large': { h1: '40px', h2: '30px', h3: '22px' },
  };
  return headingSizeMap[multiplier] || headingSizeMap['Large'];
};

/**
 * Generate dynamic CSS for universal settings
 */
export const getUniversalDynamicStyles = (settings: ReturnType<typeof useTemplateUniversalSettings>) => {
  const headingSizes = getHeadingSizes(settings.heading_size_multiplier);
  
  return `
    :root {
      --primary-color: ${settings.primary_color};
      --secondary-color: ${settings.secondary_color};
      --accent-color: ${settings.accent_color};
      --text-color: ${settings.text_color};
      --secondary-text-color: ${settings.secondary_text_color};
      --font-family: ${settings.font_family}, system-ui, sans-serif;
      --section-padding: ${settings.section_padding}px;
      --grid-columns: ${settings.grid_columns};
      --border-radius: ${settings.border_radius}px;
      --carousel-dot-size: ${settings.carousel_dot_size}px;
      --carousel-dot-gap: ${settings.carousel_dot_gap}px;
      --carousel-dot-color: ${settings.carousel_dot_color};
      --carousel-dot-active-color: ${settings.carousel_dot_active_color};
      --carousel-dot-border-color: ${settings.carousel_dot_border_color};
    }
    
    * {
      font-family: var(--font-family);
    }
    
    h1, h2, h3, h4, h5, h6 {
      font-family: var(--font-family);
    }
    
    h1 { font-size: ${headingSizes.h1}; }
    h2 { font-size: ${headingSizes.h2}; }
    h3 { font-size: ${headingSizes.h3}; }
    
    body {
      font-size: ${settings.body_font_size}px;
      color: ${settings.text_color};
      background-color: ${settings.enable_dark_mode ? '#0a0a0a' : settings.secondary_color};
    }
    
    button {
      ${settings.enable_animations ? 'transition: all 0.3s ease;' : ''}
      border-radius: ${settings.border_radius}px;
    }
    
    ${settings.show_product_shadows ? `
      .product-card {
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .product-card:hover {
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
      }
    ` : `
      .product-card {
        box-shadow: none !important;
      }
    `}
  `;
};
