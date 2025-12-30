/**
 * Universal Store Schema
 * 
 * This is the single source of truth for all store templates.
 * All templates render from this schema - they just interpret it differently.
 * 
 * Exposure levels:
 * - "basic": Shown in Basic Editor (simple edits: text, images, visibility)
 * - "advanced": Shown in Advanced Editor (layout, sizing, styling, effects)
 */

// ============================================================================
// CORE TYPES
// ============================================================================

export type Exposure = 'basic' | 'advanced';

export type BreakpointKey = 'mobile' | 'tablet' | 'desktop';

export type ResponsiveValue<T> =
  | T
  | {
      mobile?: T;
      tablet?: T;
      desktop?: T;
    };

// ============================================================================
// PRIMITIVE NODES
// ============================================================================

export type TextNode = {
  type: 'text';
  value: string;
  exposure?: Exposure;
  style?: Record<string, any>;
};

export type ImageNode = {
  type: 'image';
  assetKey: string;
  alt?: string;
  exposure?: Exposure;
  size?: ResponsiveValue<number>;
  scaleX?: ResponsiveValue<number>;
  scaleY?: ResponsiveValue<number>;
  posX?: ResponsiveValue<number>; // 0..1 focal point
  posY?: ResponsiveValue<number>; // 0..1 focal point
  fit?: 'cover' | 'contain' | 'fill';
  style?: Record<string, any>;
};

export type VideoNode = {
  type: 'video';
  url: string;
  assetKey?: string;
  exposure?: Exposure;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  poster?: string;
  fit?: 'cover' | 'contain' | 'fill';
};

export type CtaNode = {
  label: TextNode;
  action: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  exposure?: Exposure;
};

export type LinkNode = {
  label: TextNode;
  action: string;
  exposure?: Exposure;
};

// ============================================================================
// ASSET MANAGEMENT
// ============================================================================

export type Asset = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
  focalPoint?: { x: number; y: number };
  mimeType?: string;
};

export type AssetsMap = Record<string, Asset>;

// ============================================================================
// META & STORE INFO
// ============================================================================

export type StoreMeta = {
  storeId: string;
  name: string;
  description?: string;
  locale: string;
  currency: string;
  tags?: string[];
  exposure?: Exposure;
};

// ============================================================================
// HEADER SECTION
// ============================================================================

export type HeaderNode = {
  type: 'header';
  exposure?: Exposure;
  visible?: boolean;
  logo: ImageNode;
  nav: LinkNode[];
  cta?: CtaNode[];
  sticky?: boolean;
  transparent?: boolean;
  // Layout (advanced)
  paddingY?: ResponsiveValue<number>;
  paddingX?: ResponsiveValue<number>;
  backgroundColor?: string;
  textColor?: string;
};

// ============================================================================
// HERO SECTION
// ============================================================================

/**
 * Hero layouts seen across templates:
 * - left-text: Text on left, image on right (fashion, jewelry)
 * - right-text: Text on right, image on left (baby)
 * - centered: Text centered, image as background (minimal)
 * - split: 50/50 text and image (electronics, fashion)
 * - fullscreen: Full viewport hero with overlay
 * - minimal: Just text, no image
 * - collage: Multiple images arranged artistically (jewelry, fashion)
 * - stacked: Image above text (mobile-first)
 */
export type HeroLayout = 
  | 'left-text' 
  | 'right-text' 
  | 'centered' 
  | 'split' 
  | 'fullscreen' 
  | 'minimal'
  | 'collage'
  | 'stacked';

/**
 * Hero image arrangement when multiple images exist:
 * - single: One main image
 * - duo: Two images side by side
 * - trio: Three images (1 large + 2 small, or 3 equal)
 * - grid: 2x2 or custom grid
 * - carousel: Sliding images
 * - overlap: Images overlapping each other
 */
export type HeroImageArrangement = 'single' | 'duo' | 'trio' | 'grid' | 'carousel' | 'overlap';

export type HeroNode = {
  type: 'hero';
  exposure?: Exposure;
  visible?: boolean;
  // Content (basic)
  title: TextNode;
  subtitle?: TextNode;
  kicker?: TextNode; // Small text above title (e.g., "New Collection")
  badge?: {
    left?: TextNode;
    right?: TextNode;
    icon?: string;
  };
  // Images - support multiple!
  image?: ImageNode;           // Primary image
  images?: ImageNode[];        // Additional images for collage/carousel
  imageArrangement?: HeroImageArrangement;
  video?: VideoNode;
  cta?: CtaNode[];
  // Layout (advanced)
  layout?: HeroLayout;
  contentWidth?: 'narrow' | 'medium' | 'wide' | 'full';
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'center' | 'bottom';
  paddingY?: ResponsiveValue<number>;
  paddingX?: ResponsiveValue<number>;
  gap?: ResponsiveValue<number>;
  imageHeight?: ResponsiveValue<number>;
  minHeight?: ResponsiveValue<number>;
  overlay?: {
    enabled: boolean;
    color?: string;
    opacity?: number;
    gradient?: string; // e.g., 'to-right', 'to-bottom'
  };
  // Decorations (advanced)
  floatingShapes?: {
    enabled: boolean;
    shapes?: Array<{
      type: 'circle' | 'square' | 'blob';
      color: string;
      size: number;
      position: { x: number; y: number };
      blur?: number;
    }>;
  };
  // Animation (advanced)
  animation?: 'none' | 'fade' | 'slide' | 'zoom' | 'parallax';
};

// ============================================================================
// PRODUCT TYPES
// ============================================================================

export type ProductSize = 'xs' | 'small' | 'medium' | 'large' | 'xl' | 'featured';

/**
 * Product card shapes across templates:
 * - card: Rectangle with image + text below (most common)
 * - tile: Square image with overlay text on hover
 * - circle: Round product image (fashion accessories, food)
 * - list: Horizontal - image left, text right (catalog style)
 * - chip: Small pill-style for quick add (electronics specs)
 * - portrait: Tall rectangle (fashion/clothing)
 * - landscape: Wide rectangle (electronics, furniture)
 * - minimal: Just image, text on hover
 * - detailed: Card with specs/features visible
 */
export type ProductShape = 
  | 'card' 
  | 'tile' 
  | 'circle' 
  | 'list' 
  | 'chip' 
  | 'portrait' 
  | 'landscape'
  | 'minimal'
  | 'detailed';

/**
 * Product card visual styles:
 * - flat: No shadow, minimal styling
 * - shadow: Soft shadow
 * - border: Visible border
 * - elevated: Strong shadow, floating effect
 * - glass: Glassmorphism (blur background)
 * - gradient: Gradient background
 * - outlined: Colored outline on hover
 */
export type ProductStyle = 
  | 'flat' 
  | 'shadow' 
  | 'border' 
  | 'elevated'
  | 'glass'
  | 'gradient'
  | 'outlined';

/**
 * Hover effects for product cards:
 */
export type HoverEffect = 
  | 'none' 
  | 'zoom'      // Image zooms in
  | 'lift'      // Card lifts up
  | 'glow'      // Colored glow
  | 'reveal'    // Shows more info
  | 'flip'      // 3D flip
  | 'slide'     // Content slides
  | 'border'    // Border appears/changes
  | 'shadow';   // Shadow intensifies

/**
 * Image aspect ratios for product cards:
 */
export type ImageRatio = 
  | 'square'     // 1:1
  | 'portrait'   // 3:4
  | 'landscape'  // 4:3
  | 'wide'       // 16:9
  | 'tall'       // 2:3
  | 'auto';      // Natural size

export type ProductLayout = {
  position?: number;
  size?: ProductSize;
  shape?: ProductShape;
  style?: ProductStyle;
  imageRatio?: ImageRatio;
  // Colors (advanced)
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  // Effects (advanced)
  hoverEffect?: HoverEffect;
  borderRadius?: ResponsiveValue<number>;
  // Content display
  showPrice?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showBadges?: boolean;
  showAddButton?: boolean;
  pricePosition?: 'below' | 'overlay' | 'inline';
  // Visibility
  highlight?: boolean;
  featured?: boolean;
  exposure?: Exposure;
};

export type ProductBadge = {
  type: 'new' | 'sale' | 'limited' | 'bestseller' | 'custom';
  label?: string;
  color?: string;
};

export type ProductNode = {
  id: string;
  title: TextNode;
  description?: TextNode;
  price: number;
  originalPrice?: number; // For sale items
  image: ImageNode;
  images?: ImageNode[]; // Gallery
  tags?: string[];
  category?: string;
  inventory?: number;
  badges?: ProductBadge[];
  // Layout options
  layout?: ProductLayout;
  exposure?: Exposure;
};

// ============================================================================
// PRODUCT GRID SECTION
// ============================================================================

/**
 * Grid layouts across templates:
 * - grid: Standard rows/columns (most common)
 * - masonry: Pinterest-style varied heights
 * - carousel: Horizontal scroll
 * - list: Vertical list (catalog)
 * - featured-first: First item large, rest smaller
 * - featured-center: Center item large
 * - asymmetric: 1 large + multiple small
 * - bento: Mixed sizes like bento box
 */
export type GridLayout = 
  | 'grid' 
  | 'masonry' 
  | 'carousel' 
  | 'list' 
  | 'featured-first'
  | 'featured-center'
  | 'asymmetric'
  | 'bento';

export type ProductGridNode = {
  type: 'grid' | 'product-grid';
  exposure?: Exposure;
  visible?: boolean;
  // Content (basic)
  title?: TextNode;
  subtitle?: TextNode;
  items: ProductNode[];
  addLabel?: TextNode;
  // Layout (advanced)
  layout?: GridLayout;
  columns?: ResponsiveValue<number>;
  gap?: ResponsiveValue<number>;
  paddingY?: ResponsiveValue<number>;
  paddingX?: ResponsiveValue<number>;
  backgroundColor?: string;
  // Card defaults (advanced) - applies to all cards in grid
  card?: {
    shape?: ProductShape;
    style?: ProductStyle;
    radius?: ResponsiveValue<number>;
    shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    imageHeight?: ResponsiveValue<number>;
    imageRatio?: ImageRatio;
    hoverEffect?: HoverEffect;
    showPrice?: boolean;
    showTitle?: boolean;
    showDescription?: boolean;
    showBadges?: boolean;
    showAddButton?: boolean;
    pricePosition?: 'below' | 'overlay' | 'inline';
    textAlign?: 'left' | 'center' | 'right';
  };
  // Featured item override (for featured-first, asymmetric layouts)
  featuredCard?: {
    shape?: ProductShape;
    style?: ProductStyle;
    columns?: number; // How many columns it spans
    rows?: number;    // How many rows it spans
  };
  // Behavior
  showFilters?: boolean;
  showSort?: boolean;
  showSearch?: boolean;
  maxItems?: number;
  loadMoreLabel?: TextNode;
};

// ============================================================================
// BANNER SECTION
// ============================================================================

export type BannerNode = {
  type: 'banner';
  exposure?: Exposure;
  visible?: boolean;
  // Content (basic)
  title?: TextNode;
  subtitle?: TextNode;
  image?: ImageNode;
  cta?: CtaNode[];
  // Layout (advanced)
  layout?: 'full-width' | 'contained' | 'split';
  height?: ResponsiveValue<number>;
  paddingY?: ResponsiveValue<number>;
  paddingX?: ResponsiveValue<number>;
  backgroundColor?: string;
  textColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  overlay?: {
    enabled: boolean;
    color?: string;
    opacity?: number;
  };
};

// ============================================================================
// TESTIMONIAL SECTION
// ============================================================================

export type TestimonialItem = {
  id: string;
  quote: TextNode;
  author: TextNode;
  role?: TextNode;
  avatar?: ImageNode;
  rating?: number; // 1-5
};

export type TestimonialNode = {
  type: 'testimonial';
  exposure?: Exposure;
  visible?: boolean;
  // Content (basic)
  title?: TextNode;
  subtitle?: TextNode;
  items: TestimonialItem[];
  // Layout (advanced)
  layout?: 'grid' | 'carousel' | 'stack';
  columns?: ResponsiveValue<number>;
  gap?: ResponsiveValue<number>;
  paddingY?: ResponsiveValue<number>;
  paddingX?: ResponsiveValue<number>;
  backgroundColor?: string;
  showRating?: boolean;
  autoplay?: boolean;
};

// ============================================================================
// CAROUSEL SECTION
// ============================================================================

export type CarouselItem = {
  id: string;
  image: ImageNode;
  title?: TextNode;
  subtitle?: TextNode;
  cta?: CtaNode;
  link?: string;
};

export type CarouselNode = {
  type: 'carousel';
  exposure?: Exposure;
  visible?: boolean;
  // Content (basic)
  title?: TextNode;
  items: CarouselItem[];
  // Layout (advanced)
  layout?: 'full-width' | 'contained';
  height?: ResponsiveValue<number>;
  paddingY?: ResponsiveValue<number>;
  paddingX?: ResponsiveValue<number>;
  // Behavior (advanced)
  autoplay?: boolean;
  interval?: number; // ms
  showDots?: boolean;
  showArrows?: boolean;
  loop?: boolean;
};

// ============================================================================
// COLLECTION/CATEGORY SECTION
// ============================================================================

export type CollectionItem = {
  id: string;
  title: TextNode;
  image?: ImageNode;
  icon?: string;       // Emoji or icon name (e.g., "🧸", "shirt", "💍")
  link: string;
  productCount?: number;
  description?: TextNode;
  color?: string;      // Background color for icon-based categories
};

/**
 * Collection layouts:
 * - grid: Standard grid
 * - carousel: Horizontal scroll
 * - masonry: Pinterest style
 * - pills: Small horizontal chips/pills
 * - tabs: Tab-style navigation
 * - icons: Grid of icons with labels
 */
export type CollectionLayout = 'grid' | 'carousel' | 'masonry' | 'pills' | 'tabs' | 'icons';

export type CollectionNode = {
  type: 'collection';
  exposure?: Exposure;
  visible?: boolean;
  // Content (basic)
  title?: TextNode;
  subtitle?: TextNode;
  items: CollectionItem[];
  // Layout (advanced)
  layout?: CollectionLayout;
  columns?: ResponsiveValue<number>;
  gap?: ResponsiveValue<number>;
  paddingY?: ResponsiveValue<number>;
  paddingX?: ResponsiveValue<number>;
  backgroundColor?: string;
  card?: {
    shape?: 'card' | 'circle' | 'square' | 'pill';
    overlay?: boolean;
    radius?: ResponsiveValue<number>;
    showIcon?: boolean;
    showImage?: boolean;
    showCount?: boolean;
    iconSize?: 'sm' | 'md' | 'lg' | 'xl';
  };
};

// ============================================================================
// TABS/FILTER SECTION (Fashion gender tabs, etc.)
// ============================================================================

export type TabItem = {
  id: string;
  label: TextNode;
  value: string;
  icon?: string;
  badge?: string; // e.g., "New"
};

export type TabsNode = {
  type: 'tabs';
  exposure?: Exposure;
  visible?: boolean;
  // Content (basic)
  items: TabItem[];
  defaultValue?: string;
  // Layout (advanced)
  style?: 'pills' | 'underline' | 'buttons' | 'segment';
  align?: 'left' | 'center' | 'right' | 'stretch';
  size?: 'sm' | 'md' | 'lg';
  paddingY?: ResponsiveValue<number>;
  paddingX?: ResponsiveValue<number>;
  backgroundColor?: string;
  activeColor?: string;
};

// ============================================================================
// CHIPS/BADGES SECTION (Baby age chips, etc.)
// ============================================================================

export type ChipItem = {
  id: string;
  label: TextNode;
  value: string;
  icon?: string;
  color?: string;
};

export type ChipsNode = {
  type: 'chips';
  exposure?: Exposure;
  visible?: boolean;
  // Content (basic)
  items: ChipItem[];
  multiSelect?: boolean;
  // Layout (advanced)
  style?: 'filled' | 'outline' | 'soft';
  size?: 'sm' | 'md' | 'lg';
  gap?: ResponsiveValue<number>;
  paddingY?: ResponsiveValue<number>;
  paddingX?: ResponsiveValue<number>;
};

// ============================================================================
// FEATURES/BENEFITS SECTION
// ============================================================================

export type FeatureItem = {
  id: string;
  icon?: string; // Icon name or emoji
  title: TextNode;
  description?: TextNode;
};

export type FeaturesNode = {
  type: 'features';
  exposure?: Exposure;
  visible?: boolean;
  // Content (basic)
  title?: TextNode;
  subtitle?: TextNode;
  items: FeatureItem[];
  // Layout (advanced)
  layout?: 'grid' | 'row' | 'stack';
  columns?: ResponsiveValue<number>;
  gap?: ResponsiveValue<number>;
  paddingY?: ResponsiveValue<number>;
  paddingX?: ResponsiveValue<number>;
  backgroundColor?: string;
  iconStyle?: 'circle' | 'square' | 'none';
};

// ============================================================================
// CUSTOM/HTML SECTION
// ============================================================================

export type CustomNode = {
  type: 'custom';
  exposure?: Exposure;
  visible?: boolean;
  html?: string;
  className?: string;
  paddingY?: ResponsiveValue<number>;
  paddingX?: ResponsiveValue<number>;
  backgroundColor?: string;
};

// ============================================================================
// FOOTER SECTION
// ============================================================================

export type FooterColumn = {
  title?: TextNode;
  links: LinkNode[];
};

export type FooterNode = {
  type: 'footer';
  exposure?: Exposure;
  visible?: boolean;
  // Content (basic)
  logo?: ImageNode;
  description?: TextNode;
  columns?: FooterColumn[];
  links?: LinkNode[];
  copyright: TextNode;
  socialLinks?: Array<{
    platform: 'facebook' | 'instagram' | 'twitter' | 'tiktok' | 'youtube' | 'whatsapp';
    url: string;
  }>;
  // Layout (advanced)
  paddingY?: ResponsiveValue<number>;
  paddingX?: ResponsiveValue<number>;
  backgroundColor?: string;
  textColor?: string;
  layout?: 'simple' | 'columns' | 'centered';
};

// ============================================================================
// ALL SECTION TYPES
// ============================================================================

export type SectionNode =
  | HeaderNode
  | HeroNode
  | ProductGridNode
  | BannerNode
  | TestimonialNode
  | CarouselNode
  | CollectionNode
  | TabsNode
  | ChipsNode
  | FeaturesNode
  | CustomNode
  | FooterNode;

export type SectionType = SectionNode['type'];

// ============================================================================
// THEME & STYLES
// ============================================================================

export type ThemeMode = 'light' | 'dark' | 'auto';

export type BackgroundConfig = {
  enabled: boolean;
  assetKey?: string;
  color?: string;
  fit?: 'cover' | 'contain' | 'tile';
  posX?: number;
  posY?: number;
  opacity?: number;
  exposure?: Exposure;
};

export type FontConfig = {
  heading: string;
  body: string;
  exposure?: Exposure;
};

export type SpacingTokens = {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
};

export type StylesConfig = {
  // Basic
  theme?: ThemeMode;
  primaryColor?: string;
  accentColor?: string;
  // Advanced
  secondaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  background?: BackgroundConfig;
  fonts?: FontConfig;
  tokens?: {
    space?: number;
    radius?: number;
    spacing?: SpacingTokens;
  };
  // Custom CSS (advanced)
  customCss?: string;
  exposure?: Exposure;
};

// ============================================================================
// LAYOUT CONFIG
// ============================================================================

export type LayoutConfig = {
  header?: HeaderNode;
  hero?: HeroNode;
  sections?: SectionNode[];
  footer?: FooterNode;
};

// ============================================================================
// SEO CONFIG
// ============================================================================

export type SeoConfig = {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
  noIndex?: boolean;
  structuredData?: Record<string, any>;
  exposure?: Exposure;
};

// ============================================================================
// MAIN SCHEMA
// ============================================================================

export type UniversalStoreSchema = {
  // Version for migrations
  version: number;
  schemaVersion: string; // e.g., "1.0.0"
  
  // Page identifier
  pageId: string;
  templateId?: string; // Which template renders this
  
  // Store metadata
  meta: StoreMeta;
  
  // SEO
  seo?: SeoConfig;
  
  // Layout structure
  layout: LayoutConfig;
  
  // Global styles
  styles: StylesConfig;
  
  // Asset registry
  assets: AssetsMap;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
};

// ============================================================================
// FIELD EXPOSURE MAPPING
// ============================================================================

/**
 * Fields exposed in Basic Editor
 * These are the only fields users can edit in simple mode
 */
export const BASIC_FIELDS = [
  // Meta
  'meta.name',
  'meta.description',
  
  // Assets
  'assets.logo',
  'assets.hero',
  'assets.wallpaper',
  
  // Header
  'layout.header.logo',
  'layout.header.nav',
  'layout.header.visible',
  
  // Hero
  'layout.hero.title',
  'layout.hero.subtitle',
  'layout.hero.image',
  'layout.hero.cta',
  'layout.hero.visible',
  
  // Products
  'layout.sections.*.items.*.title',
  'layout.sections.*.items.*.description',
  'layout.sections.*.items.*.price',
  'layout.sections.*.items.*.image',
  'layout.sections.*.items.*.layout.position',
  'layout.sections.*.items.*.layout.highlight',
  'layout.sections.*.visible',
  'layout.sections.*.title',
  'layout.sections.*.subtitle',
  
  // Footer
  'layout.footer.copyright',
  'layout.footer.links',
  'layout.footer.visible',
  
  // Styles (basic)
  'styles.primaryColor',
  'styles.theme',
] as const;

/**
 * Additional fields exposed in Advanced Editor
 */
export const ADVANCED_FIELDS = [
  // All basic fields plus:
  
  // Layout controls
  'layout.*.layout',
  'layout.*.paddingX',
  'layout.*.paddingY',
  'layout.*.gap',
  'layout.*.columns',
  'layout.*.backgroundColor',
  'layout.*.textColor',
  
  // Product card styling
  'layout.sections.*.card.*',
  'layout.sections.*.items.*.layout.size',
  'layout.sections.*.items.*.layout.shape',
  'layout.sections.*.items.*.layout.style',
  'layout.sections.*.items.*.layout.hoverEffect',
  'layout.sections.*.items.*.layout.backgroundColor',
  'layout.sections.*.items.*.layout.textColor',
  
  // Hero advanced
  'layout.hero.video',
  'layout.hero.overlay',
  'layout.hero.animation',
  'layout.hero.minHeight',
  
  // Styles (advanced)
  'styles.accentColor',
  'styles.secondaryColor',
  'styles.fonts',
  'styles.tokens',
  'styles.background',
  'styles.customCss',
  
  // SEO
  'seo.*',
] as const;

// ============================================================================
// HELPER TYPES
// ============================================================================

export type BasicField = typeof BASIC_FIELDS[number];
export type AdvancedField = typeof ADVANCED_FIELDS[number];

/**
 * Check if a field path is basic (editable in simple mode)
 */
export function isBasicField(fieldPath: string): boolean {
  return BASIC_FIELDS.some(pattern => {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '[^.]+') + '$');
    return regex.test(fieldPath);
  });
}

/**
 * Check if a field path is advanced (only in advanced mode)
 */
export function isAdvancedField(fieldPath: string): boolean {
  return !isBasicField(fieldPath);
}

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_SCHEMA: UniversalStoreSchema = {
  version: 1,
  schemaVersion: '1.0.0',
  pageId: 'home',
  meta: {
    storeId: '',
    name: 'My Store',
    description: '',
    locale: 'en-US',
    currency: 'DZD',
  },
  layout: {
    header: {
      type: 'header',
      visible: true,
      logo: { type: 'image', assetKey: 'logo', alt: 'Store logo' },
      nav: [],
      sticky: true,
    },
    hero: {
      type: 'hero',
      visible: true,
      title: { type: 'text', value: 'Welcome to our store' },
      subtitle: { type: 'text', value: 'Discover amazing products' },
      image: { type: 'image', assetKey: 'hero', alt: 'Hero image' },
      layout: 'centered',
    },
    sections: [],
    footer: {
      type: 'footer',
      visible: true,
      copyright: { type: 'text', value: '© 2025 My Store' },
      links: [],
    },
  },
  styles: {
    theme: 'light',
    primaryColor: '#000000',
    accentColor: '#3B82F6',
  },
  assets: {},
};

// ============================================================================
// SCHEMA UTILITIES
// ============================================================================

/**
 * Create a new store schema with defaults
 */
export function createStoreSchema(
  storeId: string,
  name: string,
  templateId?: string
): UniversalStoreSchema {
  return {
    ...DEFAULT_SCHEMA,
    pageId: `${storeId}-home`,
    templateId,
    meta: {
      ...DEFAULT_SCHEMA.meta,
      storeId,
      name,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Get all visible sections from a schema
 */
export function getVisibleSections(schema: UniversalStoreSchema): SectionNode[] {
  const sections: SectionNode[] = [];
  
  if (schema.layout.header?.visible !== false) {
    sections.push(schema.layout.header!);
  }
  if (schema.layout.hero?.visible !== false) {
    sections.push(schema.layout.hero!);
  }
  if (schema.layout.sections) {
    sections.push(...schema.layout.sections.filter(s => s.visible !== false));
  }
  if (schema.layout.footer?.visible !== false) {
    sections.push(schema.layout.footer!);
  }
  
  return sections;
}

/**
 * Deep merge two schemas (for updates)
 */
export function mergeSchema(
  base: UniversalStoreSchema,
  updates: Partial<UniversalStoreSchema>
): UniversalStoreSchema {
  return {
    ...base,
    ...updates,
    meta: { ...base.meta, ...updates.meta },
    layout: {
      ...base.layout,
      ...updates.layout,
      header: { ...base.layout.header, ...updates.layout?.header } as HeaderNode,
      hero: { ...base.layout.hero, ...updates.layout?.hero } as HeroNode,
      footer: { ...base.layout.footer, ...updates.layout?.footer } as FooterNode,
      sections: updates.layout?.sections ?? base.layout.sections,
    },
    styles: { ...base.styles, ...updates.styles },
    assets: { ...base.assets, ...updates.assets },
    updatedAt: new Date().toISOString(),
  };
}
