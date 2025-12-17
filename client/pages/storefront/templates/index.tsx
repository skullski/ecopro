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

export type TemplateId = 'classic' | 'supreme' | 'maximize' | 'fullframe' | 'stockist' | 'walidstore' | 'minimal' | 'catalog' | 'fashion' | 'fashion2' | 'fashion3' | 'electronics' | 'food' | 'furniture' | 'jewelry' | 'perfume' | 'baby' | 'bags' | 'beauty' | 'cafe';

export function RenderStorefront(t: TemplateId, props: TemplateProps) {
  console.log('[RenderStorefront] Template ID:', t);
  switch (t) {
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
      // Default to fashion template instead of mercury
      console.log('[RenderStorefront] No template matched, using fashion as default');
      return <FashionTemplate {...props} />;
  }
}
