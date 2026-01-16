// Template definitions for store storefronts.
// IMPORTANT: Only include template IDs that are actually renderable by the storefront.
export interface Template {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  image: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  features: string[];
}

const templates: Template[] = [
  {
    id: 'shiro-hana',
    name: 'Shiro Hana',
    category: 'Storefront',
    icon: '🍣',
    description: 'Clean modern storefront with hero + product grid.',
    image: '/template-previews/store.png',
    colors: { primary: '#111827', secondary: '#f8fafc', accent: '#22c55e' },
    features: ['Hero', 'Product grid', 'Header & footer', 'Universal schema'],
  },
  {
    id: 'pro',
    name: 'Pro (Professional)',
    category: 'Storefront',
    icon: '🏢',
    description: 'Professional premium storefront with split hero + sidebar layout.',
    image: '/template-previews/pro.svg',
    colors: { primary: '#0b1220', secondary: '#0f172a', accent: '#2563eb' },
    features: ['Sticky header', 'Split hero', 'Sidebar layout', 'Featured strip + grid'],
  },
  {
    id: 'pro-aurora',
    name: 'Pro Aurora',
    category: 'Storefront',
    icon: '🌌',
    description: 'Premium “futuristic glass” storefront variant.',
    image: '/template-previews/pro-aurora.svg',
    colors: { primary: '#0b1220', secondary: '#0f172a', accent: '#22d3ee' },
    features: ['Glass hero', 'Feature rail', 'Editorial grid', 'Pro layout'],
  },
  {
    id: 'pro-vertex',
    name: 'Pro Vertex',
    category: 'Storefront',
    icon: '🔷',
    description: 'Sharp, high-contrast professional variant.',
    image: '/template-previews/pro-vertex.svg',
    colors: { primary: '#0b1220', secondary: '#0f172a', accent: '#a78bfa' },
    features: ['Dense header', 'Split layout', 'Compact cards', 'Pro layout'],
  },
  {
    id: 'pro-atelier',
    name: 'Pro Atelier',
    category: 'Storefront',
    icon: '🧵',
    description: 'Editorial, luxury-inspired professional variant.',
    image: '/template-previews/pro-atelier.svg',
    colors: { primary: '#0b1220', secondary: '#0f172a', accent: '#f59e0b' },
    features: ['Editorial hero', 'Showcase section', 'Large cards', 'Pro layout'],
  },
  {
    id: 'pro-orbit',
    name: 'Pro Orbit',
    category: 'Storefront',
    icon: '🪐',
    description: 'Modern, spacious pro variant with “orbit” layout.',
    image: '/template-previews/pro-orbit.svg',
    colors: { primary: '#0b1220', secondary: '#0f172a', accent: '#34d399' },
    features: ['Wide hero', 'Sectioned layout', 'Balanced grid', 'Pro layout'],
  },
  {
    id: 'pro-zen',
    name: 'Pro Zen',
    category: 'Storefront',
    icon: '🧘',
    description: 'Minimal calm professional variant with clean rhythm.',
    image: '/template-previews/pro-zen.svg',
    colors: { primary: '#0b1220', secondary: '#0f172a', accent: '#60a5fa' },
    features: ['Quiet hero', 'Minimal chrome', 'Clean grid', 'Pro layout'],
  },
  {
    id: 'pro-studio',
    name: 'Pro Studio',
    category: 'Storefront',
    icon: '🎛️',
    description: 'Studio-style professional variant with strong hierarchy.',
    image: '/template-previews/pro-studio.svg',
    colors: { primary: '#0b1220', secondary: '#0f172a', accent: '#fb7185' },
    features: ['Strong hero', 'Feature blocks', 'Showcase grid', 'Pro layout'],
  },
  {
    id: 'pro-mosaic',
    name: 'Pro Mosaic',
    category: 'Storefront',
    icon: '🧩',
    description: 'Mosaic grid professional variant with mixed card sizes.',
    image: '/template-previews/pro-mosaic.svg',
    colors: { primary: '#0b1220', secondary: '#0f172a', accent: '#f472b6' },
    features: ['Mosaic cards', 'Mixed sizes', 'Modern spacing', 'Pro layout'],
  },
  {
    id: 'pro-grid',
    name: 'Pro Grid',
    category: 'Storefront',
    icon: '🟦',
    description: 'Clean grid-first pro variant for catalogs.',
    image: '/template-previews/pro-grid.svg',
    colors: { primary: '#0b1220', secondary: '#0f172a', accent: '#38bdf8' },
    features: ['Grid-first', 'Filters-ready layout', 'Compact cards', 'Pro layout'],
  },
  {
    id: 'pro-catalog',
    name: 'Pro Catalog',
    category: 'Storefront',
    icon: '📚',
    description: 'Catalog-heavy pro variant with strong navigation.',
    image: '/template-previews/pro-catalog.svg',
    colors: { primary: '#0b1220', secondary: '#0f172a', accent: '#c084fc' },
    features: ['Catalog header', 'Collections layout', 'Dense grid', 'Pro layout'],
  },
  // Screenshot-inspired templates - Batch 1 (Green/Sage)
  {
    id: 'sage-boutique',
    name: 'Sage Boutique',
    category: 'Storefront',
    icon: '🌿',
    description: 'Elegant sage green boutique with serif typography.',
    image: '/template-previews/sage-boutique.svg',
    colors: { primary: '#e8efe8', secondary: '#ffffff', accent: '#4a7c59' },
    features: ['Sage theme', 'Newsletter section', 'Elegant typography', 'Soft design'],
  },
  {
    id: 'mint-elegance',
    name: 'Mint Elegance',
    category: 'Storefront',
    icon: '🍃',
    description: 'Fresh mint green store with stats and testimonials.',
    image: '/template-previews/mint-elegance.svg',
    colors: { primary: '#f0f7f4', secondary: '#ffffff', accent: '#3d9970' },
    features: ['Mint theme', 'Stats bar', 'Testimonials', 'Two-column hero'],
  },
  {
    id: 'forest-store',
    name: 'Forest Store',
    category: 'Storefront',
    icon: '🌲',
    description: 'Dark forest green eco-friendly store.',
    image: '/template-previews/forest-store.svg',
    colors: { primary: '#1a2e1a', secondary: '#243824', accent: '#7cb87c' },
    features: ['Dark forest', 'Eco theme', 'Organic shapes', 'Nature vibes'],
  },
  {
    id: 'pro-landing',
    name: 'Pro Landing',
    category: 'Landing Pages',
    icon: '🚀',
    description: 'Screenshot-inspired one-product landing (order card + gallery + story strip).',
    image: '/template-previews/pro-landing.svg',
    colors: { primary: '#ffffff', secondary: '#f8fafc', accent: '#b45309' },
    features: ['Order card', 'Image gallery', 'Story images strip', 'Reviews + FAQ'],
  },
  // Screenshot-inspired templates - Batch 2 (Orange/Coral)
  {
    id: 'sunset-shop',
    name: 'Sunset Shop',
    category: 'Storefront',
    icon: '🌅',
    description: 'Clean white store with orange accents and trust badges.',
    image: '/template-previews/sunset-shop.svg',
    colors: { primary: '#ffffff', secondary: '#f9fafb', accent: '#f97316' },
    features: ['Orange accents', 'Trust badges', 'Clean layout', 'Category pills'],
  },
  {
    id: 'coral-market',
    name: 'Coral Market',
    category: 'Storefront',
    icon: '🌸',
    description: 'Pink-tinted market with search and wishlist features.',
    image: '/template-previews/coral-market.svg',
    colors: { primary: '#fff5f5', secondary: '#ffffff', accent: '#f472b6' },
    features: ['Coral pink', 'Search bar', 'Wishlist buttons', 'Modern layout'],
  },
  {
    id: 'amber-store',
    name: 'Amber Store',
    category: 'Storefront',
    icon: '🔶',
    description: 'Elegant amber gold catalog with serif typography.',
    image: '/template-previews/amber-store.svg',
    colors: { primary: '#fffbf5', secondary: '#ffffff', accent: '#d97706' },
    features: ['Amber gold', 'Serif fonts', 'Elegant catalog', 'Large hero'],
  },
  // Screenshot-inspired templates - Batch 3 (Magenta/Pink)
  {
    id: 'magenta-mall',
    name: 'Magenta Mall',
    category: 'Storefront',
    icon: '🛍️',
    description: 'Marketplace layout with sidebar and promo banners.',
    image: '/template-previews/magenta-mall.svg',
    colors: { primary: '#f3f4f6', secondary: '#ffffff', accent: '#db2777' },
    features: ['Sidebar nav', 'Promo banners', 'Dense grid', 'Sale badges'],
  },
  {
    id: 'berry-market',
    name: 'Berry Market',
    category: 'Storefront',
    icon: '🫐',
    description: 'Purple-tinted market with category tiles and flash deals.',
    image: '/template-previews/berry-market.svg',
    colors: { primary: '#faf5ff', secondary: '#ffffff', accent: '#7c3aed' },
    features: ['Berry purple', 'Category tiles', 'Flash deals', 'Gradient hero'],
  },
  {
    id: 'rose-catalog',
    name: 'Rose Catalog',
    category: 'Storefront',
    icon: '🌹',
    description: 'Rose pink catalog with filters and wishlist hearts.',
    image: '/template-previews/rose-catalog.svg',
    colors: { primary: '#fff1f2', secondary: '#ffffff', accent: '#e11d48' },
    features: ['Rose pink', 'Filter dropdowns', 'NEW badges', 'Clean catalog'],
  },
  // Screenshot-inspired templates - Batch 4 (Lime/Green)
  {
    id: 'lime-direct',
    name: 'Lime Direct',
    category: 'Landing Pages',
    icon: '💚',
    description: 'Bright lime green direct sales with quick order form.',
    image: '/template-previews/lime-direct.svg',
    colors: { primary: '#f0fdf4', secondary: '#ffffff', accent: '#22c55e' },
    features: ['Lime green', 'Quick order', 'Feature badges', 'Direct sales'],
  },
  {
    id: 'emerald-shop',
    name: 'Emerald Shop',
    category: 'Storefront',
    icon: '💎',
    description: 'Rich emerald theme with feature highlights and testimonials.',
    image: '/template-previews/emerald-shop.svg',
    colors: { primary: '#ecfdf5', secondary: '#ffffff', accent: '#059669' },
    features: ['Emerald green', 'Feature cards', 'Testimonial', 'Stats hero'],
  },
  {
    id: 'neon-store',
    name: 'Neon Store',
    category: 'Storefront',
    icon: '🔋',
    description: 'Electric neon green on dark with glowing effects.',
    image: '/template-previews/neon-store.svg',
    colors: { primary: '#0a0a0a', secondary: '#141414', accent: '#00ff88' },
    features: ['Neon green', 'Dark theme', 'Glow effects', 'Tech style'],
  },
  // Screenshot-inspired templates - Batch 5 (Clean/Minimal)
  {
    id: 'clean-single',
    name: 'Clean Single',
    category: 'Landing Pages',
    icon: '⬜',
    description: 'Ultra-minimal single product focus with clean order form.',
    image: '/template-previews/clean-single.svg',
    colors: { primary: '#ffffff', secondary: '#fafafa', accent: '#3b82f6' },
    features: ['Single focus', 'Clean form', 'Feature list', 'Minimal design'],
  },
  {
    id: 'pure-product',
    name: 'Pure Product',
    category: 'Landing Pages',
    icon: '✨',
    description: 'Product-centric with sticky mobile CTA.',
    image: '/template-previews/pure-product.svg',
    colors: { primary: '#fefefe', secondary: '#f5f5f5', accent: '#0066ff' },
    features: ['Product focus', 'Sticky CTA', 'Specs table', 'Apple-like'],
  },
  {
    id: 'snow-shop',
    name: 'Snow Shop',
    category: 'Storefront',
    icon: '❄️',
    description: 'Crisp white with soft shadows and card layout.',
    image: '/template-previews/snow-shop.svg',
    colors: { primary: '#f8fafc', secondary: '#ffffff', accent: '#6366f1' },
    features: ['Snow white', 'Soft shadows', 'Card layout', 'Newsletter'],
  },
  // Screenshot-inspired templates - Batch 6 (Gallery)
  {
    id: 'gallery-pro',
    name: 'Gallery Pro',
    category: 'Landing Pages',
    icon: '🖼️',
    description: 'Image gallery focused with thumbnail navigation.',
    image: '/template-previews/gallery-pro.svg',
    colors: { primary: '#ffffff', secondary: '#fafafa', accent: '#2563eb' },
    features: ['Gallery view', 'Thumbnails', 'Quick order', 'Many images'],
  },
  {
    id: 'showcase-plus',
    name: 'Showcase Plus',
    category: 'Landing Pages',
    icon: '🎯',
    description: 'Multi-image showcase with carousel and color variants.',
    image: '/template-previews/showcase-plus.svg',
    colors: { primary: '#faf9f7', secondary: '#ffffff', accent: '#ea580c' },
    features: ['Image carousel', 'Color options', 'Reviews', 'Promo banner'],
  },
  {
    id: 'exhibit-store',
    name: 'Exhibit Store',
    category: 'Landing Pages',
    icon: '🏛️',
    description: 'Museum-style exhibition with floating info card.',
    image: '/template-previews/exhibit-store.svg',
    colors: { primary: '#f5f5f4', secondary: '#ffffff', accent: '#0d9488' },
    features: ['Exhibition style', 'Large images', 'Serif fonts', 'Elegant inquiry'],
  },
  {
    id: 'focus-one',
    name: 'Focus One',
    category: 'Landing Pages',
    icon: '🎯',
    description: 'High-conversion single-product landing with sticky CTA and upsells.',
    image: '/template-previews/focus-one.svg',
    colors: { primary: '#0b1220', secondary: '#0f172a', accent: '#22c55e' },
    features: ['Split hero', 'Sticky CTA', 'Trust badges', 'Optional upsells'],
  },
  {
    id: 'split-specs',
    name: 'Split Specs',
    category: 'Landing Pages',
    icon: '📋',
    description: 'Detail-first one-product page with specs + FAQ emphasis.',
    image: '/template-previews/split-specs.svg',
    colors: { primary: '#ffffff', secondary: '#f8fafc', accent: '#2563eb' },
    features: ['Specs section', 'FAQ blocks', 'Clean layout', 'Optional upsells'],
  },
  {
    id: 'babyos',
    name: 'Babyos',
    category: 'Storefront',
    icon: '👶',
    description: 'Playful baby-storefront with editable layout and colors.',
    image: '/template-previews/baby.png',
    colors: { primary: '#F97316', secondary: '#FDF8F3', accent: '#F97316' },
    features: ['Hero', 'Description block', 'Product grid', 'Fully editable tokens'],
  },
  {
    id: 'bags',
    name: 'Bags Editorial',
    category: 'Storefront',
    icon: '👜',
    description: 'Editorial layout with spotlight cards and collection grid.',
    image: '/template-previews/bags.png',
    colors: { primary: '#111827', secondary: '#ffffff', accent: '#111827' },
    features: ['Editorial hero', 'Spotlight cards', 'Collection grid', 'Shared edit contract'],
  },
  {
    id: 'jewelry',
    name: 'JewelryOS',
    category: 'Storefront',
    icon: '💍',
    description: 'Minimal luxury jewelry with gold glow and collection filtering.',
    image: '/template-previews/jewelry.png',
    colors: { primary: '#111827', secondary: '#ffffff', accent: '#d4af37' },
    features: ['Sticky header', 'Hero highlight', 'Collection filters', 'Product grid'],
  },
];

export function getAllTemplates(): Template[] {
  return templates;
}

export function getTemplate(id: string): Template | undefined {
  return templates.find(t => t.id === id);
}

export function getTemplatesByCategory(category: string): Template[] {
  const normalized = String(category || '').trim().toLowerCase();
  // Backwards-compatible aliases
  const resolvedCategory =
    normalized === 'single product' ||
    normalized === 'single-product' ||
    normalized === 'single_product' ||
    normalized === 'landing pages' ||
    normalized === 'landing-pages' ||
    normalized === 'landing_pages'
      ? 'Landing Pages'
      : category;

  return templates.filter(t => t.category === resolvedCategory);
}
