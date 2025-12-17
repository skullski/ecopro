// Template definitions for store storefronts
export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail?: string;
  features: string[];
}

const templates: Template[] = [
  {
    id: 'bags',
    name: 'Bags',
    category: 'fashion',
    description: 'Modern bag store template with product showcase',
    features: ['Product grid', 'Cart integration', 'Filter by category'],
  },
  {
    id: 'fashion-minimal',
    name: 'Fashion Minimal',
    category: 'fashion',
    description: 'Clean and minimal fashion store design',
    features: ['Minimalist design', 'Product details', 'Customer reviews'],
  },
  {
    id: 'fashion-modern',
    name: 'Fashion Modern',
    category: 'fashion',
    description: 'Modern fashion store with trending products',
    features: ['Trending section', 'Sale indicators', 'Size/color options'],
  },
  {
    id: 'fashion-premium',
    name: 'Fashion Premium',
    category: 'fashion',
    description: 'Premium luxury fashion template',
    features: ['Luxury styling', 'Product gallery', 'Premium checkout'],
  },
  {
    id: 'electronics',
    name: 'Electronics',
    category: 'tech',
    description: 'Electronics store with detailed specs',
    features: ['Tech specs', 'Comparison tool', 'Reviews section'],
  },
  {
    id: 'furniture',
    name: 'Furniture',
    category: 'home',
    description: 'Furniture showroom template',
    features: ['3D preview', 'Room planner', 'Material options'],
  },
  {
    id: 'jewelry',
    name: 'Jewelry',
    category: 'luxury',
    description: 'Jewelry store with detailed product images',
    features: ['High-res images', 'Material info', 'Certificate display'],
  },
  {
    id: 'perfume',
    name: 'Perfume',
    category: 'beauty',
    description: 'Perfume/fragrance store template',
    features: ['Scent notes', 'Size options', 'Sample requests'],
  },
  {
    id: 'beauty',
    name: 'Beauty',
    category: 'beauty',
    description: 'Cosmetics and beauty products store',
    features: ['Product benefits', 'How-to guides', 'Reviews'],
  },
  {
    id: 'food',
    name: 'Food',
    category: 'food',
    description: 'Food delivery and restaurant template',
    features: ['Menu management', 'Delivery tracking', 'Special offers'],
  },
  {
    id: 'cafe',
    name: 'Cafe',
    category: 'food',
    description: 'Cafe and coffee shop template',
    features: ['Menu display', 'Reservation system', 'Special events'],
  },
  {
    id: 'baby',
    name: 'Baby Products',
    category: 'kids',
    description: 'Baby products and accessories store',
    features: ['Safety info', 'Age guides', 'Bundle deals'],
  },
];

export function getAllTemplates(): Template[] {
  return templates;
}

export function getTemplate(id: string): Template | undefined {
  return templates.find(t => t.id === id);
}

export function getTemplatesByCategory(category: string): Template[] {
  return templates.filter(t => t.category === category);
}
