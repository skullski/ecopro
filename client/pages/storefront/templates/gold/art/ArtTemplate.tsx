import React, { useState, useEffect, useMemo } from 'react';
import type { TemplateProps } from '../../types';
type Breakpoint = 'mobile' | 'tablet' | 'desktop';

function asString(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function resolveInt(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = typeof value === 'number' ? value : parseInt(String(value || ''), 10);
  const safe = Number.isFinite(parsed) ? parsed : fallback;
  return Math.max(min, Math.min(max, safe));
}

export default function ArtTemplate(props: TemplateProps) {
  const settings = props.settings || ({} as any);
  const canManage = props.canManage !== false;
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    const bp = (props as any).forcedBreakpoint;
    if (bp) { setBreakpoint(bp); return; }
    const update = () => setBreakpoint(window.innerWidth >= 1024 ? 'desktop' : window.innerWidth >= 768 ? 'tablet' : 'mobile');
    update(); window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [(props as any).forcedBreakpoint]);

  const onSelect = (path: string) => { if (canManage && typeof (props as any).onSelect === 'function') (props as any).onSelect(path); };

  const clickGuard = (e: React.MouseEvent, path: string) => {
    if (!canManage) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect(path);
  };

  const bg = settings.template_bg_color || '#fafafa';
  const text = settings.template_text_color || '#18181b';
  const accent = settings.template_accent_color || '#dc2626';
  const cardBg = settings.template_card_bg || '#ffffff';

  const storeName = settings.store_name || 'ARTISAN GALLERY';
  const logoUrl = asString(settings.store_logo) || asString((settings as any).logo_url);
  const storeDescription = asString(settings.store_description);
  const heroTitle = settings.template_hero_heading || 'Original Art & Prints';
  const heroSubtitle = settings.template_hero_subtitle || 'Curated collection';
  const ctaText = settings.template_button_text || 'VIEW GALLERY';

  const addLabel = asString((settings as any).template_add_to_cart_label) || 'VIEW';
  const productTitleColor = asString((settings as any).template_product_title_color) || text;
  const productPriceColor = asString((settings as any).template_product_price_color) || accent;

  const featuredTitle = asString((settings as any).template_featured_title) || 'Featured works';
  const featuredSubtitle = asString((settings as any).template_featured_subtitle) || '';

  const rawSocial = (settings as any).template_social_links;
  const socialLinks: Array<{ platform: string; url: string }> = (() => {
    if (Array.isArray(rawSocial)) return rawSocial as any;
    if (typeof rawSocial !== 'string' || !rawSocial.trim()) return [];
    try {
      const parsed = JSON.parse(rawSocial);
      return Array.isArray(parsed) ? (parsed as any) : [];
    } catch {
      return [];
    }
  })()
    .map((l: any) => ({ platform: asString(l?.platform), url: asString(l?.url) }))
    .filter((l) => l.platform && l.url);

  const copyright = asString((settings as any).template_copyright) || `© ${new Date().getFullYear()} ${storeName}`;

  // Layout settings
  const gridColumns = resolveInt(settings.template_grid_columns, 3, 2, 6);
  const gridGap = resolveInt(settings.template_grid_gap, 48, 8, 48);
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 48, 24, 96);
  const animationSpeed = resolveInt(settings.template_animation_speed, 200, 100, 500);
  const hoverScale = asString(settings.template_hover_scale) || '1.02';
  const cardRadius = resolveInt(settings.template_card_border_radius, 0, 0, 32);

  const products = useMemo(() => {
    const list = props.filtered?.length ? props.filtered : props.products || [];
    return categoryFilter ? list.filter(p => p.category === categoryFilter) : list;
  }, [props.filtered, props.products, categoryFilter]);

  const categories = useMemo(() => [...new Set(props.products?.map(p => p.category).filter(Boolean))], [props.products]);
  const cols = breakpoint === 'mobile' ? 1 : breakpoint === 'tablet' ? 2 : gridColumns;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bg, color: text, fontFamily: '"Playfair Display", Georgia, serif' }} data-edit-path="__root">
      <header style={{ padding: '24px 32px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderBottom: '1px solid #e5e5e5' }} data-edit-path="layout.header" onClick={(e) => clickGuard(e, 'layout.header')}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 14, textAlign: 'center' }}
          data-edit-path="layout.header.logo"
          onClick={(e) => clickGuard(e, 'layout.header.logo')}
        >
          {logoUrl && (
            <img
              src={logoUrl}
              alt={storeName}
              style={{ width: 44, height: 44, borderRadius: 9999, objectFit: 'cover', border: `1px solid ${accent}` }}
            />
          )}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <h1 style={{ fontSize: '20px', fontWeight: 400, letterSpacing: '4px', textTransform: 'uppercase', margin: 0 }}>{storeName}</h1>
            {(canManage || storeDescription) && (
              <div style={{ fontSize: 12, opacity: 0.7, maxWidth: 560, lineHeight: 1.35 }}>
                {storeDescription || (canManage ? 'Add store description...' : '')}
              </div>
            )}
          </div>
        </div>
      </header>

      <section style={{ padding: '100px 24px', textAlign: 'center', backgroundColor: '#18181b', color: '#fff' }} data-edit-path="layout.hero" onClick={(e) => clickGuard(e, 'layout.hero')}>
        <p style={{ fontSize: '12px', letterSpacing: '4px', marginBottom: '24px', color: accent }}>CURATED COLLECTION</p>
        <h2 style={{ fontSize: breakpoint === 'mobile' ? '36px' : '64px', fontWeight: 300, marginBottom: '32px', fontStyle: 'italic' }} data-edit-path="layout.hero.title" onClick={(e) => clickGuard(e, 'layout.hero.title')}>{heroTitle}</h2>
        <button style={{ backgroundColor: 'transparent', color: '#fff', padding: '16px 48px', fontSize: '12px', fontWeight: 400, border: '1px solid #fff', letterSpacing: '2px', cursor: 'pointer' }} data-edit-path="layout.hero.cta" onClick={(e) => clickGuard(e, 'layout.hero.cta')}>{ctaText}</button>
      </section>

      {categories.length > 0 && (
        <div style={{ padding: '32px', display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {['All', ...categories].map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat === 'All' ? '' : cat)} style={{ padding: '8px 0', backgroundColor: 'transparent', color: (cat === 'All' ? !categoryFilter : categoryFilter === cat) ? accent : text, border: 'none', borderBottom: (cat === 'All' ? !categoryFilter : categoryFilter === cat) ? `2px solid ${accent}` : '2px solid transparent', fontSize: '13px', letterSpacing: '2px', cursor: 'pointer' }}>{cat.toUpperCase()}</button>
          ))}
        </div>
      )}

      <div
        style={{ padding: '0 32px', maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}
        data-edit-path="layout.featured"
        onClick={(e) => clickGuard(e, 'layout.featured')}
      >
        <h2
          style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 400, letterSpacing: '2px', textTransform: 'uppercase' }}
          data-edit-path="layout.featured.title"
          onClick={(e) => clickGuard(e, 'layout.featured.title')}
        >
          {featuredTitle}
        </h2>
        {(canManage || featuredSubtitle) && (
          <p
            style={{ margin: '0 0 18px', color: '#71717a', fontSize: 14 }}
            data-edit-path="layout.featured.subtitle"
            onClick={(e) => clickGuard(e, 'layout.featured.subtitle')}
          >
            {featuredSubtitle || (canManage ? 'Add section subtitle...' : '')}
          </p>
        )}
      </div>

      <section
        style={{ padding: `${sectionSpacing}px`, maxWidth: '1400px', margin: '0 auto' }}
        data-edit-path="layout.grid"
        onClick={(e) => clickGuard(e, 'layout.grid')}
      >
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: `${gridGap}px` }}>
          {products.map(product => (
            <div key={product.id} style={{ cursor: canManage ? 'default' : 'pointer' }} data-edit-path={`layout.products.${product.id}`}
              onClick={(e) => { e.stopPropagation(); if (!canManage && product.slug) props.navigate(product.slug); else if (canManage) onSelect(`layout.products.${product.id}`); }}>
              <div style={{ aspectRatio: '4/5', backgroundColor: cardBg, boxShadow: '0 20px 40px rgba(0,0,0,0.1)', marginBottom: `${baseSpacing}px`, overflow: 'hidden', borderRadius: cardRadius }}>
                {product.images?.[0] && <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 400, marginBottom: '8px', fontStyle: 'italic', color: productTitleColor }}>{product.title}</h3>
              <p style={{ fontSize: '14px', color: '#71717a', marginBottom: '8px' }}>{product.category}</p>
              <p style={{ fontSize: '16px', fontWeight: 600, color: productPriceColor }}>{props.formatPrice(product.price)}</p>
              <button
                style={{ marginTop: 10, backgroundColor: accent, color: '#fff', padding: '10px 16px', border: 'none', cursor: 'pointer', fontSize: 12 }}
                data-edit-path="layout.featured.addLabel"
                onClick={(e) => {
                  if (canManage) return clickGuard(e, 'layout.featured.addLabel');
                  e.stopPropagation();
                  if (product.slug) props.navigate(product.slug);
                }}
              >
                {addLabel}
              </button>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ padding: '64px 24px', backgroundColor: '#18181b', color: '#fff', marginTop: '64px', textAlign: 'center' }} data-edit-path="layout.footer" onClick={(e) => clickGuard(e, 'layout.footer')}>
        <p style={{ fontSize: '12px', letterSpacing: '2px', margin: 0 }} data-edit-path="layout.footer.copyright" onClick={(e) => clickGuard(e, 'layout.footer.copyright')}>
          {copyright}
        </p>
        <div
          style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 14, flexWrap: 'wrap', opacity: 0.85 }}
          data-edit-path="layout.footer.social"
          onClick={(e) => clickGuard(e, 'layout.footer.social')}
        >
          {(canManage || socialLinks.length > 0) &&
            (socialLinks.length ? socialLinks : [{ platform: 'instagram', url: '#' }]).map((l) => (
              <a
                key={`${l.platform}-${l.url}`}
                href={l.url}
                style={{ color: '#fff', textDecoration: 'none', fontSize: 12 }}
                onClick={(e) => {
                  if (canManage) {
                    e.preventDefault();
                    e.stopPropagation();
                    onSelect('layout.footer.social');
                  }
                }}
              >
                {l.platform}
              </a>
            ))}
        </div>
      </footer>
    </div>
  );
}
