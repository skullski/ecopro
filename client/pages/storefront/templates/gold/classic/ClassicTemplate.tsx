import React, { useEffect, useRef, useState, useMemo } from 'react';
import type { TemplateProps } from '../../types';

type Breakpoint = 'mobile' | 'tablet' | 'desktop';
type NavLink = { label: string; url: string };
type SocialLink = { platform: string; url: string };

function asString(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function safeParseJsonArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value !== 'string' || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function resolveInt(value: unknown, fallback: number, min: number, max: number): number {
  const str = String(value ?? '').trim();
  if (str === '') return fallback;
  const n = Number(str);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function normalizeUrl(url: string): string {
  const u = url.trim();
  if (!u) return '';
  if (u.startsWith('/')) return u;
  if (/^https?:\/\//i.test(u)) return u;
  return '/' + u.replace(/^\/+/, '');
}

/**
 * Classic Template - Traditional storefront layout
 * Warm colors, friendly design, great for local shops
 */
export default function ClassicTemplate(props: TemplateProps) {
  const settings = props.settings || ({} as any);
  const canManage = props.canManage !== false;
  const forcedBreakpoint = (props as any).forcedBreakpoint as Breakpoint | undefined;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [detectedBreakpoint, setDetectedBreakpoint] = useState<Breakpoint>(() => {
    if (typeof window !== 'undefined') {
      const w = window.innerWidth;
      return w >= 1024 ? 'desktop' : w >= 768 ? 'tablet' : 'mobile';
    }
    return 'desktop';
  });
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    if (forcedBreakpoint) return;
    const updateBreakpoint = () => {
      const w = window.innerWidth;
      const bp: Breakpoint = w >= 1024 ? 'desktop' : w >= 768 ? 'tablet' : 'mobile';
      setDetectedBreakpoint(bp);
    };
    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, [forcedBreakpoint]);

  const breakpoint = forcedBreakpoint || detectedBreakpoint;

  const onSelect = (path: string) => {
    const anyProps = props as any;
    if (!canManage) return;
    if (typeof anyProps.onSelect === 'function') anyProps.onSelect(path);
  };

  const clickGuard = (e: React.MouseEvent, path: string) => {
    if (!canManage) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect(path);
  };

  // Theme colors - Warm and inviting
  const bg = asString(settings.template_bg_color) || '#faf8f5';
  const text = asString(settings.template_text_color) || '#2d2a26';
  const muted = asString(settings.template_muted_color) || '#6b6560';
  const accent = asString(settings.template_accent_color) || '#c17f59';
  const headerBg = asString(settings.template_header_bg) || '#ffffff';
  const headerText = asString(settings.template_header_text) || '#2d2a26';
  const cardBg = asString(settings.template_card_bg) || '#ffffff';
  const border = asString(settings.template_border_color) || '#e8e4df';

  const fontFamily = asString(settings.template_font_family) || 'Georgia, "Times New Roman", serif';
  const headingWeight = asString(settings.template_heading_font_weight) || '600';
  const cardRadius = resolveInt(settings.template_card_border_radius, 8, 0, 32);
  const gridColumns = resolveInt(settings.template_grid_columns, 4, 1, 6);
  const gridGap = resolveInt(settings.template_grid_gap, 24, 8, 48);
  const baseSpacing = resolveInt(settings.template_spacing, 24, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 64, 24, 96);
  const buttonRadius = resolveInt(settings.template_button_border_radius, 8, 0, 50);
  const animationSpeed = resolveInt(settings.template_animation_speed, 300, 100, 500);
  const hoverScale = asString(settings.template_hover_scale) || '1.02';

  // Hero content
  const heroTitle = asString(settings.template_hero_heading) || 'Welcome to our store';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Quality products, crafted with care. Browse our collection and find something special.';
  const ctaText = asString(settings.template_button_text) || 'Shop Now';
  const heroImage = asString(settings.banner_url) || '';

  const storeName = asString(settings.store_name) || 'Classic Store';

  const navLinks = safeParseJsonArray<NavLink>(settings.template_nav_links)
    .map((l) => ({ label: asString((l as any)?.label), url: normalizeUrl(asString((l as any)?.url)) }))
    .filter((l) => l.label && l.url);

  const products = useMemo(() => {
    const list = (Array.isArray(props.filtered) && props.filtered.length ? props.filtered : props.products) || [];
    return list;
  }, [props.filtered, props.products]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (categoryFilter && p.category !== categoryFilter) return false;
      return true;
    });
  }, [products, categoryFilter]);

  const sectionTitle = asString(settings.template_featured_title) || 'Our Products';
  const sectionSubtitle = asString(settings.template_featured_subtitle) || 'Handpicked selection of our finest items';
  const addToCartLabel = asString(settings.template_add_to_cart_label) || 'Add to Cart';

  const copyright = asString(settings.template_copyright) || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`;
  
  const socialLinks = safeParseJsonArray<SocialLink>(settings.template_social_links)
    .map((l) => ({ platform: asString((l as any)?.platform), url: normalizeUrl(asString((l as any)?.url)) }))
    .filter((l) => l.platform && l.url);

  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';

  const descriptionText = (asString(settings.template_description_text) || asString(settings.store_description)).trim();
  const descriptionColor = asString(settings.template_description_color) || muted;
  const descriptionSize = resolveInt(settings.template_description_size, 14, 10, 32);
  const descriptionStyle = asString(settings.template_description_style) || 'normal';
  const descriptionWeight = resolveInt(settings.template_description_weight, 400, 100, 900);
  const showDescription = canManage || Boolean(descriptionText);

  const getGridCols = () => {
    if (isMobile) return 2;
    if (isTablet) return 3;
    return gridColumns;
  };

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: '100vh',
        backgroundColor: bg,
        color: text,
        fontFamily,
      }}
      data-edit-path="__root"
      onClick={() => onSelect('__root')}
    >
      {/* Header - Classic with border */}
      <header
        style={{
          backgroundColor: headerBg,
          borderBottom: `2px solid ${border}`,
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
        data-edit-path="layout.header"
        onClick={(e) => clickGuard(e, 'layout.header')}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            height: '72px',
          }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
              data-edit-path="layout.header.logo"
              onClick={(e) => clickGuard(e, 'layout.header.logo')}
            >
              {settings.store_logo && (
                <img
                  src={settings.store_logo}
                  alt={storeName}
                  style={{ height: '40px', width: '40px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${border}` }}
                />
              )}
              <span style={{ 
                color: headerText, 
                fontWeight: headingWeight as any, 
                fontSize: '22px',
              }}>
                {storeName}
              </span>
            </div>

            {!isMobile && navLinks.length > 0 && (
              <nav
                style={{ display: 'flex', gap: '28px' }}
                data-edit-path="layout.header.nav"
                onClick={(e) => clickGuard(e, 'layout.header.nav')}
              >
                {navLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    style={{
                      color: muted,
                      fontSize: '15px',
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = accent)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = muted)}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <span style={{ color: muted, fontSize: '14px', cursor: 'pointer' }}>🔍</span>
              <span style={{ 
                color: '#fff', 
                fontSize: '14px', 
                cursor: 'pointer',
                backgroundColor: accent,
                padding: '8px 16px',
                borderRadius: '4px',
              }}>
                Cart (0)
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Warm and welcoming */}
      {heroImage ? (
        <section
          style={{
            height: isMobile ? '45vh' : '55vh',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          data-edit-path="layout.hero"
          onClick={(e) => clickGuard(e, 'layout.hero')}
        >
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(45,42,38,0.85) 0%, rgba(45,42,38,0.4) 100%)',
          }} />
          <div style={{ 
            position: 'relative', 
            padding: '0 24px',
            maxWidth: '600px',
            marginLeft: isMobile ? '0' : '80px',
          }}>
            <h1
              style={{
                fontSize: isMobile ? '28px' : '42px',
                fontWeight: headingWeight as any,
                marginBottom: '16px',
                color: '#fff',
                lineHeight: 1.2,
              }}
              data-edit-path="layout.hero.title"
              onClick={(e) => clickGuard(e, 'layout.hero.title')}
            >
              {heroTitle}
            </h1>
            <p
              style={{
                fontSize: '16px',
                color: 'rgba(255,255,255,0.85)',
                marginBottom: '28px',
                lineHeight: 1.6,
              }}
              data-edit-path="layout.hero.subtitle"
              onClick={(e) => clickGuard(e, 'layout.hero.subtitle')}
            >
              {heroSubtitle}
            </p>
            <button
              style={{
                backgroundColor: accent,
                color: '#ffffff',
                padding: '14px 28px',
                fontSize: '15px',
                fontWeight: '600',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              data-edit-path="layout.hero.cta"
              onClick={(e) => clickGuard(e, 'layout.hero.cta')}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {ctaText}
            </button>
          </div>
        </section>
      ) : (
        <section
          style={{
            padding: isMobile ? '48px 24px' : '72px 24px',
            background: `linear-gradient(135deg, ${accent}15 0%, ${bg} 100%)`,
            textAlign: 'center',
          }}
          data-edit-path="layout.hero"
          onClick={(e) => clickGuard(e, 'layout.hero')}
        >
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <h1
              style={{
                fontSize: isMobile ? '32px' : '48px',
                fontWeight: headingWeight as any,
                marginBottom: '20px',
                color: text,
                lineHeight: 1.2,
              }}
              data-edit-path="layout.hero.title"
              onClick={(e) => clickGuard(e, 'layout.hero.title')}
            >
              {heroTitle}
            </h1>
            <p
              style={{
                fontSize: '17px',
                color: muted,
                marginBottom: '32px',
                lineHeight: 1.7,
              }}
              data-edit-path="layout.hero.subtitle"
              onClick={(e) => clickGuard(e, 'layout.hero.subtitle')}
            >
              {heroSubtitle}
            </p>
            <button
              style={{
                backgroundColor: accent,
                color: '#ffffff',
                padding: '14px 32px',
                fontSize: '15px',
                fontWeight: '600',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
              data-edit-path="layout.hero.cta"
              onClick={(e) => clickGuard(e, 'layout.hero.cta')}
            >
              {ctaText}
            </button>
          </div>
        </section>
      )}

      {/* Description (replaces categories) */}
      {showDescription && (
        <section
          style={{
            padding: '20px 24px',
            backgroundColor: headerBg,
            borderBottom: `1px solid ${border}`,
          }}
          data-edit-path="layout.categories"
          onClick={(e) => clickGuard(e, 'layout.categories')}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            <p
              style={{
                margin: 0,
                color: descriptionColor,
                fontSize: `${descriptionSize}px`,
                fontStyle: descriptionStyle === 'italic' ? 'italic' : 'normal',
                fontWeight: descriptionWeight,
                lineHeight: 1.6,
              }}
            >
              {descriptionText || (canManage ? 'Add description...' : '')}
            </p>
          </div>
        </section>
      )}

      {/* Products Section */}
      <section
        style={{
          padding: isMobile ? `${sectionSpacing * 0.6}px ${baseSpacing}px` : `${sectionSpacing}px ${baseSpacing}px`,
        }}
        data-edit-path="layout.featured"
        onClick={(e) => clickGuard(e, 'layout.featured')}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2
              style={{
                fontSize: isMobile ? '24px' : '32px',
                fontWeight: headingWeight as any,
                marginBottom: '12px',
                color: text,
              }}
              data-edit-path="layout.featured.title"
              onClick={(e) => clickGuard(e, 'layout.featured.title')}
            >
              {sectionTitle}
            </h2>
            <p
              style={{
                fontSize: '16px',
                color: muted,
              }}
              data-edit-path="layout.featured.subtitle"
              onClick={(e) => clickGuard(e, 'layout.featured.subtitle')}
            >
              {sectionSubtitle}
            </p>
          </div>

          {/* Product Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${getGridCols()}, 1fr)`,
              gap: isMobile ? '16px' : `${gridGap}px`,
            }}
            data-edit-path="layout.grid"
            onClick={(e) => clickGuard(e, 'layout.grid')}
          >
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                style={{
                  backgroundColor: cardBg,
                  borderRadius: `${cardRadius}px`,
                  overflow: 'hidden',
                  border: `1px solid ${border}`,
                  cursor: canManage ? 'default' : 'pointer',
                  transition: `box-shadow ${animationSpeed}ms, transform ${animationSpeed}ms`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (canManage) {
                    onSelect(`layout.products.${product.id}`);
                    return;
                  }
                  props.navigate(product.slug || String(product.id));
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = `scale(${hoverScale})`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <div
                  style={{
                    aspectRatio: '1',
                    backgroundColor: '#f5f3f0',
                    overflow: 'hidden',
                  }}
                >
                  {product.images?.[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.4s ease',
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: muted,
                      fontSize: '14px',
                    }}>
                      No image
                    </div>
                  )}
                </div>
                <div style={{ padding: '16px' }}>
                  <h3 style={{
                    fontSize: '15px',
                    fontWeight: '500',
                    marginBottom: '8px',
                    color: text,
                  }}>
                    {product.title}
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: accent,
                    }}>
                      {props.formatPrice(product.price)}
                    </p>
                    <button
                      style={{
                        backgroundColor: 'transparent',
                        color: accent,
                        border: `1px solid ${accent}`,
                        padding: '6px 12px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: canManage ? 'default' : 'pointer',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (canManage) return;
                        props.navigate(product.slug || String(product.id));
                      }}
                    >
                      {addToCartLabel}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <p style={{ textAlign: 'center', color: muted, padding: '60px 0' }}>
              No products found
            </p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: '#2d2a26',
          color: '#fff',
          padding: isMobile ? '40px 24px' : '56px 24px',
        }}
        data-edit-path="layout.footer"
        onClick={(e) => clickGuard(e, 'layout.footer')}
      >
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'center' : 'flex-start',
            gap: '32px',
            marginBottom: '32px',
          }}>
            <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>
                {storeName}
              </h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', maxWidth: '300px' }}>
                Quality products, crafted with care. Thank you for shopping with us.
              </p>
            </div>

            {socialLinks.length > 0 && (
              <div style={{ display: 'flex', gap: '16px' }}>
                {socialLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '14px',
                      textDecoration: 'none',
                      textTransform: 'capitalize',
                      padding: '8px 12px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '4px',
                    }}
                  >
                    {link.platform}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div style={{ 
            borderTop: '1px solid rgba(255,255,255,0.1)', 
            paddingTop: '24px',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
              {copyright}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
