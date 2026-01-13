import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';

function asString(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function resolveInt(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = typeof value === 'number' ? value : parseInt(String(value ?? ''), 10);
  const safe = Number.isFinite(parsed) ? parsed : fallback;
  return Math.max(min, Math.min(max, safe));
}

function safeParseJsonArray<T>(value: unknown, fallback: T[]): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value !== 'string' || !value.trim()) return fallback;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

function productTitle(p: StoreProduct): string {
  return String(p.title || p.name || '').trim() || 'Product';
}

function productImage(p: StoreProduct): string {
  const img = Array.isArray(p.images) ? p.images.find(Boolean) : undefined;
  return typeof img === 'string' && img ? img : '/placeholder.png';
}

export default function ChalkCafeTemplate(props: TemplateProps) {
  const { settings, formatPrice, navigate } = props;
  const canManage = Boolean(props.canManage);
  const onSelect = (path: string) => {
    if (canManage && typeof (props as any).onSelect === 'function') (props as any).onSelect(path);
  };
  const clickGuard = (e: React.MouseEvent, path: string) => {
    if (!canManage) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect(path);
  };

  const storeName = asString(settings.store_name) || 'CHALK CAFE';
  const storeDescription = asString(settings.store_description);
  const logoUrl = asString(settings.store_logo) || asString((settings as any).logo_url);

  const bg = asString(settings.template_bg_color) || '#0b1220';
  const text = asString(settings.template_text_color) || '#ffffff';
  const muted = asString(settings.template_muted_color) || '#cbd5e1';
  const accent = asString(settings.template_accent_color) || '#f59e0b';

  const fontFamily = asString(settings.template_font_family) || 'system-ui, -apple-system, Segoe UI, sans-serif';

  const spacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 60, 24, 120);

  const heroTitle = asString(settings.template_hero_heading) || 'Coffee, snacks, and small joys.';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Chalkboard mood with warm highlights.';
  const heroKicker = asString(settings.template_hero_kicker) || 'TODAY • FRESH';
  const ctaText = asString(settings.template_button_text) || 'Order';
  const bannerUrl = asString(settings.banner_url);

  const featuredTitle = asString(settings.template_featured_title) || 'Popular';
  const featuredSubtitle = asString(settings.template_featured_subtitle) || 'Customer favorites from our menu.';
  const addLabel = asString(settings.template_add_to_cart_label) || 'VIEW';

  const gridColumns = resolveInt(settings.template_grid_columns, 4, 2, 6);
  const gridGap = resolveInt(settings.template_grid_gap, 16, 8, 48);

  const cardBg = asString(settings.template_card_bg) || 'rgba(255,255,255,0.06)';
  const cardRadius = resolveInt(settings.template_card_border_radius, 14, 0, 32);
  const buttonRadius = resolveInt(settings.template_button_border_radius, 12, 0, 50);
  const borderRadius = resolveInt(settings.template_border_radius, 12, 0, 24);
  const titleColor = asString(settings.template_product_title_color) || text;
  const priceColor = asString(settings.template_product_price_color) || accent;

  const copyright = asString(settings.template_copyright) || `© ${new Date().getFullYear()} ${storeName}`;

  const navLinks = safeParseJsonArray<{ label: string; url: string }>(settings.template_nav_links, [
    { label: 'Menu', url: '/products' },
    { label: 'Coffee', url: '/products' },
    { label: 'Contact', url: '/products' },
  ]);

  const socialLinks = safeParseJsonArray<{ platform: string; url: string }>(settings.template_social_links, []);

  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 12) || [];

  return (
    <div className="ecopro-storefront" data-edit-path="__root" style={{ minHeight: '100vh', background: bg, color: text, fontFamily }}>
      <header data-edit-path="layout.header" onClick={(e) => clickGuard(e, 'layout.header')} style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(11,18,32,0.85)', backdropFilter: 'blur(8px)', borderBottom: '1px dashed rgba(245,158,11,0.35)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: `${spacing}px ${spacing}px`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
          <div data-edit-path="layout.header.logo" onClick={(e) => clickGuard(e, 'layout.header.logo')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: canManage ? 'pointer' : 'default' }}>
            {logoUrl && <img src={logoUrl} alt={storeName} style={{ width: 38, height: 38, borderRadius: 12, objectFit: 'cover', border: `1px solid rgba(245,158,11,0.35)` }} />}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ fontWeight: 950, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{storeName}</div>
              {(canManage || storeDescription) && <div style={{ fontSize: 12, color: muted }}>{storeDescription || (canManage ? 'Add store description...' : '')}</div>}
            </div>
          </div>
          <nav data-edit-path="layout.header.nav" onClick={(e) => clickGuard(e, 'layout.header.nav')} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {navLinks.map((l) => (
              <button key={`${l.label}-${l.url}`} onClick={(e) => { if (canManage) return clickGuard(e, 'layout.header.nav'); navigate(l.url || '/products'); }} style={{ background: 'transparent', border: '1px dashed rgba(203,213,225,0.35)', color: text, borderRadius: borderRadius, padding: '7px 10px', fontSize: 12, fontWeight: 900, cursor: 'pointer' }}>
                {l.label || 'Link'}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <section data-edit-path="layout.hero" onClick={(e) => clickGuard(e, 'layout.hero')} style={{ padding: `${sectionSpacing}px ${spacing}px`, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(900px 420px at 20% 25%, rgba(245,158,11,0.20), transparent 60%), radial-gradient(900px 420px at 80% 20%, rgba(99,102,241,0.10), transparent 60%)' }} />
        {bannerUrl && (
          <div data-edit-path="layout.hero.image" onClick={(e) => clickGuard(e, 'layout.hero.image')} style={{ position: 'absolute', inset: 0, opacity: 0.16 }}>
            <img src={bannerUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <div style={{ position: 'relative', maxWidth: 1100, margin: '0 auto', display: 'grid', gap: 14 }}>
          <div data-edit-path="layout.hero.kicker" onClick={(e) => clickGuard(e, 'layout.hero.kicker')} style={{ color: muted, fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase' }}>{heroKicker}</div>
          <h1 data-edit-path="layout.hero.title" onClick={(e) => clickGuard(e, 'layout.hero.title')} style={{ margin: 0, fontSize: 48, lineHeight: 1.06, fontWeight: 950 }}>{heroTitle}</h1>
          <p data-edit-path="layout.hero.subtitle" onClick={(e) => clickGuard(e, 'layout.hero.subtitle')} style={{ margin: 0, maxWidth: 720, color: muted, fontSize: 15, lineHeight: 1.8 }}>{heroSubtitle}</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 6 }}>
            <button data-edit-path="layout.hero.cta" onClick={(e) => { if (canManage) return clickGuard(e, 'layout.hero.cta'); navigate('/products'); }} style={{ background: accent, color: '#0b1220', border: 0, borderRadius: buttonRadius, padding: '12px 18px', fontWeight: 950, cursor: 'pointer' }}>{ctaText}</button>
            <button data-edit-path="layout.hero.cta2" onClick={(e) => { if (canManage) return clickGuard(e, 'layout.hero.cta2'); navigate('/products'); }} style={{ background: 'transparent', color: text, border: '1px dashed rgba(203,213,225,0.42)', borderRadius: buttonRadius, padding: '12px 18px', fontWeight: 950, cursor: 'pointer' }}>{asString(settings.template_button2_text) || 'Browse menu'}</button>
          </div>
        </div>
      </section>

      <section data-edit-path="layout.featured" onClick={(e) => clickGuard(e, 'layout.featured')} style={{ padding: `0 ${spacing}px ${sectionSpacing}px` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 16 }}>
            <div data-edit-path="layout.featured.title" onClick={(e) => clickGuard(e, 'layout.featured.title')} style={{ fontWeight: 950, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{featuredTitle}</div>
            <div data-edit-path="layout.featured.subtitle" onClick={(e) => clickGuard(e, 'layout.featured.subtitle')} style={{ fontSize: 12, color: muted, marginTop: 6 }}>{featuredSubtitle}</div>
          </div>

          <div data-edit-path="layout.products">
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`, gap: gridGap }}>
              {products.map((p) => (
                <div key={p.id} data-edit-path={`layout.products.${p.id}`} onClick={(e) => { if (canManage) return clickGuard(e, `layout.products.${p.id}`); if ((p as any).slug) navigate((p as any).slug); }} style={{ background: cardBg, borderRadius: cardRadius, overflow: 'hidden', border: '1px dashed rgba(203,213,225,0.25)', cursor: 'pointer' }}>
                  <div style={{ aspectRatio: '4/3', overflow: 'hidden' }}>
                    <img src={productImage(p)} alt={productTitle(p)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: 12, display: 'grid', gap: 8 }}>
                    <div style={{ color: titleColor, fontWeight: 900, lineHeight: 1.2 }}>{productTitle(p)}</div>
                    <div style={{ color: priceColor, fontWeight: 950 }}>{formatPrice(Number(p.price) || 0)}</div>
                    <button data-edit-path="layout.featured.addLabel" onClick={(e) => { if (canManage) return clickGuard(e, 'layout.featured.addLabel'); e.stopPropagation(); if ((p as any).slug) navigate((p as any).slug); }} style={{ justifySelf: 'start', background: 'rgba(245,158,11,0.16)', color: text, border: '1px dashed rgba(245,158,11,0.35)', borderRadius: borderRadius, padding: '8px 10px', fontSize: 12, fontWeight: 900, cursor: 'pointer' }}>{addLabel}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer data-edit-path="layout.footer" onClick={(e) => clickGuard(e, 'layout.footer')} style={{ padding: `${spacing}px ${spacing}px`, borderTop: '1px dashed rgba(245,158,11,0.35)', background: 'rgba(11,18,32,0.85)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div data-edit-path="layout.footer.copyright" onClick={(e) => clickGuard(e, 'layout.footer.copyright')} style={{ color: muted, fontSize: 12 }}>{copyright}</div>
          <div data-edit-path="layout.footer.social" onClick={(e) => clickGuard(e, 'layout.footer.social')} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {(socialLinks.length ? socialLinks : canManage ? [{ platform: 'instagram', url: 'https://instagram.com' }] : []).map((s) => (
              <a key={`${s.platform}-${s.url}`} href={canManage ? undefined : s.url} onClick={(e) => { if (canManage) return clickGuard(e as any, 'layout.footer.social'); e.stopPropagation(); }} style={{ color: text, textDecoration: 'none', fontSize: 12, padding: '6px 10px', borderRadius: borderRadius, border: '1px dashed rgba(203,213,225,0.35)' }}>
                {(s.platform || 'social').toUpperCase()}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
