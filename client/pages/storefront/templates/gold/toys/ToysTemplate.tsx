import React, { useState, useEffect, useMemo } from 'react';
import type { TemplateProps } from '../../types';
type Breakpoint = 'mobile' | 'tablet' | 'desktop';

function asString(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function resolveInt(value: unknown, fallback: number, min: number, max: number): number {
  const str = String(value ?? '').trim();
  if (str === '') return fallback;
  const n = Number(str);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

export default function ToysTemplate(props: TemplateProps) {
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

  const bg = settings.template_bg_color || '#fef3c7';
  const text = settings.template_text_color || '#1e1b4b';
  const accent = settings.template_accent_color || '#ec4899';
  const cardBg = settings.template_card_bg || '#ffffff';

  const logoUrl = asString(settings.store_logo) || asString((settings as any).logo_url);

  // Layout settings
  const gridColumns = resolveInt(settings.template_grid_columns, 4, 2, 6);
  const gridGap = resolveInt(settings.template_grid_gap, 20, 8, 48);
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 48, 24, 96);
  const animationSpeed = resolveInt(settings.template_animation_speed, 200, 100, 500);
  const hoverScale = asString(settings.template_hover_scale) || '1.05';
  const cardRadius = resolveInt(settings.template_card_border_radius, 24, 0, 32);

  const storeName = settings.store_name || 'TOY WORLD';
  const storeDescription = asString(settings.store_description);
  const heroTitle = settings.template_hero_heading || 'Fun for Everyone! 🎈';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Games, plushies, and surprises for every age.';
  const ctaText = settings.template_button_text || 'Shop Toys';

  const addLabel = asString((settings as any).template_add_to_cart_label) || 'VIEW';
  const productTitleColor = asString((settings as any).template_product_title_color) || text;
  const productPriceColor = asString((settings as any).template_product_price_color) || accent;

  const featuredTitle = asString((settings as any).template_featured_title) || 'Featured toys';
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

  const products = useMemo(() => {
    const list = props.filtered?.length ? props.filtered : props.products || [];
    return categoryFilter ? list.filter(p => p.category === categoryFilter) : list;
  }, [props.filtered, props.products, categoryFilter]);

  const categories = useMemo(() => [...new Set(props.products?.map(p => p.category).filter(Boolean))], [props.products]);
  const cols = breakpoint === 'mobile' ? 2 : breakpoint === 'tablet' ? Math.min(3, gridColumns) : gridColumns;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bg, color: text, fontFamily: '"Comic Sans MS", cursive, sans-serif' }} data-edit-path="__root">
      <header style={{ padding: '16px 24px', backgroundColor: accent, color: '#fff', textAlign: 'center' }} data-edit-path="layout.header" onClick={(e) => clickGuard(e, 'layout.header')}>
        <div data-edit-path="layout.header.logo" onClick={(e) => clickGuard(e, 'layout.header.logo')} style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
          {logoUrl && <img src={logoUrl} alt={storeName} style={{ width: 44, height: 44, borderRadius: 9999, objectFit: 'cover', background: '#fff' }} />}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>🎁 {storeName} 🎁</h1>
            {(canManage || storeDescription) && (
              <div style={{ fontSize: 12, opacity: 0.9, fontWeight: 700 }}>
                {storeDescription || (canManage ? 'Add store description...' : '')}
              </div>
            )}
          </div>
        </div>
      </header>

      <section style={{ padding: '60px 24px', textAlign: 'center', background: `linear-gradient(180deg, #a855f7 0%, ${accent} 100%)`, color: '#fff' }} data-edit-path="layout.hero" onClick={(e) => clickGuard(e, 'layout.hero')}>
        <h2 style={{ fontSize: breakpoint === 'mobile' ? '32px' : '56px', fontWeight: 800, marginBottom: '24px' }} data-edit-path="layout.hero.title" onClick={(e) => clickGuard(e, 'layout.hero.title')}>{heroTitle}</h2>
        <p style={{ fontSize: '16px', opacity: 0.9, margin: '0 0 24px' }} data-edit-path="layout.hero.subtitle" onClick={(e) => clickGuard(e, 'layout.hero.subtitle')}>
          {heroSubtitle}
        </p>
        <button style={{ backgroundColor: '#fff', color: accent, padding: '16px 48px', fontSize: '16px', fontWeight: 800, border: 'none', borderRadius: '50px', cursor: 'pointer' }} data-edit-path="layout.hero.cta" onClick={(e) => clickGuard(e, 'layout.hero.cta')}>{ctaText}</button>
      </section>

      {categories.length > 0 && (
        <div style={{ padding: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {['All', ...categories].map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat === 'All' ? '' : cat)} style={{ padding: '12px 24px', backgroundColor: (cat === 'All' ? !categoryFilter : categoryFilter === cat) ? accent : cardBg, color: (cat === 'All' ? !categoryFilter : categoryFilter === cat) ? '#fff' : text, border: 'none', borderRadius: '50px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>{cat}</button>
          ))}
        </div>
      )}

      <div
        style={{ padding: '0 24px', maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}
        data-edit-path="layout.featured"
        onClick={(e) => clickGuard(e, 'layout.featured')}
      >
        <h2
          style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 800 }}
          data-edit-path="layout.featured.title"
          onClick={(e) => clickGuard(e, 'layout.featured.title')}
        >
          {featuredTitle}
        </h2>
        {(canManage || featuredSubtitle) && (
          <p
            style={{ margin: '0 0 18px', opacity: 0.85, fontSize: 14 }}
            data-edit-path="layout.featured.subtitle"
            onClick={(e) => clickGuard(e, 'layout.featured.subtitle')}
          >
            {featuredSubtitle || (canManage ? 'Add section subtitle...' : '')}
          </p>
        )}
      </div>

      <section
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, maxWidth: '1400px', margin: '0 auto' }}
        data-edit-path="layout.grid"
        onClick={(e) => clickGuard(e, 'layout.grid')}
      >
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: `${gridGap}px` }}>
          {products.map(product => (
            <div key={product.id} style={{ backgroundColor: cardBg, borderRadius: `${cardRadius}px`, overflow: 'hidden', boxShadow: '0 8px 24px rgba(236,72,153,0.2)', cursor: canManage ? 'default' : 'pointer', transition: `transform ${animationSpeed}ms ease` }} data-edit-path={`layout.products.${product.id}`}
              onMouseEnter={(e) => { if (!canManage) e.currentTarget.style.transform = `scale(${hoverScale})`; }}
              onMouseLeave={(e) => { if (!canManage) e.currentTarget.style.transform = 'scale(1)'; }}
              onClick={(e) => { e.stopPropagation(); if (!canManage && product.slug) props.navigate(product.slug); else if (canManage) onSelect(`layout.products.${product.id}`); }}>
              <div style={{ aspectRatio: '1', backgroundColor: '#fce7f3', overflow: 'hidden' }}>
                {product.images?.[0] && <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div style={{ padding: '16px', textAlign: 'center' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: productTitleColor }}>{product.title}</h3>
                <p style={{ fontSize: '20px', fontWeight: 800, color: productPriceColor }}>{props.formatPrice(product.price)}</p>
                <button
                  style={{ marginTop: 12, backgroundColor: accent, color: '#fff', padding: '10px 16px', fontSize: 12, fontWeight: 800, border: 'none', borderRadius: '50px', cursor: 'pointer' }}
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
            </div>
          ))}
        </div>
      </section>

      <footer style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, backgroundColor: accent, color: '#fff', marginTop: `${sectionSpacing}px`, textAlign: 'center' }} data-edit-path="layout.footer" onClick={(e) => clickGuard(e, 'layout.footer')}>
        <p style={{ fontSize: '16px', margin: 0 }} data-edit-path="layout.footer.copyright" onClick={(e) => clickGuard(e, 'layout.footer.copyright')}>
          {copyright} ✨
        </p>
        <div
          style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 14, flexWrap: 'wrap', opacity: 0.95 }}
          data-edit-path="layout.footer.social"
          onClick={(e) => clickGuard(e, 'layout.footer.social')}
        >
          {(canManage || socialLinks.length > 0) &&
            (socialLinks.length ? socialLinks : [{ platform: 'tiktok', url: '#' }]).map((l) => (
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
