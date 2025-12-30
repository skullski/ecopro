import { TemplateProps } from './types';
import BaseTemplate from './Base';
import EditorialTemplate from './Editorial';
import MaximizeTemplate from './Maximize';
import FashionTemplate from '@/components/templates/fashion';
import Fashion2Template from '@/components/templates/fashion2';
import Fashion3Template from '@/components/templates/fashion3';
import ElectronicsTemplate from '@/components/templates/electronics';
import FoodTemplate from '@/components/templates/food';
import FurnitureTemplate from '@/components/templates/furniture';
import JewelryTemplate from '@/components/templates/jewelry';
import PerfumeTemplate from '@/components/templates/perfume';
import BabyTemplate from '@/components/templates/baby';
import BagsTemplate from '@/components/templates/bags';
import BeautyTemplate from '@/components/templates/beauty';
import CafeTemplate from '@/components/templates/cafe';
import StoreTemplate from '@/components/templates/store';

// Schema-driven templates (render from Universal Store Schema)
import ShiroHanaTemplate from './gold/shiro-hana/ShiroHanaTemplate';
import BabyGoldTemplate from '@/components/templates/baby_gold';

/**
 * All available template renderers.
 * 
 * NOTE: There is no more "silver" vs "gold" distinction.
 * All templates are equal - they just render the Universal Store Schema differently.
 * The difference is in the EDITOR MODE (basic vs advanced), not the template.
 */
export type TemplateId =
  // Schema-driven templates (recommended)
  | 'shiro-hana'
  | 'baby-gold'
  // Legacy templates (will be migrated to schema-driven)
  | 'classic'
  | 'supreme'
  | 'maximize'
  | 'fullframe'
  | 'stockist'
  | 'walidstore'
  | 'minimal'
  | 'catalog'
  | 'fashion'
  | 'fashion2'
  | 'fashion3'
  | 'electronics'
  | 'food'
  | 'furniture'
  | 'jewelry'
  | 'perfume'
  | 'baby'
  | 'bags'
  | 'beauty'
  | 'cafe'
  | 'store'
  // Backwards compatibility aliases (deprecated - will be removed)
  | 'gold-shiro-hana'
  | 'gold-baby';

/**
 * Normalize template ID - removes deprecated prefixes
 */
export function normalizeTemplateId(t: string): TemplateId {
  // Remove deprecated gold- prefix
  if (t.startsWith('gold-')) {
    return t.replace('gold-', '') as TemplateId;
  }
  return t as TemplateId;
}

export function RenderStorefront(t: TemplateId, props: TemplateProps) {
  // Normalize template ID
  const templateId = normalizeTemplateId(t);
  console.log('[RenderStorefront] Template ID:', templateId, '(original:', t, ')');

  switch (templateId) {
    // Schema-driven templates (recommended)
    case 'shiro-hana':
      return <ShiroHanaTemplate {...props} />;
    case 'baby-gold':
      return <BabyGoldTemplate {...props} />;
    
    // Legacy category templates
    case 'fashion':
      console.log('[RenderStorefront] Rendering fashion template');
      return <FashionTemplate {...props} />;
    case 'fashion2':
      return <Fashion2Template {...props} />;
    case 'fashion3':
      return <Fashion3Template {...props} />;
    case 'electronics':
      return <ElectronicsTemplate {...props} />;
    case 'food':
      return <FoodTemplate {...props} />;
    case 'furniture':
      return <FurnitureTemplate {...props} />;
    case 'jewelry':
      return <JewelryTemplate {...props} />;
    case 'perfume':
      return <PerfumeTemplate {...props} />;
    case 'baby':
      return <BabyTemplate {...props} />;
    case 'bags':
      return <BagsTemplate {...props} />;
    case 'beauty':
      return <BeautyTemplate {...props} />;
    case 'cafe':
      return <CafeTemplate {...props} />;
    case 'store':
      return <StoreTemplate {...props} />;
    
    // Legacy base templates
    case 'supreme':
      return <EditorialTemplate {...props} mode="supreme" />;
    case 'fullframe':
      return <EditorialTemplate {...props} mode="fullframe" />;
    case 'maximize':
      return <MaximizeTemplate {...props} />;
    case 'stockist':
      return <BaseTemplate {...props} variant="stockist" />;
    case 'walidstore':
      return <BaseTemplate {...props} variant="walidstore" />;
    case 'minimal':
      return <BaseTemplate {...props} variant="minimal" />;
    case 'catalog':
      return <BaseTemplate {...props} variant="catalog" />;
    
    case 'classic':
    default:
      // Default to shiro-hana (schema-driven) for new stores
      console.log('[RenderStorefront] No template matched, using shiro-hana as default');
      return <ShiroHanaTemplate {...props} />;
  }
}
