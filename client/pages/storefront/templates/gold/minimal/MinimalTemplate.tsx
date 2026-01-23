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
 * Minimal Template - Clean, white-space focused design
 * Perfect for boutique shops, art galleries, and premium products
 */
export default function MinimalTemplate(props: TemplateProps) {
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

  // Theme colors - Minimal uses lots of white space
  const bg = asString(settings.template_bg_color) || '#ffffff';
  const text = asString(settings.template_text_color) || '#111111';
  const muted = asString(settings.template_muted_color) || '#666666';
  const accent = asString(settings.template_accent_color) || '#000000';
  

  const productTitleColor = asString(settings.template_product_title_color) || text;
  const productPriceColor = asString(settings.template_product_price_color) || accent;
const headerBg = asString(settings.template_header_bg) || '#ffffff';
  const headerText = asString(settings.template_header_text) || '#111111';
  const cardBg = asString(settings.template_card_bg) || '#fafafa';
  const border = asString(settings.template_border_color) || '#e5e5e5';

  const fontFamily = asString(settings.template_font_family) || '"Helvetica Neue", Helvetica, Arial, sans-serif';
  const headingWeight = asString(settings.template_heading_font_weight) || '300';
  const cardRadius = resolveInt(settings.template_card_border_radius, 0, 0, 32);
  const gridColumns = resolveInt(settings.template_grid_columns, 3, 1, 6);
  const gridGap = resolveInt(settings.template_grid_gap, 40, 8, 48);
  const baseSpacing = resolveInt(settings.template_spacing, 24, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 80, 24, 96);
  const buttonRadius = resolveInt(settings.template_button_border_radius, 0, 0, 50);
  const animationSpeed = resolveInt(settings.template_animation_speed, 200, 100, 500);
  const hoverScale = asString(settings.template_hover_scale) || '1';

  // Hero content
  const heroTitle = asString(settings.template_hero_heading) || 'Less is more.';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Discover our carefully curated collection of essential pieces.';
  const ctaText = asString(settings.template_button_text) || 'Explore';
  const heroImage = asString(settings.banner_url) || '';
  const heroKicker = asString((settings as any).template_hero_kicker) || 'NEW • MINIMAL EDIT';
  const badgeTitle = asString((settings as any).template_hero_badge_title) || 'Featured';
  const badgeSubtitle = asString((settings as any).template_hero_badge_subtitle) || '';

  const storeName = asString(settings.store_name) || 'MINIMAL';

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

  const sectionTitle = asString(settings.template_featured_title) || 'Products';
  const sectionSubtitle = asString(settings.template_featured_subtitle) || '';
  const addToCartLabel = asString(settings.template_add_to_cart_label) || 'View';

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
    if (isMobile) return 1;
    if (isTablet) return 2;
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
      {canManage && (
        <button
          type="button"
          data-edit-path="__settings"
          onClick={(e) => clickGuard(e, '__settings')}
          style={{
            position: 'fixed',
            right: 12,
            bottom: 12,
            zIndex: 1000,
            background: 'rgba(255,255,255,0.92)',
            border: `1px solid ${border}`,
            borderRadius: 9999,
            padding: '8px 10px',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: text,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Settings
        </button>
      )}
      {/* Header - Ultra minimal */}
      <header
        style={{
          backgroundColor: headerBg,
          borderBottom: `1px solid ${border}`,
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
        data-edit-path="layout.header"
        onClick={(e) => clickGuard(e, 'layout.header')}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
              data-edit-path="layout.header.logo"
              onClick={(e) => clickGuard(e, 'layout.header.logo')}
            >
              {settings.store_logo && (
                <img
                  src={settings.store_logo}
                  alt={storeName}
                  style={{ height: '28px', width: '28px', objectFit: 'contain' }}
                />
              )}
              <span style={{ 
                color: headerText, 
                fontWeight: headingWeight as any, 
                fontSize: '18px', 
                letterSpacing: '0.2em',
                textTransform: 'uppercase'
              }}
              data-edit-path="__settings.store_name"
              onClick={(e) => clickGuard(e, '__settings.store_name')}
              >
                {storeName}
              </span>
            </div>

            {!isMobile && (canManage || navLinks.length > 0) && (
              <nav
                style={{ display: 'flex', gap: '32px' }}
                data-edit-path="layout.header.nav"
                onClick={(e) => clickGuard(e, 'layout.header.nav')}
              >
                {(navLinks.length ? navLinks : [{ label: 'Shop', url: '/products' }, { label: 'About', url: '/about' }, { label: 'Contact', url: '/contact' }]).map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    style={{
                      color: muted,
                      fontSize: '13px',
                      textDecoration: 'none',
                      letterSpacing: '0.05em',
                    }}
                    onClick={(e) => {
                      if (!canManage) return;
                      e.preventDefault();
                      e.stopPropagation();
                      onSelect('layout.header.nav');
                    }}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <span style={{ color: muted, fontSize: '13px', cursor: 'pointer' }}>Search</span>
              <span style={{ color: text, fontSize: '13px', cursor: 'pointer' }}>Cart (0)</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Clean and spacious */}
      {heroImage ? (
        <section
          style={{
            height: isMobile ? '50vh' : '70vh',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          data-edit-path="layout.hero"
          onClick={(e) => clickGuard(e, 'layout.hero')}
        >
          {canManage && (
            <div
              data-edit-path="layout.hero.image"
              onClick={(e) => clickGuard(e, 'layout.hero.image')}
              style={{
                position: 'absolute',
                top: 16,
                left: 16,
                background: 'rgba(255,255,255,0.9)',
                color: '#111',
                padding: '6px 10px',
                border: `1px solid ${border}`,
                fontSize: 11,
                letterSpacing: '0.08em',
                cursor: 'pointer',
              }}
            >
              Hero image
            </div>
          )}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(255,255,255,0.4)',
          }} />
          <div style={{ 
            position: 'relative', 
            textAlign: 'center', 
            padding: '0 24px',
            maxWidth: '600px' 
          }}>
            <div
              data-edit-path="layout.hero.kicker"
              onClick={(e) => clickGuard(e, 'layout.hero.kicker')}
              style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: muted, marginBottom: 10 }}
            >
              {heroKicker}
            </div>
            <h1
              style={{
                fontSize: isMobile ? '32px' : '48px',
                fontWeight: headingWeight as any,
                letterSpacing: '0.02em',
                marginBottom: '16px',
                color: text,
              }}
              data-edit-path="layout.hero.title"
              onClick={(e) => clickGuard(e, 'layout.hero.title')}
            >
              {heroTitle}
            </h1>
            <p
              style={{
                fontSize: '16px',
                color: muted,
                marginBottom: '32px',
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
                padding: '14px 32px',
                fontSize: '13px',
                letterSpacing: '0.1em',
                border: 'none',
                cursor: 'pointer',
              }}
              data-edit-path="layout.hero.cta"
              onClick={(e) => clickGuard(e, 'layout.hero.cta')}
            >
              {ctaText}
            </button>

            {canManage && (
              <div
                data-edit-path="layout.hero.badge"
                onClick={(e) => clickGuard(e, 'layout.hero.badge')}
                style={{
                  marginTop: 14,
                  display: 'inline-block',
                  background: 'rgba(255,255,255,0.92)',
                  border: `1px solid ${border}`,
                  padding: '10px 12px',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontSize: 12, color: text, letterSpacing: '0.06em' }}>{badgeTitle}</div>
                <div style={{ marginTop: 4, fontSize: 12, color: muted }}>{badgeSubtitle || 'Add badge subtitle...'}</div>
              </div>
            )}
          </div>
        </section>
      ) : (
        <section
          style={{
            padding: isMobile ? '60px 24px' : '100px 24px',
            textAlign: 'center',
            maxWidth: '600px',
            margin: '0 auto',
          }}
          data-edit-path="layout.hero"
          onClick={(e) => clickGuard(e, 'layout.hero')}
        >
          <div
            data-edit-path="layout.hero.kicker"
            onClick={(e) => clickGuard(e, 'layout.hero.kicker')}
            style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: muted, marginBottom: 14 }}
          >
            {heroKicker}
          </div>
          {canManage && (
            <div
              data-edit-path="layout.hero.image"
              onClick={(e) => clickGuard(e, 'layout.hero.image')}
              style={{
                display: 'inline-block',
                background: '#fff',
                border: `1px dashed ${border}`,
                padding: '10px 12px',
                marginBottom: 18,
                color: muted,
                fontSize: 12,
              }}
            >
              Add hero image
            </div>
          )}
          <h1
            style={{
              fontSize: isMobile ? '36px' : '56px',
              fontWeight: headingWeight as any,
              letterSpacing: '0.02em',
              marginBottom: '20px',
              color: text,
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
              marginBottom: '36px',
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
              padding: '14px 36px',
              fontSize: '13px',
              letterSpacing: '0.1em',
              border: 'none',
              cursor: 'pointer',
            }}
            data-edit-path="layout.hero.cta"
            onClick={(e) => clickGuard(e, 'layout.hero.cta')}
          >
            {ctaText}
          </button>

          {canManage && (
            <div
              data-edit-path="layout.hero.badge"
              onClick={(e) => clickGuard(e, 'layout.hero.badge')}
              style={{
                marginTop: 18,
                display: 'inline-block',
                background: '#fff',
                border: `1px solid ${border}`,
                padding: '10px 12px',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: 12, color: text, letterSpacing: '0.06em' }}>{badgeTitle}</div>
              <div style={{ marginTop: 4, fontSize: 12, color: muted }}>{badgeSubtitle || 'Add badge subtitle...'}</div>
            </div>
          )}
        </section>
      )}

      {/* Description (replaces categories) */}
      {showDescription && (
        <section
          style={{
            padding: '24px',
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
                lineHeight: 1.7,
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
          <h2
            style={{
              fontSize: '14px',
              fontWeight: '400',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: '48px',
              color: muted,
              textAlign: 'center',
            }}
            data-edit-path="layout.featured.title"
            onClick={(e) => clickGuard(e, 'layout.featured.title')}
          >
            {sectionTitle}
          </h2>

          <p
            style={{
              margin: '0 0 48px',
              color: muted,
              fontSize: '13px',
              letterSpacing: '0.02em',
              textAlign: 'center',
            }}
            data-edit-path="layout.featured.subtitle"
            onClick={(e) => clickGuard(e, 'layout.featured.subtitle')}
          >
            {sectionSubtitle || (canManage ? 'Add subtitle...' : '')}
          </p>

          {/* Product Grid */}
          <div
            style={{ width: '100%' }}
            data-edit-path="layout.featured.items"
            onClick={(e) => clickGuard(e, 'layout.featured.items')}
          >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${getGridCols()}, 1fr)`,
              gap: isMobile ? '24px' : `${gridGap}px`,
            }}
            data-edit-path="layout.grid"
            onClick={(e) => clickGuard(e, 'layout.grid')}
          >
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                style={{
                  cursor: canManage ? 'default' : 'pointer',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (canManage) {
                    // In editor mode, select for editing instead of navigating
                    onSelect(`layout.grid.items.${product.id}`);
                    return;
                  }
                  // In storefront, navigate to product page (relative path)
                  props.navigate(product.slug || String(product.id));
                }}
              >
                <div
                  style={{
                    aspectRatio: '3/4',
                    backgroundColor: cardBg,
                    borderRadius: `${cardRadius}px`,
                    overflow: 'hidden',
                    marginBottom: '16px',
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
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
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
                <h3 style={{
                  fontSize: '14px',
                  fontWeight: '400',
                  marginBottom: '6px',
                  color: text,
                }}>
                  {product.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: muted,
                }}>
                  {props.formatPrice(product.price)}
                </p>

                <button
                  style={{
                    marginTop: 14,
                    backgroundColor: accent,
                    color: '#ffffff',
                    padding: '10px 14px',
                    fontSize: 12,
                    letterSpacing: '0.08em',
                    border: 'none',
                    borderRadius: `${buttonRadius}px`,
                    cursor: 'pointer',
                  }}
                  data-edit-path="layout.featured.addLabel"
                  onClick={(e) => {
                    if (canManage) return clickGuard(e, 'layout.featured.addLabel');
                    e.stopPropagation();
                    props.navigate(product.slug || String(product.id));
                  }}
                >
                  {addToCartLabel}
                </button>
              </div>
            ))}
            </div>
          </div>

          {filteredProducts.length === 0 && (
            <p style={{ textAlign: 'center', color: muted, padding: '60px 0' }}>
              No products found
            </p>
          )}
        </div>
      </section>

      {/* Footer - Simple */}
      <footer
        style={{
          borderTop: `1px solid ${border}`,
          padding: '48px 24px',
          backgroundColor: bg,
        }}
        data-edit-path="layout.footer"
        onClick={(e) => clickGuard(e, 'layout.footer')}
      >
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'center' : 'flex-start',
          gap: '24px',
        }}>
          <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
            <p
              style={{ fontSize: '12px', color: muted, letterSpacing: '0.05em' }}
              data-edit-path="layout.footer.copyright"
              onClick={(e) => clickGuard(e, 'layout.footer.copyright')}
            >
              {copyright}
            </p>
          </div>

          <div
            style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-start' }}
            data-edit-path="layout.footer.links"
            onClick={(e) => clickGuard(e, 'layout.footer.links')}
          >
            {['Shipping', 'Returns', 'Contact'].map((label) => (
              <a
                key={label}
                href="#"
                style={{ color: muted, fontSize: 12, textDecoration: 'none' }}
                onClick={(e) => clickGuard(e, 'layout.footer.links')}
              >
                {label}
              </a>
            ))}
          </div>

          {(canManage || socialLinks.length > 0) && (
            <div
              style={{ display: 'flex', gap: '20px' }}
              data-edit-path="layout.footer.social"
              onClick={(e) => clickGuard(e, 'layout.footer.social')}
            >
              {(socialLinks.length ? socialLinks : [{ platform: 'instagram', url: '#' }, { platform: 'tiktok', url: '#' }]).map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: muted,
                    fontSize: '12px',
                    textDecoration: 'none',
                    textTransform: 'capitalize',
                  }}
                  onClick={(e) => {
                    if (!canManage) return;
                    e.preventDefault();
                    e.stopPropagation();
                    onSelect('layout.footer.social');
                  }}
                >
                  {link.platform}
                </a>
              ))}
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
