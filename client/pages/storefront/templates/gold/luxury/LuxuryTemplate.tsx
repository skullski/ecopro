import React, { useState, useEffect, useMemo } from 'react';
import type { TemplateProps } from '../../types';
type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export default function LuxuryTemplate(props: TemplateProps) {
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

  const bg = settings.template_bg_color || '#0a0a0a';
  const text = settings.template_text_color || '#fafafa';
  const accent = settings.template_accent_color || '#c9a962';
  const cardBg = settings.template_card_bg || '#141414';

  const storeName = settings.store_name || 'MAISON LUXE';
  const heroTitle = settings.template_hero_heading || 'Exceptional Quality';
  const heroSubtitle = settings.template_hero_subtitle || 'Timeless elegance, uncompromising craftsmanship';
  const ctaText = settings.template_button_text || 'DISCOVER';

  const products = useMemo(() => {
    const list = props.filtered?.length ? props.filtered : props.products || [];
    return categoryFilter ? list.filter(p => p.category === categoryFilter) : list;
  }, [props.filtered, props.products, categoryFilter]);

  const categories = useMemo(() => [...new Set(props.products?.map(p => p.category).filter(Boolean))], [props.products]);
  const cols = breakpoint === 'mobile' ? 2 : breakpoint === 'tablet' ? 3 : 4;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bg, color: text, fontFamily: '"Cormorant Garamond", Georgia, serif' }} data-edit-path="__root">
      <header style={{ padding: '24px 32px', display: 'flex', justifyContent: 'center', alignItems: 'center' }} data-edit-path="layout.header" onClick={(e) => clickGuard(e, 'layout.header')}>
        <h1 style={{ fontSize: '24px', fontWeight: 400, letterSpacing: '8px', color: accent }} data-edit-path="layout.header.logo" onClick={(e) => clickGuard(e, 'layout.header.logo')}>{storeName}</h1>
      </header>

      <section style={{ padding: '120px 24px', textAlign: 'center' }} data-edit-path="layout.hero" onClick={(e) => clickGuard(e, 'layout.hero')}>
        <p style={{ fontSize: '12px', letterSpacing: '6px', color: accent, marginBottom: '24px' }}>SINCE 1892</p>
        <h2 style={{ fontSize: breakpoint === 'mobile' ? '36px' : '64px', fontWeight: 300, marginBottom: '24px', fontStyle: 'italic' }} data-edit-path="layout.hero.title" onClick={(e) => clickGuard(e, 'layout.hero.title')}>{heroTitle}</h2>
        <p style={{ color: '#737373', fontSize: '16px', letterSpacing: '2px', marginBottom: '40px' }} data-edit-path="layout.hero.subtitle" onClick={(e) => clickGuard(e, 'layout.hero.subtitle')}>{heroSubtitle}</p>
        <button style={{ backgroundColor: 'transparent', color: accent, padding: '16px 48px', fontSize: '12px', fontWeight: 400, letterSpacing: '4px', border: `1px solid ${accent}`, cursor: 'pointer' }} data-edit-path="layout.hero.cta" onClick={(e) => clickGuard(e, 'layout.hero.cta')}>{ctaText}</button>
      </section>

      {categories.length > 0 && (
        <div style={{ padding: '24px', display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {['All', ...categories].map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat === 'All' ? '' : cat)} style={{ padding: '8px 0', backgroundColor: 'transparent', color: (cat === 'All' ? !categoryFilter : categoryFilter === cat) ? accent : '#737373', border: 'none', borderBottom: (cat === 'All' ? !categoryFilter : categoryFilter === cat) ? `1px solid ${accent}` : '1px solid transparent', fontSize: '12px', letterSpacing: '3px', cursor: 'pointer' }}>{cat.toUpperCase()}</button>
          ))}
        </div>
      )}

      <section style={{ padding: '48px 24px', maxWidth: '1400px', margin: '0 auto' }} data-edit-path="layout.products">
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '32px' }}>
          {products.map(product => (
            <div key={product.id} style={{ backgroundColor: cardBg, overflow: 'hidden', cursor: canManage ? 'default' : 'pointer' }} data-edit-path={`layout.products.${product.id}`}
              onClick={(e) => { e.stopPropagation(); if (!canManage && product.slug) props.navigate(product.slug); else if (canManage) onSelect(`layout.products.${product.id}`); }}>
              <div style={{ aspectRatio: '3/4', backgroundColor: '#1a1a1a', overflow: 'hidden' }}>
                {product.images?.[0] && <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <p style={{ fontSize: '10px', letterSpacing: '3px', color: accent, marginBottom: '8px' }}>{product.category || 'LUXURY'}</p>
                <h3 style={{ fontSize: '16px', fontWeight: 400, fontStyle: 'italic', marginBottom: '12px' }}>{product.title}</h3>
                <p style={{ fontSize: '16px', fontWeight: 300, color: accent, letterSpacing: '2px' }}>{props.formatPrice(product.price)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ padding: '64px 24px', marginTop: '48px', textAlign: 'center', borderTop: `1px solid ${accent}22` }} data-edit-path="layout.footer" onClick={(e) => clickGuard(e, 'layout.footer')}>
        <p style={{ color: '#525252', letterSpacing: '2px', fontSize: '12px' }}>© {new Date().getFullYear()} {storeName}</p>
      </footer>
    </div>
  );
}
