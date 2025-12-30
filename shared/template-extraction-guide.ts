/**
 * Template Extraction Guide
 * 
 * This file documents how legacy templates map to Universal Schema + Theme Presets.
 * 
 * KEY INSIGHT: Templates differ in 4 main ways:
 * 
 * 1. HERO VARIATIONS
 *    - Single image (right/left/center)
 *    - Multiple images (2, 3, or collage)
 *    - Split layout, fullscreen, minimal
 *    - With/without video
 *    - With/without floating shapes
 * 
 * 2. CARD SHAPES
 *    - Rectangle (standard)
 *    - Square, Portrait, Landscape
 *    - Circle (accessories, food)
 *    - Minimal (image only, text on hover)
 * 
 * 3. CATEGORY STYLES
 *    - Icons with emojis (baby)
 *    - Tabs (fashion gender)
 *    - Pills/chips (age groups, filters)
 *    - Cards with images
 * 
 * 4. COLORS & FONTS
 *    - Theme presets handle this
 * 
 * ============================================================================
 * 
 * OLD WAY (each template):
 * ┌──────────────────────────────────────────────────────────────┐
 * │  fashion.tsx (576 lines)                                    │
 * │  - Hardcoded hero: left-text, gradient overlay              │
 * │  - Hardcoded cards: portrait, no radius                     │
 * │  - Hardcoded tabs: Women/Men/Essentials                     │
 * │  - Hardcoded colors: #f97316 orange                         │
 * └──────────────────────────────────────────────────────────────┘
 * 
 * NEW WAY:
 * ┌──────────────────────────────────────────────────────────────┐
 * │  Universal Schema         +    fashion-dark preset           │
 * │  ├─ hero.layout: 'split'       ├─ primaryColor: #f97316     │
 * │  ├─ hero.images: [1]           ├─ heroLayout: 'split'       │
 * │  ├─ categories: tabs           ├─ cardShape: 'portrait'     │
 * │  └─ products: grid             └─ hoverEffect: 'zoom'       │
 * └──────────────────────────────────────────────────────────────┘
 */

// ============================================================================
// EXTRACTION MAPPING: FASHION TEMPLATE
// ============================================================================

export const FASHION_EXTRACTION = {
  source: 'client/components/templates/fashion.tsx',
  lines: 576,
  
  // KEY DIFFERENCES from other templates:
  heroConfig: {
    layout: 'split',                // Text left, image right
    imageCount: 1,                  // Single background image
    imageArrangement: 'single',
    hasVideo: true,                 // Supports hero video
    hasOverlay: true,               // Gradient overlay
    hasKicker: true,                // "NEW COLLECTION" text above title
  },
  
  cardConfig: {
    shape: 'portrait',              // Tall cards for clothing
    imageRatio: 'portrait',         // 3:4 ratio
    hoverEffect: 'zoom',            // Image zooms on hover
    showPrice: true,
    pricePosition: 'below',
  },
  
  categoryConfig: {
    style: 'tabs',                  // Women / Men / Essentials tabs
    layout: 'pills',                // Filter pills below tabs
  },
  
  // What becomes THEME PRESET
  themePreset: {
    id: 'fashion-dark',
    styles: {
      primaryColor: '#f97316',
      secondaryColor: '#09090f',
      accentColor: '#fed7aa',
      textColor: '#f0f0f0',
      backgroundColor: '#09090f',
      theme: 'dark',
      fonts: {
        heading: 'Playfair Display',
        body: 'Inter',
      },
    },
    defaults: {
      heroLayout: 'split',
      heroImageArrangement: 'single',
      heroOverlay: true,
      productShape: 'portrait',
      productImageRatio: 'portrait',
      cardRadius: 0,
      hoverEffect: 'zoom',
      collectionLayout: 'tabs',
      categoryStyle: 'tabs',
      enableAnimations: true,
    },
  },
  
  // What becomes UNIVERSAL SCHEMA content
  schemaContent: {
    'layout.hero.layout': 'split',
    'layout.hero.title.value': 'Build a wardrobe that behaves like software.',
    'layout.hero.subtitle.value': 'Fewer pieces, more combinations...',
    'layout.hero.kicker.value': 'New Collection',
    'layout.hero.overlay.enabled': true,
    'layout.hero.overlay.gradient': 'to-right',
    'layout.categories.layout': 'tabs',
    'layout.categories.items': [
      { id: 'women', label: 'Women' },
      { id: 'men', label: 'Men' },
      { id: 'essentials', label: 'Essentials' },
    ],
    'layout.productGrid.card.shape': 'portrait',
  },
};

// ============================================================================
// EXTRACTION MAPPING: BABY TEMPLATE  
// ============================================================================

export const BABY_EXTRACTION = {
  source: 'client/components/templates/baby.tsx',
  lines: 553,
  
  // KEY DIFFERENCES from other templates:
  heroConfig: {
    layout: 'right-text',           // Image left, text right
    imageCount: 1,
    imageArrangement: 'single',
    hasFloatingShapes: true,        // Colored circles floating around
    hasBadge: true,                 // "Free Shipping • Ages 0-3"
    hasAgeChips: true,              // 0-6m, 6-12m, 1-3y chips
  },
  
  cardConfig: {
    shape: 'card',                  // Standard rectangle
    imageRatio: 'square',           // 1:1 ratio
    hoverEffect: 'lift',            // Card lifts on hover
    radius: 16,                     // Very rounded
    shadow: 'md',
  },
  
  categoryConfig: {
    style: 'icons',                 // Emoji icons with labels
    layout: 'grid',                 // 2x3 or 3x2 grid
    items: [
      { icon: '🧸', label: 'Toys' },
      { icon: '👕', label: 'Clothing' },
      { icon: '🍼', label: 'Feeding' },
      { icon: '🚼', label: 'Strollers' },
      { icon: '🛏️', label: 'Nursery' },
    ],
  },
  
  themePreset: {
    id: 'baby-soft',
    styles: {
      primaryColor: '#ec4899',
      secondaryColor: '#fce7f3',
      accentColor: '#f472b6',
      textColor: '#1f2937',
      backgroundColor: '#FFF5F7',
      theme: 'light',
      fonts: {
        heading: 'Quicksand',
        body: 'Nunito',
      },
    },
    defaults: {
      heroLayout: 'right-text',
      heroImageArrangement: 'single',
      productShape: 'card',
      productImageRatio: 'square',
      cardRadius: 16,
      cardShadow: 'md',
      hoverEffect: 'lift',
      collectionLayout: 'icons',
      categoryStyle: 'icons',
      enableAnimations: true,
    },
  },
  
  schemaContent: {
    'layout.hero.layout': 'right-text',
    'layout.hero.title.value': 'A soft, modern universe for every little moment.',
    'layout.hero.badge.left': 'Free Shipping',
    'layout.hero.badge.right': 'Ages 0-3',
    'layout.hero.floatingShapes.enabled': true,
    'layout.chips.items': [
      { label: '0-6 months', value: '0-6m' },
      { label: '6-12 months', value: '6-12m' },
      { label: '1-3 years', value: '1-3y' },
    ],
    'layout.categories.layout': 'icons',
    'layout.categories.card.showIcon': true,
  },
};

// ============================================================================
// EXTRACTION MAPPING: ELECTRONICS TEMPLATE
// ============================================================================

export const ELECTRONICS_EXTRACTION = {
  source: 'client/components/templates/electronics.tsx',
  lines: 561,
  
  // KEY DIFFERENCES from other templates:
  heroConfig: {
    layout: 'split',                // Text left, product showcase right
    imageCount: 1,                  // Featured product image
    imageArrangement: 'single',
    hasGlowEffect: true,            // Colored glow behind product
    hasSpecChips: true,             // Product specs as chips
    hasBadge: true,                 // "New • 2025 line-up"
  },
  
  cardConfig: {
    shape: 'detailed',              // Shows specs below image
    imageRatio: 'landscape',        // Wide for electronics
    hoverEffect: 'glow',            // Cyan glow on hover
    showSpecs: true,                // Display, Battery, Storage
    specStyle: 'chips',             // Small chips for specs
  },
  
  categoryConfig: {
    style: 'pills',                 // Horizontal pill buttons
    layout: 'carousel',             // Scrollable
    items: ['All', 'Phones', 'Audio', 'Gaming', 'Accessories'],
  },
  
  themePreset: {
    id: 'tech-dark',
    styles: {
      primaryColor: '#22d3ee',
      secondaryColor: '#0f172a',
      accentColor: '#22d3ee',
      textColor: '#e2e8f0',
      backgroundColor: '#0f172a',
      theme: 'dark',
      fonts: {
        heading: 'Space Grotesk',
        body: 'Inter',
      },
    },
    defaults: {
      heroLayout: 'split',
      productShape: 'detailed',
      productImageRatio: 'landscape',
      cardRadius: 12,
      cardShadow: 'lg',
      hoverEffect: 'glow',
      collectionLayout: 'pills',
      categoryStyle: 'pills',
      showProductShadows: true,
      enableAnimations: true,
    },
  },
  
  schemaContent: {
    'layout.hero.layout': 'split',
    'layout.hero.badge.left': 'New',
    'layout.hero.badge.right': '2025 line-up',
    'layout.hero.title.value': 'Flagship performance for your entire tech store.',
    'layout.productGrid.card.shape': 'detailed',
    'layout.productGrid.card.showSpecs': true,
  },
};

// ============================================================================
// EXTRACTION MAPPING: JEWELRY TEMPLATE
// ============================================================================

export const JEWELRY_EXTRACTION = {
  source: 'client/components/templates/jewelry.tsx',
  lines: 619,
  
  // KEY DIFFERENCES from other templates:
  heroConfig: {
    layout: 'collage',              // Multiple images arranged artistically
    imageCount: 3,                  // Main + 2 smaller
    imageArrangement: 'overlap',    // Images overlap each other
    hasGlow: true,                  // Gold glow effect
    hasKicker: true,                // "Timeless Collection"
  },
  
  cardConfig: {
    shape: 'square',                // 1:1 for jewelry
    imageRatio: 'square',
    hoverEffect: 'glow',            // Gold glow on hover
    showMaterial: true,             // Gold, Silver, Diamond badges
    glowColor: 'gold',
  },
  
  categoryConfig: {
    style: 'tabs',                  // Collections / Gold / Engagement
    layout: 'underline',            // Underline style tabs
  },
  
  themePreset: {
    id: 'jewelry-gold',
    styles: {
      primaryColor: '#D4AF37',
      secondaryColor: '#1A1A1A',
      accentColor: '#FFD700',
      textColor: '#2D2D2D',
      backgroundColor: '#FFFFFF',
      theme: 'light',
      fonts: {
        heading: 'Cormorant Garamond',
        body: 'Lato',
      },
    },
    defaults: {
      heroLayout: 'collage',
      heroImageArrangement: 'overlap',
      productShape: 'square',
      productImageRatio: 'square',
      cardRadius: 0,
      cardShadow: 'none',
      hoverEffect: 'glow',
      enableAnimations: true,
    },
  },
};

// ============================================================================
// WHAT WE DON'T NEED TO EXTRACT (Renderer handles it)
// ============================================================================

/**
 * The Shiro Hana renderer already handles these universal patterns:
 * 
 * 1. HEADER
 *    - Logo (from schema: layout.header.logo)
 *    - Navigation (from schema: layout.header.nav)
 *    - CTA buttons (from schema: layout.header.cta)
 *    - Styling (from preset: colors, fonts)
 * 
 * 2. HERO
 *    - Title/subtitle (from schema: layout.hero.title/subtitle)
 *    - Image/video (from schema: layout.hero.image/video)
 *    - CTA buttons (from schema: layout.hero.cta)
 *    - Layout (from preset: heroLayout - centered/split/fullscreen)
 * 
 * 3. PRODUCT GRID
 *    - Products (from schema: layout.sections[].items)
 *    - Card appearance (from preset: cardRadius, shadow, hoverEffect)
 *    - Grid layout (from preset: gridColumns, gap)
 * 
 * 4. FOOTER
 *    - Links (from schema: layout.footer.links)
 *    - Copyright (from schema: layout.footer.copyright)
 *    - Styling (from preset: colors)
 */

// ============================================================================
// MIGRATION STEPS
// ============================================================================

/**
 * To fully migrate away from legacy templates:
 * 
 * STEP 1: ✅ DONE - Universal Schema created
 *         shared/universal-store-schema.ts
 * 
 * STEP 2: ✅ DONE - Theme Presets created  
 *         shared/theme-presets.ts
 * 
 * STEP 3: 🔄 IN PROGRESS - Make Shiro Hana read presets
 *         Update ShiroHanaTemplate to apply theme preset styles
 * 
 * STEP 4: TODO - Add preset selector to editor
 *         Let users pick fashion/baby/tech theme
 * 
 * STEP 5: TODO - Create default schemas per category
 *         Pre-fill content for fashion, baby, electronics stores
 * 
 * STEP 6: TODO - Deprecate legacy templates
 *         Remove fashion.tsx, baby.tsx, etc.
 */

// ============================================================================
// SECTION TYPES MAPPING
// ============================================================================

/**
 * Legacy template sections → Universal Schema sections
 * 
 * Fashion "looks" section    → type: 'carousel' or 'collection'
 * Baby "category grid"       → type: 'collection' with icons
 * Electronics "best sellers" → type: 'product-grid' with badges
 * Any "testimonials"         → type: 'testimonial'
 * Any "features/benefits"    → type: 'features'
 * Any "promotional banner"   → type: 'banner'
 */

export const SECTION_TYPE_MAPPING = {
  // Fashion template sections
  'fashion.looks': { type: 'carousel', note: 'Styled outfits carousel' },
  'fashion.genderTabs': { type: 'collection', note: 'Women/Men/Essentials tabs' },
  'fashion.productGrid': { type: 'product-grid' },
  
  // Baby template sections
  'baby.categoryGrid': { type: 'collection', note: 'Categories with emoji icons' },
  'baby.ageChips': { type: 'custom', note: '0-6m, 6-12m, 1-3y chips' },
  'baby.featuredProduct': { type: 'product-grid', note: 'Featured single product' },
  
  // Electronics template sections
  'electronics.splitHero': { type: 'hero', layout: 'split' },
  'electronics.categoryNav': { type: 'collection' },
  'electronics.bestSellers': { type: 'product-grid', note: 'With TOP badge' },
  'electronics.specTable': { type: 'custom', note: 'Product specs comparison' },
};
