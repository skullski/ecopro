import { TemplateProps } from '../types';

import ShiroHanaTemplate from './shiro-hana/ShiroHanaTemplate';
import BabyGoldTemplate from '@/components/templates/baby_gold';

/**
 * @deprecated Gold template distinction is removed.
 * All templates are now equal - just different renderers.
 * Use the main template index instead.
 */
export type GoldTemplateId = 'gold-shiro-hana' | 'gold-baby';

/**
 * @deprecated Use RenderStorefront from '../index' instead.
 * This is kept for backward compatibility only.
 */
export function RenderGoldStorefront(t: GoldTemplateId, props: TemplateProps) {
  console.warn('[DEPRECATED] RenderGoldStorefront is deprecated. Use RenderStorefront instead.');
  switch (t) {
    case 'gold-shiro-hana':
      return <ShiroHanaTemplate {...props} />;
    case 'gold-baby':
      return <BabyGoldTemplate {...props} />;
    default:
      return <ShiroHanaTemplate {...props} />;
  }
}

// Re-export templates directly (new way)
export { ShiroHanaTemplate, BabyGoldTemplate };
