import { TemplateProps } from './types';
import ShiroHanaTemplate from './gold/shiro-hana/ShiroHanaTemplate';
import BabyosTemplate from './gold/babyos/BabyosTemplate';
import BagsTemplate from './gold/bags/BagsTemplate';
import JewelryTemplate from './gold/jewelry/JewelryTemplate';
import FashionTemplate from './gold/fashion/FashionTemplate';
import ElectronicsTemplate from './gold/electronics/ElectronicsTemplate';
import BeautyTemplate from './gold/beauty/BeautyTemplate';
import FoodTemplate from './gold/food/FoodTemplate';
import CafeTemplate from './gold/cafe/CafeTemplate';
import FurnitureTemplate from './gold/furniture/FurnitureTemplate';
import PerfumeTemplate from './gold/perfume/PerfumeTemplate';

/**
 * Available template IDs.
 */
export type TemplateId = 
  | 'shiro-hana' 
  | 'babyos' 
  | 'bags' 
  | 'jewelry'
  | 'fashion'
  | 'electronics'
  | 'beauty'
  | 'food'
  | 'cafe'
  | 'furniture'
  | 'perfume';

/**
 * Normalize template ID.
 */
export function normalizeTemplateId(t: string): TemplateId {
  const raw = String(t || '')
    .trim()
    .toLowerCase()
    .replace(/^gold-/, '')
    .replace(/-gold$/, '');
  if (!raw || raw === 'classic') return 'shiro-hana';
  if (raw === 'jewelry') return 'jewelry';
  if (raw === 'bags') return 'bags';
  if (raw === 'babyos' || raw === 'baby') return 'babyos';
  if (raw === 'fashion') return 'fashion';
  if (raw === 'electronics' || raw === 'tech') return 'electronics';
  if (raw === 'beauty' || raw === 'cosmetics') return 'beauty';
  if (raw === 'food' || raw === 'restaurant') return 'food';
  if (raw === 'cafe' || raw === 'bakery' || raw === 'coffee') return 'cafe';
  if (raw === 'furniture' || raw === 'home') return 'furniture';
  if (raw === 'perfume' || raw === 'fragrance') return 'perfume';
  return 'shiro-hana';
}

/**
 * Render the storefront using the template system.
 */
export function RenderStorefront(t: TemplateId | string, props: TemplateProps) {
  const id = normalizeTemplateId(String(t || (props.settings as any)?.template || ''));
  if (id === 'jewelry') return <JewelryTemplate {...props} />;
  if (id === 'bags') return <BagsTemplate {...props} />;
  if (id === 'babyos') return <BabyosTemplate {...props} />;
  if (id === 'fashion') return <FashionTemplate {...props} />;
  if (id === 'electronics') return <ElectronicsTemplate {...props} />;
  if (id === 'beauty') return <BeautyTemplate {...props} />;
  if (id === 'food') return <FoodTemplate {...props} />;
  if (id === 'cafe') return <CafeTemplate {...props} />;
  if (id === 'furniture') return <FurnitureTemplate {...props} />;
  if (id === 'perfume') return <PerfumeTemplate {...props} />;
  return <ShiroHanaTemplate {...props} />;
}

// Re-export all templates
export { ShiroHanaTemplate };
export { BabyosTemplate };
export { BagsTemplate };
export { JewelryTemplate };
export { FashionTemplate };
export { ElectronicsTemplate };
export { BeautyTemplate };
export { FoodTemplate };
export { CafeTemplate };
export { FurnitureTemplate };
export { PerfumeTemplate };
