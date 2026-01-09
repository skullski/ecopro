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

export default function OutdoorTemplate(props: TemplateProps) {
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

  const bg = asString(settings.template_bg_color) || '#1c1917';
  const text = asString(settings.template_text_color) || '#fafaf9';
  const accent = asString(settings.template_accent_color) || '#84cc16';
  const cardBg = asString(settings.template_card_bg) || '#292524';

  // Layout settings
  const gridColumns = resolveInt(settings.template_grid_columns, 4, 2, 6);
  const gridGap = resolveInt(settings.template_grid_gap, 24, 8, 48);
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 48, 24, 96);
  const animationSpeed = resolveInt(settings.template_animation_speed, 200, 100, 500);
  const hoverScale = asString(settings.template_hover_scale) || '1.02';
  const cardRadius = resolveInt(settings.template_card_border_radius, 8, 0, 32);

  const storeName = asString(settings.store_name) || 'WILD CAMP';
  const heroTitle = asString(settings.template_hero_heading) || 'Explore The Outdoors 🏕️';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Premium camping & hiking gear';
  const ctaText = asString(settings.template_button_text) || 'GEAR UP';

  const products = useMemo(() => {
    const list = props.filtered?.length ? props.filtered : props.products || [];
    return categoryFilter ? list.filter(p => p.category === categoryFilter) : list;
  }, [props.filtered, props.products, categoryFilter]);

  const categories = useMemo(() => [...new Set(props.products?.map(p => p.category).filter(Boolean))], [props.products]);
  const cols = breakpoint === 'mobile' ? 2 : breakpoint === 'tablet' ? Math.min(3, gridColumns) : gridColumns;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bg, color: text, fontFamily: 'system-ui, sans-serif' }} data-edit-path="__root">
      <header style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0c0a09' }} data-edit-path="layout.header" onClick={(e) => clickGuard(e, 'layout.header')}>
        <h1 style={{ fontSize: '22px', fontWeight: 900, letterSpacing: '2px' }} data-edit-path="layout.header.logo" onClick={(e) => clickGuard(e, 'layout.header.logo')}>⛺ {storeName}</h1>
      </header>

      <section style={{ padding: '100px 24px', textAlign: 'center', background: `linear-gradient(135deg, #365314 0%, ${bg} 100%)` }} data-edit-path="layout.hero" onClick={(e) => clickGuard(e, 'layout.hero')}>
        <p style={{ fontSize: '12px', letterSpacing: '4px', color: accent, marginBottom: '16px' }}>ADVENTURE AWAITS</p>
        <h2 style={{ fontSize: breakpoint === 'mobile' ? '36px' : '60px', fontWeight: 900, marginBottom: '20px' }} data-edit-path="layout.hero.title" onClick={(e) => clickGuard(e, 'layout.hero.title')}>{heroTitle}</h2>
        <p style={{ color: '#a8a29e', fontSize: '18px', marginBottom: '32px' }} data-edit-path="layout.hero.subtitle" onClick={(e) => clickGuard(e, 'layout.hero.subtitle')}>{heroSubtitle}</p>
        <button style={{ backgroundColor: accent, color: '#1c1917', padding: '16px 40px', fontSize: '14px', fontWeight: 800, border: 'none', borderRadius: '4px', cursor: 'pointer' }} data-edit-path="layout.hero.cta" onClick={(e) => clickGuard(e, 'layout.hero.cta')}>{ctaText}</button>
      </section>

      {categories.length > 0 && (
        <div style={{ padding: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {['All', ...categories].map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat === 'All' ? '' : cat)} style={{ padding: '10px 24px', backgroundColor: (cat === 'All' ? !categoryFilter : categoryFilter === cat) ? accent : cardBg, color: (cat === 'All' ? !categoryFilter : categoryFilter === cat) ? '#1c1917' : '#fff', border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>{cat.toUpperCase()}</button>
          ))}
        </div>
      )}

      <section style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, maxWidth: '1400px', margin: '0 auto' }} data-edit-path="layout.products">
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: gridGap }}>
          {products.map(product => (
            <div key={product.id} style={{ backgroundColor: cardBg, borderRadius: cardRadius, overflow: 'hidden', cursor: canManage ? 'default' : 'pointer', transition: `transform ${animationSpeed}ms, box-shadow ${animationSpeed}ms` }} data-edit-path={`layout.products.${product.id}`}
              onMouseEnter={(e) => { e.currentTarget.style.transform = `scale(${hoverScale})`; e.currentTarget.style.boxShadow = `0 8px 24px rgba(132,204,22,0.2)`; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
              onClick={(e) => { e.stopPropagation(); if (!canManage && product.slug) props.navigate(product.slug); else if (canManage) onSelect(`layout.products.${product.id}`); }}>
              <div style={{ aspectRatio: '1', backgroundColor: '#1c1917', overflow: 'hidden' }}>
                {product.images?.[0] && <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div style={{ padding: '16px' }}>
                <p style={{ fontSize: '10px', color: accent, fontWeight: 700, marginBottom: '4px' }}>{product.category || 'OUTDOOR'}</p>
                <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>{product.title}</h3>
                <p style={{ fontSize: '18px', fontWeight: 800, color: accent }}>{props.formatPrice(product.price)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, backgroundColor: '#0c0a09', marginTop: `${sectionSpacing}px`, textAlign: 'center' }} data-edit-path="layout.footer" onClick={(e) => clickGuard(e, 'layout.footer')}>
        <p style={{ color: '#78716c' }}>© {new Date().getFullYear()} {storeName}</p>
      </footer>
    </div>
  );
}
