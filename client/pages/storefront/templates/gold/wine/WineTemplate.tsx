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

export default function WineTemplate(props: TemplateProps) {
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

  const bg = settings.template_bg_color || '#1c1917';
  const text = settings.template_text_color || '#fef2f2';
  const accent = settings.template_accent_color || '#991b1b';
  const cardBg = settings.template_card_bg || '#292524';

  // Layout settings
  const gridColumns = resolveInt(settings.template_grid_columns, 4, 2, 6);
  const gridGap = resolveInt(settings.template_grid_gap, 24, 8, 48);
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 48, 24, 96);
  const animationSpeed = resolveInt(settings.template_animation_speed, 200, 100, 500);
  const hoverScale = asString(settings.template_hover_scale) || '1.02';
  const cardRadius = resolveInt(settings.template_card_border_radius, 0, 0, 32);

  const storeName = settings.store_name || 'Château Rouge';
  const heroTitle = settings.template_hero_heading || 'Fine Wines 🍷';
  const heroSubtitle = settings.template_hero_subtitle || 'Curated wines from around the world';
  const ctaText = settings.template_button_text || 'Explore Collection';

  const products = useMemo(() => {
    const list = props.filtered?.length ? props.filtered : props.products || [];
    return categoryFilter ? list.filter(p => p.category === categoryFilter) : list;
  }, [props.filtered, props.products, categoryFilter]);

  const categories = useMemo(() => [...new Set(props.products?.map(p => p.category).filter(Boolean))], [props.products]);
  const cols = breakpoint === 'mobile' ? 2 : breakpoint === 'tablet' ? Math.min(3, gridColumns) : gridColumns;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bg, color: text, fontFamily: '"Cormorant Garamond", Georgia, serif' }} data-edit-path="__root">
      <header style={{ padding: '24px 32px', display: 'flex', justifyContent: 'center', alignItems: 'center' }} data-edit-path="layout.header" onClick={(e) => clickGuard(e, 'layout.header')}>
        <h1 style={{ fontSize: '28px', fontWeight: 500, fontStyle: 'italic', color: accent }} data-edit-path="layout.header.logo" onClick={(e) => clickGuard(e, 'layout.header.logo')}>🍷 {storeName}</h1>
      </header>

      <section style={{ padding: '100px 24px', textAlign: 'center', background: `radial-gradient(circle at center, ${accent}22 0%, transparent 50%)` }} data-edit-path="layout.hero" onClick={(e) => clickGuard(e, 'layout.hero')}>
        <p style={{ fontSize: '12px', letterSpacing: '6px', color: accent, marginBottom: '20px' }}>ESTABLISHED 1892</p>
        <h2 style={{ fontSize: breakpoint === 'mobile' ? '40px' : '64px', fontWeight: 400, fontStyle: 'italic', marginBottom: '24px' }} data-edit-path="layout.hero.title" onClick={(e) => clickGuard(e, 'layout.hero.title')}>{heroTitle}</h2>
        <p style={{ color: '#a8a29e', fontSize: '16px', marginBottom: '40px', fontStyle: 'italic' }} data-edit-path="layout.hero.subtitle" onClick={(e) => clickGuard(e, 'layout.hero.subtitle')}>{heroSubtitle}</p>
        <button style={{ backgroundColor: accent, color: '#fff', padding: '16px 48px', fontSize: '14px', fontWeight: 500, border: 'none', cursor: 'pointer' }} data-edit-path="layout.hero.cta" onClick={(e) => clickGuard(e, 'layout.hero.cta')}>{ctaText}</button>
      </section>

      {categories.length > 0 && (
        <div style={{ padding: '24px', display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {['All', ...categories].map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat === 'All' ? '' : cat)} style={{ padding: '8px 0', backgroundColor: 'transparent', color: (cat === 'All' ? !categoryFilter : categoryFilter === cat) ? accent : '#78716c', border: 'none', borderBottom: (cat === 'All' ? !categoryFilter : categoryFilter === cat) ? `1px solid ${accent}` : '1px solid transparent', fontSize: '13px', fontStyle: 'italic', letterSpacing: '2px', cursor: 'pointer' }}>{cat}</button>
          ))}
        </div>
      )}

      <section style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, maxWidth: '1400px', margin: '0 auto' }} data-edit-path="layout.products">
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: `${gridGap}px` }}>
          {products.map(product => (
            <div key={product.id} style={{ backgroundColor: cardBg, borderRadius: `${cardRadius}px`, overflow: 'hidden', cursor: canManage ? 'default' : 'pointer', transition: `transform ${animationSpeed}ms ease` }} data-edit-path={`layout.products.${product.id}`}
              onMouseEnter={(e) => { if (!canManage) e.currentTarget.style.transform = `scale(${hoverScale})`; }}
              onMouseLeave={(e) => { if (!canManage) e.currentTarget.style.transform = 'scale(1)'; }}
              onClick={(e) => { e.stopPropagation(); if (!canManage && product.slug) props.navigate(product.slug); else if (canManage) onSelect(`layout.products.${product.id}`); }}>
              <div style={{ aspectRatio: '3/4', backgroundColor: '#44403c', overflow: 'hidden' }}>
                {product.images?.[0] && <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <p style={{ fontSize: '10px', letterSpacing: '3px', color: accent, marginBottom: '8px' }}>{product.category || 'WINE'}</p>
                <h3 style={{ fontSize: '18px', fontWeight: 400, fontStyle: 'italic', marginBottom: '12px' }}>{product.title}</h3>
                <p style={{ fontSize: '16px', fontWeight: 500, color: accent }}>{props.formatPrice(product.price)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ padding: `${sectionSpacing + 16}px ${baseSpacing}px`, borderTop: `1px solid ${accent}33`, marginTop: `${sectionSpacing}px`, textAlign: 'center' }} data-edit-path="layout.footer" onClick={(e) => clickGuard(e, 'layout.footer')}>
        <p style={{ color: '#78716c', fontStyle: 'italic' }}>© {new Date().getFullYear()} {storeName}</p>
      </footer>
    </div>
  );
}
