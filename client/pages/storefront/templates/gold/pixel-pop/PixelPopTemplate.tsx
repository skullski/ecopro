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

export default function PixelPopTemplate(props: TemplateProps) {
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

  const storeName = asString(settings.store_name) || 'PIXEL POP';
  const storeDescription = asString(settings.store_description);
  const logoUrl = asString(settings.store_logo) || asString((settings as any).logo_url);

  const bg = asString(settings.template_bg_color) || '#0b1020';
  const text = asString(settings.template_text_color) || '#f8fafc';
  const muted = asString(settings.template_muted_color) || '#93c5fd';
  const accent = asString(settings.template_accent_color) || '#f97316';

  const fontFamily = asString(settings.template_font_family) || 'system-ui, -apple-system, Segoe UI, sans-serif';

  const spacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 56, 24, 100);

  const heroTitle = asString(settings.template_hero_heading) || 'Level up your store';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Retro blocks, bold borders, clean layout.';
  const heroKicker = asString(settings.template_hero_kicker) || 'POWER-UP • NEW ARRIVALS';
  const ctaText = asString(settings.template_button_text) || 'Start';
  const bannerUrl = asString(settings.banner_url);

  const featuredTitle = asString(settings.template_featured_title) || 'Top Items';
  const featuredSubtitle = asString(settings.template_featured_subtitle) || 'Pick a product to view details.';
  const addLabel = asString(settings.template_add_to_cart_label) || 'VIEW';

  const gridColumns = resolveInt(settings.template_grid_columns, 4, 2, 6);
  const gridGap = resolveInt(settings.template_grid_gap, 16, 8, 48);

  const cardBg = asString(settings.template_card_bg) || '#111827';
  const cardRadius = resolveInt(settings.template_card_border_radius, 10, 0, 32);
  const buttonRadius = resolveInt(settings.template_button_border_radius, 10, 0, 50);
  const borderRadius = resolveInt(settings.template_border_radius, 10, 0, 24);
  const titleColor = asString(settings.template_product_title_color) || text;
  const priceColor = asString(settings.template_product_price_color) || accent;

  const copyright = asString(settings.template_copyright) || `© ${new Date().getFullYear()} ${storeName}`;

  const navLinks = safeParseJsonArray<{ label: string; url: string }>(settings.template_nav_links, [
    { label: 'Shop', url: '/products' },
    { label: 'Hot', url: '/products' },
    { label: 'Help', url: '/products' },
  ]);

  const socialLinks = safeParseJsonArray<{ platform: string; url: string }>(settings.template_social_links, []);

  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 12) || [];

  return (
    <div className="ecopro-storefront" data-edit-path="__root" style={{ minHeight: '100vh', background: bg, color: text, fontFamily }}>
      <header data-edit-path="layout.header" onClick={(e) => clickGuard(e, 'layout.header')} style={{ borderBottom: `4px solid ${accent}`, background: '#0b1020' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: `${spacing}px ${spacing}px`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div data-edit-path="layout.header.logo" onClick={(e) => clickGuard(e, 'layout.header.logo')} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: canManage ? 'pointer' : 'default' }}>
            {logoUrl && <img src={logoUrl} alt={storeName} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', border: `2px solid ${accent}` }} />}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <div style={{ fontWeight: 950, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{storeName}</div>
              {(canManage || storeDescription) && <div style={{ fontSize: 12, color: muted }}>{storeDescription || (canManage ? 'Add store description...' : '')}</div>}
            </div>
          </div>
          <nav data-edit-path="layout.header.nav" onClick={(e) => clickGuard(e, 'layout.header.nav')} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {navLinks.map((l) => (
              <button
                key={`${l.label}-${l.url}`}
                onClick={(e) => {
                  if (canManage) return clickGuard(e, 'layout.header.nav');
                  navigate(l.url || '/products');
                }}
                style={{
                  background: 'transparent',
                  border: `2px solid ${muted}`,
                  color: text,
                  borderRadius: borderRadius,
                  padding: '6px 10px',
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                {l.label || 'Link'}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <section data-edit-path="layout.hero" onClick={(e) => clickGuard(e, 'layout.hero')} style={{ padding: `${sectionSpacing}px ${spacing}px`, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: `repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 10px, rgba(255,255,255,0.02) 10px 20px)` }} />
        {bannerUrl && (
          <div data-edit-path="layout.hero.image" onClick={(e) => clickGuard(e, 'layout.hero.image')} style={{ position: 'absolute', inset: 0, opacity: 0.18 }}>
            <img src={bannerUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', display: 'grid', gap: 16 }}>
          <div data-edit-path="layout.hero.kicker" onClick={(e) => clickGuard(e, 'layout.hero.kicker')} style={{ color: muted, fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase' }}>{heroKicker}</div>
          <h1 data-edit-path="layout.hero.title" onClick={(e) => clickGuard(e, 'layout.hero.title')} style={{ margin: 0, fontSize: 50, lineHeight: 1.05, fontWeight: 950 }}>{heroTitle}</h1>
          <p data-edit-path="layout.hero.subtitle" onClick={(e) => clickGuard(e, 'layout.hero.subtitle')} style={{ margin: 0, maxWidth: 680, color: muted, fontSize: 15, lineHeight: 1.7 }}>{heroSubtitle}</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button data-edit-path="layout.hero.cta" onClick={(e) => { if (canManage) return clickGuard(e, 'layout.hero.cta'); navigate('/products'); }} style={{ background: accent, color: '#111827', border: 0, borderRadius: buttonRadius, padding: '12px 18px', fontWeight: 950, cursor: 'pointer' }}>{ctaText}</button>
            <button data-edit-path="layout.hero.cta2" onClick={(e) => { if (canManage) return clickGuard(e, 'layout.hero.cta2'); navigate('/products'); }} style={{ background: 'transparent', color: text, border: `2px solid ${text}`, borderRadius: buttonRadius, padding: '12px 18px', fontWeight: 950, cursor: 'pointer' }}>{asString(settings.template_button2_text) || 'More'}</button>
          </div>
        </div>
      </section>

      <section data-edit-path="layout.featured" onClick={(e) => clickGuard(e, 'layout.featured')} style={{ padding: `0 ${spacing}px ${sectionSpacing}px` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ border: `2px solid ${muted}`, borderRadius: borderRadius, padding: 14, marginBottom: 16 }}>
            <div data-edit-path="layout.featured.title" onClick={(e) => clickGuard(e, 'layout.featured.title')} style={{ fontWeight: 950, letterSpacing: '0.12em', textTransform: 'uppercase' }}>{featuredTitle}</div>
            <div data-edit-path="layout.featured.subtitle" onClick={(e) => clickGuard(e, 'layout.featured.subtitle')} style={{ fontSize: 12, color: muted, marginTop: 6 }}>{featuredSubtitle}</div>
          </div>

          <div data-edit-path="layout.products">
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`, gap: gridGap }}>
              {products.map((p) => (
                <div key={p.id} data-edit-path={`layout.products.${p.id}`} onClick={(e) => { if (canManage) return clickGuard(e, `layout.products.${p.id}`); if ((p as any).slug) navigate((p as any).slug); }} style={{ background: cardBg, border: `2px solid ${text}`, borderRadius: cardRadius, overflow: 'hidden', cursor: 'pointer' }}>
                  <div style={{ aspectRatio: '1', overflow: 'hidden', background: '#0b1020' }}>
                    <img src={productImage(p)} alt={productTitle(p)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: 12, display: 'grid', gap: 8 }}>
                    <div style={{ color: titleColor, fontWeight: 950, lineHeight: 1.2 }}>{productTitle(p)}</div>
                    <div style={{ color: priceColor, fontWeight: 950 }}>{formatPrice(Number(p.price) || 0)}</div>
                    <button data-edit-path="layout.featured.addLabel" onClick={(e) => { if (canManage) return clickGuard(e, 'layout.featured.addLabel'); e.stopPropagation(); if ((p as any).slug) navigate((p as any).slug); }} style={{ justifySelf: 'start', background: accent, color: '#111827', border: 0, borderRadius: borderRadius, padding: '8px 10px', fontSize: 12, fontWeight: 950, cursor: 'pointer' }}>
                      {addLabel}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer data-edit-path="layout.footer" onClick={(e) => clickGuard(e, 'layout.footer')} style={{ padding: `${spacing}px ${spacing}px`, borderTop: `4px solid ${accent}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div data-edit-path="layout.footer.copyright" onClick={(e) => clickGuard(e, 'layout.footer.copyright')} style={{ color: muted, fontSize: 12 }}>{copyright}</div>
          <div data-edit-path="layout.footer.social" onClick={(e) => clickGuard(e, 'layout.footer.social')} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {(socialLinks.length ? socialLinks : canManage ? [{ platform: 'instagram', url: 'https://instagram.com' }] : []).map((s) => (
              <a key={`${s.platform}-${s.url}`} href={canManage ? undefined : s.url} onClick={(e) => { if (canManage) return clickGuard(e as any, 'layout.footer.social'); e.stopPropagation(); }} style={{ color: text, textDecoration: 'none', fontSize: 12, padding: '6px 10px', borderRadius: borderRadius, border: `2px solid ${muted}` }}>
                {(s.platform || 'social').toUpperCase()}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
