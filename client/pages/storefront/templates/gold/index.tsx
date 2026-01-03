import { TemplateProps } from '../types';
import ShiroHanaTemplate from './shiro-hana/ShiroHanaTemplate';
import BabyosTemplate from './babyos/BabyosTemplate';

/**
 * Gold templates index.
 * Currently only Shiro Hana is available.
 */
export type GoldTemplateId = 'shiro-hana' | 'babyos';

export function RenderGoldStorefront(t: GoldTemplateId | string, props: TemplateProps) {
  const raw = String(t || '').trim().replace(/^gold-/, '');
  if (raw === 'babyos') return <BabyosTemplate {...props} />;
  return <ShiroHanaTemplate {...props} />;
}

// Re-export template
export { ShiroHanaTemplate };
export { BabyosTemplate };
