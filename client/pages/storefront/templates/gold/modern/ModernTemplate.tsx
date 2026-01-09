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
 * Modern Template - Bold, contemporary design
 * Gradient accents, rounded cards, perfect for tech/lifestyle brands
 */
export default function ModernTemplate(props: TemplateProps) {
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

  // Theme colors - Bold and modern
  const bg = asString(settings.template_bg_color) || '#f8fafc';
  const text = asString(settings.template_text_color) || '#0f172a';
  const muted = asString(settings.template_muted_color) || '#64748b';
  const accent = asString(settings.template_accent_color) || '#6366f1';
  const accentSecondary = asString(settings.template_accent_secondary_color) || '#8b5cf6';
  const headerBg = asString(settings.template_header_bg) || '#ffffff';
  const headerText = asString(settings.template_header_text) || '#0f172a';
  const cardBg = asString(settings.template_card_bg) || '#ffffff';
  const border = asString(settings.template_border_color) || '#e2e8f0';

  const fontFamily = asString(settings.template_font_family) || 'Inter, -apple-system, BlinkMacSystemFont, sans-serif';
  const headingWeight = asString(settings.template_heading_font_weight) || '700';
  const cardRadius = resolveInt(settings.template_card_border_radius, 16, 0, 32);
  const gridColumns = resolveInt(settings.template_grid_columns, 4, 1, 6);
  const gridGap = resolveInt(settings.template_grid_gap, 24, 8, 48);
  const baseSpacing = resolveInt(settings.template_spacing, 24, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 64, 24, 96);
  const buttonRadius = resolveInt(settings.template_button_border_radius, 12, 0, 50);
  const animationSpeed = resolveInt(settings.template_animation_speed, 300, 100, 500);
  const hoverScale = asString(settings.template_hover_scale) || '1.02';

  // Gradient for hero
  const gradient = `linear-gradient(135deg, ${accent} 0%, ${accentSecondary} 100%)`;

  // Hero content
  const heroTitle = asString(settings.template_hero_heading) || 'Shop the future.';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Discover innovative products designed for modern living. Quality meets style.';
  const ctaText = asString(settings.template_button_text) || 'Get Started';
  const ctaSecondaryText = asString(settings.template_button_secondary_text) || 'Learn More';
  const heroImage = asString(settings.banner_url) || '';

  const storeName = asString(settings.store_name) || 'MODERN';

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

  const sectionTitle = asString(settings.template_featured_title) || 'Featured Products';
  const sectionSubtitle = asString(settings.template_featured_subtitle) || 'Our most popular items, hand-picked for you';
  const addToCartLabel = asString(settings.template_add_to_cart_label) || 'Quick View';

  const copyright = asString(settings.template_copyright) || `© ${new Date().getFullYear()} ${storeName}`;
  
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
      {/* Header - Modern with shadow */}
      <header
        style={{
          backgroundColor: headerBg,
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}
        data-edit-path="layout.header"
        onClick={(e) => clickGuard(e, 'layout.header')}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            height: '68px',
          }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
              data-edit-path="layout.header.logo"
              onClick={(e) => clickGuard(e, 'layout.header.logo')}
            >
              {settings.store_logo ? (
                <img
                  src={settings.store_logo}
                  alt={storeName}
                  style={{ height: '36px', width: '36px', borderRadius: '10px', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '16px',
                }}>
                  {storeName.charAt(0)}
                </div>
              )}
              <span style={{ 
                color: headerText, 
                fontWeight: headingWeight as any, 
                fontSize: '18px',
              }}>
                {storeName}
              </span>
            </div>

            {!isMobile && navLinks.length > 0 && (
              <nav
                style={{ display: 'flex', gap: '32px' }}
                data-edit-path="layout.header.nav"
                onClick={(e) => clickGuard(e, 'layout.header.nav')}
              >
                {navLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    style={{
                      color: muted,
                      fontSize: '14px',
                      fontWeight: '500',
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = text)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = muted)}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button style={{ 
                background: 'none',
                border: 'none',
                color: muted, 
                fontSize: '14px', 
                cursor: 'pointer',
                padding: '8px',
              }}>
                Search
              </button>
              <button style={{ 
                background: gradient,
                color: '#fff', 
                fontSize: '14px', 
                fontWeight: '600',
                cursor: 'pointer',
                padding: '10px 20px',
                borderRadius: '10px',
                border: 'none',
              }}>
                Cart (0)
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Bold gradient or image */}
      {heroImage ? (
        <section
          style={{
            minHeight: isMobile ? '50vh' : '65vh',
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
            background: 'linear-gradient(135deg, rgba(99,102,241,0.9) 0%, rgba(139,92,246,0.8) 100%)',
          }} />
          <div style={{ 
            position: 'relative', 
            padding: '0 24px',
            maxWidth: '1280px',
            margin: '0 auto',
            width: '100%',
          }}>
            <div style={{ maxWidth: '600px' }}>
              <h1
                style={{
                  fontSize: isMobile ? '36px' : '56px',
                  fontWeight: headingWeight as any,
                  marginBottom: '20px',
                  color: '#fff',
                  lineHeight: 1.1,
                }}
                data-edit-path="layout.hero.title"
                onClick={(e) => clickGuard(e, 'layout.hero.title')}
              >
                {heroTitle}
              </h1>
              <p
                style={{
                  fontSize: isMobile ? '16px' : '18px',
                  color: 'rgba(255,255,255,0.9)',
                  marginBottom: '32px',
                  lineHeight: 1.6,
                }}
                data-edit-path="layout.hero.subtitle"
                onClick={(e) => clickGuard(e, 'layout.hero.subtitle')}
              >
                {heroSubtitle}
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  style={{
                    backgroundColor: '#fff',
                    color: accent,
                    padding: '14px 28px',
                    fontSize: '15px',
                    fontWeight: '600',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                  }}
                  data-edit-path="layout.hero.cta"
                  onClick={(e) => clickGuard(e, 'layout.hero.cta')}
                >
                  {ctaText}
                </button>
                <button
                  style={{
                    backgroundColor: 'transparent',
                    color: '#fff',
                    padding: '14px 28px',
                    fontSize: '15px',
                    fontWeight: '600',
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                  }}
                >
                  {ctaSecondaryText}
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section
          style={{
            background: gradient,
            padding: isMobile ? '60px 24px' : '100px 24px',
          }}
          data-edit-path="layout.hero"
          onClick={(e) => clickGuard(e, 'layout.hero')}
        >
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center',
              gap: '48px',
            }}>
              <div style={{ flex: 1, maxWidth: '600px' }}>
                <h1
                  style={{
                    fontSize: isMobile ? '40px' : '64px',
                    fontWeight: headingWeight as any,
                    marginBottom: '24px',
                    color: '#fff',
                    lineHeight: 1.1,
                  }}
                  data-edit-path="layout.hero.title"
                  onClick={(e) => clickGuard(e, 'layout.hero.title')}
                >
                  {heroTitle}
                </h1>
                <p
                  style={{
                    fontSize: isMobile ? '16px' : '18px',
                    color: 'rgba(255,255,255,0.9)',
                    marginBottom: '36px',
                    lineHeight: 1.7,
                  }}
                  data-edit-path="layout.hero.subtitle"
                  onClick={(e) => clickGuard(e, 'layout.hero.subtitle')}
                >
                  {heroSubtitle}
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    style={{
                      backgroundColor: '#fff',
                      color: accent,
                      padding: '16px 32px',
                      fontSize: '15px',
                      fontWeight: '600',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                    }}
                    data-edit-path="layout.hero.cta"
                    onClick={(e) => clickGuard(e, 'layout.hero.cta')}
                  >
                    {ctaText}
                  </button>
                  <button
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      color: '#fff',
                      padding: '16px 32px',
                      fontSize: '15px',
                      fontWeight: '600',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      backdropFilter: 'blur(4px)',
                    }}
                  >
                    {ctaSecondaryText}
                  </button>
                </div>
              </div>
              
              {/* Decorative circles */}
              {!isMobile && (
                <div style={{ flex: 1, position: 'relative', height: '300px' }}>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '250px',
                    height: '250px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: '30%',
                    left: '30%',
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.08)',
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: '60%',
                    left: '60%',
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.12)',
                  }} />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Description (replaces categories) */}
      {showDescription && (
        <section
          style={{ padding: '24px' }}
          data-edit-path="layout.categories"
          onClick={(e) => clickGuard(e, 'layout.categories')}
        >
          <div style={{ maxWidth: '1280px', margin: '0 auto', textAlign: 'center' }}>
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
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2
              style={{
                fontSize: isMobile ? '28px' : '36px',
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
                  cursor: canManage ? 'default' : 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  transition: `all ${animationSpeed}ms ease`,
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
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)';
                  e.currentTarget.style.transform = `scale(${hoverScale})`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <div
                  style={{
                    aspectRatio: '1',
                    backgroundColor: '#f1f5f9',
                    overflow: 'hidden',
                    position: 'relative',
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
                        transition: 'transform 0.5s ease',
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
                  
                  {/* Quick view button on hover */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      opacity: 0,
                      transition: 'opacity 0.3s',
                    }}
                    className="quick-view-btn"
                  >
                    <button
                      style={{
                        background: gradient,
                        color: '#fff',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
                      }}
                    >
                      {addToCartLabel}
                    </button>
                  </div>
                </div>
                <div style={{ padding: '16px' }}>
                  {product.category && (
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      color: accent,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      {product.category}
                    </span>
                  )}
                  <h3 style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    marginTop: '4px',
                    marginBottom: '8px',
                    color: text,
                  }}>
                    {product.title}
                  </h3>
                  <p style={{
                    fontSize: '17px',
                    fontWeight: '700',
                    color: text,
                  }}>
                    {props.formatPrice(product.price)}
                  </p>
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

      {/* Footer - Modern with gradient accent */}
      <footer
        style={{
          backgroundColor: '#0f172a',
          color: '#fff',
          padding: isMobile ? '48px 24px' : '64px 24px',
        }}
        data-edit-path="layout.footer"
        onClick={(e) => clickGuard(e, 'layout.footer')}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          {/* Gradient line */}
          <div style={{
            height: '4px',
            background: gradient,
            borderRadius: '2px',
            marginBottom: '48px',
          }} />

          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'center' : 'flex-start',
            gap: '40px',
          }}>
            <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '14px',
                }}>
                  {storeName.charAt(0)}
                </div>
                <span style={{ fontWeight: '700', fontSize: '18px' }}>{storeName}</span>
              </div>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', maxWidth: '300px' }}>
                Building the future of shopping, one product at a time.
              </p>
            </div>

            {socialLinks.length > 0 && (
              <div style={{ display: 'flex', gap: '12px' }}>
                {socialLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#fff',
                      fontSize: '14px',
                      textDecoration: 'none',
                      textTransform: 'capitalize',
                      padding: '10px 16px',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                  >
                    {link.platform}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div style={{ 
            marginTop: '48px',
            paddingTop: '24px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
              {copyright}
            </p>
          </div>
        </div>
      </footer>

      {/* Custom styles for hover effects */}
      <style>{`
        [data-edit-path="layout.grid"] > div:hover .quick-view-btn {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}
