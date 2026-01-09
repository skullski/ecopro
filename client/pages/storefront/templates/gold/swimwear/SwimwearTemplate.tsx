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

export default function SwimwearTemplate(props: TemplateProps) {
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

  const bg = settings.template_bg_color || '#ecfeff';
  const text = settings.template_text_color || '#164e63';
  const accent = settings.template_accent_color || '#06b6d4';
  const cardBg = settings.template_card_bg || '#ffffff';

  // Layout settings
  const gridColumns = resolveInt(settings.template_grid_columns, 4, 2, 6);
  const gridGap = resolveInt(settings.template_grid_gap, 24, 8, 48);
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 48, 24, 96);
  const animationSpeed = resolveInt(settings.template_animation_speed, 200, 100, 500);
  const hoverScale = asString(settings.template_hover_scale) || '1.02';
  const cardRadius = resolveInt(settings.template_card_border_radius, 20, 0, 32);

  const storeName = settings.store_name || 'Wave Rider';
  const heroTitle = settings.template_hero_heading || 'Beach Ready 🏖️';
  const heroSubtitle = settings.template_hero_subtitle || 'Swimwear for sun-seekers';
  const ctaText = settings.template_button_text || 'Shop Swimwear';

  const products = useMemo(() => {
    const list = props.filtered?.length ? props.filtered : props.products || [];
    return categoryFilter ? list.filter(p => p.category === categoryFilter) : list;
  }, [props.filtered, props.products, categoryFilter]);

  const categories = useMemo(() => [...new Set(props.products?.map(p => p.category).filter(Boolean))], [props.products]);
  const cols = breakpoint === 'mobile' ? 2 : breakpoint === 'tablet' ? Math.min(3, gridColumns) : gridColumns;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bg, color: text, fontFamily: 'system-ui, sans-serif' }} data-edit-path="__root">
      <header style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(90deg, #06b6d4, #0284c7)' }} data-edit-path="layout.header" onClick={(e) => clickGuard(e, 'layout.header')}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }} data-edit-path="layout.header.logo" onClick={(e) => clickGuard(e, 'layout.header.logo')}>🏖️ {storeName}</h1>
      </header>

      <section style={{ padding: '80px 24px', textAlign: 'center', background: 'linear-gradient(180deg, #cffafe 0%, #ecfeff 100%)' }} data-edit-path="layout.hero" onClick={(e) => clickGuard(e, 'layout.hero')}>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
          {['🌊', '🏝️', '☀️', '🐚', '🏖️'].map((e, i) => <span key={i} style={{ fontSize: '28px' }}>{e}</span>)}
        </div>
        <h2 style={{ fontSize: breakpoint === 'mobile' ? '36px' : '56px', fontWeight: 800, marginBottom: '16px' }} data-edit-path="layout.hero.title" onClick={(e) => clickGuard(e, 'layout.hero.title')}>{heroTitle}</h2>
        <p style={{ color: '#0891b2', fontSize: '18px', marginBottom: '32px' }} data-edit-path="layout.hero.subtitle" onClick={(e) => clickGuard(e, 'layout.hero.subtitle')}>{heroSubtitle}</p>
        <button style={{ background: 'linear-gradient(90deg, #06b6d4, #0284c7)', color: '#fff', padding: '14px 40px', fontSize: '14px', fontWeight: 700, border: 'none', borderRadius: '50px', cursor: 'pointer' }} data-edit-path="layout.hero.cta" onClick={(e) => clickGuard(e, 'layout.hero.cta')}>{ctaText}</button>
      </section>

      {categories.length > 0 && (
        <div style={{ padding: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {['All', ...categories].map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat === 'All' ? '' : cat)} style={{ padding: '10px 24px', background: (cat === 'All' ? !categoryFilter : categoryFilter === cat) ? 'linear-gradient(90deg, #06b6d4, #0284c7)' : '#fff', color: (cat === 'All' ? !categoryFilter : categoryFilter === cat) ? '#fff' : accent, border: 'none', borderRadius: '50px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>{cat}</button>
          ))}
        </div>
      )}

      <section style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, maxWidth: '1400px', margin: '0 auto' }} data-edit-path="layout.products">
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: `${gridGap}px` }}>
          {products.map(product => (
            <div key={product.id} style={{ backgroundColor: cardBg, borderRadius: `${cardRadius}px`, overflow: 'hidden', boxShadow: '0 4px 20px rgba(6,182,212,0.15)', cursor: canManage ? 'default' : 'pointer', transition: `transform ${animationSpeed}ms ease` }} data-edit-path={`layout.products.${product.id}`}
              onMouseEnter={(e) => { if (!canManage) e.currentTarget.style.transform = `scale(${hoverScale})`; }}
              onMouseLeave={(e) => { if (!canManage) e.currentTarget.style.transform = 'scale(1)'; }}
              onClick={(e) => { e.stopPropagation(); if (!canManage && product.slug) props.navigate(product.slug); else if (canManage) onSelect(`layout.products.${product.id}`); }}>
              <div style={{ aspectRatio: '3/4', backgroundColor: '#cffafe', overflow: 'hidden' }}>
                {product.images?.[0] && <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div style={{ padding: '16px', textAlign: 'center' }}>
                <p style={{ fontSize: '11px', color: accent, fontWeight: 600, marginBottom: '4px' }}>{product.category || 'SWIMWEAR'}</p>
                <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>{product.title}</h3>
                <p style={{ fontSize: '18px', fontWeight: 700, color: accent }}>{props.formatPrice(product.price)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, background: 'linear-gradient(90deg, #06b6d4, #0284c7)', marginTop: `${sectionSpacing}px`, textAlign: 'center' }} data-edit-path="layout.footer" onClick={(e) => clickGuard(e, 'layout.footer')}>
        <p style={{ color: '#cffafe' }}>© {new Date().getFullYear()} {storeName} 🌊</p>
      </footer>
    </div>
  );
}
