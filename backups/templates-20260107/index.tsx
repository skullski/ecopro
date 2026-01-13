import { TemplateProps } from '../types';
import BagsTemplate from './bags/BagsTemplate';
import JewelryTemplate from './jewelry/JewelryTemplate';

/**
 * Storefront templates (legacy folder name).
 */
export type GoldTemplateId = 'bags' | 'jewelry';

export function RenderGoldStorefront(t: GoldTemplateId | string, props: TemplateProps) {
  const raw = String(t || '').trim().replace(/^gold-/, '');
  if (raw === 'jewelry') return <JewelryTemplate {...props} />;
  if (raw === 'bags') return <BagsTemplate {...props} />;
  return <BagsTemplate {...props} />;
}

export { BagsTemplate };
export { JewelryTemplate };
