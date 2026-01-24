import { safeJsonParse } from '@/utils/safeJson';

export const STOREFRONT_TEMPLATE_KEY = 'storefront_template_v1';
export const STOREFRONT_SETTINGS_KEY = 'storefront_storeSettings_v1';

export function readStorefrontTemplate(fallback = 'fashion'): string {
  if (typeof window === 'undefined') return fallback;
  const next = (localStorage.getItem(STOREFRONT_TEMPLATE_KEY) || '').trim();
  if (next) return next;
  const legacy = (localStorage.getItem('template') || '').trim();
  return legacy || fallback;
}

export function readStorefrontSettings<T extends Record<string, any> = Record<string, any>>(
  fallback: T
): T {
  if (typeof window === 'undefined') return fallback;
  const raw = localStorage.getItem(STOREFRONT_SETTINGS_KEY) ?? localStorage.getItem('storeSettings');
  const parsed = safeJsonParse<T>(raw, fallback as any);
  return parsed && typeof parsed === 'object' ? parsed : fallback;
}

export function writeStorefrontTemplate(templateId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STOREFRONT_TEMPLATE_KEY, String(templateId || '').trim());
  } catch {
    // ignore
  }
}

export function writeStorefrontSettings(settings: any): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STOREFRONT_SETTINGS_KEY, JSON.stringify(settings || {}));
  } catch {
    // ignore
  }
}
