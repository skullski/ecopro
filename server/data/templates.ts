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
    id: 'babyos',
    name: 'Babyos',
    category: 'Storefront',
    icon: '👶',
    description: 'Playful baby-storefront with editable layout and colors.',
    image: '/template-previews/baby.png',
    colors: { primary: '#F97316', secondary: '#FDF8F3', accent: '#F97316' },
    features: ['Hero', 'Category pills', 'Product grid', 'Fully editable tokens'],
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
  return templates.filter(t => t.category === category);
}
