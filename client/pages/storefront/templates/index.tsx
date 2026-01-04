import { TemplateProps } from './types';
import ShiroHanaTemplate from './gold/shiro-hana/ShiroHanaTemplate';
import BabyosTemplate from './gold/babyos/BabyosTemplate';
import BagsTemplate from './gold/bags/BagsTemplate';
import JewelryTemplate from './gold/jewelry/JewelryTemplate';

/**
 * Available template IDs.
 */
export type TemplateId = 'shiro-hana' | 'babyos' | 'bags' | 'jewelry';

/**
 * Normalize template ID - all templates render as shiro-hana for now
 */
export function normalizeTemplateId(t: string): TemplateId {
  const raw = String(t || '').trim().replace(/^gold-/, '');
  if (raw === 'jewelry') return 'jewelry';
  if (raw === 'bags') return 'bags';
  if (raw === 'babyos' || raw === 'baby') return 'babyos';
  return 'shiro-hana';
}

/**
 * Render the storefront using the template system.
 * Currently all stores use the Shiro Hana template.
 */
export function RenderStorefront(t: TemplateId | string, props: TemplateProps) {
  const id = normalizeTemplateId(String(t || (props.settings as any)?.template || ''));
  if (id === 'jewelry') return <JewelryTemplate {...props} />;
  if (id === 'bags') return <BagsTemplate {...props} />;
  if (id === 'babyos') return <BabyosTemplate {...props} />;
  return <ShiroHanaTemplate {...props} />;
}

// Re-export the template directly
export { ShiroHanaTemplate };
export { BabyosTemplate };
export { BagsTemplate };
export { JewelryTemplate };
