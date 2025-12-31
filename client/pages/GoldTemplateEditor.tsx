import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, RotateCcw, RotateCw, Save, ShieldAlert, Settings, Sparkles, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { RenderStorefront } from './storefront/templates';
import { getCurrentUser } from '@/lib/auth';
import baseShiroHanaHome from './storefront/templates/gold/shiro-hana-home.json';
import baseBabyHome from './storefront/templates/gold/baby-home.json';
import baseFashionHome from './storefront/templates/gold/fashion-home.json';
import baseElectronicsHome from './storefront/templates/gold/electronics-home.json';
import baseBeautyHome from './storefront/templates/gold/beauty-home.json';
import baseJewelryHome from './storefront/templates/gold/jewelry-home.json';
import baseFoodHome from './storefront/templates/gold/food-home.json';
import baseCafeHome from './storefront/templates/gold/cafe-home.json';
import basePerfumeHome from './storefront/templates/gold/perfume-home.json';
import baseBagsHome from './storefront/templates/gold/bags-home.json';
import baseFurnitureHome from './storefront/templates/gold/furniture-home.json';
import { uploadImage } from '@/lib/api';
import { migrateShiroHanaDoc } from './storefront/templates/gold/shiro-hana/migrations';
import type { EditorMode } from '@/lib/templateEditorSchema';

// ============================================================================
// TEMPLATE LIST - All available templates with preview images
// ============================================================================

const templateList = [
  { id: 'shiro-hana', label: 'Shiro Hana', preview: '/template-previews/shiro-hana.png', category: 'premium' },
  { id: 'fashion', label: 'Fashion', preview: '/template-previews/fashion.png', category: 'fashion' },
  { id: 'fashion2', label: 'Fashion 2', preview: '/template-previews/fashion2.png', category: 'fashion' },
  { id: 'fashion3', label: 'Fashion 3', preview: '/template-previews/fashion3.png', category: 'fashion' },
  { id: 'electronics', label: 'Electronics', preview: '/template-previews/electronics.png', category: 'tech' },
  { id: 'food', label: 'Food', preview: '/template-previews/food.png', category: 'food' },
  { id: 'furniture', label: 'Furniture', preview: '/template-previews/furniture.png', category: 'home' },
  { id: 'jewelry', label: 'Jewelry', preview: '/template-previews/jewelry.png', category: 'jewelry' },
  { id: 'perfume', label: 'Perfume', preview: '/template-previews/perfume.png', category: 'beauty' },
  { id: 'baby', label: 'Baby', preview: '/template-previews/baby.png', category: 'baby' },
  { id: 'bags', label: 'Bags', preview: '/template-previews/bags.png', category: 'fashion' },
  { id: 'beauty', label: 'Beauty', preview: '/template-previews/beauty.png', category: 'beauty' },
  { id: 'cafe', label: 'Cafe', preview: '/template-previews/cafe.png', category: 'food' },
  { id: 'store', label: 'Store', preview: '/template-previews/store.png', category: 'general' },
];

type SubscriptionRow = {
  tier?: string | null;
  status?: string | null;
  trial_started_at?: string | null;
  trial_ends_at?: string | null;
  current_period_start?: string | null;
  current_period_end?: string | null;
} | null;

type MeResponse = {
  id: string;
  email: string;
  name: string;
  role: string;
  user_type?: string | null;
  subscription?: SubscriptionRow;
};

type AuthMeResponse = {
  id: string | number;
  email: string;
  name: string;
  role: string;
  user_type?: string | null;
};

function normalizeEmail(input?: string | null): string {
  return String(input || '').trim().toLowerCase();
}

type StoreSettings = {
  [key: string]: any;
  store_slug?: string;
  store_name?: string;
  store_description?: string;
  store_logo?: string;
  banner_url?: string | null;
  primary_color?: string;
  secondary_color?: string;
  currency_code?: string;
  template?: string;
  owner_name?: string | null;
  owner_email?: string | null;
  seller_name?: string | null;
  seller_email?: string | null;
  template_hero_heading?: string | null;
  template_hero_subtitle?: string | null;
  template_button_text?: string | null;
  template_accent_color?: string | null;
  hero_tile1_url?: string | null;
  hero_tile2_url?: string | null;
};

type StoreProduct = {
  id: number;
  title: string;
  description?: string;
  price: number;
  original_price?: number;
  images?: string[];
  category?: string;
  stock_quantity: number;
  is_featured: boolean;
  slug: string;
  views: number;
};

type Breakpoint = 'mobile' | 'tablet' | 'desktop';
type EditBreakpoint = 'all' | Breakpoint;

function clampNumber(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function sanitizeNumberForPath(path: string, value: number): number {
  const p = String(path || '');

  // Normalized ratios
  if (/\.(posX|posY)$/.test(p) || p === 'styles.background.posX' || p === 'styles.background.posY') {
    return clampNumber(value, 0, 1);
  }
  if (/\.opacity$/.test(p) || p === 'styles.background.opacity') {
    return clampNumber(value, 0, 1);
  }

  // Grid columns
  if (p === 'layout.featured.columns') {
    return Math.round(clampNumber(value, 1, 6));
  }

  // Image transforms
  if (/\.(scaleX|scaleY|size)$/.test(p)) {
    return clampNumber(value, 0.1, 5);
  }

  // Typography
  if (/\.style\.fontSize$/.test(p)) {
    return clampNumber(value, 8, 96);
  }
  if (/\.style\.fontWeight$/.test(p)) {
    return Math.round(clampNumber(value, 100, 900));
  }
  if (/\.style\.lineHeight$/.test(p)) {
    return clampNumber(value, 0.8, 4);
  }
  if (/\.style\.letterSpacing$/.test(p)) {
    return clampNumber(value, -5, 20);
  }

  // Common spacing
  if (/\.(paddingX|paddingY|gap|radius|imageHeight)$/.test(p) || /\.style\.(padding|margin)$/.test(p)) {
    return clampNumber(value, 0, 800);
  }

  return value;
}

function sanitizeValueForPath(path: string, next: any): { value: any; changed: boolean } {
  if (typeof next === 'number') {
    const sanitized = sanitizeNumberForPath(path, next);
    return { value: sanitized, changed: sanitized !== next };
  }

  if (next && typeof next === 'object' && !Array.isArray(next)) {
    const keys = ['mobile', 'tablet', 'desktop'] as const;
    const looksResponsive = keys.some((k) => Object.prototype.hasOwnProperty.call(next, k));
    if (!looksResponsive) return { value: next, changed: false };

    let changed = false;
    const out: any = { ...next };
    for (const k of keys) {
      if (typeof out[k] === 'number') {
        const sanitized = sanitizeNumberForPath(path, out[k]);
        if (sanitized !== out[k]) changed = true;
        out[k] = sanitized;
      }
    }
    return { value: out, changed };
  }

  return { value: next, changed: false };
}

type ContentWarning = { path: string; message: string };

function isValidAction(action: string): boolean {
  const a = String(action || '').trim();
  if (!a) return false;
  if (a === '#') return true;
  if (a.startsWith('/')) return true;
  if (/^https?:\/\//i.test(a)) return true;
  return false;
}

function collectContentWarnings(doc: any): ContentWarning[] {
  const out: ContentWarning[] = [];
  const push = (path: string, message: string) => out.push({ path, message });

  const header = doc?.layout?.header;
  const hero = doc?.layout?.hero;
  const featured = doc?.layout?.featured;
  const footer = doc?.layout?.footer;

  if (header?.logo && !String(header.logo.alt || '').trim()) {
    push('layout.header.logo', 'Header logo is missing alt text');
  }
  if (hero?.image && !String(hero.image.alt || '').trim()) {
    push('layout.hero.image', 'Hero image is missing alt text');
  }

  const featuredItems = Array.isArray(featured?.items) ? featured.items : [];
  featuredItems.forEach((p: any, i: number) => {
    if (p?.image && !String(p.image.alt || '').trim()) {
      const seg = (p && (typeof p.id === 'string' || typeof p.id === 'number')) ? String(p.id) : String(i);
      push(`layout.featured.items.${seg}.image`, 'Product image is missing alt text');
    }
  });

  const textPaths = [
    'layout.hero.title',
    'layout.hero.subtitle',
    'layout.featured.addLabel',
    'layout.footer.copyright',
  ];
  for (const path of textPaths) {
    const v = resolveBySchemaPath(doc, path).value;
    const value = typeof v?.value === 'string' ? v.value : '';
    if (v && typeof v === 'object' && v.type === 'text' && !value.trim()) {
      push(path, 'Text is empty');
    }
  }

  const headerNav = Array.isArray(header?.nav) ? header.nav : [];
  headerNav.forEach((n: any, i: number) => {
    const isLink = n && typeof n === 'object' && typeof n.action === 'string';
    const label = isLink ? n.label : n;
    const labelPath = isLink ? `layout.header.nav.${i}.label` : `layout.header.nav.${i}`;
    const labelText = typeof label?.value === 'string' ? label.value : '';
    if (label && typeof label === 'object' && label.type === 'text' && !labelText.trim()) {
      push(labelPath, 'Nav label is empty');
    }
    if (isLink && !isValidAction(String(n.action || '')))
      push(labelPath, 'Nav link action is missing/invalid');
  });

  const footerLinks = Array.isArray(footer?.links) ? footer.links : [];
  footerLinks.forEach((l: any, i: number) => {
    const isLink = l && typeof l === 'object' && typeof l.action === 'string';
    const label = isLink ? l.label : l;
    const labelPath = isLink ? `layout.footer.links.${i}.label` : `layout.footer.links.${i}`;
    const labelText = typeof label?.value === 'string' ? label.value : '';
    if (label && typeof label === 'object' && label.type === 'text' && !labelText.trim()) {
      push(labelPath, 'Footer link label is empty');
    }
    if (isLink && !isValidAction(String(l.action || '')))
      push(labelPath, 'Footer link action is missing/invalid');
  });

  const heroCtas = Array.isArray(hero?.cta) ? hero.cta : [];
  heroCtas.forEach((c: any, i: number) => {
    const labelText = typeof c?.label?.value === 'string' ? c.label.value : '';
    const labelPath = `layout.hero.cta.${i}.label`;
    if (c?.label && typeof c.label === 'object' && c.label.type === 'text' && !labelText.trim()) {
      push(labelPath, 'CTA label is empty');
    }
    if (!isValidAction(String(c?.action || '')))
      push(labelPath, 'CTA action is missing/invalid');
  });

  const headerCtas = Array.isArray(header?.cta) ? header.cta : [];
  headerCtas.forEach((c: any, i: number) => {
    const labelText = typeof c?.label?.value === 'string' ? c.label.value : '';
    const labelPath = `layout.header.cta.${i}.label`;
    if (c?.label && typeof c.label === 'object' && c.label.type === 'text' && !labelText.trim()) {
      push(labelPath, 'CTA label is empty');
    }
    if (!isValidAction(String(c?.action || '')))
      push(labelPath, 'CTA action is missing/invalid');
  });

  return out;
}

function getResponsiveNumber(value: any, bp: EditBreakpoint): number | undefined {
  if (typeof value === 'number') return value;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  if (bp === 'all') {
    const fallback = value?.desktop;
    return typeof fallback === 'number' ? fallback : undefined;
  }
  const byBp = value?.[bp];
  if (typeof byBp === 'number') return byBp;
  const fallback = value?.desktop;
  return typeof fallback === 'number' ? fallback : undefined;
}

function setResponsiveNumber(current: any, bp: EditBreakpoint, next: number): any {
  if (bp === 'all') return next;
  const base: any = (current && typeof current === 'object' && !Array.isArray(current)) ? { ...current } : {};
  if (typeof current === 'number') base.desktop = current;
  base[bp] = next;
  return base;
}

function isResponsiveNumberPath(path: string): boolean {
  const p = String(path || '');
  if (!p) return false;

  // Layout
  if (p === 'layout.header.paddingX' || p === 'layout.header.paddingY') return true;
  if (p === 'layout.hero.paddingX' || p === 'layout.hero.paddingY' || p === 'layout.hero.gap' || p === 'layout.hero.imageHeight') return true;
  if (p === 'layout.footer.paddingX' || p === 'layout.footer.paddingY') return true;
  if (p === 'layout.featured.columns' || p === 'layout.featured.gap' || p === 'layout.featured.paddingX' || p === 'layout.featured.paddingY') return true;
  if (p === 'layout.featured.card.radius' || p === 'layout.featured.card.imageHeight') return true;

  // Background
  if (p === 'styles.background.posX' || p === 'styles.background.posY' || p === 'styles.background.opacity') return true;

  // Image transforms anywhere in schema
  if (/\.(posX|posY|scaleX|scaleY|size)$/.test(p)) return true;

  // Text style numeric overrides (typography)
  if (/\.style\.(fontSize|lineHeight|letterSpacing|fontWeight|padding|margin)$/.test(p)) return true;

  return false;
}

function moveArrayItem<T>(arr: T[], from: number, to: number): T[] {
  const next = arr.slice();
  const clampedFrom = Math.max(0, Math.min(next.length - 1, from));
  const clampedTo = Math.max(0, Math.min(next.length - 1, to));
  if (clampedFrom === clampedTo) return next;
  const [item] = next.splice(clampedFrom, 1);
  next.splice(clampedTo, 0, item);
  return next;
}

const EDITABLE_FIELDS: Array<{ key: keyof StoreSettings; label: string; type: 'text' | 'textarea' | 'url' | 'color' }> = [
  { key: 'store_name', label: 'Store Name', type: 'text' },
  { key: 'store_description', label: 'Store Description', type: 'textarea' },
  { key: 'store_logo', label: 'Store Logo URL', type: 'url' },
  { key: 'banner_url', label: 'Banner URL', type: 'url' },
  { key: 'primary_color', label: 'Primary Color', type: 'color' },
  { key: 'secondary_color', label: 'Secondary Color', type: 'color' },
  { key: 'template_hero_heading', label: 'Hero Heading', type: 'text' },
  { key: 'template_hero_subtitle', label: 'Hero Subtitle', type: 'text' },
  { key: 'template_button_text', label: 'Hero Button Text', type: 'text' },
  { key: 'template_accent_color', label: 'Template Accent Color', type: 'color' },
];

function normalizeTier(input?: string | null): string {
  return String(input || '').trim().toLowerCase();
}

function canUseAdvancedEditor(tier: string): boolean {
  // Allow all authenticated users to use advanced editor
  // Previously required gold/platinum tier, now open to all
  return true;
}

function isAdvancedSettingsKey(settingsKey: string): boolean {
  const k = String(settingsKey || '').trim().toLowerCase();

  // Explicit Basic allows
  if (k === 'banner_url') return false; // hero image upload/change is BASIC
  if (k === 'template_hero_video_url') return false; // add video url is BASIC
  if (k === 'enable_dark_mode') return false; // dark mode toggle is BASIC

  // Advanced controls (resize/layout/structure-ish controls)
  return (
    /template_hero_image_(scale|pos_x|pos_y|fit)/.test(k) ||
    /template_hero_video_(autoplay|loop|muted)/.test(k) ||
    /^(border_radius|section_padding|card_padding|grid_columns|grid_gap)$/.test(k) ||
    /^(enable_animations|show_product_shadows|enable_parallax)$/.test(k) ||
    /^(product_card_style|product_image_ratio|show_quick_view)$/.test(k)
  );
}

function isAdvancedSelectedPath(selectedPath: string | null): boolean {
  if (!selectedPath) return false;

  // Any schema/path editing (not __settings) is considered Advanced.
  if (!selectedPath.startsWith('__settings.')) return true;

  const key = selectedPath.replace('__settings.', '');
  return isAdvancedSettingsKey(key);
}

function inferSelectedKey(target: EventTarget | null, settings: StoreSettings): keyof StoreSettings | null {
  if (!target || !(target instanceof HTMLElement)) return null;

  const storeName = (settings.store_name || '').trim();
  const storeDescription = (settings.store_description || '').trim();

  // Images
  if (target instanceof HTMLImageElement) {
    const src = target.currentSrc || target.src || '';
    if (settings.store_logo && src.includes(String(settings.store_logo))) return 'store_logo';
    if (settings.banner_url && src.includes(String(settings.banner_url))) return 'banner_url';
  }

  // Text
  const text = (target.textContent || '').trim();
  if (storeName && text === storeName) return 'store_name';
  if (storeDescription && text === storeDescription) return 'store_description';

  if (settings.template_hero_heading && text === String(settings.template_hero_heading).trim()) return 'template_hero_heading';
  if (settings.template_hero_subtitle && text === String(settings.template_hero_subtitle).trim()) return 'template_hero_subtitle';
  if (settings.template_button_text && text === String(settings.template_button_text).trim()) return 'template_button_text';

  return null;
}

function parseSchemaPath(path: string): string[] {
  return String(path || '')
    .split('.')
    .map((s) => s.trim())
    .filter(Boolean);
}

function isNumericSegment(seg: string): boolean {
  return /^\d+$/.test(seg);
}

function resolveBySchemaPath(root: any, path: string): { parent: any; key: string | number | null; value: any } {
  const parts = parseSchemaPath(path);
  let parent: any = null;
  let current: any = root;
  let key: any = null;

  for (const seg of parts) {
    parent = current;
    key = seg;

    if (Array.isArray(current)) {
      if (isNumericSegment(seg)) {
        key = Number(seg);
        current = current[key];
      } else {
        const found = current.find((x) => x && typeof x === 'object' && String(x.id) === seg);
        current = found;
      }
      continue;
    }

    if (current && typeof current === 'object') {
      current = current[seg];
      continue;
    }

    current = undefined;
  }

  return { parent, key, value: current };
}

function setBySchemaPath(root: any, path: string, nextValue: any): any {
  const parts = parseSchemaPath(path);
  if (!parts.length) return root;

  const cloneDeep = (v: any): any => {
    if (Array.isArray(v)) return v.map(cloneDeep);
    if (v && typeof v === 'object') {
      const out: any = {};
      for (const [k, val] of Object.entries(v)) out[k] = cloneDeep(val);
      return out;
    }
    return v;
  };

  const nextRoot = cloneDeep(root);
  let current: any = nextRoot;

  for (let i = 0; i < parts.length - 1; i++) {
    const seg = parts[i];
    const nextSeg = parts[i + 1];

    if (Array.isArray(current)) {
      if (isNumericSegment(seg)) {
        current = current[Number(seg)];
      } else {
        current = current.find((x) => x && typeof x === 'object' && String(x.id) === seg);
      }
      continue;
    }

    if (current && typeof current === 'object') {
      if (current[seg] == null) {
        current[seg] = isNumericSegment(nextSeg) ? [] : {};
      }
      current = current[seg];
      continue;
    }
  }

  const last = parts[parts.length - 1];
  if (Array.isArray(current)) {
    if (isNumericSegment(last)) current[Number(last)] = nextValue;
    else {
      const idx = current.findIndex((x) => x && typeof x === 'object' && String(x.id) === last);
      if (idx >= 0) current[idx] = nextValue;
    }
  } else if (current && typeof current === 'object') {
    current[last] = nextValue;
  }

  return nextRoot;
}

function findClosestEditPath(target: EventTarget | null): string | null {
  if (!target || !(target instanceof HTMLElement)) return null;
  const el = target.closest('[data-edit-path]') as HTMLElement | null;
  const path = el?.getAttribute('data-edit-path');
  return path ? String(path) : null;
}

function safeClone<T>(value: T): T {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sc = (globalThis as any)?.structuredClone;
    if (typeof sc === 'function') return sc(value);
  } catch {
    // ignore
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

function cssEscape(value: string): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const esc = (globalThis as any)?.CSS?.escape;
    if (typeof esc === 'function') return esc(value);
  } catch {
    // ignore
  }
  return String(value).replace(/[^a-zA-Z0-9_-]/g, (m) => `\\${m}`);
}

function stableStringify(value: any): string {
  const seen = new WeakSet();
  const norm = (v: any): any => {
    if (v == null) return v;
    if (typeof v !== 'object') return v;
    if (seen.has(v)) return null;
    seen.add(v);

    if (Array.isArray(v)) return v.map(norm);
    const out: any = {};
    for (const k of Object.keys(v).sort()) out[k] = norm(v[k]);
    return out;
  };

  return JSON.stringify(norm(value));
}

function getShiroDocFromSettings(s: StoreSettings): any {
  const raw = (s as any)?.gold_page_shiro_hana_home;
  const fallback = baseShiroHanaHome as any;
  return migrateShiroHanaDoc(raw && typeof raw === 'object' ? raw : fallback).doc;
}

function deepMerge(base: any, patch: any): any {
  if (patch == null) return base;
  if (Array.isArray(base) && Array.isArray(patch)) return patch;
  if (base && typeof base === 'object' && patch && typeof patch === 'object' && !Array.isArray(patch)) {
    const out: any = { ...base };
    for (const [k, v] of Object.entries(patch)) out[k] = deepMerge((base as any)[k], v);
    return out;
  }
  return patch;
}

function parseCommaList(input: any): string[] {
  if (!input) return [];
  return String(input)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function getBabyDocFromSettings(s: StoreSettings): any {
  const raw = (s as any)?.gold_page_baby_home;
  const base = safeClone(baseBabyHome as any);

  // If a doc already exists, keep it as source of truth (merged onto base).
  if (raw && typeof raw === 'object') {
    return deepMerge(base, raw);
  }

  // Otherwise, hydrate from existing flat Baby settings keys (so stores keep their current values).
  const next = safeClone(base);

  if ((s as any).template_header_search_label) next.layout.header.searchLabel = String((s as any).template_header_search_label);
  if ((s as any).template_header_cart_label) next.layout.header.cartLabel = String((s as any).template_header_cart_label);

  if ((s as any).template_hero_badge_left) next.layout.hero.badgeLeft = String((s as any).template_hero_badge_left);
  if ((s as any).template_hero_badge_right) next.layout.hero.badgeRight = String((s as any).template_hero_badge_right);
  if ((s as any).template_hero_heading) next.layout.hero.heading = String((s as any).template_hero_heading);
  if ((s as any).template_hero_subtitle) next.layout.hero.subtitle = String((s as any).template_hero_subtitle);
  if ((s as any).template_age_chips) {
    const chips = parseCommaList((s as any).template_age_chips);
    if (chips.length) next.layout.hero.ageChips = chips;
  }
  if ((s as any).template_primary_cta) next.layout.hero.primaryCta = String((s as any).template_primary_cta);
  if ((s as any).template_secondary_cta) next.layout.hero.secondaryCta = String((s as any).template_secondary_cta);
  if ((s as any).template_featured_product_label) next.layout.hero.featuredProductLabel = String((s as any).template_featured_product_label);
  if ((s as any).template_hero_image_alt) next.layout.hero.heroImageAlt = String((s as any).template_hero_image_alt);
  if ((s as any).banner_url) next.layout.hero.bannerUrl = String((s as any).banner_url);
  if ((s as any).hero_video_url) next.layout.hero.heroVideoUrl = String((s as any).hero_video_url);

  if ((s as any).template_browse_by_category_label) next.layout.categories.browseByCategoryLabel = String((s as any).template_browse_by_category_label);
  if ((s as any).template_categories_json) {
    try {
      const parsed = typeof (s as any).template_categories_json === 'string'
        ? JSON.parse(String((s as any).template_categories_json))
        : (s as any).template_categories_json;
      if (Array.isArray(parsed)) next.layout.categories.categories = parsed;
    } catch {
      // ignore
    }
  }
  if ((s as any).template_product_badge_1) next.layout.categories.productBadge1 = String((s as any).template_product_badge_1);
  if ((s as any).template_product_badge_2) next.layout.categories.productBadge2 = String((s as any).template_product_badge_2);
  if ((s as any).template_buy_now_label) next.layout.categories.buyNowLabel = String((s as any).template_buy_now_label);

  if ((s as any).template_featured_kicker) next.layout.featured.kicker = String((s as any).template_featured_kicker);
  if ((s as any).template_featured_title) next.layout.featured.title = String((s as any).template_featured_title);
  if ((s as any).template_featured_text) next.layout.featured.text = String((s as any).template_featured_text);

  if ((s as any).template_grid_kicker) next.layout.grid.kicker = String((s as any).template_grid_kicker);
  if ((s as any).template_grid_title) next.layout.grid.title = String((s as any).template_grid_title);
  if ((s as any).template_items_suffix) next.layout.grid.itemsSuffix = String((s as any).template_items_suffix);
  if ((s as any).template_empty_category_text) next.layout.grid.emptyCategoryText = String((s as any).template_empty_category_text);

  if ((s as any).template_footer_suffix) next.layout.footer.suffix = String((s as any).template_footer_suffix);
  if ((s as any).template_footer_links) {
    const links = parseCommaList((s as any).template_footer_links);
    if (links.length) next.layout.footer.links = links;
  }

  return next;
}

function deriveBabySettingsFromDoc(doc: any): Record<string, any> {
  const layout = doc?.layout || {};
  const header = layout.header || {};
  const hero = layout.hero || {};
  const categories = layout.categories || {};
  const featured = layout.featured || {};
  const grid = layout.grid || {};
  const footer = layout.footer || {};

  const heroVideo = String(hero.heroVideoUrl || '').trim();

  return {
    template_header_search_label: header.searchLabel ?? null,
    template_header_cart_label: header.cartLabel ?? null,

    template_hero_badge_left: hero.badgeLeft ?? null,
    template_hero_badge_right: hero.badgeRight ?? null,
    template_hero_heading: hero.heading ?? null,
    template_hero_subtitle: hero.subtitle ?? null,
    template_age_chips: Array.isArray(hero.ageChips) ? hero.ageChips.join(', ') : null,
    template_primary_cta: hero.primaryCta ?? null,
    template_secondary_cta: hero.secondaryCta ?? null,
    template_featured_product_label: hero.featuredProductLabel ?? null,
    template_hero_image_alt: hero.heroImageAlt ?? null,

    banner_url: hero.bannerUrl ?? null,
    hero_video_url: heroVideo ? heroVideo : null,

    template_browse_by_category_label: categories.browseByCategoryLabel ?? null,
    template_categories_json: Array.isArray(categories.categories) ? JSON.stringify(categories.categories) : null,
    template_product_badge_1: categories.productBadge1 ?? null,
    template_product_badge_2: categories.productBadge2 ?? null,
    template_buy_now_label: categories.buyNowLabel ?? null,

    template_featured_kicker: featured.kicker ?? null,
    template_featured_title: featured.title ?? null,
    template_featured_text: featured.text ?? null,

    template_grid_kicker: grid.kicker ?? null,
    template_grid_title: grid.title ?? null,
    template_items_suffix: grid.itemsSuffix ?? null,
    template_empty_category_text: grid.emptyCategoryText ?? null,

    template_footer_suffix: footer.suffix ?? null,
    template_footer_links: Array.isArray(footer.links) ? footer.links.join(', ') : null,
  };
}

// Generic template doc getter - returns base schema merged with stored settings
function getTemplateDocFromSettings(s: StoreSettings, templateKey: string, baseDoc: any): any {
  const raw = (s as any)?.[templateKey];
  const base = safeClone(baseDoc);
  if (raw && typeof raw === 'object') {
    return deepMerge(base, raw);
  }
  return base;
}

// Template to doc key mapping
const TEMPLATE_DOC_KEYS: Record<string, { key: string; base: any }> = {
  'shiro-hana': { key: 'gold_page_shiro_hana_home', base: baseShiroHanaHome },
  'baby': { key: 'gold_page_baby_home', base: baseBabyHome },
  'fashion': { key: 'gold_page_fashion_home', base: baseFashionHome },
  'fashion2': { key: 'gold_page_fashion_home', base: baseFashionHome },
  'fashion3': { key: 'gold_page_fashion_home', base: baseFashionHome },
  'electronics': { key: 'gold_page_electronics_home', base: baseElectronicsHome },
  'beauty': { key: 'gold_page_beauty_home', base: baseBeautyHome },
  'beaty': { key: 'gold_page_beauty_home', base: baseBeautyHome }, // typo variant
  'jewelry': { key: 'gold_page_jewelry_home', base: baseJewelryHome },
  'food': { key: 'gold_page_food_home', base: baseFoodHome },
  'cafe': { key: 'gold_page_cafe_home', base: baseCafeHome },
  'perfume': { key: 'gold_page_perfume_home', base: basePerfumeHome },
  'bags': { key: 'gold_page_bags_home', base: baseBagsHome },
  'furniture': { key: 'gold_page_furniture_home', base: baseFurnitureHome },
};

function buildPublishPayload(s: StoreSettings, templateId: string, shiroDoc: any, babyDoc?: any): any {
  const base: any = {
    store_name: s.store_name || null,
    owner_name: s.owner_name || s.seller_name || null,
    owner_email: s.owner_email || s.seller_email || null,
    seller_name: s.seller_name || null,
    seller_email: s.seller_email || null,
    store_description: s.store_description || null,
    store_logo: s.store_logo || null,
    template: templateId,
    banner_url: s.banner_url || null,
    hero_tile1_url: s.hero_tile1_url || null,
    hero_tile2_url: s.hero_tile2_url || null,
    currency_code: s.currency_code || 'DZD',
    template_hero_heading: s.template_hero_heading || null,
    template_hero_subtitle: s.template_hero_subtitle || null,
    template_button_text: s.template_button_text || null,
    template_accent_color: s.template_accent_color || null,
    primary_color: s.primary_color || null,
    secondary_color: s.secondary_color || null,
  };

  const normalizedId = String(templateId).replace(/^gold-/, '');
  const templateConfig = TEMPLATE_DOC_KEYS[normalizedId];

  // For schema-driven gold templates (shiro-hana), include the page doc.
  if (normalizedId === 'shiro-hana') {
    base.gold_page_shiro_hana_home = (s as any).gold_page_shiro_hana_home || shiroDoc;
    return base;
  }

  // For gold-baby, persist its page doc and also keep the existing Baby settings keys in sync
  // so the Baby UI remains unchanged (it still reads template_* keys).
  if (normalizedId === 'baby' || normalizedId === 'baby-gold') {
    const doc = (s as any).gold_page_baby_home || babyDoc || getBabyDocFromSettings(s);
    base.gold_page_baby_home = doc;
    Object.assign(base, deriveBabySettingsFromDoc(doc));
    return base;
  }

  // For all other schema-driven templates, include their page doc
  if (templateConfig) {
    const doc = (s as any)[templateConfig.key] || getTemplateDocFromSettings(s, templateConfig.key, templateConfig.base);
    base[templateConfig.key] = doc;
    return base;
  }

  return base;
}

export default function GoldTemplateEditor() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Editor mode from URL param (?mode=basic or ?mode=advanced)
  const initialMode = (searchParams.get('mode') as EditorMode) || 'advanced';
  const [editorMode, setEditorMode] = React.useState<EditorMode>(initialMode);

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const [allowed, setAllowed] = React.useState<boolean>(false);
  const [tier, setTier] = React.useState<string>('');
  const [meEmail, setMeEmail] = React.useState<string>('');

  const [settings, setSettings] = React.useState<StoreSettings>({
    template: 'shiro-hana', // Default to shiro-hana (universal schema base)
    primary_color: '#16a34a',
    secondary_color: '#0ea5e9',
    currency_code: 'DZD',
  });

  const [publishedSettings, setPublishedSettings] = React.useState<StoreSettings | null>(null);

  const [products, setProducts] = React.useState<StoreProduct[]>([]);
  const [filtered, setFiltered] = React.useState<StoreProduct[]>([]);
  const [categories, setCategories] = React.useState<string[]>([]);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('all');
  const [sortOption, setSortOption] = React.useState<'newest' | 'price-asc' | 'price-desc' | 'featured' | 'views-desc'>('newest');
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  const [selectedKey, setSelectedKey] = React.useState<keyof StoreSettings | null>(null);
  const [selectedPath, setSelectedPath] = React.useState<string | null>(null);
  const [hoveredPath, setHoveredPath] = React.useState<string | null>(null);

  const [previewDevice, setPreviewDevice] = React.useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewOrientation, setPreviewOrientation] = React.useState<'portrait' | 'landscape'>('portrait');
  
  // Template selector state
  const [templatesCollapsed, setTemplatesCollapsed] = React.useState(false);

  const inferredBreakpoint = (previewDevice === 'desktop' ? 'desktop' : (previewDevice === 'tablet' ? 'tablet' : 'mobile')) as Breakpoint;
  const [editBreakpoint, setEditBreakpoint] = React.useState<EditBreakpoint>(inferredBreakpoint);
  React.useEffect(() => {
    setEditBreakpoint((prev) => (prev === 'all' ? 'all' : inferredBreakpoint));
  }, [inferredBreakpoint]);

  const previewRef = React.useRef<HTMLDivElement | null>(null);
  const hoverElRef = React.useRef<HTMLElement | null>(null);
  const selectedElRef = React.useRef<HTMLElement | null>(null);
  const rafHoverRef = React.useRef<number | null>(null);

  const historyRef = React.useRef<StoreSettings[]>([]);
  const futureRef = React.useRef<StoreSettings[]>([]);
  const [historyVersion, setHistoryVersion] = React.useState(0);

  React.useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        setLoading(true);

        // Local fallback (works even if cookie/session requests fail)
        const localUser = getCurrentUser();
        const localEmail = normalizeEmail((localUser as any)?.email);
        const localId = Number((localUser as any)?.id);
        const localIsSkull = localEmail === 'skull@gmail.com' || localId === 10;
        if (mounted) {
          setMeEmail(localEmail);
          if (localIsSkull) setAllowed(true);
        }

        const [authMeRes, meRes, settingsRes, productsRes] = await Promise.all([
          fetch('/api/auth/me', { credentials: 'include' }),
          fetch('/api/users/me', { credentials: 'include' }),
          fetch('/api/client/store/settings', { credentials: 'include' }),
          fetch('/api/client/store/products', { credentials: 'include' }),
        ]);

        // First, try /api/auth/me (most reliable) to identify the logged-in account
        if (authMeRes.ok) {
          const me = (await authMeRes.json()) as AuthMeResponse;
          const email = normalizeEmail(me?.email);
          const idNum = Number(me?.id);
          const allowByEmail = email === 'skull@gmail.com' || idNum === 10;
          if (mounted) {
            setMeEmail(email);
            if (allowByEmail) setAllowed(true);
          }
        }

        // Allow all authenticated users (no tier restriction)
        if (meRes.ok) {
          const me = (await meRes.json()) as MeResponse;
          const rawTier = normalizeTier(me?.subscription?.tier || null);
          const email = normalizeEmail(me?.email);
          const allowByEmail = email === 'skull@gmail.com';
          if (mounted) {
            setTier(rawTier);
            // Allow any authenticated user with a subscription
            setAllowed(true);
          }
        }

        if (settingsRes.ok) {
          const s = (await settingsRes.json()) as StoreSettings;
          if (mounted) {
            const next: any = { ...s };
            // Normalize template name (remove gold- prefix for backward compatibility)
            const existingTemplate = String(next.template || '').trim();
            // Keep existing template or default to shiro-hana
            if (existingTemplate.startsWith('gold-')) {
              next.template = existingTemplate.replace('gold-', '');
            } else if (!existingTemplate) {
              next.template = 'shiro-hana';
            }
            // Ensure schema doc exists for shiro-hana
            if ((next.template === 'shiro-hana' || next.template === 'gold-shiro-hana') && !next.gold_page_shiro_hana_home) {
              next.gold_page_shiro_hana_home = baseShiroHanaHome as any;
            }
            setSettings((prev) => ({ ...prev, ...next }));
            setPublishedSettings((prev) => ({ ...(prev || {}), ...next } as any));
          }
        }

        if (productsRes.ok) {
          const p = (await productsRes.json()) as StoreProduct[];
          if (mounted) {
            setProducts(p);
            setFiltered(p);
            const cats = Array.from(new Set(p.map((x) => x.category).filter(Boolean))).map(String);
            setCategories(cats);
          }
        }
      } catch (e) {
        if (mounted) {
          setAllowed(false);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void run();
    return () => {
      mounted = false;
    };
  }, []);

  const advancedAllowed = React.useMemo(() => canUseAdvancedEditor(tier), [tier]);
  const schemaEditorEnabled = React.useMemo(() => advancedAllowed && editorMode === 'advanced', [advancedAllowed, editorMode]);

  // Enforce: non-Gold users cannot switch to Advanced mode.
  React.useEffect(() => {
    if (!advancedAllowed && editorMode === 'advanced') {
      setEditorMode('basic');
      setSearchParams({ mode: 'basic' });
    }
  }, [advancedAllowed, editorMode, setSearchParams]);

  const storeSlug = settings.store_slug || 'preview';

  const rawTemplateId = String(settings.template || '').trim();
  // Pass through all template IDs - the RenderStorefront function handles normalization
  // Only default to shiro-hana if empty
  const templateId = (rawTemplateId || 'shiro-hana') as any;
  const primaryColor = settings.primary_color || '#16a34a';
  const secondaryColor = settings.secondary_color || '#0ea5e9';
  const bannerUrl = settings.banner_url || null;

  const formatPrice = React.useCallback(
    (n: number) => {
      const code = settings.currency_code || 'DZD';
      try {
        return new Intl.NumberFormat(undefined, { style: 'currency', currency: code, maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(Math.round(n));
      } catch {
        return `${Math.round(n)} ${code}`;
      }
    },
    [settings.currency_code]
  );

  // Template detection (supports both old gold- prefix and new names)
  const normalizedTemplate = String(templateId).replace(/^gold-/, '');
  const isShiro = normalizedTemplate === 'shiro-hana';
  const isGoldBaby = normalizedTemplate === 'baby' || normalizedTemplate === 'baby-gold';
  
  // Check if current template has a schema doc
  const templateConfig = TEMPLATE_DOC_KEYS[normalizedTemplate];
  const hasSchemaDoc = !!templateConfig;

  const canUndo = historyRef.current.length > 0;
  const canRedo = futureRef.current.length > 0;

  const pushHistory = React.useCallback((snapshot: StoreSettings) => {
    historyRef.current.push(safeClone(snapshot));
    if (historyRef.current.length > 60) historyRef.current.shift();
    futureRef.current = [];
    setHistoryVersion((v) => v + 1);
  }, []);

  // Handle template switch from marquee
  const handleTemplateSwitch = React.useCallback((newTemplateId: string) => {
    if (newTemplateId === normalizedTemplate) return;
    pushHistory(settings);
    setSettings(prev => ({ ...prev, template: newTemplateId }));
  }, [normalizedTemplate, settings, pushHistory]);

  const undo = React.useCallback(() => {
    if (!historyRef.current.length) return;
    const prev = historyRef.current.pop() as StoreSettings;
    futureRef.current.push(safeClone(settings));
    setSettings(prev);
    setHistoryVersion((v) => v + 1);
  }, [settings]);

  const redo = React.useCallback(() => {
    if (!futureRef.current.length) return;
    const next = futureRef.current.pop() as StoreSettings;
    historyRef.current.push(safeClone(settings));
    setSettings(next);
    setHistoryVersion((v) => v + 1);
  }, [settings]);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isMac = /Mac|iPhone|iPad|iPod/i.test(navigator.platform);
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (!mod) return;

      const tag = (document.activeElement as HTMLElement | null)?.tagName?.toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea' || (document.activeElement as HTMLElement | null)?.isContentEditable;
      if (isTyping) return;

      if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      if ((e.key.toLowerCase() === 'z' && e.shiftKey) || e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undo, redo]);

  const onPreviewClickCapture = (e: React.MouseEvent) => {
    // Prevent the preview from navigating away (anchors/buttons inside templates).
    const target = e.target as HTMLElement | null;
    const anchor = target?.closest?.('a');
    const button = target?.closest?.('button');
    if (anchor || button) {
      e.preventDefault();
      e.stopPropagation();
    }

    const editPath = findClosestEditPath(e.target);
    if (editPath) {
      e.preventDefault();
      e.stopPropagation();
      setSelectedPath(editPath);
      setSelectedKey(null);
      return;
    }

    // Clicked empty/background area - works for ALL templates now
    setSelectedPath('__root');
    setSelectedKey(null);

    // For templates without data-edit-path, try to infer from text/image content
    const nextKey = inferSelectedKey(e.target, settings);
    if (nextKey) {
      setSelectedKey(nextKey);
      setSelectedPath(null);
    }
  };

  const onPreviewMouseMoveCapture = (e: React.MouseEvent) => {
    // Enable hover highlighting for ALL templates
    if (rafHoverRef.current) window.cancelAnimationFrame(rafHoverRef.current);
    const target = e.target;
    rafHoverRef.current = window.requestAnimationFrame(() => {
      const next = findClosestEditPath(target);
      setHoveredPath((prev) => (prev === next ? prev : next));
    });
  };

  const previewViewport = React.useMemo(() => {
    if (previewDevice === 'desktop') {
      return { width: null as number | null, height: null as number | null };
    }

    // OnePlus 13R dimensions: 6.78", 2780x1264px (~19.8:9 aspect ratio)
    // Scaled to fit editor: ~393px width for realistic mobile view
    const portrait =
      previewDevice === 'mobile'
        ? { width: 393, height: 873 } // OnePlus 13R scaled
        : { width: 820, height: 1180 }; // Tablet
    const landscape = { width: portrait.height, height: portrait.width };
    return previewOrientation === 'portrait' ? portrait : landscape;
  }, [previewDevice, previewOrientation]);

  React.useEffect(() => {
    // Enable selection outline highlighting for ALL templates
    const root = previewRef.current;
    if (!root) return;

    const clear = (el: HTMLElement | null) => {
      if (!el) return;
      el.style.outline = '';
      el.style.outlineOffset = '';
    };

    clear(hoverElRef.current);
    clear(selectedElRef.current);
    hoverElRef.current = null;
    selectedElRef.current = null;

    if (hoveredPath) {
      const el = root.querySelector(`[data-edit-path="${cssEscape(hoveredPath)}"]`) as HTMLElement | null;
      if (el) {
        el.style.outline = '1px dashed hsl(var(--primary))';
        el.style.outlineOffset = '2px';
        hoverElRef.current = el;
      }
    }

    if (selectedPath) {
      const el = root.querySelector(`[data-edit-path="${cssEscape(selectedPath)}"]`) as HTMLElement | null;
      if (el) {
        el.style.outline = '2px solid hsl(var(--primary))';
        el.style.outlineOffset = '2px';
        selectedElRef.current = el;
      }
    }
  }, [hoveredPath, selectedPath, historyVersion]);

  const selectedField = selectedKey ? EDITABLE_FIELDS.find((f) => f.key === selectedKey) : null;

  const shiroDoc = React.useMemo(() => {
    const fromSettings = (settings as any)?.gold_page_shiro_hana_home;
    const raw = (fromSettings && typeof fromSettings === 'object') ? fromSettings : (baseShiroHanaHome as any);
    return migrateShiroHanaDoc(raw).doc;
  }, [settings]);

  const babyDoc = React.useMemo(() => {
    return getBabyDocFromSettings(settings);
  }, [settings]);

  // Generic template doc for templates that have schemas
  const genericTemplateDoc = React.useMemo(() => {
    if (isShiro || isGoldBaby || !templateConfig) return null;
    return getTemplateDocFromSettings(settings, templateConfig.key, templateConfig.base);
  }, [isShiro, isGoldBaby, templateConfig, settings]);

  // Determine schemaDoc and schemaDocKey for all templates with schemas
  const schemaDoc = React.useMemo(() => {
    if (isShiro) return shiroDoc;
    if (isGoldBaby) return babyDoc;
    if (templateConfig) return genericTemplateDoc;
    return null;
  }, [isShiro, isGoldBaby, templateConfig, shiroDoc, babyDoc, genericTemplateDoc]);

  const schemaDocKey = React.useMemo(() => {
    if (isShiro) return 'gold_page_shiro_hana_home';
    if (isGoldBaby) return 'gold_page_baby_home';
    if (templateConfig) return templateConfig.key;
    return null;
  }, [isShiro, isGoldBaby, templateConfig]);

  const previewSettings = React.useMemo(() => {
    // For Baby template, keep backward compatibility with template_* settings keys
    if (isGoldBaby) {
      const doc = (settings as any).gold_page_baby_home || babyDoc;
      return {
        ...settings,
        gold_page_baby_home: doc,
        ...deriveBabySettingsFromDoc(doc),
      } as any;
    }
    // For other templates with schemas, include the doc in settings
    if (schemaDocKey && schemaDoc) {
      return {
        ...settings,
        [schemaDocKey]: schemaDoc,
      } as any;
    }
    return settings;
  }, [babyDoc, isGoldBaby, settings, schemaDocKey, schemaDoc]);

  const isDirty = React.useMemo(() => {
    if (!publishedSettings) return false;
    const draftPayload = buildPublishPayload(settings, templateId, shiroDoc, babyDoc);
    const publishedShiroDoc = getShiroDocFromSettings(publishedSettings);
    const publishedBabyDoc = getBabyDocFromSettings(publishedSettings);
    const publishedPayload = buildPublishPayload(publishedSettings, templateId, publishedShiroDoc, publishedBabyDoc);
    return stableStringify(draftPayload) !== stableStringify(publishedPayload);
  }, [babyDoc, publishedSettings, settings, shiroDoc, templateId]);

  const contentWarnings = React.useMemo(() => {
    if (!isShiro) return [] as ContentWarning[];
    return collectContentWarnings(shiroDoc);
  }, [isShiro, shiroDoc]);

  const [guardrailNote, setGuardrailNote] = React.useState<string>('');
  const guardrailTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!isShiro) return;
    const fromSettings = (settings as any)?.gold_page_shiro_hana_home;
    if (!fromSettings || typeof fromSettings !== 'object') return;

    const migrated = migrateShiroHanaDoc(fromSettings);
    if (!migrated.migrated) return;
    setSettings((prev) => ({
      ...prev,
      gold_page_shiro_hana_home: migrated.doc,
    } as any));
  }, [isShiro, settings]);

  const selectedSchema = React.useMemo(() => {
    if (!selectedPath) return null;
    if (selectedPath.startsWith('__settings.')) return null;
    if (!schemaDoc) return null;
    const { value } = resolveBySchemaPath(schemaDoc, selectedPath);
    return value;
  }, [schemaDoc, selectedPath]);

  const selectedSettingsKey = React.useMemo(() => {
    if (!selectedPath) return null;
    if (!selectedPath.startsWith('__settings.')) return null;
    return selectedPath.replace('__settings.', '') as keyof StoreSettings;
  }, [selectedPath]);

  const [jsonDraft, setJsonDraft] = React.useState<string>('');
  const [jsonError, setJsonError] = React.useState<string>('');
  const [basicUploadError, setBasicUploadError] = React.useState<string>('');

  const isCtaLabelPath = !!selectedPath && /^(layout\.hero\.cta\.\d+\.label|layout\.header\.cta\.\d+\.label)$/.test(selectedPath);
  const ctaActionPath = React.useMemo(() => {
    if (!selectedPath) return null;
    const m = selectedPath.match(/^(layout\.(hero|header)\.cta\.\d+)\.label$/);
    if (!m) return null;
    return `${m[1]}.action`;
  }, [selectedPath]);

  const isLinkLabelPath = !!selectedPath && /^(layout\.header\.nav\.\d+\.label|layout\.footer\.links\.\d+\.label)$/.test(selectedPath);
  const linkActionPath = React.useMemo(() => {
    if (!selectedPath) return null;
    const m = selectedPath.match(/^(layout\.(header\.nav|footer\.links)\.\d+)\.label$/);
    if (!m) return null;
    return `${m[1]}.action`;
  }, [selectedPath]);

  React.useEffect(() => {
    setJsonError('');
    if (!hasSchemaDoc || !selectedPath) {
      setJsonDraft('');
      return;
    }
    if (selectedPath.startsWith('__settings.')) {
      setJsonDraft('');
      return;
    }
    if (selectedSchema && (Array.isArray(selectedSchema) || typeof selectedSchema === 'object')) {
      setJsonDraft(JSON.stringify(selectedSchema, null, 2));
    } else {
      setJsonDraft('');
    }
  }, [hasSchemaDoc, selectedPath, selectedSchema]);

  const setSchemaValue = (path: string, next: any) => {
    if (!schemaEditorEnabled) return;
    pushHistory(settings);

    const sanitized = isShiro ? sanitizeValueForPath(path, next) : { value: next, changed: false };
    if (sanitized.changed) {
      setGuardrailNote('Adjusted value to a safe range');
      if (guardrailTimerRef.current) window.clearTimeout(guardrailTimerRef.current);
      guardrailTimerRef.current = window.setTimeout(() => setGuardrailNote(''), 2500);
    }

    if (!schemaDocKey || !schemaDoc) return;
    const nextDoc = setBySchemaPath(schemaDoc, path, sanitized.value);
    setSettings((prev) => ({ ...prev, [schemaDocKey]: nextDoc } as any));
  };

  const reorderArray = React.useCallback(
    (arrayPath: string, fromIndex: number, toIndex: number) => {
      if (!schemaEditorEnabled) return;
      if (!schemaDocKey || !schemaDoc) return;
      const arr = resolveBySchemaPath(schemaDoc, arrayPath).value;
      if (!Array.isArray(arr)) return;
      if (fromIndex === toIndex) return;

      pushHistory(settings);
      const nextArr = moveArrayItem(arr, fromIndex, toIndex);
      const nextDoc = setBySchemaPath(schemaDoc, arrayPath, nextArr);
      setSettings((prev) => ({ ...prev, [schemaDocKey]: nextDoc } as any));

      // If selection is index-based under this array path, keep it pointing at the same item.
      if (selectedPath && selectedPath.startsWith(`${arrayPath}.`)) {
        const tail = selectedPath.slice(arrayPath.length + 1);
        const parts = tail.split('.');
        const idxSeg = parts[0];
        if (/^\d+$/.test(idxSeg)) {
          const idx = Number(idxSeg);
          let nextIdx = idx;
          if (idx === fromIndex) nextIdx = toIndex;
          else if (fromIndex < toIndex && idx > fromIndex && idx <= toIndex) nextIdx = idx - 1;
          else if (fromIndex > toIndex && idx >= toIndex && idx < fromIndex) nextIdx = idx + 1;
          if (nextIdx !== idx) {
            const rest = parts.slice(1).join('.');
            setSelectedPath(rest ? `${arrayPath}.${nextIdx}.${rest}` : `${arrayPath}.${nextIdx}`);
          }
        }
      }
    },
    [schemaDocKey, schemaDoc, pushHistory, schemaEditorEnabled, selectedPath, settings]
  );

  const onPublish = async () => {
    try {
      setSaving(true);
      const payload = buildPublishPayload(settings, templateId, shiroDoc, babyDoc);
      const res = await fetch('/api/client/store/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err.details ? `${err.error}: ${err.details}` : (err.error || 'Save failed');
        throw new Error(msg);
      }

      // Refresh canonical state
      const settingsRes = await fetch('/api/client/store/settings', { credentials: 'include' });
      if (settingsRes.ok) {
        const fresh = (await settingsRes.json()) as StoreSettings;
        const persistedTemplate = String((fresh as any)?.template || '').trim();
        const nextTemplate = persistedTemplate.startsWith('gold-') ? persistedTemplate : String(templateId);
        setSettings((prev) => ({ ...prev, ...fresh, template: nextTemplate }));
        setPublishedSettings((prev) => ({ ...(prev || {}), ...fresh, template: nextTemplate } as any));
        historyRef.current = [];
        futureRef.current = [];
        setHistoryVersion((v) => v + 1);
      }
    } finally {
      setSaving(false);
    }
  };

  const discardDraft = React.useCallback(() => {
    if (!publishedSettings) return;
    setSettings(safeClone(publishedSettings));
    historyRef.current = [];
    futureRef.current = [];
    setHistoryVersion((v) => v + 1);
  }, [publishedSettings]);

  const updateField = (key: keyof StoreSettings, value: any) => {
    pushHistory(settings);
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const breadcrumbParts = React.useMemo(() => {
    if (!isShiro || !selectedPath) return [] as Array<{ label: string; path: string }>;
    if (selectedPath === '__root') return [{ label: 'Root', path: '__root' }];
    if (selectedPath.startsWith('__settings.')) {
      const key = selectedPath.replace('__settings.', '');
      return [
        { label: 'Settings', path: '__settings' },
        { label: key, path: selectedPath },
      ];
    }

    const parts = parseSchemaPath(selectedPath);
    const out: Array<{ label: string; path: string }> = [{ label: 'Root', path: '__root' }];
    let cur = '';
    for (const p of parts) {
      cur = cur ? `${cur}.${p}` : p;
      out.push({ label: isNumericSegment(p) ? `[${p}]` : p, path: cur });
    }
    return out;
  }, [isShiro, selectedPath]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading editor…</div>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-semibold">Template Editor</h1>
          </div>

          <Alert>
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription>
              This editor is available for paid accounts only. Current tier: {tier || 'unknown'}{meEmail ? ` • Account: ${meEmail}` : ''}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <div className="font-semibold flex items-center gap-2">
                Template Editor
                <Badge variant={editorMode === 'advanced' ? 'default' : 'secondary'} className="text-xs">
                  {editorMode === 'advanced' ? 'Advanced' : 'Basic'}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">Click on your storefront preview to edit elements</div>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center gap-4">
            <Tabs value={editorMode} onValueChange={(v) => {
              // Prevent Advanced selection for non-Gold users
              if (v === 'advanced' && !advancedAllowed) return;
              setEditorMode(v as EditorMode);
              setSearchParams({ mode: v });
            }}>
              <TabsList>
                <TabsTrigger value="basic" className="gap-1 text-xs">
                  <Settings className="h-3 w-3" />
                  Basic
                </TabsTrigger>
                <TabsTrigger value="advanced" className="gap-1 text-xs" disabled={!advancedAllowed}>
                  <Sparkles className="h-3 w-3" />
                  Advanced
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={undo} disabled={!canUndo || saving} title="Undo (Ctrl/Cmd+Z)">
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={redo} disabled={!canRedo || saving} title="Redo (Ctrl/Cmd+Shift+Z)">
                <RotateCw className="w-4 h-4" />
              </Button>
              <div className="text-xs text-muted-foreground mr-1">
                {isDirty ? 'Draft' : 'Published'}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={discardDraft} disabled={!isDirty || saving}>
                Discard
              </Button>
              <Button onClick={onPublish} disabled={saving || !isDirty} size="sm">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Publishing…' : 'Publish'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Template Selector - Scrolling Marquee */}
      <div className="border-b bg-card">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold">🎨 Choose Your Store Template</h2>
            {normalizedTemplate && (
              <Badge variant="default" className="text-xs">
                Active: {templateList.find(t => t.id === normalizedTemplate)?.label || normalizedTemplate}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTemplatesCollapsed(!templatesCollapsed)}
            className="h-8 px-3 gap-1"
          >
            {templatesCollapsed ? 'Show Templates' : 'Hide'}
            {templatesCollapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            templatesCollapsed
              ? 'max-h-0 opacity-0 pb-0'
              : 'max-h-[220px] opacity-100 pb-4'
          }`}
        >
          {/* Infinite scrolling marquee */}
          <div className="overflow-hidden relative">
            <style>{`
              @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .animate-marquee {
                animation: marquee 40s linear infinite;
              }
              .animate-marquee:hover {
                animation-play-state: paused;
              }
            `}</style>
            <div className="flex gap-3 px-4 animate-marquee" style={{ width: 'max-content' }}>
              {/* First set of templates */}
              {templateList.map((tpl) => {
                const isActive = normalizedTemplate === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => handleTemplateSwitch(tpl.id)}
                    className={`flex-shrink-0 w-[100px] rounded-xl overflow-hidden transition-all duration-200 transform hover:scale-105 group ${
                      isActive
                        ? 'ring-3 ring-primary ring-offset-2 shadow-lg scale-105'
                        : 'border-2 border-muted hover:border-primary/50 shadow hover:shadow-md'
                    }`}
                  >
                    <div className="aspect-[3/4] relative bg-gradient-to-br from-muted to-muted/50">
                      <img 
                        src={tpl.preview} 
                        alt={tpl.label}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <div className={`absolute inset-0 flex flex-col items-center justify-end pb-2 transition-all ${
                        isActive
                          ? 'bg-gradient-to-t from-primary/80 via-primary/40 to-transparent'
                          : 'bg-gradient-to-t from-black/60 to-transparent group-hover:from-primary/60'
                      }`}>
                        <span className="text-white font-semibold text-xs text-center px-1 drop-shadow">
                          {tpl.label}
                        </span>
                      </div>
                      {isActive && (
                        <div className="absolute top-1 right-1 z-10">
                          <div className="bg-primary text-primary-foreground rounded-full p-0.5 shadow">
                            <Check className="w-3 h-3" />
                          </div>
                        </div>
                      )}
                      {isActive && (
                        <div className="absolute top-1 left-1 z-10">
                          <Badge variant="secondary" className="text-[9px] px-1 py-0 bg-white/90 text-primary">
                            ACTIVE
                          </Badge>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
              {/* Duplicate for seamless loop */}
              {templateList.map((tpl) => {
                const isActive = normalizedTemplate === tpl.id;
                return (
                  <button
                    key={`${tpl.id}-dup`}
                    onClick={() => handleTemplateSwitch(tpl.id)}
                    className={`flex-shrink-0 w-[100px] rounded-xl overflow-hidden transition-all duration-200 transform hover:scale-105 group ${
                      isActive
                        ? 'ring-3 ring-primary ring-offset-2 shadow-lg scale-105'
                        : 'border-2 border-muted hover:border-primary/50 shadow hover:shadow-md'
                    }`}
                  >
                    <div className="aspect-[3/4] relative bg-gradient-to-br from-muted to-muted/50">
                      <img 
                        src={tpl.preview} 
                        alt={tpl.label}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                      <div className={`absolute inset-0 flex flex-col items-center justify-end pb-2 transition-all ${
                        isActive
                          ? 'bg-gradient-to-t from-primary/80 via-primary/40 to-transparent'
                          : 'bg-gradient-to-t from-black/60 to-transparent group-hover:from-primary/60'
                      }`}>
                        <span className="text-white font-semibold text-xs text-center px-1 drop-shadow">
                          {tpl.label}
                        </span>
                      </div>
                      {isActive && (
                        <div className="absolute top-1 right-1 z-10">
                          <div className="bg-primary text-primary-foreground rounded-full p-0.5 shadow">
                            <Check className="w-3 h-3" />
                          </div>
                        </div>
                      )}
                      {isActive && (
                        <div className="absolute top-1 left-1 z-10">
                          <Badge variant="secondary" className="text-[9px] px-1 py-0 bg-white/90 text-primary">
                            ACTIVE
                          </Badge>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Hover to pause • Click a template to preview • Click <strong>Publish</strong> to apply
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>Preview</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                    onClick={() => setPreviewDevice('desktop')}
                  >
                    PC
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={previewDevice === 'tablet' ? 'default' : 'outline'}
                    onClick={() => {
                      setPreviewDevice('tablet');
                      setPreviewOrientation('portrait');
                    }}
                  >
                    Tablet
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                    onClick={() => {
                      setPreviewDevice('mobile');
                      setPreviewOrientation('portrait');
                    }}
                    title="OnePlus 13R (393×873)"
                  >
                    📱 Mobile
                  </Button>

                  {previewDevice !== 'desktop' ? (
                    <>
                      <Separator orientation="vertical" className="h-6" />
                      <Button
                        type="button"
                        size="sm"
                        variant={previewOrientation === 'portrait' ? 'default' : 'outline'}
                        onClick={() => setPreviewOrientation('portrait')}
                      >
                        Portrait
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={previewOrientation === 'landscape' ? 'default' : 'outline'}
                        onClick={() => setPreviewOrientation('landscape')}
                      >
                        Landscape
                      </Button>
                      <div className="text-xs text-muted-foreground ml-1 whitespace-nowrap">
                        {previewViewport.width}×{previewViewport.height}
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border bg-background/40 p-3 overflow-auto">
                <div className="mx-auto" style={{ width: previewDevice === 'mobile' ? 'auto' : (previewViewport.width ?? '100%') }}>
                  {/* Phone Frame for Mobile View - OnePlus 13R Style */}
                  {previewDevice === 'mobile' ? (
                    <div
                      className="relative mx-auto"
                      style={{
                        width: previewViewport.width + 24,
                        padding: '12px',
                        background: 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
                        borderRadius: '44px',
                        boxShadow: '0 0 0 2px #333, 0 0 0 4px #1a1a1a, inset 0 0 20px rgba(0,0,0,0.3), 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 12px 24px -8px rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      {/* Camera punch-hole */}
                      <div
                        className="absolute left-1/2 -translate-x-1/2 z-20"
                        style={{
                          top: '20px',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: 'radial-gradient(circle at 30% 30%, #3a3a3a, #1a1a1a)',
                          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.8), 0 0 0 2px #222',
                        }}
                      />
                      {/* Status bar area */}
                      <div
                        className="absolute left-1/2 -translate-x-1/2 z-10 flex items-center justify-between px-6"
                        style={{
                          top: '16px',
                          width: previewViewport.width - 20,
                          height: '24px',
                          pointerEvents: 'none',
                        }}
                      >
                        <span className="text-[10px] font-medium text-white/90">9:41</span>
                        <div className="flex items-center gap-1">
                          <svg className="w-3 h-3 text-white/90" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8z"/>
                          </svg>
                          <svg className="w-3 h-3 text-white/90" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>
                          </svg>
                          <div className="flex items-center">
                            <div className="w-5 h-2.5 rounded-sm border border-white/90 relative">
                              <div className="absolute inset-0.5 bg-green-500 rounded-[1px]" style={{ width: '80%' }} />
                            </div>
                            <div className="w-0.5 h-1 bg-white/90 rounded-r-sm" />
                          </div>
                        </div>
                      </div>
                      {/* Screen */}
                      <div
                        ref={previewRef}
                        onClickCapture={onPreviewClickCapture}
                        onMouseMoveCapture={onPreviewMouseMoveCapture}
                        className="bg-background overflow-auto relative"
                        style={{
                          width: previewViewport.width,
                          height: previewViewport.height,
                          borderRadius: '32px',
                        }}
                      >
                        {RenderStorefront(templateId, {
                          storeSlug,
                          products,
                          filtered,
                          settings: previewSettings,
                          categories,
                          searchQuery,
                          setSearchQuery,
                          categoryFilter,
                          setCategoryFilter,
                          sortOption,
                          setSortOption,
                          viewMode,
                          setViewMode,
                          formatPrice,
                          primaryColor,
                          secondaryColor,
                          bannerUrl: (previewSettings as any)?.banner_url ?? bannerUrl,
                          navigate: () => null,
                          canManage: false,
                        })}
                      </div>
                      {/* Navigation bar / gesture indicator */}
                      <div
                        className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10"
                        style={{
                          width: '134px',
                          height: '5px',
                          background: 'rgba(255,255,255,0.3)',
                          borderRadius: '100px',
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      ref={previewRef}
                      onClickCapture={onPreviewClickCapture}
                      onMouseMoveCapture={onPreviewMouseMoveCapture}
                      className="bg-background border rounded-md overflow-auto"
                      style={{
                        width: previewViewport.width ?? '100%',
                        height: previewViewport.height ?? undefined,
                      }}
                    >
                      {RenderStorefront(templateId, {
                        storeSlug,
                        products,
                        filtered,
                        settings: previewSettings,
                        categories,
                        searchQuery,
                        setSearchQuery,
                        categoryFilter,
                        setCategoryFilter,
                        sortOption,
                        setSortOption,
                        viewMode,
                        setViewMode,
                        formatPrice,
                        primaryColor,
                        secondaryColor,
                        bannerUrl: (previewSettings as any)?.banner_url ?? bannerUrl,
                        navigate: () => null,
                        canManage: false,
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Tip: Click anything in the preview to edit.
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[70vh] overflow-y-auto">
              {editorMode === 'basic' ? (
                <div className="space-y-4">
                  <div className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Silver Editor - Quick Customization
                  </div>

                  {/* Store Info Section */}
                  <details open className="group border rounded-lg">
                    <summary className="flex items-center justify-between p-3 cursor-pointer bg-muted/30 rounded-t-lg hover:bg-muted/50">
                      <span className="font-medium text-sm flex items-center gap-2">
                        🏪 Store Info
                      </span>
                      <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="p-3 space-y-3">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Store Name</div>
                        <Input
                          value={String((settings as any).store_name ?? '')}
                          onChange={(e) => updateField('store_name' as any, e.target.value)}
                          placeholder="My Store"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Store Description</div>
                        <Textarea
                          value={String((settings as any).store_description ?? '')}
                          onChange={(e) => updateField('store_description' as any, e.target.value)}
                          rows={2}
                          placeholder="Brief description of your store..."
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Currency</div>
                        <Input
                          value={String((settings as any).currency ?? 'DZD')}
                          onChange={(e) => updateField('currency' as any, e.target.value)}
                          placeholder="DZD"
                        />
                      </div>
                    </div>
                  </details>

                  {/* Hero Section */}
                  <details open className="group border rounded-lg">
                    <summary className="flex items-center justify-between p-3 cursor-pointer bg-muted/30 rounded-t-lg hover:bg-muted/50">
                      <span className="font-medium text-sm flex items-center gap-2">
                        🎯 Hero Section
                      </span>
                      <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="p-3 space-y-3">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Hero Title</div>
                        <Input
                          value={String((settings as any).template_hero_heading ?? '')}
                          onChange={(e) => updateField('template_hero_heading' as any, e.target.value)}
                          placeholder="Welcome to Our Store"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Hero Subtitle</div>
                        <Textarea
                          value={String((settings as any).template_hero_subtitle ?? '')}
                          onChange={(e) => updateField('template_hero_subtitle' as any, e.target.value)}
                          rows={2}
                          placeholder="Discover amazing products..."
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Hero Button Text</div>
                        <Input
                          value={String((settings as any).template_button_text ?? '')}
                          onChange={(e) => updateField('template_button_text' as any, e.target.value)}
                          placeholder="Shop Now"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Badge Left</div>
                          <Input
                            value={String((settings as any).template_hero_badge_left ?? '')}
                            onChange={(e) => updateField('template_hero_badge_left' as any, e.target.value)}
                            placeholder="Free Shipping"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Badge Right</div>
                          <Input
                            value={String((settings as any).template_hero_badge_right ?? '')}
                            onChange={(e) => updateField('template_hero_badge_right' as any, e.target.value)}
                            placeholder="24/7 Support"
                          />
                        </div>
                      </div>
                    </div>
                  </details>

                  {/* Images Section */}
                  <details open className="group border rounded-lg">
                    <summary className="flex items-center justify-between p-3 cursor-pointer bg-muted/30 rounded-t-lg hover:bg-muted/50">
                      <span className="font-medium text-sm flex items-center gap-2">
                        🖼️ Images & Media
                      </span>
                      <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="p-3 space-y-3">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Store Logo</div>
                        <Input
                          type="url"
                          value={String((settings as any).store_logo ?? '')}
                          onChange={(e) => updateField('store_logo' as any, e.target.value)}
                          placeholder="https://..."
                        />
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              setBasicUploadError('');
                              const uploaded = await uploadImage(file);
                              updateField('store_logo' as any, uploaded.url);
                            } catch (err) {
                              setBasicUploadError((err as any)?.message || 'Upload failed');
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Hero Banner Image</div>
                        <Input
                          type="url"
                          value={String((settings as any).banner_url ?? '')}
                          onChange={(e) => updateField('banner_url' as any, e.target.value)}
                          placeholder="https://..."
                        />
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              setBasicUploadError('');
                              const uploaded = await uploadImage(file);
                              updateField('banner_url' as any, uploaded.url);
                            } catch (err) {
                              setBasicUploadError((err as any)?.message || 'Upload failed');
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Hero Video URL (optional)</div>
                        <Input
                          type="url"
                          value={String((settings as any).hero_video_url ?? '')}
                          onChange={(e) => updateField('hero_video_url' as any, e.target.value)}
                          placeholder="https://...mp4"
                        />
                        <div className="text-xs text-muted-foreground">Replaces hero image with video when set</div>
                      </div>
                    </div>
                  </details>

                  {/* Categories Section */}
                  <details className="group border rounded-lg">
                    <summary className="flex items-center justify-between p-3 cursor-pointer bg-muted/30 rounded-t-lg hover:bg-muted/50">
                      <span className="font-medium text-sm flex items-center gap-2">
                        📂 Categories & Products
                      </span>
                      <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="p-3 space-y-3">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Browse by Category Label</div>
                        <Input
                          value={String((settings as any).template_browse_by_category_label ?? '')}
                          onChange={(e) => updateField('template_browse_by_category_label' as any, e.target.value)}
                          placeholder="Browse by Category"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Featured Section Title</div>
                        <Input
                          value={String((settings as any).template_featured_title ?? '')}
                          onChange={(e) => updateField('template_featured_title' as any, e.target.value)}
                          placeholder="Featured Products"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Grid Section Title</div>
                        <Input
                          value={String((settings as any).template_grid_title ?? '')}
                          onChange={(e) => updateField('template_grid_title' as any, e.target.value)}
                          placeholder="All Products"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Product Badge 1</div>
                          <Input
                            value={String((settings as any).template_product_badge_1 ?? '')}
                            onChange={(e) => updateField('template_product_badge_1' as any, e.target.value)}
                            placeholder="New"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Product Badge 2</div>
                          <Input
                            value={String((settings as any).template_product_badge_2 ?? '')}
                            onChange={(e) => updateField('template_product_badge_2' as any, e.target.value)}
                            placeholder="Sale"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Buy Now Label</div>
                        <Input
                          value={String((settings as any).template_buy_now_label ?? '')}
                          onChange={(e) => updateField('template_buy_now_label' as any, e.target.value)}
                          placeholder="Buy Now"
                        />
                      </div>
                    </div>
                  </details>

                  {/* Colors Section */}
                  <details open className="group border rounded-lg">
                    <summary className="flex items-center justify-between p-3 cursor-pointer bg-muted/30 rounded-t-lg hover:bg-muted/50">
                      <span className="font-medium text-sm flex items-center gap-2">
                        🎨 Colors & Theme
                      </span>
                      <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="p-3 space-y-3">
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">Dark Mode</div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={(settings as any).enable_dark_mode ? 'default' : 'outline'}
                            onClick={() => updateField('enable_dark_mode' as any, !(settings as any).enable_dark_mode)}
                          >
                            {(settings as any).enable_dark_mode ? '🌙 Enabled' : '☀️ Disabled'}
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Primary Color</div>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              className="w-12 h-10 p-1"
                              value={String((settings as any).primary_color ?? '#16a34a')}
                              onChange={(e) => updateField('primary_color' as any, e.target.value)}
                            />
                            <Input
                              value={String((settings as any).primary_color ?? '')}
                              onChange={(e) => updateField('primary_color' as any, e.target.value)}
                              placeholder="#16a34a"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Secondary Color</div>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              className="w-12 h-10 p-1"
                              value={String((settings as any).secondary_color ?? '#0ea5e9')}
                              onChange={(e) => updateField('secondary_color' as any, e.target.value)}
                            />
                            <Input
                              value={String((settings as any).secondary_color ?? '')}
                              onChange={(e) => updateField('secondary_color' as any, e.target.value)}
                              placeholder="#0ea5e9"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Accent Color (optional)</div>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            className="w-12 h-10 p-1"
                            value={String((settings as any).template_accent_color ?? (settings as any).primary_color ?? '#16a34a')}
                            onChange={(e) => updateField('template_accent_color' as any, e.target.value)}
                          />
                          <Input
                            value={String((settings as any).template_accent_color ?? '')}
                            onChange={(e) => updateField('template_accent_color' as any, e.target.value)}
                            placeholder="(uses primary if empty)"
                        />
                      </div>
                    </div>
                    </div>
                  </details>

                  {/* Footer & Contact Section */}
                  <details className="group border rounded-lg">
                    <summary className="flex items-center justify-between p-3 cursor-pointer bg-muted/30 rounded-t-lg hover:bg-muted/50">
                      <span className="font-medium text-sm flex items-center gap-2">
                        📧 Contact & Footer
                      </span>
                      <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="p-3 space-y-3">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Contact Phone</div>
                        <Input
                          value={String((settings as any).phone ?? '')}
                          onChange={(e) => updateField('phone' as any, e.target.value)}
                          placeholder="+213 123 456 789"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Contact Email</div>
                        <Input
                          value={String((settings as any).seller_email ?? '')}
                          onChange={(e) => updateField('seller_email' as any, e.target.value)}
                          placeholder="contact@store.com"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Store Address</div>
                        <Input
                          value={String((settings as any).address ?? '')}
                          onChange={(e) => updateField('address' as any, e.target.value)}
                          placeholder="123 Main St, City"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Footer Text</div>
                        <Input
                          value={String((settings as any).template_footer_suffix ?? '')}
                          onChange={(e) => updateField('template_footer_suffix' as any, e.target.value)}
                          placeholder="© 2024 My Store. All rights reserved."
                        />
                      </div>
                    </div>
                  </details>

                  {/* Social Media Section */}
                  <details className="group border rounded-lg">
                    <summary className="flex items-center justify-between p-3 cursor-pointer bg-muted/30 rounded-t-lg hover:bg-muted/50">
                      <span className="font-medium text-sm flex items-center gap-2">
                        🔗 Social Media
                      </span>
                      <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="p-3 space-y-3">
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Facebook</div>
                        <Input
                          value={String((settings as any).facebook ?? '')}
                          onChange={(e) => updateField('facebook' as any, e.target.value)}
                          placeholder="https://facebook.com/..."
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Instagram</div>
                        <Input
                          value={String((settings as any).instagram ?? '')}
                          onChange={(e) => updateField('instagram' as any, e.target.value)}
                          placeholder="https://instagram.com/..."
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Twitter / X</div>
                        <Input
                          value={String((settings as any).twitter ?? '')}
                          onChange={(e) => updateField('twitter' as any, e.target.value)}
                          placeholder="https://twitter.com/..."
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">WhatsApp Number</div>
                        <Input
                          value={String((settings as any).whatsapp ?? '')}
                          onChange={(e) => updateField('whatsapp' as any, e.target.value)}
                          placeholder="+213 123 456 789"
                        />
                      </div>
                    </div>
                  </details>

                  {/* Template-Specific Settings based on selected template */}
                  {(normalizedTemplate === 'fashion' || normalizedTemplate === 'fashion2' || normalizedTemplate === 'fashion3') && (
                    <details className="group border rounded-lg border-orange-500/30">
                      <summary className="flex items-center justify-between p-3 cursor-pointer bg-orange-500/10 rounded-t-lg hover:bg-orange-500/20">
                        <span className="font-medium text-sm flex items-center gap-2">
                          👗 Fashion Template Settings
                        </span>
                        <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="p-3 space-y-3">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Hero Kicker</div>
                          <Input
                            value={String((settings as any).template_hero_kicker ?? '')}
                            onChange={(e) => updateField('template_hero_kicker' as any, e.target.value)}
                            placeholder="System wardrobes / 2025"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Gender Tabs (comma separated)</div>
                          <Input
                            value={String((settings as any).template_genders ?? '')}
                            onChange={(e) => updateField('template_genders' as any, e.target.value)}
                            placeholder="Women, Men, Essentials"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Category Tabs (comma separated)</div>
                          <Input
                            value={String((settings as any).template_category_tabs ?? '')}
                            onChange={(e) => updateField('template_category_tabs' as any, e.target.value)}
                            placeholder="All, Outerwear, Tops, Bottoms"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Fit Tabs (comma separated)</div>
                          <Input
                            value={String((settings as any).template_fit_tabs ?? '')}
                            onChange={(e) => updateField('template_fit_tabs' as any, e.target.value)}
                            placeholder="All, Oversized, Relaxed, Regular"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Nav: New</div>
                            <Input
                              value={String((settings as any).template_nav_new ?? '')}
                              onChange={(e) => updateField('template_nav_new' as any, e.target.value)}
                              placeholder="New"
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Nav: Collections</div>
                            <Input
                              value={String((settings as any).template_nav_collections ?? '')}
                              onChange={(e) => updateField('template_nav_collections' as any, e.target.value)}
                              placeholder="Collections"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Account Label</div>
                          <Input
                            value={String((settings as any).template_account_label ?? '')}
                            onChange={(e) => updateField('template_account_label' as any, e.target.value)}
                            placeholder="Account"
                          />
                        </div>
                      </div>
                    </details>
                  )}

                  {normalizedTemplate === 'electronics' && (
                    <details className="group border rounded-lg border-cyan-500/30">
                      <summary className="flex items-center justify-between p-3 cursor-pointer bg-cyan-500/10 rounded-t-lg hover:bg-cyan-500/20">
                        <span className="font-medium text-sm flex items-center gap-2">
                          📱 Electronics Template Settings
                        </span>
                        <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="p-3 space-y-3">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Header Tagline</div>
                          <Input
                            value={String((settings as any).template_header_tagline ?? '')}
                            onChange={(e) => updateField('template_header_tagline' as any, e.target.value)}
                            placeholder="Phones · Audio · Gaming · Accessories"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Header Status</div>
                          <Input
                            value={String((settings as any).template_header_status ?? '')}
                            onChange={(e) => updateField('template_header_status' as any, e.target.value)}
                            placeholder="24/7 online"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Hero Badge</div>
                          <Input
                            value={String((settings as any).template_hero_badge ?? '')}
                            onChange={(e) => updateField('template_hero_badge' as any, e.target.value)}
                            placeholder="2025 line-up"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Hero Kicker Label</div>
                          <Input
                            value={String((settings as any).template_hero_kicker_label ?? '')}
                            onChange={(e) => updateField('template_hero_kicker_label' as any, e.target.value)}
                            placeholder="New"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Primary CTA</div>
                            <Input
                              value={String((settings as any).template_hero_primary_cta ?? '')}
                              onChange={(e) => updateField('template_hero_primary_cta' as any, e.target.value)}
                              placeholder="Shop flagship"
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Secondary CTA</div>
                            <Input
                              value={String((settings as any).template_hero_secondary_cta ?? '')}
                              onChange={(e) => updateField('template_hero_secondary_cta' as any, e.target.value)}
                              placeholder="View full catalog"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Featured Kicker</div>
                          <Input
                            value={String((settings as any).template_featured_kicker ?? '')}
                            onChange={(e) => updateField('template_featured_kicker' as any, e.target.value)}
                            placeholder="Featured products"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Categories Title</div>
                          <Input
                            value={String((settings as any).template_categories_title ?? '')}
                            onChange={(e) => updateField('template_categories_title' as any, e.target.value)}
                            placeholder="Categories"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Store Initials</div>
                          <Input
                            value={String((settings as any).store_initials ?? '')}
                            onChange={(e) => updateField('store_initials' as any, e.target.value)}
                            placeholder="EC"
                          />
                        </div>
                      </div>
                    </details>
                  )}

                  {(normalizedTemplate === 'beauty' || normalizedTemplate === 'beaty') && (
                    <details className="group border rounded-lg border-pink-500/30">
                      <summary className="flex items-center justify-between p-3 cursor-pointer bg-pink-500/10 rounded-t-lg hover:bg-pink-500/20">
                        <span className="font-medium text-sm flex items-center gap-2">
                          💄 Beauty Template Settings
                        </span>
                        <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="p-3 space-y-3">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Shade Bar Title</div>
                          <Input
                            value={String((settings as any).template_shade_bar_title ?? '')}
                            onChange={(e) => updateField('template_shade_bar_title' as any, e.target.value)}
                            placeholder="Find Your Perfect Shade"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Featured Badge</div>
                          <Input
                            value={String((settings as any).template_featured_badge ?? '')}
                            onChange={(e) => updateField('template_featured_badge' as any, e.target.value)}
                            placeholder="Bestseller"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Quick View Label</div>
                          <Input
                            value={String((settings as any).template_quick_view_label ?? '')}
                            onChange={(e) => updateField('template_quick_view_label' as any, e.target.value)}
                            placeholder="Quick View"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Filter Label</div>
                          <Input
                            value={String((settings as any).template_filter_label ?? '')}
                            onChange={(e) => updateField('template_filter_label' as any, e.target.value)}
                            placeholder="Filter by price"
                          />
                        </div>
                      </div>
                    </details>
                  )}

                  {normalizedTemplate === 'jewelry' && (
                    <details className="group border rounded-lg border-yellow-500/30">
                      <summary className="flex items-center justify-between p-3 cursor-pointer bg-yellow-500/10 rounded-t-lg hover:bg-yellow-500/20">
                        <span className="font-medium text-sm flex items-center gap-2">
                          💎 Jewelry Template Settings
                        </span>
                        <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="p-3 space-y-3">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Collection Title</div>
                          <Input
                            value={String((settings as any).template_collection_title ?? '')}
                            onChange={(e) => updateField('template_collection_title' as any, e.target.value)}
                            placeholder="Luxury Collection"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Featured Label</div>
                          <Input
                            value={String((settings as any).template_featured_label ?? '')}
                            onChange={(e) => updateField('template_featured_label' as any, e.target.value)}
                            placeholder="Featured Piece"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Craft Story Title</div>
                          <Input
                            value={String((settings as any).template_craft_story_title ?? '')}
                            onChange={(e) => updateField('template_craft_story_title' as any, e.target.value)}
                            placeholder="The Art of Fine Jewelry"
                          />
                        </div>
                      </div>
                    </details>
                  )}

                  {normalizedTemplate === 'food' && (
                    <details className="group border rounded-lg border-red-500/30">
                      <summary className="flex items-center justify-between p-3 cursor-pointer bg-red-500/10 rounded-t-lg hover:bg-red-500/20">
                        <span className="font-medium text-sm flex items-center gap-2">
                          🍕 Food Template Settings
                        </span>
                        <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="p-3 space-y-3">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Menu Title</div>
                          <Input
                            value={String((settings as any).template_menu_title ?? '')}
                            onChange={(e) => updateField('template_menu_title' as any, e.target.value)}
                            placeholder="Our Menu"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Seasonal Title</div>
                          <Input
                            value={String((settings as any).template_seasonal_title ?? '')}
                            onChange={(e) => updateField('template_seasonal_title' as any, e.target.value)}
                            placeholder="Seasonal Specials"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Delivery Badge</div>
                          <Input
                            value={String((settings as any).template_delivery_badge ?? '')}
                            onChange={(e) => updateField('template_delivery_badge' as any, e.target.value)}
                            placeholder="Free Delivery"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Order Now Label</div>
                          <Input
                            value={String((settings as any).template_order_now_label ?? '')}
                            onChange={(e) => updateField('template_order_now_label' as any, e.target.value)}
                            placeholder="Order Now"
                          />
                        </div>
                      </div>
                    </details>
                  )}

                  {normalizedTemplate === 'cafe' && (
                    <details className="group border rounded-lg border-amber-500/30">
                      <summary className="flex items-center justify-between p-3 cursor-pointer bg-amber-500/10 rounded-t-lg hover:bg-amber-500/20">
                        <span className="font-medium text-sm flex items-center gap-2">
                          ☕ Cafe Template Settings
                        </span>
                        <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="p-3 space-y-3">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Coffee Menu Title</div>
                          <Input
                            value={String((settings as any).template_coffee_menu_title ?? '')}
                            onChange={(e) => updateField('template_coffee_menu_title' as any, e.target.value)}
                            placeholder="Coffee & Espresso"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Bakery Title</div>
                          <Input
                            value={String((settings as any).template_bakery_title ?? '')}
                            onChange={(e) => updateField('template_bakery_title' as any, e.target.value)}
                            placeholder="Fresh Bakery"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Hours Label</div>
                          <Input
                            value={String((settings as any).template_hours_label ?? '')}
                            onChange={(e) => updateField('template_hours_label' as any, e.target.value)}
                            placeholder="Open 7am - 10pm"
                          />
                        </div>
                      </div>
                    </details>
                  )}

                  {normalizedTemplate === 'perfume' && (
                    <details className="group border rounded-lg border-purple-500/30">
                      <summary className="flex items-center justify-between p-3 cursor-pointer bg-purple-500/10 rounded-t-lg hover:bg-purple-500/20">
                        <span className="font-medium text-sm flex items-center gap-2">
                          🌸 Perfume Template Settings
                        </span>
                        <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="p-3 space-y-3">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Collection Title</div>
                          <Input
                            value={String((settings as any).template_collection_title ?? '')}
                            onChange={(e) => updateField('template_collection_title' as any, e.target.value)}
                            placeholder="Signature Scents"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Notes Label</div>
                          <Input
                            value={String((settings as any).template_notes_label ?? '')}
                            onChange={(e) => updateField('template_notes_label' as any, e.target.value)}
                            placeholder="Fragrance Notes"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Best Seller Badge</div>
                          <Input
                            value={String((settings as any).template_bestseller_badge ?? '')}
                            onChange={(e) => updateField('template_bestseller_badge' as any, e.target.value)}
                            placeholder="Best Seller"
                          />
                        </div>
                      </div>
                    </details>
                  )}

                  {normalizedTemplate === 'bags' && (
                    <details className="group border rounded-lg border-gray-500/30">
                      <summary className="flex items-center justify-between p-3 cursor-pointer bg-gray-500/10 rounded-t-lg hover:bg-gray-500/20">
                        <span className="font-medium text-sm flex items-center gap-2">
                          👜 Bags Template Settings
                        </span>
                        <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="p-3 space-y-3">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Collection Title</div>
                          <Input
                            value={String((settings as any).template_collection_title ?? '')}
                            onChange={(e) => updateField('template_collection_title' as any, e.target.value)}
                            placeholder="Premium Collection"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Materials Label</div>
                          <Input
                            value={String((settings as any).template_materials_label ?? '')}
                            onChange={(e) => updateField('template_materials_label' as any, e.target.value)}
                            placeholder="Crafted Materials"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">New Arrival Badge</div>
                          <Input
                            value={String((settings as any).template_new_arrival_badge ?? '')}
                            onChange={(e) => updateField('template_new_arrival_badge' as any, e.target.value)}
                            placeholder="New Arrival"
                          />
                        </div>
                      </div>
                    </details>
                  )}

                  {normalizedTemplate === 'furniture' && (
                    <details className="group border rounded-lg border-emerald-500/30">
                      <summary className="flex items-center justify-between p-3 cursor-pointer bg-emerald-500/10 rounded-t-lg hover:bg-emerald-500/20">
                        <span className="font-medium text-sm flex items-center gap-2">
                          🛋️ Furniture Template Settings
                        </span>
                        <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="p-3 space-y-3">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Room Categories</div>
                          <Input
                            value={String((settings as any).template_room_categories ?? '')}
                            onChange={(e) => updateField('template_room_categories' as any, e.target.value)}
                            placeholder="Living Room, Bedroom, Office"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Style Label</div>
                          <Input
                            value={String((settings as any).template_style_label ?? '')}
                            onChange={(e) => updateField('template_style_label' as any, e.target.value)}
                            placeholder="Modern Design"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Delivery Info</div>
                          <Input
                            value={String((settings as any).template_delivery_info ?? '')}
                            onChange={(e) => updateField('template_delivery_info' as any, e.target.value)}
                            placeholder="Free Assembly & Delivery"
                          />
                        </div>
                      </div>
                    </details>
                  )}

                  {basicUploadError ? <div className="text-xs text-destructive">{basicUploadError}</div> : null}
                </div>
              ) : null}

              {hasSchemaDoc && schemaEditorEnabled ? (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Edit values for</div>
                  <div className="flex flex-wrap gap-2">
                    {([
                      { key: 'all', label: 'All' },
                      { key: 'mobile', label: 'Mobile' },
                      { key: 'tablet', label: 'Tablet' },
                      { key: 'desktop', label: 'Desktop' },
                    ] as const).map((b) => (
                      <Button
                        key={b.key}
                        type="button"
                        size="sm"
                        variant={editBreakpoint === b.key ? 'default' : 'outline'}
                        onClick={() => setEditBreakpoint(b.key)}
                      >
                        {b.label}
                      </Button>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Per-device edits are saved as breakpoint overrides.
                  </div>
                </div>
              ) : null}

              {hasSchemaDoc && schemaEditorEnabled && guardrailNote ? (
                <div className="text-xs text-muted-foreground">
                  {guardrailNote}
                </div>
              ) : null}

              {hasSchemaDoc && schemaEditorEnabled && contentWarnings.length ? (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Warnings ({contentWarnings.length})</div>
                  <div className="space-y-1">
                    {contentWarnings.slice(0, 8).map((w, idx) => (
                      <Button
                        key={`${w.path}-${idx}`}
                        type="button"
                        size="sm"
                        variant="outline"
                        className="w-full justify-start text-left"
                        onClick={() => setSelectedPath(w.path)}
                      >
                        {w.message}
                      </Button>
                    ))}
                    {contentWarnings.length > 8 ? (
                      <div className="text-xs text-muted-foreground">
                        +{contentWarnings.length - 8} more
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {hasSchemaDoc && schemaEditorEnabled && breadcrumbParts.length ? (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Selected</div>
                  <div className="flex flex-wrap gap-1">
                    {breadcrumbParts.map((b) => (
                      <Button
                        key={b.path}
                        type="button"
                        size="sm"
                        variant={b.path === selectedPath ? 'default' : 'outline'}
                        onClick={() => {
                          setSelectedPath(b.path === '__root' ? '__root' : b.path);
                          setSelectedKey(null);
                        }}
                      >
                        {b.label}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : null}

              {hasSchemaDoc && selectedPath ? (
                selectedSettingsKey ? (
                  <>
                    <div className="text-sm font-medium">Store Setting</div>
                    <div className="text-xs text-muted-foreground break-all">{String(selectedSettingsKey)}</div>
                    <Separator />
                    <Input
                      value={String((settings as any)[selectedSettingsKey] ?? '')}
                      onChange={(e) => updateField(selectedSettingsKey, e.target.value)}
                    />
                  </>
                ) : !schemaEditorEnabled ? (
                  <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
                    {!advancedAllowed
                      ? 'Gold required: Template layout controls are Advanced edits.'
                      : 'Switch to Advanced mode to access template layout controls.'}
                  </div>
                ) : selectedPath === '__root' && isShiro ? (
                  <>
                    <div className="space-y-3">
                      <div className="text-sm font-medium">Page Theme</div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={String(resolveBySchemaPath(schemaDoc, 'styles.theme').value || 'light') === 'light' ? 'default' : 'outline'}
                          onClick={() => setSchemaValue('styles.theme', 'light')}
                        >
                          Light
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={String(resolveBySchemaPath(schemaDoc, 'styles.theme').value || 'light') === 'dark' ? 'default' : 'outline'}
                          onClick={() => setSchemaValue('styles.theme', 'dark')}
                        >
                          Dark
                        </Button>
                      </div>

                      <Separator />
                      <div className="text-sm font-medium">Colors (optional overrides)</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Background</div>
                          <Input
                            value={String(resolveBySchemaPath(schemaDoc, 'styles.colors.background').value || '')}
                            placeholder="(default)"
                            onChange={(e) => setSchemaValue('styles.colors.background', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Text</div>
                          <Input
                            value={String(resolveBySchemaPath(schemaDoc, 'styles.colors.text').value || '')}
                            placeholder="(default)"
                            onChange={(e) => setSchemaValue('styles.colors.text', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Surface</div>
                          <Input
                            value={String(resolveBySchemaPath(schemaDoc, 'styles.colors.surface').value || '')}
                            placeholder="(default)"
                            onChange={(e) => setSchemaValue('styles.colors.surface', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Muted Text</div>
                          <Input
                            value={String(resolveBySchemaPath(schemaDoc, 'styles.colors.muted').value || '')}
                            placeholder="(default)"
                            onChange={(e) => setSchemaValue('styles.colors.muted', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Accent</div>
                          <Input
                            value={String(resolveBySchemaPath(schemaDoc, 'styles.colors.accent').value || '')}
                            placeholder="(default)"
                            onChange={(e) => setSchemaValue('styles.colors.accent', e.target.value)}
                          />
                        </div>
                      </div>

                      <Separator />
                      <div className="text-sm font-medium">Fonts</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Heading</div>
                          <Input
                            value={String(resolveBySchemaPath(schemaDoc, 'styles.fonts.heading').value || '')}
                            placeholder="(inherit)"
                            onChange={(e) => setSchemaValue('styles.fonts.heading', e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Body</div>
                          <Input
                            value={String(resolveBySchemaPath(schemaDoc, 'styles.fonts.body').value || '')}
                            placeholder="(inherit)"
                            onChange={(e) => setSchemaValue('styles.fonts.body', e.target.value)}
                          />
                        </div>
                      </div>

                      <Separator />
                      <div className="text-sm font-medium">Tokens</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Radius</div>
                          <Input
                            type="number"
                            value={String(resolveBySchemaPath(schemaDoc, 'styles.tokens.radius').value ?? '')}
                            placeholder="(default)"
                            onChange={(e) => setSchemaValue('styles.tokens.radius', e.target.value === '' ? null : Number(e.target.value))}
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Space</div>
                          <Input
                            type="number"
                            value={String(resolveBySchemaPath(schemaDoc, 'styles.tokens.space').value ?? '')}
                            placeholder="(default)"
                            onChange={(e) => setSchemaValue('styles.tokens.space', e.target.value === '' ? null : Number(e.target.value))}
                          />
                        </div>
                      </div>

                      <Separator />
                      <div className="text-sm font-medium">Background Image</div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={resolveBySchemaPath(schemaDoc, 'styles.background.enabled').value ? 'default' : 'outline'}
                            onClick={() => setSchemaValue('styles.background.enabled', !resolveBySchemaPath(schemaDoc, 'styles.background.enabled').value)}
                          >
                            {resolveBySchemaPath(schemaDoc, 'styles.background.enabled').value ? 'Enabled' : 'Disabled'}
                          </Button>
                          <div className="text-xs text-muted-foreground">Uses assets[assetKey].url</div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Asset Key</div>
                            <Input
                              value={String(resolveBySchemaPath(schemaDoc, 'styles.background.assetKey').value || 'page-bg')}
                              onChange={(e) => setSchemaValue('styles.background.assetKey', e.target.value || 'page-bg')}
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Fit</div>
                            <Input
                              value={String(resolveBySchemaPath(schemaDoc, 'styles.background.fit').value || 'cover')}
                              onChange={(e) => setSchemaValue('styles.background.fit', e.target.value)}
                              placeholder="cover | contain"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Upload Background</div>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const key = String(resolveBySchemaPath(schemaDoc, 'styles.background.assetKey').value || 'page-bg');
                              if (!key) return;
                              try {
                                const uploaded = await uploadImage(file);
                                pushHistory(settings);
                                const current = (settings as any).gold_page_shiro_hana_home || shiroDoc;
                                const assets = (current.assets && typeof current.assets === 'object') ? current.assets : {};
                                const next = {
                                  ...current,
                                  assets: {
                                    ...assets,
                                    [key]: {
                                      ...(assets[key] && typeof assets[key] === 'object' ? assets[key] : {}),
                                      url: uploaded.url,
                                    },
                                  },
                                };
                                setSettings((prev) => ({ ...prev, gold_page_shiro_hana_home: next } as any));
                                setSchemaValue('styles.background.enabled', true);
                              } catch (err) {
                                setJsonError((err as any)?.message || 'Upload failed');
                              }
                            }}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">X (0..1)</div>
                            <Input
                              type="number"
                                value={String(getResponsiveNumber(resolveBySchemaPath(schemaDoc, 'styles.background.posX').value, editBreakpoint) ?? 0.5)}
                                onChange={(e) => {
                                  const path = 'styles.background.posX';
                                  const current = resolveBySchemaPath(schemaDoc, path).value;
                                  setSchemaValue(path, setResponsiveNumber(current, editBreakpoint, Number(e.target.value)));
                                }}
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Y (0..1)</div>
                            <Input
                              type="number"
                                value={String(getResponsiveNumber(resolveBySchemaPath(schemaDoc, 'styles.background.posY').value, editBreakpoint) ?? 0.5)}
                                onChange={(e) => {
                                  const path = 'styles.background.posY';
                                  const current = resolveBySchemaPath(schemaDoc, path).value;
                                  setSchemaValue(path, setResponsiveNumber(current, editBreakpoint, Number(e.target.value)));
                                }}
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Opacity (0..1)</div>
                            <Input
                              type="number"
                                value={String(getResponsiveNumber(resolveBySchemaPath(schemaDoc, 'styles.background.opacity').value, editBreakpoint) ?? 1)}
                                onChange={(e) => {
                                  const path = 'styles.background.opacity';
                                  const current = resolveBySchemaPath(schemaDoc, path).value;
                                  setSchemaValue(path, setResponsiveNumber(current, editBreakpoint, Number(e.target.value)));
                                }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : selectedPath === '__root' && hasSchemaDoc && !isShiro ? (
                  <>
                    {/* Generic root editor for non-Shiro templates */}
                    <div className="space-y-3">
                      <div className="text-sm font-medium">Template Settings</div>
                      <div className="text-xs text-muted-foreground">
                        Click on any element in the preview to edit it, or browse the layout sections below.
                      </div>
                      
                      <Separator />
                      <div className="text-sm font-medium">Quick Access</div>
                      <div className="grid grid-cols-2 gap-2">
                        {['layout.header', 'layout.hero', 'layout.featured', 'layout.categories', 'layout.products', 'layout.footer'].map((path) => {
                          const val = resolveBySchemaPath(schemaDoc, path).value;
                          if (!val || typeof val !== 'object') return null;
                          return (
                            <Button
                              key={path}
                              type="button"
                              size="sm"
                              variant="outline"
                              className="justify-start"
                              onClick={() => setSelectedPath(path)}
                            >
                              {path.replace('layout.', '').charAt(0).toUpperCase() + path.replace('layout.', '').slice(1)}
                            </Button>
                          );
                        })}
                      </div>

                      <Separator />
                      <div className="text-sm font-medium">Styles</div>
                      {schemaDoc?.styles ? (
                        <div className="grid grid-cols-2 gap-2">
                          {schemaDoc.styles.theme !== undefined && (
                            <div className="col-span-2 space-y-1">
                              <div className="text-xs text-muted-foreground">Theme</div>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={String(schemaDoc.styles.theme || 'light') === 'light' ? 'default' : 'outline'}
                                  onClick={() => setSchemaValue('styles.theme', 'light')}
                                >
                                  Light
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={String(schemaDoc.styles.theme || 'light') === 'dark' ? 'default' : 'outline'}
                                  onClick={() => setSchemaValue('styles.theme', 'dark')}
                                >
                                  Dark
                                </Button>
                              </div>
                            </div>
                          )}
                          {schemaDoc.styles.primaryColor !== undefined && (
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">Primary Color</div>
                              <Input
                                type="color"
                                value={String(schemaDoc.styles.primaryColor || '#000000')}
                                onChange={(e) => setSchemaValue('styles.primaryColor', e.target.value)}
                              />
                            </div>
                          )}
                          {schemaDoc.styles.secondaryColor !== undefined && (
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">Secondary Color</div>
                              <Input
                                type="color"
                                value={String(schemaDoc.styles.secondaryColor || '#ffffff')}
                                onChange={(e) => setSchemaValue('styles.secondaryColor', e.target.value)}
                              />
                            </div>
                          )}
                          {schemaDoc.styles.accentColor !== undefined && (
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">Accent Color</div>
                              <Input
                                type="color"
                                value={String(schemaDoc.styles.accentColor || '#000000')}
                                onChange={(e) => setSchemaValue('styles.accentColor', e.target.value)}
                              />
                            </div>
                          )}
                          {schemaDoc.styles.textColor !== undefined && (
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">Text Color</div>
                              <Input
                                type="color"
                                value={String(schemaDoc.styles.textColor || '#000000')}
                                onChange={(e) => setSchemaValue('styles.textColor', e.target.value)}
                              />
                            </div>
                          )}
                          {schemaDoc.styles.fontFamily !== undefined && (
                            <div className="col-span-2 space-y-1">
                              <div className="text-xs text-muted-foreground">Font Family</div>
                              <Input
                                value={String(schemaDoc.styles.fontFamily || '')}
                                placeholder="Inter, system-ui, sans-serif"
                                onChange={(e) => setSchemaValue('styles.fontFamily', e.target.value)}
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground">No style options available for this template.</div>
                      )}
                    </div>
                  </>
                ) : selectedPath === 'layout.featured' && isShiro ? (
                  <>
                    <div className="space-y-3">
                      <div className="text-sm font-medium">Featured Products Grid</div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Columns</div>
                          <Input
                            type="number"
                            value={String(getResponsiveNumber(resolveBySchemaPath(schemaDoc, 'layout.featured.columns').value, editBreakpoint) ?? 3)}
                            onChange={(e) => {
                              const path = 'layout.featured.columns';
                              const current = resolveBySchemaPath(schemaDoc, path).value;
                              setSchemaValue(path, setResponsiveNumber(current, editBreakpoint, Number(e.target.value)));
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Gap (px)</div>
                          <Input
                            type="number"
                            value={String(getResponsiveNumber(resolveBySchemaPath(schemaDoc, 'layout.featured.gap').value, editBreakpoint) ?? 24)}
                            onChange={(e) => {
                              const path = 'layout.featured.gap';
                              const current = resolveBySchemaPath(schemaDoc, path).value;
                              setSchemaValue(path, setResponsiveNumber(current, editBreakpoint, Number(e.target.value)));
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Padding Y (px)</div>
                          <Input
                            type="number"
                            value={String(getResponsiveNumber(resolveBySchemaPath(schemaDoc, 'layout.featured.paddingY').value, editBreakpoint) ?? 48)}
                            onChange={(e) => {
                              const path = 'layout.featured.paddingY';
                              const current = resolveBySchemaPath(schemaDoc, path).value;
                              setSchemaValue(path, setResponsiveNumber(current, editBreakpoint, Number(e.target.value)));
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Padding X (px)</div>
                          <Input
                            type="number"
                            value={String(getResponsiveNumber(resolveBySchemaPath(schemaDoc, 'layout.featured.paddingX').value, editBreakpoint) ?? 24)}
                            onChange={(e) => {
                              const path = 'layout.featured.paddingX';
                              const current = resolveBySchemaPath(schemaDoc, path).value;
                              setSchemaValue(path, setResponsiveNumber(current, editBreakpoint, Number(e.target.value)));
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Section Background Color</div>
                        <Input
                          value={String(resolveBySchemaPath(schemaDoc, 'layout.featured.backgroundColor').value ?? '')}
                          placeholder="(none)"
                          onChange={(e) => setSchemaValue('layout.featured.backgroundColor', e.target.value)}
                        />
                      </div>

                      <Separator />
                      <div className="text-sm font-medium">Product Card</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Radius (px)</div>
                          <Input
                            type="number"
                            value={String(getResponsiveNumber(resolveBySchemaPath(schemaDoc, 'layout.featured.card.radius').value, editBreakpoint) ?? 12)}
                            onChange={(e) => {
                              const path = 'layout.featured.card.radius';
                              const current = resolveBySchemaPath(schemaDoc, path).value;
                              setSchemaValue(path, setResponsiveNumber(current, editBreakpoint, Number(e.target.value)));
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Image Height (px)</div>
                          <Input
                            type="number"
                            value={String(getResponsiveNumber(resolveBySchemaPath(schemaDoc, 'layout.featured.card.imageHeight').value, editBreakpoint) ?? 192)}
                            onChange={(e) => {
                              const path = 'layout.featured.card.imageHeight';
                              const current = resolveBySchemaPath(schemaDoc, path).value;
                              setSchemaValue(path, setResponsiveNumber(current, editBreakpoint, Number(e.target.value)));
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Shadow</div>
                        <div className="flex gap-2">
                          {(['none', 'sm', 'md'] as const).map((v) => (
                            <Button
                              key={v}
                              type="button"
                              size="sm"
                              variant={String(resolveBySchemaPath(schemaDoc, 'layout.featured.card.shadow').value || 'sm') === v ? 'default' : 'outline'}
                              onClick={() => setSchemaValue('layout.featured.card.shadow', v)}
                            >
                              {v}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <Separator />
                      <div className="text-sm font-medium">Reorder Items</div>
                      <div className="text-xs text-muted-foreground">Changes the order items appear in the grid</div>
                      <div className="space-y-2">
                        {(() => {
                          const items = resolveBySchemaPath(schemaDoc, 'layout.featured.items').value;
                          if (!Array.isArray(items) || !items.length) return <div className="text-xs text-muted-foreground">No items</div>;
                          return items.map((it: any, i: number) => {
                            const label = String(it?.title?.value || it?.id || `Item ${i + 1}`);
                            return (
                              <div key={String(it?.id || i)} className="flex items-center justify-between gap-2">
                                <div className="text-xs truncate flex-1">{label}</div>
                                <div className="flex gap-2">
                                  <Button type="button" size="sm" variant="outline" disabled={i === 0} onClick={() => reorderArray('layout.featured.items', i, i - 1)}>
                                    Up
                                  </Button>
                                  <Button type="button" size="sm" variant="outline" disabled={i === items.length - 1} onClick={() => reorderArray('layout.featured.items', i, i + 1)}>
                                    Down
                                  </Button>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </>
                ) : selectedPath === 'layout.header' && isShiro ? (
                  <>
                    <div className="space-y-3">
                      <div className="text-sm font-medium">Header Layout</div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={(resolveBySchemaPath(schemaDoc, 'layout.header.sticky').value ?? true) ? 'default' : 'outline'}
                          onClick={() => setSchemaValue('layout.header.sticky', !(resolveBySchemaPath(schemaDoc, 'layout.header.sticky').value ?? true))}
                        >
                          {(resolveBySchemaPath(schemaDoc, 'layout.header.sticky').value ?? true) ? 'Sticky' : 'Not Sticky'}
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Padding Y (px)</div>
                          <Input
                            type="number"
                            value={String(getResponsiveNumber(resolveBySchemaPath(schemaDoc, 'layout.header.paddingY').value, editBreakpoint) ?? 16)}
                            onChange={(e) => {
                              const path = 'layout.header.paddingY';
                              const current = resolveBySchemaPath(schemaDoc, path).value;
                              setSchemaValue(path, setResponsiveNumber(current, editBreakpoint, Number(e.target.value)));
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Padding X (px)</div>
                          <Input
                            type="number"
                            value={String(getResponsiveNumber(resolveBySchemaPath(schemaDoc, 'layout.header.paddingX').value, editBreakpoint) ?? 24)}
                            onChange={(e) => {
                              const path = 'layout.header.paddingX';
                              const current = resolveBySchemaPath(schemaDoc, path).value;
                              setSchemaValue(path, setResponsiveNumber(current, editBreakpoint, Number(e.target.value)));
                            }}
                          />
                        </div>
                      </div>

                      <Separator />
                      <div className="text-sm font-medium">Reorder Nav Links</div>
                      <div className="text-xs text-muted-foreground">Desktop nav order</div>
                      <div className="space-y-2">
                        {(() => {
                          const nav = resolveBySchemaPath(schemaDoc, 'layout.header.nav').value;
                          if (!Array.isArray(nav) || !nav.length) return <div className="text-xs text-muted-foreground">No nav links</div>;
                          return nav.map((n: any, i: number) => {
                            const label = String((n?.label?.value ?? n?.value ?? n?.label ?? n) || `Link ${i + 1}`);
                            return (
                              <div key={i} className="flex items-center justify-between gap-2">
                                <div className="text-xs truncate flex-1">{label}</div>
                                <div className="flex gap-2">
                                  <Button type="button" size="sm" variant="outline" disabled={i === 0} onClick={() => reorderArray('layout.header.nav', i, i - 1)}>
                                    Up
                                  </Button>
                                  <Button type="button" size="sm" variant="outline" disabled={i === nav.length - 1} onClick={() => reorderArray('layout.header.nav', i, i + 1)}>
                                    Down
                                  </Button>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>

                      <Separator />
                      <div className="text-sm font-medium">Reorder Header Buttons</div>
                      <div className="text-xs text-muted-foreground">CTA button order</div>
                      <div className="space-y-2">
                        {(() => {
                          const ctas = resolveBySchemaPath(schemaDoc, 'layout.header.cta').value;
                          if (!Array.isArray(ctas) || !ctas.length) return <div className="text-xs text-muted-foreground">No buttons</div>;
                          return ctas.map((c: any, i: number) => {
                            const label = String(c?.label?.value || `Button ${i + 1}`);
                            return (
                              <div key={i} className="flex items-center justify-between gap-2">
                                <div className="text-xs truncate flex-1">{label}</div>
                                <div className="flex gap-2">
                                  <Button type="button" size="sm" variant="outline" disabled={i === 0} onClick={() => reorderArray('layout.header.cta', i, i - 1)}>
                                    Up
                                  </Button>
                                  <Button type="button" size="sm" variant="outline" disabled={i === ctas.length - 1} onClick={() => reorderArray('layout.header.cta', i, i + 1)}>
                                    Down
                                  </Button>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </>
                ) : selectedPath === 'layout.hero' && isShiro ? (
                  <>
                    <div className="space-y-3">
                      <div className="text-sm font-medium">Hero Layout</div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Padding Y (px)</div>
                          <Input
                            type="number"
                            value={String(getResponsiveNumber(resolveBySchemaPath(schemaDoc, 'layout.hero.paddingY').value, editBreakpoint) ?? 48)}
                            onChange={(e) => {
                              const path = 'layout.hero.paddingY';
                              const current = resolveBySchemaPath(schemaDoc, path).value;
                              setSchemaValue(path, setResponsiveNumber(current, editBreakpoint, Number(e.target.value)));
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Padding X (px)</div>
                          <Input
                            type="number"
                            value={String(getResponsiveNumber(resolveBySchemaPath(schemaDoc, 'layout.hero.paddingX').value, editBreakpoint) ?? 24)}
                            onChange={(e) => {
                              const path = 'layout.hero.paddingX';
                              const current = resolveBySchemaPath(schemaDoc, path).value;
                              setSchemaValue(path, setResponsiveNumber(current, editBreakpoint, Number(e.target.value)));
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Gap (px)</div>
                          <Input
                            type="number"
                            value={String(getResponsiveNumber(resolveBySchemaPath(schemaDoc, 'layout.hero.gap').value, editBreakpoint) ?? 32)}
                            onChange={(e) => {
                              const path = 'layout.hero.gap';
                              const current = resolveBySchemaPath(schemaDoc, path).value;
                              setSchemaValue(path, setResponsiveNumber(current, editBreakpoint, Number(e.target.value)));
                            }}
                          />
                        </div>
                      </div>

                      <Separator />
                      <div className="text-sm font-medium">Hero Image Size</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Height (px)</div>
                          <Input
                            type="number"
                            value={String(getResponsiveNumber(resolveBySchemaPath(schemaDoc, 'layout.hero.imageHeight').value, editBreakpoint) ?? 320)}
                            onChange={(e) => {
                              const path = 'layout.hero.imageHeight';
                              const current = resolveBySchemaPath(schemaDoc, path).value;
                              setSchemaValue(path, setResponsiveNumber(current, editBreakpoint, Number(e.target.value)));
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Height md+ (px)</div>
                          <Input
                            type="number"
                            value={String(resolveBySchemaPath(schemaDoc, 'layout.hero.imageHeightMd').value ?? 384)}
                            onChange={(e) => setSchemaValue('layout.hero.imageHeightMd', Number(e.target.value))}
                          />
                        </div>
                      </div>

                      <Separator />
                      <div className="text-sm font-medium">Reorder Hero Buttons</div>
                      <div className="text-xs text-muted-foreground">CTA button order</div>
                      <div className="space-y-2">
                        {(() => {
                          const ctas = resolveBySchemaPath(schemaDoc, 'layout.hero.cta').value;
                          if (!Array.isArray(ctas) || !ctas.length) return <div className="text-xs text-muted-foreground">No buttons</div>;
                          return ctas.map((c: any, i: number) => {
                            const label = String(c?.label?.value || `Button ${i + 1}`);
                            return (
                              <div key={i} className="flex items-center justify-between gap-2">
                                <div className="text-xs truncate flex-1">{label}</div>
                                <div className="flex gap-2">
                                  <Button type="button" size="sm" variant="outline" disabled={i === 0} onClick={() => reorderArray('layout.hero.cta', i, i - 1)}>
                                    Up
                                  </Button>
                                  <Button type="button" size="sm" variant="outline" disabled={i === ctas.length - 1} onClick={() => reorderArray('layout.hero.cta', i, i + 1)}>
                                    Down
                                  </Button>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </>
                ) : selectedPath === 'layout.footer' && isShiro ? (
                  <>
                    <div className="space-y-3">
                      <div className="text-sm font-medium">Footer Layout</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Padding Y (px)</div>
                          <Input
                            type="number"
                            value={String(getResponsiveNumber(resolveBySchemaPath(schemaDoc, 'layout.footer.paddingY').value, editBreakpoint) ?? 32)}
                            onChange={(e) => {
                              const path = 'layout.footer.paddingY';
                              const current = resolveBySchemaPath(schemaDoc, path).value;
                              setSchemaValue(path, setResponsiveNumber(current, editBreakpoint, Number(e.target.value)));
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Padding X (px)</div>
                          <Input
                            type="number"
                            value={String(getResponsiveNumber(resolveBySchemaPath(schemaDoc, 'layout.footer.paddingX').value, editBreakpoint) ?? 24)}
                            onChange={(e) => {
                              const path = 'layout.footer.paddingX';
                              const current = resolveBySchemaPath(schemaDoc, path).value;
                              setSchemaValue(path, setResponsiveNumber(current, editBreakpoint, Number(e.target.value)));
                            }}
                          />
                        </div>
                      </div>

                      <Separator />
                      <div className="text-sm font-medium">Reorder Footer Links</div>
                      <div className="text-xs text-muted-foreground">Link order</div>
                      <div className="space-y-2">
                        {(() => {
                          const links = resolveBySchemaPath(schemaDoc, 'layout.footer.links').value;
                          if (!Array.isArray(links) || !links.length) return <div className="text-xs text-muted-foreground">No links</div>;
                          return links.map((l: any, i: number) => {
                            const label = String((l?.label?.value ?? l?.value ?? l?.label ?? l) || `Link ${i + 1}`);
                            return (
                              <div key={i} className="flex items-center justify-between gap-2">
                                <div className="text-xs truncate flex-1">{label}</div>
                                <div className="flex gap-2">
                                  <Button type="button" size="sm" variant="outline" disabled={i === 0} onClick={() => reorderArray('layout.footer.links', i, i - 1)}>
                                    Up
                                  </Button>
                                  <Button type="button" size="sm" variant="outline" disabled={i === links.length - 1} onClick={() => reorderArray('layout.footer.links', i, i + 1)}>
                                    Down
                                  </Button>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </>
                ) :
                !selectedSchema ? (
                  <div className="text-sm text-muted-foreground">Selected path has no value.</div>
                ) : (
                  <>
                    <div className="text-sm font-medium">Schema Path</div>
                    <div className="text-xs text-muted-foreground break-all">{selectedPath}</div>
                    <Separator />
                    {selectedSchema && typeof selectedSchema === 'object' && selectedSchema.type === 'text' ? (
                      <>
                        <div className="text-sm font-medium">Text</div>
                        <Textarea
                          value={String(selectedSchema.value ?? '')}
                          onChange={(e) => setSchemaValue(`${selectedPath}.value`, e.target.value)}
                          rows={4}
                        />

                        <Separator />
                        <div className="text-sm font-medium">Style</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Color</div>
                            <Input
                              type="color"
                              value={String(selectedSchema.style?.color || '#000000')}
                              onChange={(e) => setSchemaValue(`${selectedPath}.style.color`, e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Background</div>
                            <Input
                              type="color"
                              value={String(selectedSchema.style?.backgroundColor || '#ffffff')}
                              onChange={(e) => setSchemaValue(`${selectedPath}.style.backgroundColor`, e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Font Size</div>
                            <Input
                              type="number"
                              value={String(getResponsiveNumber(resolveBySchemaPath(schemaDoc, `${selectedPath}.style.fontSize`).value, editBreakpoint) ?? '')}
                              onChange={(e) => {
                                const path = `${selectedPath}.style.fontSize`;
                                const current = resolveBySchemaPath(schemaDoc, path).value;
                                if (!e.target.value) {
                                  setSchemaValue(path, undefined);
                                  return;
                                }
                                const next = Number(e.target.value);
                                if (isShiro && isResponsiveNumberPath(path)) {
                                  setSchemaValue(path, setResponsiveNumber(current, editBreakpoint, next));
                                  return;
                                }
                                setSchemaValue(path, next);
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Font Weight</div>
                            <Input
                              type="number"
                              value={String(getResponsiveNumber(resolveBySchemaPath(schemaDoc, `${selectedPath}.style.fontWeight`).value, editBreakpoint) ?? '')}
                              onChange={(e) => {
                                const path = `${selectedPath}.style.fontWeight`;
                                const current = resolveBySchemaPath(schemaDoc, path).value;
                                if (!e.target.value) {
                                  setSchemaValue(path, undefined);
                                  return;
                                }
                                const next = Number(e.target.value);
                                if (isShiro && isResponsiveNumberPath(path)) {
                                  setSchemaValue(path, setResponsiveNumber(current, editBreakpoint, next));
                                  return;
                                }
                                setSchemaValue(path, next);
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Line Height</div>
                            <Input
                              type="number"
                              value={String(getResponsiveNumber(resolveBySchemaPath(schemaDoc, `${selectedPath}.style.lineHeight`).value, editBreakpoint) ?? '')}
                              onChange={(e) => {
                                const path = `${selectedPath}.style.lineHeight`;
                                const current = resolveBySchemaPath(schemaDoc, path).value;
                                if (!e.target.value) {
                                  setSchemaValue(path, undefined);
                                  return;
                                }
                                const next = Number(e.target.value);
                                if (isShiro && isResponsiveNumberPath(path)) {
                                  setSchemaValue(path, setResponsiveNumber(current, editBreakpoint, next));
                                  return;
                                }
                                setSchemaValue(path, next);
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Letter Spacing</div>
                            <Input
                              type="number"
                              value={String(getResponsiveNumber(resolveBySchemaPath(schemaDoc, `${selectedPath}.style.letterSpacing`).value, editBreakpoint) ?? '')}
                              onChange={(e) => {
                                const path = `${selectedPath}.style.letterSpacing`;
                                const current = resolveBySchemaPath(schemaDoc, path).value;
                                if (!e.target.value) {
                                  setSchemaValue(path, undefined);
                                  return;
                                }
                                const next = Number(e.target.value);
                                if (isShiro && isResponsiveNumberPath(path)) {
                                  setSchemaValue(path, setResponsiveNumber(current, editBreakpoint, next));
                                  return;
                                }
                                setSchemaValue(path, next);
                              }}
                            />
                          </div>
                          <div className="col-span-2 space-y-1">
                            <div className="text-xs text-muted-foreground">Font Family</div>
                            <Input
                              value={String(selectedSchema.style?.fontFamily ?? '')}
                              onChange={(e) => setSchemaValue(`${selectedPath}.style.fontFamily`, e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Padding</div>
                            <Input
                              type="number"
                              value={String(getResponsiveNumber(resolveBySchemaPath(schemaDoc, `${selectedPath}.style.padding`).value, editBreakpoint) ?? '')}
                              onChange={(e) => {
                                const path = `${selectedPath}.style.padding`;
                                const current = resolveBySchemaPath(schemaDoc, path).value;
                                if (!e.target.value) {
                                  setSchemaValue(path, undefined);
                                  return;
                                }
                                const next = Number(e.target.value);
                                if (isShiro && isResponsiveNumberPath(path)) {
                                  setSchemaValue(path, setResponsiveNumber(current, editBreakpoint, next));
                                  return;
                                }
                                setSchemaValue(path, next);
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Margin</div>
                            <Input
                              type="number"
                              value={String(getResponsiveNumber(resolveBySchemaPath(schemaDoc, `${selectedPath}.style.margin`).value, editBreakpoint) ?? '')}
                              onChange={(e) => {
                                const path = `${selectedPath}.style.margin`;
                                const current = resolveBySchemaPath(schemaDoc, path).value;
                                if (!e.target.value) {
                                  setSchemaValue(path, undefined);
                                  return;
                                }
                                const next = Number(e.target.value);
                                if (isShiro && isResponsiveNumberPath(path)) {
                                  setSchemaValue(path, setResponsiveNumber(current, editBreakpoint, next));
                                  return;
                                }
                                setSchemaValue(path, next);
                              }}
                            />
                          </div>
                        </div>
                        {hasSchemaDoc && editBreakpoint !== 'all' ? (
                          <div className="text-xs text-muted-foreground">
                            Style numbers save as {editBreakpoint} overrides
                          </div>
                        ) : null}
                      </>
                    ) : typeof selectedSchema === 'number' ? (
                      <>
                        <div className="text-sm font-medium">Number</div>
                        <Input
                          type="number"
                          value={String(getResponsiveNumber(resolveBySchemaPath(schemaDoc, selectedPath).value, editBreakpoint) ?? selectedSchema)}
                          onChange={(e) => {
                            const next = Number(e.target.value);
                            if (hasSchemaDoc && isResponsiveNumberPath(selectedPath)) {
                              const current = resolveBySchemaPath(schemaDoc, selectedPath).value;
                              setSchemaValue(selectedPath, setResponsiveNumber(current, editBreakpoint, next));
                              return;
                            }
                            setSchemaValue(selectedPath, next);
                          }}
                        />
                        {hasSchemaDoc && isResponsiveNumberPath(selectedPath) && editBreakpoint !== 'all' ? (
                          <div className="text-xs text-muted-foreground">
                            Saving as {editBreakpoint} override
                          </div>
                        ) : null}
                      </>
                    ) : typeof selectedSchema === 'boolean' ? (
                      <>
                        <div className="text-sm font-medium">Boolean</div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="checkbox"
                            checked={selectedSchema}
                            onChange={(e) => setSchemaValue(selectedPath, e.target.checked)}
                          />
                          <div className="text-sm">{selectedSchema ? 'true' : 'false'}</div>
                        </div>
                      </>
                    ) : selectedSchema && typeof selectedSchema === 'string' ? (
                      <>
                        <div className="text-sm font-medium">Text</div>
                        <Input value={selectedSchema} onChange={(e) => setSchemaValue(selectedPath, e.target.value)} />
                        {/^(#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}))$/.test(selectedSchema) ? (
                          <Input
                            type="color"
                            value={selectedSchema}
                            onChange={(e) => setSchemaValue(selectedPath, e.target.value)}
                          />
                        ) : null}
                      </>
                    ) : selectedSchema && typeof selectedSchema === 'object' && selectedSchema.type === 'image' ? (
                      <>
                        <div className="text-sm font-medium">Asset Key</div>
                        <Input
                          value={String((selectedSchema as any).assetKey || '')}
                          onChange={(e) => setSchemaValue(`${selectedPath}.assetKey`, e.target.value)}
                        />

                        <div className="text-sm font-medium">Alt Text</div>
                        <Input
                          value={String((selectedSchema as any).alt || '')}
                          onChange={(e) => setSchemaValue(`${selectedPath}.alt`, e.target.value)}
                        />

                        <div className="text-sm font-medium">Fit</div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={String((selectedSchema as any).fit || 'cover') === 'cover' ? 'default' : 'outline'}
                            onClick={() => setSchemaValue(`${selectedPath}.fit`, 'cover')}
                          >
                            Cover
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={String((selectedSchema as any).fit || 'cover') === 'contain' ? 'default' : 'outline'}
                            onClick={() => setSchemaValue(`${selectedPath}.fit`, 'contain')}
                          >
                            Contain
                          </Button>
                        </div>

                        <div className="text-sm font-medium">Image URL</div>
                        <Input
                          value={String(((settings as any)[schemaDocKey || '']?.assets?.[selectedSchema.assetKey]?.url) ?? '')}
                          onChange={(e) => {
                            const key = String(selectedSchema.assetKey || '');
                            if (!key || !schemaDocKey) return;
                            const nextUrl = e.target.value;
                            pushHistory(settings);
                            const current = (settings as any)[schemaDocKey] || schemaDoc;
                            const assets = (current.assets && typeof current.assets === 'object') ? current.assets : {};
                            const next = {
                              ...current,
                              assets: {
                                ...assets,
                                [key]: {
                                  ...(assets[key] && typeof assets[key] === 'object' ? assets[key] : {}),
                                  url: nextUrl,
                                },
                              },
                            };
                            setSettings((prev) =>
                              ({
                                ...prev,
                                [schemaDocKey]: next,
                                ...(key === 'logo-main' ? { store_logo: nextUrl } : null),
                                ...(key === 'hero-sushi' ? { banner_url: nextUrl } : null),
                              } as any)
                            );
                          }}
                        />
                        <div className="text-xs text-muted-foreground">Asset key: {String(selectedSchema.assetKey)}</div>

                        <Separator />
                        <div className="text-sm font-medium">Asset Library</div>
                        <div className="text-xs text-muted-foreground">Click to use an existing uploaded asset</div>
                        <div className="max-h-40 overflow-auto rounded border p-2 space-y-2">
                          {Object.entries(((schemaDoc as any)?.assets && typeof (schemaDoc as any).assets === 'object') ? (schemaDoc as any).assets : {}).map(([key, meta]: any) => {
                            const url = meta?.url ? String(meta.url) : '';
                            return (
                              <button
                                key={key}
                                type="button"
                                className="w-full flex items-center gap-2 text-left rounded p-1 hover:bg-muted"
                                onClick={() => setSchemaValue(`${selectedPath}.assetKey`, String(key))}
                              >
                                <div className="w-10 h-10 rounded overflow-hidden bg-muted flex items-center justify-center">
                                  {url ? (
                                    <img src={url} alt={String(key)} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="text-[10px] text-muted-foreground">No URL</div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-medium truncate">{String(key)}</div>
                                  <div className="text-[10px] text-muted-foreground truncate">{url || '(not set)'}</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        <Separator />
                        <div className="text-sm font-medium">Upload</div>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file || !schemaDocKey) return;
                            const key = String(selectedSchema.assetKey || '');
                            if (!key) return;
                            try {
                              const uploaded = await uploadImage(file);
                              pushHistory(settings);
                              const current = (settings as any)[schemaDocKey] || schemaDoc;
                              const assets = (current.assets && typeof current.assets === 'object') ? current.assets : {};
                              const next = {
                                ...current,
                                assets: {
                                  ...assets,
                                  [key]: {
                                    ...(assets[key] && typeof assets[key] === 'object' ? assets[key] : {}),
                                    url: uploaded.url,
                                  },
                                },
                              };
                              setSettings((prev) =>
                                ({
                                  ...prev,
                                  [schemaDocKey]: next,
                                  ...(key === 'logo-main' ? { store_logo: uploaded.url } : null),
                                  ...(key === 'hero-sushi' ? { banner_url: uploaded.url } : null),
                                } as any)
                              );
                            } catch (err) {
                              setJsonError((err as any)?.message || 'Upload failed');
                            }
                          }}
                        />

                        <Separator />
                        <div className="text-sm font-medium">Position & Scale</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">X (0..1)</div>
                            <Input
                              type="number"
                              value={String(getResponsiveNumber((selectedSchema as any).posX, editBreakpoint) ?? 0.5)}
                              onChange={(e) => {
                                const path = `${selectedPath}.posX`;
                                const current = resolveBySchemaPath(schemaDoc, path).value;
                                setSchemaValue(path, setResponsiveNumber(current, editBreakpoint, Number(e.target.value)));
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Y (0..1)</div>
                            <Input
                              type="number"
                              value={String(getResponsiveNumber((selectedSchema as any).posY, editBreakpoint) ?? 0.5)}
                              onChange={(e) => {
                                const path = `${selectedPath}.posY`;
                                const current = resolveBySchemaPath(schemaDoc, path).value;
                                setSchemaValue(path, setResponsiveNumber(current, editBreakpoint, Number(e.target.value)));
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Scale X</div>
                            <Input
                              type="number"
                              value={String(getResponsiveNumber((selectedSchema as any).scaleX ?? (selectedSchema as any).size, editBreakpoint) ?? 1)}
                              onChange={(e) => {
                                const path = `${selectedPath}.scaleX`;
                                const current = resolveBySchemaPath(schemaDoc, path).value;
                                setSchemaValue(path, setResponsiveNumber(current, editBreakpoint, Number(e.target.value)));
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Scale Y</div>
                            <Input
                              type="number"
                              value={String(getResponsiveNumber((selectedSchema as any).scaleY ?? (selectedSchema as any).size, editBreakpoint) ?? 1)}
                              onChange={(e) => {
                                const path = `${selectedPath}.scaleY`;
                                const current = resolveBySchemaPath(schemaDoc, path).value;
                                setSchemaValue(path, setResponsiveNumber(current, editBreakpoint, Number(e.target.value)));
                              }}
                            />
                          </div>
                        </div>
                      </>
                    ) : isCtaLabelPath ? (
                      <>
                        <div className="text-sm font-medium">Button Label</div>
                        <Input
                          value={String((selectedSchema as any)?.value ?? '')}
                          onChange={(e) => setSchemaValue(`${selectedPath}.value`, e.target.value)}
                        />
                        {ctaActionPath ? (
                          <>
                            <Separator />
                            <div className="text-sm font-medium">Button Action (Route)</div>
                            <Input
                              value={String(resolveBySchemaPath(schemaDoc, ctaActionPath).value ?? '')}
                              onChange={(e) => setSchemaValue(ctaActionPath, e.target.value)}
                            />
                          </>
                        ) : null}
                      </>
                    ) : isLinkLabelPath ? (
                      <>
                        <div className="text-sm font-medium">Link Label</div>
                        <Input
                          value={String((selectedSchema as any)?.value ?? '')}
                          onChange={(e) => setSchemaValue(`${selectedPath}.value`, e.target.value)}
                        />
                        {linkActionPath ? (
                          <>
                            <Separator />
                            <div className="text-sm font-medium">Link Action (URL/Route)</div>
                            <Input
                              value={String(resolveBySchemaPath(schemaDoc, linkActionPath).value ?? '')}
                              onChange={(e) => setSchemaValue(linkActionPath, e.target.value)}
                            />
                          </>
                        ) : null}
                      </>
                    ) : selectedSchema && (Array.isArray(selectedSchema) || typeof selectedSchema === 'object') ? (
                      <>
                        <div className="text-sm font-medium">JSON</div>
                        <Textarea
                          value={jsonDraft}
                          onChange={(e) => {
                            setJsonDraft(e.target.value);
                            setJsonError('');
                          }}
                          onBlur={() => {
                            try {
                              const parsed = JSON.parse(jsonDraft);
                              setSchemaValue(selectedPath, parsed);
                            } catch (e) {
                              setJsonError((e as any)?.message || 'Invalid JSON');
                            }
                          }}
                          rows={10}
                        />
                        {jsonError ? <div className="text-xs text-destructive">{jsonError}</div> : null}
                        <div className="text-xs text-muted-foreground">Tip: paste valid JSON then click outside to apply.</div>
                      </>
                    ) : (
                      <div className="text-sm text-muted-foreground">Selected element is not editable yet.</div>
                    )}
                  </>
                )
              ) : isGoldBaby ? (
                !selectedPath || selectedPath === '__root' ? (
                  <div className="text-sm text-muted-foreground">Click something in the preview to edit.</div>
                ) : selectedPath.startsWith('__settings.') && selectedSettingsKey ? (
                  <>
                    <div className="text-sm font-medium">{String(selectedSettingsKey)}</div>
                    <Input
                      type={
                        /color/i.test(String(selectedSettingsKey))
                          ? 'color'
                          : /url|logo/i.test(String(selectedSettingsKey))
                            ? 'url'
                            : 'text'
                      }
                      value={String((settings as any)[selectedSettingsKey] ?? '')}
                      onChange={(e) => updateField(selectedSettingsKey as any, e.target.value)}
                    />
                    <div className="text-xs text-muted-foreground">Path: {selectedPath}</div>
                  </>
                ) : (
                  (() => {
                    if (!schemaEditorEnabled) {
                      return (
                        <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
                          {!advancedAllowed
                            ? 'Gold required: this is an Advanced edit.'
                            : 'Switch to Advanced mode to edit this.'}
                        </div>
                      );
                    }

                    const listRoot =
                      selectedPath.startsWith('layout.hero.ageChips')
                        ? 'layout.hero.ageChips'
                        : selectedPath.startsWith('layout.footer.links')
                          ? 'layout.footer.links'
                          : selectedPath.startsWith('layout.categories.categories')
                            ? 'layout.categories.categories'
                            : null;

                    if (listRoot) {
                      const arr = resolveBySchemaPath(babyDoc, listRoot).value;
                      const isCategories = listRoot === 'layout.categories.categories';
                      if (!Array.isArray(arr)) {
                        return <div className="text-sm text-muted-foreground">Selected element is not editable yet.</div>;
                      }

                      return (
                        <div className="space-y-3">
                          <div className="text-sm font-medium">
                            {listRoot === 'layout.hero.ageChips'
                              ? 'Age Chips'
                              : listRoot === 'layout.footer.links'
                                ? 'Footer Links'
                                : 'Categories'}
                          </div>

                          <div className="space-y-2">
                            {arr.slice(0, 20).map((item: any, idx: number) => (
                              <div key={`${listRoot}-${idx}`} className="flex items-center gap-2">
                                {isCategories ? (
                                  <>
                                    <Input
                                      className="flex-1"
                                      value={String(item?.label ?? '')}
                                      onChange={(e) => {
                                        const next = arr.slice();
                                        next[idx] = { ...(next[idx] || {}), label: e.target.value };
                                        setSchemaValue(listRoot, next);
                                      }}
                                    />
                                    <Input
                                      className="w-20"
                                      value={String(item?.icon ?? '')}
                                      onChange={(e) => {
                                        const next = arr.slice();
                                        next[idx] = { ...(next[idx] || {}), icon: e.target.value };
                                        setSchemaValue(listRoot, next);
                                      }}
                                    />
                                  </>
                                ) : (
                                  <Input
                                    className="flex-1"
                                    value={String(item ?? '')}
                                    onChange={(e) => {
                                      const next = arr.slice();
                                      next[idx] = e.target.value;
                                      setSchemaValue(listRoot, next);
                                    }}
                                  />
                                )}

                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  disabled={idx === 0}
                                  onClick={() => reorderArray(listRoot, idx, idx - 1)}
                                >
                                  ↑
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  disabled={idx === arr.length - 1}
                                  onClick={() => reorderArray(listRoot, idx, idx + 1)}
                                >
                                  ↓
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const next = arr.filter((_: any, i: number) => i !== idx);
                                    setSchemaValue(listRoot, next);
                                  }}
                                >
                                  Remove
                                </Button>
                              </div>
                            ))}
                          </div>

                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const next = arr.slice();
                              next.push(isCategories ? { label: 'New', icon: '✨' } : 'New');
                              setSchemaValue(listRoot, next);
                            }}
                          >
                            Add
                          </Button>

                          <div className="text-xs text-muted-foreground">Path: {listRoot}</div>
                        </div>
                      );
                    }

                    if (typeof selectedSchema === 'string') {
                      const long = selectedSchema.length > 120 || selectedSchema.includes('\n');
                      return (
                        <>
                          <div className="text-sm font-medium">Text</div>
                          {long ? (
                            <Textarea
                              value={selectedSchema}
                              onChange={(e) => setSchemaValue(selectedPath, e.target.value)}
                              rows={8}
                            />
                          ) : (
                            <Input value={selectedSchema} onChange={(e) => setSchemaValue(selectedPath, e.target.value)} />
                          )}
                          <div className="text-xs text-muted-foreground">Path: {selectedPath}</div>
                        </>
                      );
                    }

                    if (selectedSchema && (Array.isArray(selectedSchema) || typeof selectedSchema === 'object')) {
                      return (
                        <>
                          <div className="text-sm font-medium">JSON</div>
                          <Textarea
                            value={jsonDraft}
                            onChange={(e) => {
                              setJsonDraft(e.target.value);
                              setJsonError('');
                            }}
                            onBlur={() => {
                              try {
                                const parsed = JSON.parse(jsonDraft);
                                setSchemaValue(selectedPath, parsed);
                              } catch (e) {
                                setJsonError((e as any)?.message || 'Invalid JSON');
                              }
                            }}
                            rows={10}
                          />
                          {jsonError ? <div className="text-xs text-destructive">{jsonError}</div> : null}
                          <div className="text-xs text-muted-foreground">Tip: paste valid JSON then click outside to apply.</div>
                        </>
                      );
                    }

                    return <div className="text-sm text-muted-foreground">Selected element is not editable yet.</div>;
                  })()
                )
              ) : !selectedPath ? (
                <div className="text-sm text-muted-foreground">Select something in the preview to edit.</div>
              ) : selectedPath.startsWith('__settings.') && selectedSettingsKey ? (
                // Handle __settings.* paths for ALL templates (universal settings editor)
                <>
                  <div className="text-sm font-medium capitalize">{String(selectedSettingsKey).replace(/_/g, ' ')}</div>
                  {(() => {
                    const advancedPath = isAdvancedSelectedPath(selectedPath);
                    const lockedByTier = advancedPath && !advancedAllowed;
                    const lockedByMode = advancedPath && editorMode !== 'advanced';
                    const locked = lockedByTier || lockedByMode;

                    if (!locked) return null;

                    return (
                      <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
                        {lockedByTier
                          ? 'Gold required: this is an Advanced edit.'
                          : 'Switch to Advanced mode to edit this field.'}
                      </div>
                    );
                  })()}
                  {/* Show appropriate input based on field name */}
                  {/color/i.test(String(selectedSettingsKey)) ? (
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        className="w-12 h-10 p-1"
                        value={String((settings as any)[selectedSettingsKey] ?? '#000000')}
                        onChange={(e) => {
                          const advancedPath = isAdvancedSelectedPath(selectedPath);
                          if ((advancedPath && !advancedAllowed) || (advancedPath && editorMode !== 'advanced')) return;
                          updateField(selectedSettingsKey as any, e.target.value);
                        }}
                      />
                      <Input
                        value={String((settings as any)[selectedSettingsKey] ?? '')}
                        onChange={(e) => {
                          const advancedPath = isAdvancedSelectedPath(selectedPath);
                          if ((advancedPath && !advancedAllowed) || (advancedPath && editorMode !== 'advanced')) return;
                          updateField(selectedSettingsKey as any, e.target.value);
                        }}
                        placeholder="#000000"
                      />
                    </div>
                  ) : /url|logo|banner|image/i.test(String(selectedSettingsKey)) ? (
                    <>
                      <Input
                        type="url"
                        value={String((settings as any)[selectedSettingsKey] ?? '')}
                        onChange={(e) => {
                          const advancedPath = isAdvancedSelectedPath(selectedPath);
                          if ((advancedPath && !advancedAllowed) || (advancedPath && editorMode !== 'advanced')) return;
                          updateField(selectedSettingsKey as any, e.target.value);
                        }}
                        placeholder="https://..."
                      />
                      {(settings as any)[selectedSettingsKey] && (
                        <div className="rounded border overflow-hidden">
                          <img 
                            src={String((settings as any)[selectedSettingsKey])} 
                            alt="Preview" 
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      )}
                    </>
                  ) : /description|subtitle|text/i.test(String(selectedSettingsKey)) ? (
                    <Textarea
                      value={String((settings as any)[selectedSettingsKey] ?? '')}
                      onChange={(e) => {
                        const advancedPath = isAdvancedSelectedPath(selectedPath);
                        if ((advancedPath && !advancedAllowed) || (advancedPath && editorMode !== 'advanced')) return;
                        updateField(selectedSettingsKey as any, e.target.value);
                      }}
                      rows={4}
                    />
                  ) : (
                    <Input
                      value={String((settings as any)[selectedSettingsKey] ?? '')}
                      onChange={(e) => {
                        const advancedPath = isAdvancedSelectedPath(selectedPath);
                        if ((advancedPath && !advancedAllowed) || (advancedPath && editorMode !== 'advanced')) return;
                        updateField(selectedSettingsKey as any, e.target.value);
                      }}
                    />
                  )}
                  <Separator />
                  <div className="text-xs text-muted-foreground">Setting: {String(selectedSettingsKey)}</div>
                </>
              ) : !selectedKey ? (
                <div className="text-sm text-muted-foreground">Selected element is not editable yet. Try clicking on text or buttons.</div>
              ) : !selectedField ? (
                <div className="text-sm text-muted-foreground">Selected element is not editable yet.</div>
              ) : (
                <>
                  <div className="text-sm font-medium">{selectedField.label}</div>
                  {(() => {
                    const advancedPath = isAdvancedSelectedPath(selectedPath);
                    const lockedByTier = advancedPath && !advancedAllowed;
                    const lockedByMode = advancedPath && editorMode !== 'advanced';
                    const locked = lockedByTier || lockedByMode;
                    if (!locked) return null;
                    return (
                      <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
                        {lockedByTier
                          ? 'Gold required: this is an Advanced edit.'
                          : 'Switch to Advanced mode to edit this field.'}
                      </div>
                    );
                  })()}
                  {selectedField.type === 'textarea' ? (
                    <Textarea
                      value={String(settings[selectedField.key] ?? '')}
                      onChange={(e) => {
                        const advancedPath = isAdvancedSelectedPath(selectedPath);
                        if ((advancedPath && !advancedAllowed) || (advancedPath && editorMode !== 'advanced')) return;
                        updateField(selectedField.key, e.target.value);
                      }}
                      rows={5}
                    />
                  ) : (
                    <Input
                      type={selectedField.type === 'color' ? 'color' : 'text'}
                      value={String(settings[selectedField.key] ?? '')}
                      onChange={(e) => {
                        const advancedPath = isAdvancedSelectedPath(selectedPath);
                        if ((advancedPath && !advancedAllowed) || (advancedPath && editorMode !== 'advanced')) return;
                        updateField(selectedField.key, e.target.value);
                      }}
                    />
                  )}
                  <Separator />
                  <div className="text-xs text-muted-foreground">Field key: {String(selectedField.key)}</div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
