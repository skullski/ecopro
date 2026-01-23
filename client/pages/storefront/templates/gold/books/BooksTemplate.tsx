import React, { useState, useEffect, useRef, useMemo } from 'react';
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

export default function BooksTemplate(props: TemplateProps) {
  const settings = props.settings || ({} as any);
  const canManage = props.canManage !== false;
  const forcedBreakpoint = (props as any).forcedBreakpoint as Breakpoint | undefined;

  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    if (forcedBreakpoint) { setBreakpoint(forcedBreakpoint); return; }
    const update = () => setBreakpoint(window.innerWidth >= 1024 ? 'desktop' : window.innerWidth >= 768 ? 'tablet' : 'mobile');
    update(); window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [forcedBreakpoint]);

  const onSelect = (path: string) => { if (canManage && typeof (props as any).onSelect === 'function') (props as any).onSelect(path); };

  const clickGuard = (e: React.MouseEvent, path: string) => {
    if (!canManage) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect(path);
  };

  // Theme - Warm, Literary
  const bg = settings.template_bg_color || '#fef7ed';
  const text = settings.template_text_color || '#1c1917';
  const accent = settings.template_accent_color || '#b45309';
  const muted = settings.template_muted_color || '#78716c';
  const cardBg = settings.template_card_bg || '#ffffff';

  const storeName = settings.store_name || 'THE BOOKSHELF';
  const logoUrl = asString(settings.store_logo) || asString((settings as any).logo_url);
  const storeDescription = asString(settings.store_description);
  const heroTitle = settings.template_hero_heading || 'Discover Your Next Adventure';
  const heroSubtitle = settings.template_hero_subtitle || 'Curated books for curious minds';
  const ctaText = settings.template_button_text || 'Browse Collection';

  const heroKicker = asString((settings as any).template_hero_kicker) || 'NEW ARRIVALS • LIMITED EDITIONS';
  const badgeTitle = asString((settings as any).template_hero_badge_title) || 'Editor’s Pick';
  const badgeSubtitle = asString((settings as any).template_hero_badge_subtitle) || '';
  const heroImage = asString((settings as any).banner_url) || (props.products?.[0]?.images?.[0] || '/placeholder.png');

  const addLabel = asString((settings as any).template_add_to_cart_label) || 'VIEW';
  const productTitleColor = asString((settings as any).template_product_title_color) || text;
  const productPriceColor = asString((settings as any).template_product_price_color) || accent;

  const featuredTitle = asString((settings as any).template_featured_title) || 'Featured picks';
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
  const gridColumns = resolveInt(settings.template_grid_columns, 5, 2, 6);
  const gridGap = resolveInt(settings.template_grid_gap, 24, 8, 48);
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
  const isMobile = breakpoint === 'mobile';
  const cols = isMobile ? 2 : breakpoint === 'tablet' ? 3 : gridColumns;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bg, color: text, fontFamily: 'Georgia, serif' }} data-edit-path="__root">
      {canManage && (
        <button
          type="button"
          data-edit-path="__settings"
          onClick={(e) => clickGuard(e, '__settings')}
          style={{
            position: 'fixed',
            right: 12,
            bottom: 12,
            zIndex: 1000,
            background: 'rgba(255,255,255,0.92)',
            border: `1px solid ${accent}33`,
            borderRadius: 9999,
            padding: '8px 10px',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: accent,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Settings
        </button>
      )}
      {/* Header */}
      <header style={{ padding: '20px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderBottom: `1px solid ${accent}22` }} data-edit-path="layout.header" onClick={(e) => clickGuard(e, 'layout.header')}>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'center' }}
          data-edit-path="layout.header.logo"
          onClick={(e) => clickGuard(e, 'layout.header.logo')}
        >
          {logoUrl && (
            <img
              src={logoUrl}
              alt={storeName}
              style={{ width: 44, height: 44, borderRadius: 9999, objectFit: 'cover', border: `2px solid ${accent}` }}
            />
          )}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <h1
              style={{ fontSize: '28px', fontWeight: 400, fontStyle: 'italic', color: accent, margin: 0 }}
              data-edit-path="__settings.store_name"
              onClick={(e) => clickGuard(e, '__settings.store_name')}
            >
              {storeName}
            </h1>
            {(canManage || storeDescription) && (
              <div style={{ fontSize: 12, color: muted, maxWidth: 520, lineHeight: 1.35 }}>
                {storeDescription || (canManage ? 'Add store description...' : '')}
              </div>
            )}
          </div>
        </div>
      </header>

      {(canManage) && (
        <div
          style={{ padding: '16px 24px', display: 'flex', justifyContent: 'center' }}
          data-edit-path="layout.header.nav"
          onClick={(e) => clickGuard(e, 'layout.header.nav')}
        >
          <div style={{ display: 'flex', gap: 18, fontSize: 12, fontFamily: 'inherit', color: accent }}>
            {['Shop', 'About', 'Contact'].map((label) => (
              <a
                key={label}
                href="#"
                style={{ color: accent, textDecoration: 'none' }}
                onClick={(e) => clickGuard(e, 'layout.header.nav')}
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Hero */}
      <section style={{ padding: isMobile ? '48px 16px' : '80px 24px', textAlign: 'center', backgroundColor: '#fffbeb' }} data-edit-path="layout.hero" onClick={(e) => clickGuard(e, 'layout.hero')}>
        <div
          style={{ display: 'inline-block', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: muted, marginBottom: 14 }}
          data-edit-path="layout.hero.kicker"
          onClick={(e) => clickGuard(e, 'layout.hero.kicker')}
        >
          {heroKicker}
        </div>
        <h2 style={{ fontSize: isMobile ? '28px' : '48px', fontWeight: 400, fontStyle: 'italic', marginBottom: '16px' }} data-edit-path="layout.hero.title" onClick={(e) => clickGuard(e, 'layout.hero.title')}>{heroTitle}</h2>
        <p style={{ color: muted, fontSize: '18px', marginBottom: '32px' }} data-edit-path="layout.hero.subtitle" onClick={(e) => clickGuard(e, 'layout.hero.subtitle')}>{heroSubtitle}</p>
        <button style={{ backgroundColor: accent, color: '#fff', padding: '14px 40px', fontSize: '14px', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }} data-edit-path="layout.hero.cta" onClick={(e) => clickGuard(e, 'layout.hero.cta')}>{ctaText}</button>

        <div style={{ maxWidth: 900, margin: '32px auto 0', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 260px', gap: 18, alignItems: 'center' }}>
          <div data-edit-path="layout.hero.image" onClick={(e) => clickGuard(e, 'layout.hero.image')} style={{ background: '#fff', padding: 10, border: `1px solid ${accent}22` }}>
            <div style={{ aspectRatio: '16/9', overflow: 'hidden' }}>
              <img src={heroImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
          <div data-edit-path="layout.hero.badge" onClick={(e) => clickGuard(e, 'layout.hero.badge')} style={{ background: '#fff', padding: 14, border: `1px solid ${accent}22`, textAlign: 'left' }}>
            <div style={{ fontSize: 12, color: accent, fontWeight: 700, letterSpacing: '0.08em' }}>{badgeTitle}</div>
            {(canManage || badgeSubtitle) && <div style={{ marginTop: 6, fontSize: 12, color: muted }}>{badgeSubtitle || 'Add badge subtitle...'}</div>}
          </div>
        </div>
      </section>

      {/* Categories */}
      {(canManage || categories.length > 0) && (
        <div
          style={{ padding: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}
          data-edit-path="layout.categories"
          onClick={(e) => clickGuard(e, 'layout.categories')}
        >
          <button onClick={() => setCategoryFilter('')} style={{ padding: '8px 24px', backgroundColor: !categoryFilter ? accent : 'transparent', color: !categoryFilter ? '#fff' : accent, border: `1px solid ${accent}`, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>All</button>
          {(categories.length ? categories : ['Category']).map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat === 'Category' ? '' : cat)} style={{ padding: '8px 24px', backgroundColor: categoryFilter === cat ? accent : 'transparent', color: categoryFilter === cat ? '#fff' : accent, border: `1px solid ${accent}`, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>{cat}</button>
          ))}
        </div>
      )}

      {/* Products */}
      <div
        style={{ padding: '0 24px', maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}
        data-edit-path="layout.featured"
        onClick={(e) => clickGuard(e, 'layout.featured')}
      >
        <h2
          style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 600, color: accent, fontStyle: 'italic' }}
          data-edit-path="layout.featured.title"
          onClick={(e) => clickGuard(e, 'layout.featured.title')}
        >
          {featuredTitle}
        </h2>
        {(canManage || featuredSubtitle) && (
          <p
            style={{ margin: '0 0 18px', color: muted, fontSize: 14 }}
            data-edit-path="layout.featured.subtitle"
            onClick={(e) => clickGuard(e, 'layout.featured.subtitle')}
          >
            {featuredSubtitle || (canManage ? 'Add section subtitle...' : '')}
          </p>
        )}
      </div>
      <section
        style={{ padding: `${sectionSpacing}px 24px`, maxWidth: '1400px', margin: '0 auto' }}
        data-edit-path="layout.grid"
        onClick={(e) => clickGuard(e, 'layout.grid')}
      >
        <div
          style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: `${gridGap}px` }}
          data-edit-path="layout.featured.items"
          onClick={(e) => clickGuard(e, 'layout.featured.items')}
        >
          {products.map(product => (
            <div key={product.id} style={{ cursor: canManage ? 'default' : 'pointer', textAlign: 'center', transition: `transform ${animationSpeed}ms` }} data-edit-path={`layout.products.${product.id}`}
              onMouseEnter={(e) => (e.currentTarget.style.transform = `scale(${hoverScale})`)}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              onClick={(e) => { e.stopPropagation(); if (!canManage && product.slug) props.navigate(product.slug); else if (canManage) onSelect(`layout.products.${product.id}`); }}>
              <div style={{ aspectRatio: '2/3', backgroundColor: cardBg, boxShadow: '4px 4px 12px rgba(0,0,0,0.1)', marginBottom: `${baseSpacing}px`, overflow: 'hidden', borderRadius: cardRadius }}>
                {product.images?.[0] && <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px', color: productTitleColor }}>{product.title}</h3>
              <p style={{ fontSize: '12px', color: muted, marginBottom: '4px' }}>{product.category}</p>
              <p style={{ fontSize: '16px', fontWeight: 700, color: productPriceColor }}>{props.formatPrice(product.price)}</p>
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

      {/* Footer */}
      <footer style={{ padding: '48px 24px', backgroundColor: accent, color: '#fff', marginTop: '48px', textAlign: 'center' }} data-edit-path="layout.footer" onClick={(e) => clickGuard(e, 'layout.footer')}>
        <p style={{ fontSize: '14px', opacity: 0.8, margin: 0 }} data-edit-path="layout.footer.copyright" onClick={(e) => clickGuard(e, 'layout.footer.copyright')}>
          {copyright}
        </p>

        <div
          style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 14, flexWrap: 'wrap' }}
          data-edit-path="layout.footer.links"
          onClick={(e) => clickGuard(e, 'layout.footer.links')}
        >
          {['Shipping', 'Returns', 'Contact'].map((label) => (
            <a
              key={label}
              href="#"
              style={{ color: '#fff', textDecoration: 'none', fontSize: 12, opacity: 0.9 }}
              onClick={(e) => clickGuard(e, 'layout.footer.links')}
            >
              {label}
            </a>
          ))}
        </div>

        <div
          style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 14, flexWrap: 'wrap' }}
          data-edit-path="layout.footer.social"
          onClick={(e) => clickGuard(e, 'layout.footer.social')}
        >
          {(canManage || socialLinks.length > 0) &&
            (socialLinks.length ? socialLinks : [{ platform: 'instagram', url: '#' }]).map((l) => (
              <a
                key={`${l.platform}-${l.url}`}
                href={l.url}
                style={{ color: '#fff', textDecoration: 'none', fontSize: 12, opacity: 0.9 }}
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
