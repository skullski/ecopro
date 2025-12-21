# Template Settings Wiring Guide

## Overview

All 12 templates now have access to universal settings through the `useTemplateUniversalSettings()` hook. This guide shows how to apply those settings to make templates truly customizable.

## Current Status

- ✅ All templates import `useTemplateUniversalSettings` hook
- ✅ Fashion template is FULLY wired as a reference
- ✅ Bags template uses universal settings
- 🔄 Remaining templates need JSX updates to apply the settings

## Universal Settings Available to ALL Templates

From the `useTemplateUniversalSettings()` hook:

```typescript
{
  // Colors
  primary_color: '#f97316',           // Main brand color
  secondary_color: '#ffffff',         // Background/card color
  accent_color: '#fed7aa',            // Highlight/CTA color
  text_color: '#1f2937',              // Main text color
  secondary_text_color: '#6b7280',    // Muted text color

  // Typography
  font_family: 'Inter',               // Font name
  heading_size_multiplier: 'Large',   // 'Small' | 'Medium' | 'Large'
  body_font_size: 15,                 // px

  // Layout
  section_padding: 24,                // px (padding around sections)
  grid_columns: 4,                    // Number of columns for product grid
  border_radius: 8,                   // px (corner roundness)

  // Theme
  enable_dark_mode: false,            // Apply dark theme
  default_theme: 'Light',             // 'Light' | 'Dark'
  show_product_shadows: true,         // Show shadows on product cards
  enable_animations: true,            // Enable hover/transition animations

  // Features
  show_featured_section: false,
  featured_product_ids: '',
  show_testimonials: false,
  show_faq: false,
  footer_about: '',
  social_links: '[]',
  footer_contact: '',
}
```

## How to Apply Settings in Template JSX

### Step 1: Extract Settings at Top of Component

```typescript
// Already done - universal settings are available
const {
  primary_color,
  secondary_color,
  accent_color,
  text_color,
  secondary_text_color,
  font_family,
  heading_size_multiplier,
  body_font_size,
  section_padding,
  grid_columns,
  border_radius,
  enable_dark_mode,
  show_product_shadows,
  enable_animations,
} = useMemo(() => universalSettings as any || {}, [universalSettings]);
```

### Step 2: Get Heading Sizes

```typescript
// Helper to get dynamic heading sizes
const headingSizeMap: Record<string, { h1: string; h2: string; h3: string }> = {
  Small: { h1: '20px', h2: '16px', h3: '14px' },
  Medium: { h1: '28px', h2: '20px', h3: '16px' },
  Large: { h1: '32px', h2: '24px', h3: '18px' },
};
const headingSizes = headingSizeMap[heading_size_multiplier] || headingSizeMap['Large'];
```

### Step 3: Create Dynamic Styles

```typescript
const dynamicStyles = `
  :root {
    --primary-color: ${primary_color};
    --secondary-color: ${secondary_color};
    --text-color: ${text_color};
    --border-radius: ${border_radius}px;
  }
  
  h1 { font-size: ${headingSizes.h1}; }
  h2 { font-size: ${headingSizes.h2}; }
  h3 { font-size: ${headingSizes.h3}; }
  
  body {
    background-color: ${enable_dark_mode ? '#0a0a0a' : secondary_color};
    color: ${text_color};
    font-family: ${font_family}, system-ui, sans-serif;
  }
  
  button {
    ${enable_animations ? 'transition: all 0.3s ease;' : ''}
  }
`;
```

### Step 4: Update JSX to Use Dynamic Styles

Instead of:
```tsx
<div className="bg-white text-black rounded-lg">
```

Use:
```tsx
<div style={{
  backgroundColor: secondary_color,
  color: text_color,
  borderRadius: `${border_radius}px`,
}}>
```

## Template-Specific Settings to Wire

Each template has unique settings defined in AGENTS.md Q20:

| Template | Template-Specific Settings |
|----------|---------------------------|
| **Fashion** | `template_hero_heading`, `template_hero_subtitle`, `template_button_text`, `template_genders` |
| **Fashion2** | `template_hero_heading`, `template_hero_subtitle`, `template_button_text`, `banner_url` |
| **Fashion3** | `template_video_hero_url`, `template_hotspot_config`, `template_lookbook_images`, `template_seasonal_drops`, `template_gender_filters`, `banner_url` |
| **Electronics** | `template_featured_product_ids`, `template_best_sellers_ids`, `template_deals_ids`, `banner_url` |
| **Food** | `banner_url`, `template_products_per_row` |
| **Furniture** | `template_mega_menu_categories`, `template_price_range_min`, `template_price_range_max`, `banner_url`, `template_hero_heading` |
| **Jewelry** | `template_featured_product_ids`, `template_materials_filter_list`, `banner_url` |
| **Perfume** | `template_scent_realms`, `banner_url`, `template_accent_color` |
| **Baby** | `template_grid_columns`, `template_featured_product_ids`, `banner_url` |
| **Beauty** | `template_shade_colors`, `template_products_per_row`, `banner_url`, `template_hero_heading`, `template_hero_subtitle` |
| **Cafe** | `banner_url`, `template_since_year`, `template_store_city`, `template_accent_color` |
| **Bags** | `template_bg_image`, `template_hero_bg_blur`, `template_hero_heading`, `template_hero_subtitle` |

### Example: Wiring Template-Specific Settings

```typescript
// From props.settings
const bannerUrl = settings.banner_url || 'https://example.com/default.jpg';
const heroHeading = settings.template_hero_heading || 'Default Heading';
const buttonText = settings.template_button_text || 'Shop Now';

// Use in JSX with fallback to dynamic color
<h1 style={{ 
  fontSize: headingSizes.h1,
  color: text_color,
}}>
  {heroHeading}
</h1>

<button style={{
  backgroundColor: primary_color,
  color: secondary_color,
  borderRadius: `${border_radius}px`,
  transition: enable_animations ? 'all 0.3s ease' : 'none',
}}>
  {buttonText}
</button>
```

## Reference Implementation: Fashion Template

Fashion template is FULLY wired. Key patterns:

1. ✅ Imports and hooks:
   - `useTemplateUniversalSettings()` hook
   - `getHeadingSizes()` for dynamic heading sizes

2. ✅ Extracts all settings:
   - Universal colors, fonts, spacing
   - Template-specific: hero_heading, hero_subtitle, button_text, genders

3. ✅ Creates dynamic styles:
   - CSS-in-JS with all color/font variables
   - Applies enable_animations, show_product_shadows conditionally

4. ✅ Uses styles in JSX:
   - All hardcoded colors replaced with `${primary_color}`, `${text_color}`, etc
   - All hardcoded border-radius replaced with `${border_radius}px`
   - All hardcoded animations conditional on `enable_animations`

See: `/home/skull/Desktop/ecopro/client/components/templates/fashion.tsx`

## Remaining Work

Each template needs to be updated similar to Fashion:

### High Priority (Most Used)
1. **Electronics** - Popular tech store template
2. **Beauty** - Already reads some settings, needs full wiring
3. **Furniture** - Has hero heading partially implemented

### Medium Priority
4. **Fashion3** - Most complex (lookbooks, hotspots, video)
5. **Perfume** - Realm filters
6. **Jewelry** - Material filters

### Lower Priority
7. **Food/Cafe** - Similar patterns
8. **Baby** - Grid layout customization
9. **Bags** - Already mostly done ✅

## Testing After Updates

After wiring each template:

1. Open TemplateSettings.tsx
2. Change a color setting (primary_color)
3. Verify template preview updates immediately
4. Change font_family to "Georgia" or similar
5. Verify headings use the new font
6. Change border_radius to 16
7. Verify buttons/cards have more rounded corners
8. Toggle enable_animations off
9. Verify hover effects disappear

## Common Patterns to Replace

### Hardcoded Colors
```tsx
// Before
className="bg-blue-500 text-white"

// After
style={{ backgroundColor: primary_color, color: secondary_color }}
```

### Hardcoded Sizes
```tsx
// Before
className="rounded-lg"

// After
style={{ borderRadius: `${border_radius}px` }}
```

### Hardcoded Fonts
```tsx
// Before
className="font-serif"

// After
style={{ fontFamily: `${font_family}, system-ui, sans-serif` }}
```

### Hardcoded Animations
```tsx
// Before
className="hover:scale-105 transition"

// After
style={{ transition: enable_animations ? 'transform 0.3s ease' : 'none' }}
onMouseEnter={e => enable_animations && e.target.style.transform = 'scale(1.05)'}
```

## Files to Update

- ✅ `/home/skull/Desktop/ecopro/client/hooks/useTemplateUniversalSettings.ts` - Utility hook (CREATED)
- ✅ `/home/skull/Desktop/ecopro/client/components/templates/fashion.tsx` - Reference implementation (DONE)
- 🔄 `/home/skull/Desktop/ecopro/client/components/templates/fashion2.tsx` - High priority
- 🔄 `/home/skull/Desktop/ecopro/client/components/templates/electronics.tsx` - High priority
- 🔄 `/home/skull/Desktop/ecopro/client/components/templates/beauty.tsx` - High priority
- 🔄 `/home/skull/Desktop/ecopro/client/components/templates/furniture.tsx` - Medium priority
- 🔄 `/home/skull/Desktop/ecopro/client/components/templates/fashion3.tsx` - Medium priority
- 🔄 `/home/skull/Desktop/ecopro/client/components/templates/perfume.tsx` - Medium priority
- 🔄 `/home/skull/Desktop/ecopro/client/components/templates/jewelry.tsx` - Lower priority
- 🔄 `/home/skull/Desktop/ecopro/client/components/templates/food.tsx` - Lower priority
- 🔄 `/home/skull/Desktop/ecopro/client/components/templates/cafe.tsx` - Lower priority
- 🔄 `/home/skull/Desktop/ecopro/client/components/templates/baby.tsx` - Lower priority
- ✅ `/home/skull/Desktop/ecopro/client/components/templates/bags.tsx` - Already mostly done

## Summary

**Completed:**
- ✅ All templates have hook access to universal settings
- ✅ Fashion template fully wired as reference
- ✅ Created useTemplateUniversalSettings utility hook

**Next Steps:**
- 🔄 Update remaining 10 templates to apply universal settings to JSX
- Test that TemplateSettings changes reflect in live preview
- Verify all settings work end-to-end

**End Goal:**
Store owners can fully customize their template appearance (colors, fonts, spacing, animations, features) through the TemplateSettings panel, and all changes appear immediately in the preview.
