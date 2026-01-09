import React, { useState, useEffect, useMemo } from 'react';
import type { TemplateProps } from '../../types';
type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export default function VintageTemplate(props: TemplateProps) {
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

  const bg = settings.template_bg_color || '#f5f0e8';
  const text = settings.template_text_color || '#3d3022';
  const accent = settings.template_accent_color || '#a1673c';
  const cardBg = settings.template_card_bg || '#ffffff';

  const storeName = settings.store_name || 'The Vintage Emporium';
  const heroTitle = settings.template_hero_heading || 'Timeless Treasures';
  const heroSubtitle = settings.template_hero_subtitle || 'Curated antiques & collectibles';
  const ctaText = settings.template_button_text || 'VIEW COLLECTION';

  const products = useMemo(() => {
    const list = props.filtered?.length ? props.filtered : props.products || [];
    return categoryFilter ? list.filter(p => p.category === categoryFilter) : list;
  }, [props.filtered, props.products, categoryFilter]);

  const categories = useMemo(() => [...new Set(props.products?.map(p => p.category).filter(Boolean))], [props.products]);
  const cols = breakpoint === 'mobile' ? 2 : breakpoint === 'tablet' ? 3 : 4;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bg, color: text, fontFamily: '"Playfair Display", Georgia, serif' }} data-edit-path="__root">
      <header style={{ padding: '20px 24px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderBottom: `2px solid ${accent}` }} data-edit-path="layout.header" onClick={(e) => clickGuard(e, 'layout.header')}>
        <h1 style={{ fontSize: '28px', fontWeight: 600, fontStyle: 'italic' }} data-edit-path="layout.header.logo" onClick={(e) => clickGuard(e, 'layout.header.logo')}>{storeName}</h1>
      </header>

      <section style={{ padding: '80px 24px', textAlign: 'center' }} data-edit-path="layout.hero" onClick={(e) => clickGuard(e, 'layout.hero')}>
        <div style={{ maxWidth: '700px', margin: '0 auto', border: `3px double ${accent}`, padding: '60px 40px' }}>
          <p style={{ fontSize: '14px', letterSpacing: '6px', color: accent, marginBottom: '20px' }}>EST. 1952</p>
          <h2 style={{ fontSize: breakpoint === 'mobile' ? '32px' : '52px', fontWeight: 600, fontStyle: 'italic', marginBottom: '20px' }} data-edit-path="layout.hero.title" onClick={(e) => clickGuard(e, 'layout.hero.title')}>{heroTitle}</h2>
          <p style={{ color: '#78716c', fontSize: '16px', marginBottom: '32px', fontStyle: 'italic' }} data-edit-path="layout.hero.subtitle" onClick={(e) => clickGuard(e, 'layout.hero.subtitle')}>{heroSubtitle}</p>
          <button style={{ backgroundColor: accent, color: '#fff', padding: '14px 40px', fontSize: '12px', fontWeight: 600, letterSpacing: '3px', border: 'none', cursor: 'pointer' }} data-edit-path="layout.hero.cta" onClick={(e) => clickGuard(e, 'layout.hero.cta')}>{ctaText}</button>
        </div>
      </section>

      {categories.length > 0 && (
        <div style={{ padding: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {['All', ...categories].map(cat => (
            <button key={cat} onClick={() => setCategoryFilter(cat === 'All' ? '' : cat)} style={{ padding: '10px 28px', backgroundColor: 'transparent', color: (cat === 'All' ? !categoryFilter : categoryFilter === cat) ? accent : text, borderBottom: (cat === 'All' ? !categoryFilter : categoryFilter === cat) ? `2px solid ${accent}` : '2px solid transparent', border: 'none', fontSize: '13px', letterSpacing: '2px', cursor: 'pointer' }}>{cat.toUpperCase()}</button>
          ))}
        </div>
      )}

      <section style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }} data-edit-path="layout.products">
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '24px' }}>
          {products.map(product => (
            <div key={product.id} style={{ backgroundColor: cardBg, overflow: 'hidden', boxShadow: '0 2px 15px rgba(0,0,0,0.08)', cursor: canManage ? 'default' : 'pointer' }} data-edit-path={`layout.products.${product.id}`}
              onClick={(e) => { e.stopPropagation(); if (!canManage && product.slug) props.navigate(product.slug); else if (canManage) onSelect(`layout.products.${product.id}`); }}>
              <div style={{ aspectRatio: '1', backgroundColor: '#e8e0d5', overflow: 'hidden' }}>
                {product.images?.[0] && <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(10%)' }} />}
              </div>
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <p style={{ fontSize: '10px', letterSpacing: '2px', color: accent, marginBottom: '8px' }}>{product.category || 'ANTIQUE'}</p>
                <h3 style={{ fontSize: '16px', fontWeight: 600, fontStyle: 'italic', marginBottom: '10px' }}>{product.title}</h3>
                <p style={{ fontSize: '18px', fontWeight: 600, color: accent }}>{props.formatPrice(product.price)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ padding: '48px 24px', borderTop: `2px solid ${accent}`, marginTop: '48px', textAlign: 'center' }} data-edit-path="layout.footer" onClick={(e) => clickGuard(e, 'layout.footer')}>
        <p style={{ fontStyle: 'italic', color: '#78716c' }}>© {new Date().getFullYear()} {storeName}</p>
      </footer>
    </div>
  );
}
