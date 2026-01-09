import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { TemplateProps } from '../../types';

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

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
  const muted = settings.template_muted_color || '#64748b';
  const cardBg = settings.template_card_bg || '#1e293b';

  const storeName = settings.store_name || 'SPORTS GEAR';
  const heroTitle = settings.template_hero_heading || 'PUSH YOUR LIMITS';
  const heroSubtitle = settings.template_hero_subtitle || 'Premium athletic gear for champions';
  const ctaText = settings.template_button_text || 'SHOP NOW';

  const products = useMemo(() => {
    const list = props.filtered?.length ? props.filtered : props.products || [];
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

  return (
    <div ref={containerRef} style={{ minHeight: '100vh', backgroundColor: bg, color: text, fontFamily: 'system-ui, sans-serif' }} data-edit-path="__root">
      {/* Header */}
      <header 
        style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${muted}33` }}
        data-edit-path="layout.header"
        onClick={(e) => clickGuard(e, 'layout.header')}
      >
        <h1 
          style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '2px', color: accent }}
          data-edit-path="layout.header.logo"
          onClick={(e) => clickGuard(e, 'layout.header.logo')}
        >
          {storeName}
        </h1>
        <nav style={{ display: 'flex', gap: '24px' }} data-edit-path="layout.header.nav" onClick={(e) => clickGuard(e, 'layout.header.nav')}>
          {['Shop', 'New', 'Sale'].map(item => (
            <span key={item} style={{ color: muted, cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}>{item}</span>
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
      <section style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }} data-edit-path="layout.products">
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '16px' }}>
          {products.map(product => (
            <div 
              key={product.id} 
              style={{ backgroundColor: cardBg, overflow: 'hidden', cursor: canManage ? 'default' : 'pointer' }}
              data-edit-path={`layout.products.${product.id}`}
              onClick={(e) => { 
                e.stopPropagation(); 
                if (!canManage && product.slug) props.navigate(product.slug); 
                else if (canManage) onSelect(`layout.products.${product.id}`); 
              }}
            >
              <div style={{ aspectRatio: '1', backgroundColor: '#334155', overflow: 'hidden' }}>
                {product.images?.[0] && <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div style={{ padding: '16px' }}>
                <p style={{ fontSize: '12px', color: accent, fontWeight: 600, marginBottom: '4px' }}>{product.category || 'GEAR'}</p>
                <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>{product.title}</h3>
                <p style={{ fontSize: '18px', fontWeight: 800 }}>{props.formatPrice(product.price)}</p>
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
        <p style={{ color: muted, fontSize: '14px' }}>© {new Date().getFullYear()} {storeName}</p>
      </footer>
    </div>
  );
}
