import { TemplateProps } from '../types';
import ShiroHanaTemplate from './shiro-hana/ShiroHanaTemplate';
import BabyosTemplate from './babyos/BabyosTemplate';
import BagsTemplate from './bags/BagsTemplate';
import JewelryTemplate from './jewelry/JewelryTemplate';

/**
 * Storefront templates (legacy folder name).
 */
export type GoldTemplateId = 'shiro-hana' | 'babyos' | 'bags' | 'jewelry';

export function RenderGoldStorefront(t: GoldTemplateId | string, props: TemplateProps) {
  const raw = String(t || '').trim().replace(/^gold-/, '');
  if (raw === 'jewelry') return <JewelryTemplate {...props} />;
  if (raw === 'bags') return <BagsTemplate {...props} />;
  if (raw === 'babyos' || raw === 'baby') return <BabyosTemplate {...props} />;
  return <ShiroHanaTemplate {...props} />;
}

// Re-export template
export { ShiroHanaTemplate };
export { BabyosTemplate };
export { BagsTemplate };
export { JewelryTemplate };
