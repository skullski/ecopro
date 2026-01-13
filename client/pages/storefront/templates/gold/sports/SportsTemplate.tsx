import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { TemplateProps } from '../../types';

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

type NavLink = { label: string; url: string };

function asString(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function resolveInt(value: unknown, fallback: number, min: number, max: number): number {
  const str = String(value ?? '').trim();
  if (!str) return fallback;
  const n = Number(str);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function safeParseNavLinks(value: unknown): NavLink[] {
  if (Array.isArray(value)) {
    return value
      .map((v: any) => ({ label: typeof v?.label === 'string' ? v.label : '', url: typeof v?.url === 'string' ? v.url : '' }))
      .filter((v) => v.label && v.url);
  }
  if (typeof value !== 'string' || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return safeParseNavLinks(parsed);
  } catch {
    return [];
  }
}

function normalizeUrl(url: string): string {
  const u = url.trim();
  if (!u) return '';
  if (u.startsWith('/')) return u;
  if (/^https?:\/\//i.test(u)) return u;
  return '/' + u.replace(/^\/+/, '');
}

export default function SportsTemplate(props: TemplateProps) {
  const settings = props.settings || ({} as any);
  const canManage = props.canManage !== false;
  const forcedBreakpoint = (props as any).forcedBreakpoint as Breakpoint | undefined;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    if (forcedBreakpoint) { setBreakpoint(forcedBreakpoint); return; }
    const update = () => {
      const w = window.innerWidth;
      setBreakpoint(w >= 1024 ? 'desktop' : w >= 768 ? 'tablet' : 'mobile');
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [forcedBreakpoint]);

  const onSelect = (path: string) => {
    if (!canManage) return;
    const anyProps = props as any;
    if (typeof anyProps.onSelect === 'function') anyProps.onSelect(path);
  };

  const clickGuard = (e: React.MouseEvent, path: string) => {
    if (!canManage) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect(path);
  };

  // Theme - Athletic/Energetic
  const bg = settings.template_bg_color || '#0f172a';
  const text = settings.template_text_color || '#f8fafc';
  const accent = settings.template_accent_color || '#22c55e';
  

  const productTitleColor = asString(settings.template_product_title_color) || text;
  const productPriceColor = asString(settings.template_product_price_color) || accent;
const muted = settings.template_muted_color || '#64748b';
  const cardBg = settings.template_card_bg || '#1e293b';

  const storeName = settings.store_name || 'SPORTS GEAR';
  
  const copyright = asString(settings.template_copyright) || `© ${new Date().getFullYear()} ${storeName}`;
const heroTitle = settings.template_hero_heading || 'PUSH YOUR LIMITS';
  const heroSubtitle = settings.template_hero_subtitle || 'Premium athletic gear for champions';
  const ctaText = settings.template_button_text || 'SHOP NOW';

  const products = useMemo(() => {
    const list = props.filtered?.length ? props.filtered : props.products || [];
    

  const sectionTitle = asString(settings.template_featured_title) || "Featured";
  const sectionSubtitle = asString(settings.template_featured_subtitle) || "";
  const addToCartLabel = asString(settings.template_add_to_cart_label) || "View";
return categoryFilter ? list.filter(p => p.category === categoryFilter) : list;
  }, [props.filtered, props.products, categoryFilter]);

  const categories = useMemo(() => [...new Set(props.products?.map(p => p.category).filter(Boolean))], [props.products]);
  const isMobile = breakpoint === 'mobile';
  const cols = isMobile ? 2 : breakpoint === 'tablet' ? 3 : 4;

  const descriptionText = (asString(settings.template_description_text) || asString(settings.store_description)).trim();
  const descriptionColor = asString(settings.template_description_color) || muted;
  const descriptionSize = resolveInt(settings.template_description_size, 14, 10, 32);
  const descriptionStyle = asString(settings.template_description_style) || 'normal';
  const descriptionWeight = resolveInt(settings.template_description_weight, 400, 100, 900);
  const showDescription = canManage || Boolean(descriptionText);

  // Layout settings
  const gridColumns = resolveInt(settings.template_grid_columns, 4, 2, 6);
  const gridGap = resolveInt(settings.template_grid_gap, 24, 8, 48);
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 48, 24, 96);
  const animationSpeed = resolveInt(settings.template_animation_speed, 200, 100, 500);
  const hoverScale = asString(settings.template_hover_scale) || '1.02';
  const cardRadius = resolveInt(settings.template_card_border_radius, 12, 0, 32);

  const navLinks = useMemo(() => {
    const raw = (settings as any).template_nav_links;
    return safeParseNavLinks(raw).map((l) => ({ ...l, url: normalizeUrl(l.url) })).filter((l) => l.label && l.url);
  }, [(settings as any).template_nav_links]);

  const finalCols = isMobile ? 2 : breakpoint === 'tablet' ? 3 : gridColumns;

  return (
    <div ref={containerRef} style={{ minHeight: '100vh', backgroundColor: bg, color: text, fontFamily: 'system-ui, sans-serif' }} data-edit-path="__root">
      {/* Header */}
      <header 
        style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${muted}33` }}
        data-edit-path="layout.header"
        onClick={(e) => clickGuard(e, 'layout.header')}
      >
        <h1
          style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '2px', color: accent, display: 'flex', alignItems: 'center', gap: 10 }}
          data-edit-path="layout.header.logo"
          onClick={(e) => clickGuard(e, 'layout.header.logo')}
        >
          {asString(settings.store_logo) ? (
            <img
              src={asString(settings.store_logo)}
              alt={storeName}
              style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover' }}
            />
          ) : null}
          {storeName}
        </h1>
        <nav style={{ display: 'flex', gap: '24px' }} data-edit-path="layout.header.nav" onClick={(e) => clickGuard(e, 'layout.header.nav')}>
          {(navLinks.length ? navLinks : [
            { label: 'Shop', url: '/products' },
            { label: 'New', url: '/products' },
            { label: 'Sale', url: '/products' },
          ]).map((item) => (
            <a
              key={item.label}
              href={item.url}
              style={{ color: muted, cursor: 'pointer', fontSize: '14px', fontWeight: 600, textDecoration: 'none' }}
              onClick={(e) => {
                if (!canManage) return;
                e.preventDefault();
                e.stopPropagation();
                onSelect('layout.header.nav');
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      {/* Hero */}
      <section 
        style={{ padding: isMobile ? '40px 16px' : '80px 24px', textAlign: 'center', background: `linear-gradient(135deg, ${bg} 0%, ${cardBg} 100%)` }}
        data-edit-path="layout.hero"
        onClick={(e) => clickGuard(e, 'layout.hero')}
      >
        <p style={{ color: accent, fontSize: '12px', fontWeight: 700, letterSpacing: '3px', marginBottom: '16px' }}>NEW COLLECTION</p>
        <h2 
          style={{ fontSize: isMobile ? '32px' : '56px', fontWeight: 900, marginBottom: '16px', letterSpacing: '-1px' }}
          data-edit-path="layout.hero.title"
          onClick={(e) => clickGuard(e, 'layout.hero.title')}
        >
          {heroTitle}
        </h2>
        <p 
          style={{ color: muted, fontSize: '18px', marginBottom: '32px' }}
          data-edit-path="layout.hero.subtitle"
          onClick={(e) => clickGuard(e, 'layout.hero.subtitle')}
        >
          {heroSubtitle}
        </p>
        <button 
          style={{ backgroundColor: accent, color: bg, padding: '16px 48px', fontSize: '14px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
          data-edit-path="layout.hero.cta"
          onClick={(e) => clickGuard(e, 'layout.hero.cta')}
        >
          {ctaText}
        </button>
      </section>

      {/* Description (replaces categories) */}
      {showDescription && (
        <div
          style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}
          data-edit-path="layout.categories"
          onClick={(e) => clickGuard(e, 'layout.categories')}
        >
          <p
            style={{
              margin: 0,
              color: descriptionColor,
              fontSize: `${descriptionSize}px`,
              fontStyle: descriptionStyle === 'italic' ? 'italic' : 'normal',
              fontWeight: descriptionWeight,
              lineHeight: 1.6,
              textAlign: 'center',
              maxWidth: 920,
            }}
          >
            {descriptionText || (canManage ? 'Add description...' : '')}
          </p>
        </div>
      )}

      {/* Products */}
      <section style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, maxWidth: '1400px', margin: '0 auto' }} data-edit-path="layout.grid">
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${finalCols}, 1fr)`, gap: gridGap }}>
          {products.map(product => (
            <div 
              key={product.id} 
              style={{ backgroundColor: cardBg, borderRadius: cardRadius, overflow: 'hidden', cursor: canManage ? 'default' : 'pointer', transition: `transform ${animationSpeed}ms, box-shadow ${animationSpeed}ms` }}
              data-edit-path={`layout.grid.items.${product.id}`}
              onMouseEnter={(e) => { e.currentTarget.style.transform = `scale(${hoverScale})`; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
              onClick={(e) => { 
                e.stopPropagation(); 
                if (!canManage && product.slug) props.navigate(product.slug); 
                else if (canManage) onSelect(`layout.grid.items.${product.id}`); 
              }}
            >
              <div style={{ aspectRatio: '1', backgroundColor: '#334155', overflow: 'hidden' }}>
                {product.images?.[0] && <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div style={{ padding: '16px' }}>
                <p style={{ fontSize: '12px', color: accent, fontWeight: 600, marginBottom: '4px' }}>{product.category || 'GEAR'}</p>
                <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' , color: productTitleColor}}>{product.title}</h3>
                <p style={{ fontSize: '18px', fontWeight: 800 , color: productPriceColor}}>{props.formatPrice(product.price)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer 
        style={{ padding: '48px 24px', backgroundColor: cardBg, marginTop: '48px', textAlign: 'center' }}
        data-edit-path="layout.footer"
        onClick={(e) => clickGuard(e, 'layout.footer')}
      >
        <p style={{ color: muted, fontSize: '14px' }}>{copyright}</p>
      </footer>
    </div>
  );
}
