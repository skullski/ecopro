/**
 * Apply Theme Preset to Store Schema
 * 
 * This module connects Theme Presets to the Universal Store Schema,
 * allowing one renderer (Shiro Hana) to display different visual styles.
 */

import type { ThemePreset } from './theme-presets';
import type { UniversalStoreSchema, LayoutConfig } from './universal-store-schema';

/**
 * Apply a theme preset to a store schema.
 * This merges the preset's style values into the schema's styles section.
 */
export function applyThemePresetToSchema(
  schema: UniversalStoreSchema,
  preset: ThemePreset
): UniversalStoreSchema {
  return {
    ...schema,
    styles: {
      ...schema.styles,
      // Apply theme (light/dark)
      theme: preset.styles.theme,
      
      // Apply colors
      primaryColor: preset.styles.primaryColor,
      secondaryColor: preset.styles.secondaryColor,
      accentColor: preset.styles.accentColor,
      backgroundColor: preset.styles.backgroundColor,
      textColor: preset.styles.textColor,
      
      // Apply fonts
      fonts: {
        heading: preset.styles.fonts?.heading || 'Inter',
        body: preset.styles.fonts?.body || 'Inter',
      },
      
      // Apply tokens (spacing, radius)
      tokens: {
        ...schema.styles?.tokens,
        radius: preset.defaults?.cardRadius || 8,
      },
    },
  };
}

/**
 * Generate CSS custom properties from a theme preset.
 * These can be injected into the store's stylesheet.
 */
export function generateCSSVariables(preset: ThemePreset): string {
  const vars = [
    `--preset-primary: ${preset.styles.primaryColor}`,
    `--preset-secondary: ${preset.styles.secondaryColor}`,
    `--preset-accent: ${preset.styles.accentColor}`,
    `--preset-text: ${preset.styles.textColor}`,
    `--preset-background: ${preset.styles.backgroundColor}`,
    `--preset-font-heading: ${preset.styles.fonts?.heading || 'Inter'}`,
    `--preset-font-body: ${preset.styles.fonts?.body || 'Inter'}`,
    `--preset-radius: ${preset.defaults?.cardRadius || 8}px`,
  ];
  
  return `:root {\n  ${vars.join(';\n  ')};\n}`;
}

/**
 * Generate Tailwind classes for a product card based on preset.
 */
export function getProductCardClasses(preset: ThemePreset): string {
  const classes: string[] = ['relative', 'overflow-hidden', 'transition-all', 'duration-300'];
  
  // Card radius
  const radius = preset.defaults?.cardRadius || 8;
  if (radius === 0) classes.push('rounded-none');
  else if (radius <= 4) classes.push('rounded-sm');
  else if (radius <= 8) classes.push('rounded');
  else if (radius <= 12) classes.push('rounded-lg');
  else classes.push('rounded-xl');
  
  // Shadow based on style
  const style = preset.defaults?.productStyle || 'flat';
  if (style === 'elevated') classes.push('shadow-lg');
  else if (style === 'border') classes.push('border', 'border-gray-200', 'dark:border-gray-700');
  else if (style === 'flat') classes.push('shadow-sm');
  
  // Hover effect
  const hover = preset.defaults?.hoverEffect || 'none';
  if (hover === 'zoom') classes.push('hover:scale-[1.02]');
  else if (hover === 'lift') classes.push('hover:-translate-y-1', 'hover:shadow-xl');
  else if (hover === 'glow') classes.push('hover:shadow-lg', 'hover:shadow-primary/20');
  else if (hover === 'border') classes.push('hover:border-primary');
  
  return classes.join(' ');
}

/**
 * Generate inline styles for the page container based on preset.
 */
export function getPageStyles(preset: ThemePreset): Record<string, string> {
  return {
    backgroundColor: preset.styles.backgroundColor || '',
    color: preset.styles.textColor || '',
    fontFamily: preset.styles.fonts?.body || 'Inter',
  };
}

/**
 * Get preset-specific overrides for hero section.
 */
export function getHeroStyles(preset: ThemePreset): Record<string, string> {
  const styles: Record<string, string> = {
    fontFamily: preset.styles.fonts?.heading || 'Inter',
  };
  
  // Dark themes often have gradient overlays
  if (preset.styles.theme === 'dark') {
    styles.backgroundImage = `linear-gradient(to bottom, ${preset.styles.backgroundColor}00, ${preset.styles.backgroundColor})`;
  }
  
  return styles;
}

/**
 * Get button styles based on preset.
 */
export function getButtonStyles(preset: ThemePreset, variant: 'primary' | 'secondary' = 'primary'): Record<string, string> {
  if (variant === 'primary') {
    return {
      backgroundColor: preset.styles.primaryColor || '#3B82F6',
      color: preset.styles.theme === 'dark' ? '#000000' : '#ffffff',
      borderRadius: `${preset.defaults?.cardRadius || 8}px`,
    };
  }
  
  return {
    backgroundColor: 'transparent',
    color: preset.styles.primaryColor || '#3B82F6',
    border: `1px solid ${preset.styles.primaryColor || '#3B82F6'}`,
    borderRadius: `${preset.defaults?.cardRadius || 8}px`,
  };
}

/**
 * Create default content for a store category.
 * This pre-fills the schema with category-appropriate content.
 */
export function createDefaultSchemaContent(
  category: 'fashion' | 'baby' | 'electronics' | 'food' | 'jewelry' | 'beauty' | 'sports' | 'books' | 'home'
): Partial<LayoutConfig> {
  const defaults: Record<string, Partial<LayoutConfig>> = {
    fashion: {
      hero: {
        type: 'hero',
        title: { type: 'text', value: 'Build a wardrobe that behaves like software.' },
        subtitle: { type: 'text', value: 'Fewer pieces, more combinations. Discover modular fashion that adapts to your life.' },
        cta: [
          { label: { type: 'text', value: 'Browse collection' }, action: '/products', variant: 'primary' },
          { label: { type: 'text', value: 'How it works' }, action: '/about', variant: 'outline' },
        ],
      },
    },
    baby: {
      hero: {
        type: 'hero',
        title: { type: 'text', value: 'A soft, modern universe for every little moment.' },
        subtitle: { type: 'text', value: 'Toys, outfits, feeding essentials — everything for ages 0-3.' },
        cta: [
          { label: { type: 'text', value: 'Shop baby essentials' }, action: '/products', variant: 'primary' },
          { label: { type: 'text', value: 'New arrivals' }, action: '/new', variant: 'outline' },
        ],
      },
    },
    electronics: {
      hero: {
        type: 'hero',
        title: { type: 'text', value: 'Flagship performance for your entire tech store.' },
        subtitle: { type: 'text', value: 'Showcase phones, headphones, gaming gear in a layout that feels as premium as your products.' },
        cta: [
          { label: { type: 'text', value: 'Shop flagship' }, action: '/products', variant: 'primary' },
          { label: { type: 'text', value: 'View specs' }, action: '/specs', variant: 'outline' },
        ],
      },
    },
    food: {
      hero: {
        type: 'hero',
        title: { type: 'text', value: 'Fresh, fast, and always delicious.' },
        subtitle: { type: 'text', value: 'From farm to table, discover quality ingredients that make every meal special.' },
        cta: [
          { label: { type: 'text', value: 'Order now' }, action: '/products', variant: 'primary' },
          { label: { type: 'text', value: 'View menu' }, action: '/menu', variant: 'outline' },
        ],
      },
    },
    jewelry: {
      hero: {
        type: 'hero',
        title: { type: 'text', value: 'Timeless elegance for every occasion.' },
        subtitle: { type: 'text', value: 'Handcrafted pieces that tell your story. Discover our exclusive collection.' },
        cta: [
          { label: { type: 'text', value: 'Explore collection' }, action: '/products', variant: 'primary' },
          { label: { type: 'text', value: 'Custom design' }, action: '/custom', variant: 'outline' },
        ],
      },
    },
    beauty: {
      hero: {
        type: 'hero',
        title: { type: 'text', value: 'Beauty that feels like you.' },
        subtitle: { type: 'text', value: 'Clean ingredients, stunning results. Discover skincare and makeup that cares.' },
        cta: [
          { label: { type: 'text', value: 'Shop beauty' }, action: '/products', variant: 'primary' },
          { label: { type: 'text', value: 'Take the quiz' }, action: '/quiz', variant: 'outline' },
        ],
      },
    },
    sports: {
      hero: {
        type: 'hero',
        title: { type: 'text', value: 'Gear up for greatness.' },
        subtitle: { type: 'text', value: 'Performance equipment for athletes who never stop pushing limits.' },
        cta: [
          { label: { type: 'text', value: 'Shop gear' }, action: '/products', variant: 'primary' },
          { label: { type: 'text', value: 'Find your sport' }, action: '/categories', variant: 'outline' },
        ],
      },
    },
    books: {
      hero: {
        type: 'hero',
        title: { type: 'text', value: 'Stories that stay with you.' },
        subtitle: { type: 'text', value: 'From bestsellers to hidden gems, find your next favorite read.' },
        cta: [
          { label: { type: 'text', value: 'Browse books' }, action: '/products', variant: 'primary' },
          { label: { type: 'text', value: 'Staff picks' }, action: '/staff-picks', variant: 'outline' },
        ],
      },
    },
    home: {
      hero: {
        type: 'hero',
        title: { type: 'text', value: 'Make every room feel like home.' },
        subtitle: { type: 'text', value: 'Furniture, decor, and essentials that transform your space.' },
        cta: [
          { label: { type: 'text', value: 'Shop home' }, action: '/products', variant: 'primary' },
          { label: { type: 'text', value: 'Get inspired' }, action: '/inspiration', variant: 'outline' },
        ],
      },
    },
  };
  
  return defaults[category] || defaults.fashion;
}
