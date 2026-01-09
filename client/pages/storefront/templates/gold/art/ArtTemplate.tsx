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
  const heroTitle = settings.template_hero_heading || 'Original Art & Prints';
  const heroSubtitle = settings.template_hero_subtitle || 'Curated collection';
  const ctaText = settings.template_button_text || 'VIEW GALLERY';

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
      <header style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e5e5' }} data-edit-path="layout.header" onClick={(e) => clickGuard(e, 'layout.header')}>
        <h1 style={{ fontSize: '20px', fontWeight: 400, letterSpacing: '4px', textTransform: 'uppercase' }} data-edit-path="layout.header.logo" onClick={(e) => clickGuard(e, 'layout.header.logo')}>{storeName}</h1>
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

      <section style={{ padding: `${sectionSpacing}px`, maxWidth: '1400px', margin: '0 auto' }} data-edit-path="layout.products">
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: `${gridGap}px` }}>
          {products.map(product => (
            <div key={product.id} style={{ cursor: canManage ? 'default' : 'pointer' }} data-edit-path={`layout.products.${product.id}`}
              onClick={(e) => { e.stopPropagation(); if (!canManage && product.slug) props.navigate(product.slug); else if (canManage) onSelect(`layout.products.${product.id}`); }}>
              <div style={{ aspectRatio: '4/5', backgroundColor: cardBg, boxShadow: '0 20px 40px rgba(0,0,0,0.1)', marginBottom: `${baseSpacing}px`, overflow: 'hidden', borderRadius: cardRadius }}>
                {product.images?.[0] && <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 400, marginBottom: '8px', fontStyle: 'italic' }}>{product.title}</h3>
              <p style={{ fontSize: '14px', color: '#71717a', marginBottom: '8px' }}>{product.category}</p>
              <p style={{ fontSize: '16px', fontWeight: 600, color: accent }}>{props.formatPrice(product.price)}</p>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ padding: '64px 24px', backgroundColor: '#18181b', color: '#fff', marginTop: '64px', textAlign: 'center' }} data-edit-path="layout.footer" onClick={(e) => clickGuard(e, 'layout.footer')}>
        <p style={{ fontSize: '12px', letterSpacing: '2px' }}>© {new Date().getFullYear()} {storeName}</p>
      </footer>
    </div>
  );
}
