# Template Edits Reference Guide

This document lists all editable features implemented in the Babyos template. Use this as a reference when building new templates to ensure consistency.

---

## ✅ COMPLETED EDITS (Babyos Template)

### 1. Header Section
**Edit Path:** `layout.header`, `layout.header.logo`, `layout.header.nav`

| Feature | Setting Key | Type | Default | Description |
|---------|-------------|------|---------|-------------|
| Store Logo | `store_logo` | Image URL | - | Circular logo (40x40px) with accent border |
| Store Name | `store_name` | Text | "YOUR STORE" | Displayed next to logo |
| Header Background | `template_header_bg` | Color | `#FDF8F3` | Header background color |
| Header Text Color | `template_header_text` | Color | `#F97316` | Logo/store name text color |
| Navigation Links | `template_nav_links` | JSON Array | `[]` | Array of {label, url} objects |

**Component:** `Header({ storeName, logoUrl, theme, onSelect })`

---

### 2. Hero Section
**Edit Path:** `layout.hero`, `layout.hero.title`, `layout.hero.subtitle`, `layout.hero.kicker`, `layout.hero.cta`, `layout.hero.image`, `layout.hero.badge`

| Feature | Setting Key | Type | Default | Description |
|---------|-------------|------|---------|-------------|
| Hero Heading | `template_hero_heading` | Text | "A soft, modern universe..." | Main headline |
| Heading Color | `template_hero_title_color` | Color | `#1C1917` | Title text color |
| Heading Size | `template_hero_title_size` | Number (px) | `32` | Font size in pixels |
| Hero Subtitle | `template_hero_subtitle` | Text | "Shop cuddly toys..." | Description text |
| Subtitle Color | `template_hero_subtitle_color` | Color | `#78716C` | Subtitle text color |
| Subtitle Size | `template_hero_subtitle_size` | Number (px) | `13` | Font size in pixels |
| Kicker Text | `template_hero_kicker` | Text | "NEW SEASON • SOFT & PLAYFUL" | Small text above title |
| Kicker Color | `template_hero_kicker_color` | Color | `#78716C` | Kicker text color |
| Primary Button Text | `template_button_text` | Text | "SHOP BABY ESSENTIALS" | CTA button label |
| Secondary Button Text | `template_button2_text` | Text | "VIEW ALL TOYS" | Secondary button label |
| Button Color | `template_accent_color` | Color | `#F97316` | Primary button background |
| Secondary Border | `template_button2_border` | Color | `#D6D3D1` | Secondary button border |
| Hero Image | `banner_url` | Image URL | - | Background/banner image |
| Hero Video | `hero_video_url` | URL | - | Optional video URL |
| Badge Title | `template_hero_badge_title` | Text | "Soft Plush Elephant" | Floating badge text |
| Badge Subtitle | `template_hero_badge_subtitle` | Text | "Limited offer" | Badge secondary text |

**Component:** `Hero({ node, responsive, theme, settings, onSelect, resolveAsset })`

---

### 3. Category Pills Section
**Edit Path:** `layout.categories`

| Feature | Setting Key | Type | Default | Description |
|---------|-------------|------|---------|-------------|
| Pill Background | `template_category_pill_bg` | Color | `#F5F5F4` | Inactive pill background |
| Pill Text Color | `template_category_pill_text` | Color | `#78716C` | Inactive pill text |
| Active Pill Background | `template_category_pill_active_bg` | Color | `#F97316` | Active pill background |
| Active Pill Text | `template_category_pill_active_text` | Color | `#FFFFFF` | Active pill text |
| Pill Border Radius | `template_category_pill_border_radius` | Number (px) | `9999` | Rounded corners |

**Component:** `CategoryPills({ categories, active, theme, onPick })`

---

### 4. Product Grid Section
**Edit Path:** `layout.grid`, `layout.featured`, `layout.featured.title`, `layout.featured.subtitle`, `layout.featured.items`, `layout.featured.addLabel`

| Feature | Setting Key | Type | Default | Description |
|---------|-------------|------|---------|-------------|
| Section Title | `template_featured_title` | Text | "Soft & snugly picks" | Section heading |
| Section Subtitle | `template_featured_subtitle` | Text | "A small edit of plush toys..." | Section description |
| Add Button Label | `template_add_to_cart_label` | Text | "VIEW" (Babyos) / "Add" (Shiro Hana) | Label for the product CTA button |
| Title Color | `template_section_title_color` | Color | `#1C1917` | Section title color |
| Title Size | `template_section_title_size` | Number (px) | `20` | Section title font size |
| Subtitle Color | `template_section_subtitle_color` | Color | `#78716C` | Section subtitle color |
| Grid Columns | `template_grid_columns` | Select | `4` | 2-6 columns on desktop |
| Grid Gap | `template_grid_gap` | Number (px) | `24` | Space between cards |
| Card Background | `template_card_bg` | Color | `#FFFFFF` | Product card background |
| Card Border Radius | `template_card_border_radius` | Number (px) | `12` | Card rounded corners |
| Product Title Color | `template_product_title_color` | Color | `#1C1917` | Product name color |
| Product Price Color | `template_product_price_color` | Color | `#1C1917` | Price text color |

**Component:** `FeaturedSection({ ... })`, `ProductGrid({ ... })`

---

### 5. Footer Section
**Edit Path:** `layout.footer`, `layout.footer.copyright`, `layout.footer.links`, `layout.footer.social`

| Feature | Setting Key | Type | Default | Description |
|---------|-------------|------|---------|-------------|
| Copyright Text | `template_copyright` | Text | "© 2026 Your Store" | Footer copyright |
| Footer Text Color | `template_footer_text` | Color | `#A8A29E` | Footer text color |
| Footer Link Color | `template_footer_link_color` | Color | `#78716C` | Link hover color |
| Social Links | `template_social_links` | JSON Array | `[]` | Array of {platform, url} objects |

**Social Platforms Supported:** facebook, twitter, instagram, youtube, linkedin, tiktok, pinterest

**Component:** `Footer({ node, theme, settings, onSelect })`

---

### 6. Global Typography & Font Controls
**Edit Path:** `__root`, `__settings`

| Feature | Setting Key | Type | Default | Description |
|---------|-------------|------|---------|-------------|
| Font Family | `template_font_family` | Select | `system-ui, -apple-system, sans-serif` | Main font |
| Body Font Weight | `template_font_weight` | Select | `400` | Normal text weight (300-500) |
| Heading Font Weight | `template_heading_font_weight` | Select | `600` | Heading weight (500-800) |

**Available Fonts:**
- System (Default)
- Inter
- Poppins
- Roboto
- Open Sans
- Lato
- Montserrat
- Playfair Display (serif)
- Merriweather (serif)
- Georgia (serif)

---

### 7. Border Radius Controls
**Edit Path:** `__root`, `__settings`

| Feature | Setting Key | Type | Default | Description |
|---------|-------------|------|---------|-------------|
| Global Border Radius | `template_border_radius` | Range (0-24px) | `8` | Default rounded corners |
| Card Border Radius | `template_card_border_radius` | Range (0-32px) | `12` | Product card corners |
| Button Border Radius | `template_button_border_radius` | Range (0-50px) | `9999` | Button corners (pill) |

---

### 8. Spacing Controls
**Edit Path:** `__root`, `__settings`

| Feature | Setting Key | Type | Default | Description |
|---------|-------------|------|---------|-------------|
| Base Spacing | `template_spacing` | Range (8-32px) | `16` | Base spacing unit |
| Section Spacing | `template_section_spacing` | Range (24-96px) | `48` | Vertical section padding |

---

### 9. Animation Controls
**Edit Path:** `__root`, `__settings`

| Feature | Setting Key | Type | Default | Description |
|---------|-------------|------|---------|-------------|
| Animation Speed | `template_animation_speed` | Range (100-500ms) | `200` | Transition duration |
| Hover Scale | `template_hover_scale` | Select | `1.02` | Scale on hover (1, 1.02, 1.05, 1.1) |

**Built-in CSS Classes:**
- `.theme-hover-scale` - Applies hover scale animation
- `.theme-fade-in` - Fade in on mount animation

---

### 10. Custom CSS Injection
**Edit Path:** `__root`, `__settings`

| Feature | Setting Key | Type | Default | Description |
|---------|-------------|------|---------|-------------|
| Custom CSS | `template_custom_css` | Textarea | `''` | Raw CSS injected into template |

**CSS Variables Available:**
```css
:root {
  --theme-bg: <background color>;
  --theme-accent: <accent color>;
  --theme-text: <text color>;
  --theme-muted: <muted color>;
  --theme-border: <border color>;
  --theme-card-bg: <card background>;
  --theme-font-family: <font family>;
  --theme-font-weight: <font weight>;
  --theme-heading-font-weight: <heading weight>;
  --theme-border-radius: <border radius>px;
  --theme-card-border-radius: <card radius>px;
  --theme-button-border-radius: <button radius>px;
  --theme-spacing: <spacing>px;
  --theme-section-spacing: <section spacing>px;
  --theme-animation-speed: <animation speed>ms;
  --theme-hover-scale: <hover scale>;
  --theme-grid-columns: <grid columns>;
  --theme-grid-gap: <grid gap>px;
}
```

---

### 11. Navigation Menu Editor
**Edit Path:** `layout.header.nav`

| Feature | Setting Key | Type | Default | Description |
|---------|-------------|------|---------|-------------|
| Navigation Links | `template_nav_links` | JSON Array | `[]` | Header navigation links |

**JSON Format:**
```json
[
  {"label": "Shop", "url": "/products"},
  {"label": "About", "url": "/about"},
  {"label": "Contact", "url": "/contact"}
]
```

---

### 12. Social Links Editor
**Edit Path:** `layout.footer.social`

| Feature | Setting Key | Type | Default | Description |
|---------|-------------|------|---------|-------------|
| Social Links | `template_social_links` | JSON Array | `[]` | Footer social media icons |

**JSON Format:**
```json
[
  {"platform": "facebook", "url": "https://facebook.com/yourpage"},
  {"platform": "instagram", "url": "https://instagram.com/yourpage"},
  {"platform": "twitter", "url": "https://twitter.com/yourpage"}
]
```

**Supported Platforms:** facebook, twitter, instagram, youtube, linkedin, tiktok, pinterest

---

### 13. Global Theme Colors
**Edit Path:** `__root`

| Feature | Setting Key | Type | Default | Description |
|---------|-------------|------|---------|-------------|
| Background Color | `template_bg_color` | Color | `#FDF8F3` | Page background |
| Accent Color | `template_accent_color` | Color | `#F97316` | Primary accent (buttons, highlights) |
| Text Color | `template_text_color` | Color | `#1C1917` | Main text color |
| Muted Text Color | `template_muted_color` | Color | `#78716C` | Secondary text color |

---

## 📋 ThemeColors Interface (Complete)

Every template should implement this interface for consistent theming:

```typescript
interface ThemeColors {
  // Base colors
  bg: string;
  accent: string;
  text: string;
  muted: string;
  mutedLight: string;
  border: string;
  borderLight: string;
  cardBg: string;
  
  // Header
  headerBg: string;
  headerText: string;
  
  // Hero
  heroTitleColor: string;
  heroTitleSize: string;
  heroSubtitleColor: string;
  heroSubtitleSize: string;
  heroKickerColor: string;
  
  // Sections
  sectionTitleColor: string;
  sectionTitleSize: string;
  sectionSubtitleColor: string;
  
  // Products
  productTitleColor: string;
  productPriceColor: string;
  
  // Footer
  footerText: string;
  footerLinkColor: string;
  
  // Typography
  fontFamily: string;
  fontWeight: string;
  headingFontWeight: string;
  
  // Border Radius
  borderRadius: string;
  cardBorderRadius: string;
  buttonBorderRadius: string;
  
  // Spacing
  spacing: string;
  sectionSpacing: string;
  
  // Animations
  animationSpeed: string;
  hoverScale: string;
  
  // Grid
  gridColumns: string;
  gridGap: string;
  
  // Category Pills
  categoryPillBg: string;
  categoryPillText: string;
  categoryPillActiveBg: string;
  categoryPillActiveText: string;
  categoryPillBorderRadius: string;
  
  // Custom
  customCss: string;
  socialLinks: SocialLink[];
  navLinks: NavLink[];
}

interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

interface NavLink {
  label: string;
  url: string;
}
```

---

## 📁 Required Files for a Template

```
templates/gold/{template-name}/
├── {TemplateName}Template.tsx    # Main template component
├── schema-types.ts               # TypeScript types for layout nodes
└── {template-name}-home.json     # Default layout schema (optional)
```

---

## 🎨 Color Defaults (Babyos Palette)

```typescript
const DEFAULTS = {
  bg: '#FDF8F3',           // Warm cream background
  accent: '#F97316',       // Orange accent
  text: '#1C1917',         // Dark text
  muted: '#78716C',        // Muted gray
  mutedLight: '#A8A29E',   // Light muted
  border: '#E7E5E4',       // Border gray
  borderLight: '#F5F5F4',  // Light border
  cardBg: '#FFFFFF',       // White cards
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontWeight: '400',
  borderRadius: '8',
  spacing: '16',
  animationSpeed: '200',
  gridColumns: '4',
  categoryPillBg: '#F5F5F4',
  categoryPillText: '#78716C',
  categoryPillActiveBg: '#F97316',
  categoryPillActiveText: '#FFFFFF',
};
```

---

## 🔧 Edit Panel Binding Functions

The `GoldTemplateEditor.tsx` provides these helper functions:

```typescript
// Text input
bindText(label: string, key: string, placeholder?: string)

// Color picker with hex input
bindColor(label: string, key: string, fallback: string)

// Image upload
bindImage(label: string, key: string)

// Dropdown select
bindSelect(label: string, key: string, options: {value, label}[], fallback: string)

// Range slider
bindRange(label: string, key: string, min: number, max: number, fallback: number, unit?: string)

// Multi-line textarea
bindTextarea(label: string, key: string, placeholder?: string, rows?: number)

// JSON array input
bindJsonArray(label: string, key: string, placeholder?: string)
```

---

## 📝 How to Add a New Editable Field

### 1. Add the setting key to `StoreSettings` interface:
```typescript
// In GoldTemplateEditor.tsx
interface StoreSettings {
  template_new_field?: string | null;
}
```

### 2. Add to server whitelist (if needed for DB storage):
```typescript
// In server/routes/client-store.ts
const allowedCols = new Set([
  // ... existing
  'template_new_field',
]);
```

### 3. Use in template component:
```typescript
// In BabyosTemplate.tsx
const theme: ThemeColors = {
  newField: settings?.template_new_field || 'default',
  // ...
};
```

### 4. Add edit panel binding:
```typescript
// In GoldTemplateEditor.tsx
if (path === 'layout.new.element') {
  body = bindColor('New Field', 'template_new_field', '#default');
}
```

### 5. Add data-edit-path to element:
```tsx
// In template component
<div data-edit-path="layout.new.element" onClick={() => onSelect('layout.new.element')}>
  {/* content */}
</div>
```

---

## 📊 Database Schema

Settings are stored in `client_store_settings` table:

| Column | Type | Description |
|--------|------|-------------|
| `store_name` | TEXT | Store display name |
| `store_logo` | TEXT | Logo image URL |
| `template` | TEXT | Template ID (e.g., 'babyos') |
| `template_accent_color` | TEXT | Accent color hex |
| `template_settings` | JSONB | Additional template settings |

Template-specific settings can be stored in `template_settings` JSONB column for flexibility.

---

## ✅ FEATURE CHECKLIST

| Feature | Status | Setting Key |
|---------|--------|-------------|
| Store Logo | ✅ | `store_logo` |
| Store Name | ✅ | `store_name` |
| Header Colors | ✅ | `template_header_bg`, `template_header_text` |
| Navigation Menu | ✅ | `template_nav_links` |
| Hero Section | ✅ | Multiple keys |
| Category Pills | ✅ | `template_category_pill_*` |
| Product Grid Columns | ✅ | `template_grid_columns` |
| Font Family | ✅ | `template_font_family` |
| Font Weight | ✅ | `template_font_weight`, `template_heading_font_weight` |
| Border Radius | ✅ | `template_border_radius`, `template_card_border_radius`, `template_button_border_radius` |
| Spacing | ✅ | `template_spacing`, `template_section_spacing` |
| Animations | ✅ | `template_animation_speed`, `template_hover_scale` |
| Custom CSS | ✅ | `template_custom_css` |
| Social Links | ✅ | `template_social_links` |
| Footer Styling | ✅ | `template_footer_text`, `template_footer_link_color` |

---

*Last Updated: January 3, 2026*
*Template: Babyos v2.0 - Full Feature Set*
