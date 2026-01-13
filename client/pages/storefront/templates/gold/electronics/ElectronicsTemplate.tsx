import React, { useEffect, useRef, useState, useMemo } from 'react';
import type { TemplateProps } from '../../types';

type Breakpoint = 'mobile' | 'tablet' | 'desktop';
type NavLink = { label: string; url: string };
type SocialLink = { platform: string; url: string; icon?: string };

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

export default function ElectronicsTemplate(props: TemplateProps) {
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

  // Theme colors - Tech/Electronics dark theme with cyan accents
  const bg = asString(settings.template_bg_color) || '#020617';
  const text = asString(settings.template_text_color) || '#f1f5f9';
  const muted = asString(settings.template_muted_color) || '#94a3b8';
  const accent = asString(settings.template_accent_color) || '#38bdf8';
  

  const productTitleColor = asString(settings.template_product_title_color) || text;
  const productPriceColor = asString(settings.template_product_price_color) || accent;
const headerBg = asString(settings.template_header_bg) || 'rgba(2,6,23,0.95)';
  const headerText = asString(settings.template_header_text) || '#f1f5f9';
  const cardBg = asString(settings.template_card_bg) || '#0f172a';
  const footerBg = asString(settings.template_footer_bg) || bg;

  const fontFamily = asString(settings.template_font_family) || 'system-ui, -apple-system, sans-serif';
  const headingWeight = asString(settings.template_heading_font_weight) || '600';
  const cardRadius = resolveInt(settings.template_card_border_radius, 16, 0, 32);

  // Advanced settings - properly parsed
  const gridGap = resolveInt(settings.template_grid_gap, 20, 8, 48);
  const baseSpacing = resolveInt(settings.template_spacing, 24, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 64, 24, 96);
  const animationSpeed = resolveInt(settings.template_animation_speed, 300, 100, 500);
  const hoverScale = asString(settings.template_hover_scale) || '1.02';
  const gridColumns = resolveInt(settings.template_grid_columns, 4, 1, 6);
  const customCss = asString(settings.template_custom_css);

  // Category pill settings
  const categoryPillBg = asString(settings.template_category_pill_bg) || 'rgba(56,189,248,0.1)';
  const categoryPillText = asString(settings.template_category_pill_text) || muted;
  const categoryPillActiveBg = asString(settings.template_category_pill_active_bg) || accent;
  const categoryPillActiveText = asString(settings.template_category_pill_active_text) || '#020617';
  const categoryPillRadius = resolveInt(settings.template_category_pill_border_radius, 9999, 0, 9999);

  // Hero content
  const heroTitle = asString(settings.template_hero_heading) || 'Next-Gen Tech\nAt Your Fingertips';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Discover cutting-edge gadgets, premium accessories, and innovative devices. Experience the future today.';
  const heroKicker = asString(settings.template_hero_kicker) || 'ELECTRONICS · GADGETS · INNOVATION';
  const ctaText = asString(settings.template_button_text) || 'SHOP NOW';
  const ctaSecondaryText = asString(settings.template_button_secondary_text) || 'LEARN MORE';
  const heroBadge = asString(settings.template_hero_badge) || '🚀 NEW RELEASES';
  const heroImage = asString(settings.banner_url) || (props.products?.[0]?.images?.[0] || '/placeholder.png');

  const storeName = asString(settings.store_name) || 'TECHSTORE';

  const navLinks = safeParseJsonArray<NavLink>(settings.template_nav_links)
    .map((l) => ({ label: asString((l as any)?.label), url: normalizeUrl(asString((l as any)?.url)) }))
    .filter((l) => l.label && l.url);

  const footerLinks = safeParseJsonArray<NavLink>(settings.template_footer_links)
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
  const sectionSubtitle = asString(settings.template_featured_subtitle) || 'Hand-picked tech for every need';
  const addToCartLabel = asString(settings.template_add_to_cart_label) || 'Add to Cart';

  const copyright = asString(settings.template_copyright) || `© ${new Date().getFullYear()} ${storeName}`;
  const footerText = asString(settings.template_footer_text) || muted;

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
      {/* Header */}
      <header
        style={{
          backgroundColor: headerBg,
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(56, 189, 248, 0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
        data-edit-path="layout.header"
        onClick={(e) => clickGuard(e, 'layout.header')}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
              data-edit-path="layout.header.logo"
              onClick={(e) => clickGuard(e, 'layout.header.logo')}
            >
              {settings.store_logo && (
                <img
                  src={settings.store_logo}
                  alt={storeName}
                  style={{ height: '36px', width: '36px', borderRadius: '8px', objectFit: 'cover' }}
                />
              )}
              <span style={{ color: headerText, fontWeight: headingWeight as any, fontSize: '16px' }}>
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
                      fontSize: '13px',
                      textDecoration: 'none',
                      fontWeight: 500,
                    }}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            )}

            <div
              style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
              data-edit-path="layout.header.actions"
              onClick={(e) => clickGuard(e, 'layout.header.actions')}
            >
              <span style={{ color: muted, fontSize: '13px', cursor: 'pointer' }}>🔍</span>
              <span style={{ color: accent, fontSize: '13px', cursor: 'pointer' }}>🛒 (0)</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with radial gradient background */}
      <section
        style={{
          minHeight: isMobile ? '50vh' : '65vh',
          position: 'relative',
          background: `radial-gradient(ellipse at top right, ${accent}15, transparent 50%), ${bg}`,
          display: 'flex',
          alignItems: 'center',
        }}
        data-edit-path="layout.hero"
        onClick={(e) => clickGuard(e, 'layout.hero')}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '40px 20px' : '60px 24px', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: '40px' }}>
            <div style={{ flex: 1 }}>
              {/* Badge */}
              <div
                style={{
                  display: 'inline-block',
                  background: `linear-gradient(135deg, ${accent}20, ${accent}10)`,
                  border: `1px solid ${accent}30`,
                  color: accent,
                  padding: '8px 16px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  marginBottom: '20px',
                  fontWeight: 500,
                }}
                data-edit-path="layout.hero.badge"
                onClick={(e) => clickGuard(e, 'layout.hero.badge')}
              >
                {heroBadge}
              </div>
              <div
                style={{ color: muted, fontSize: '12px', letterSpacing: '0.12em', marginBottom: '12px' }}
                data-edit-path="layout.hero.kicker"
                onClick={(e) => clickGuard(e, 'layout.hero.kicker')}
              >
                {heroKicker}
              </div>
              <h1
                style={{
                  fontSize: isMobile ? '32px' : '48px',
                  fontWeight: headingWeight as any,
                  lineHeight: 1.1,
                  marginBottom: '20px',
                  whiteSpace: 'pre-line',
                  background: `linear-gradient(135deg, ${text} 0%, ${accent} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
                data-edit-path="layout.hero.title"
                onClick={(e) => clickGuard(e, 'layout.hero.title')}
              >
                {heroTitle}
              </h1>
              <p
                style={{ color: muted, fontSize: '15px', lineHeight: 1.7, marginBottom: '32px', maxWidth: '480px' }}
                data-edit-path="layout.hero.subtitle"
                onClick={(e) => clickGuard(e, 'layout.hero.subtitle')}
              >
                {heroSubtitle}
              </p>
              {/* Dual CTA buttons */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  style={{
                    background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                    color: '#020617',
                    padding: '14px 28px',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: `0 8px 32px ${accent}40`,
                  }}
                  data-edit-path="layout.hero.cta.0.label"
                  onClick={(e) => clickGuard(e, 'layout.hero.cta.0.label')}
                >
                  {ctaText}
                </button>
                <button
                  style={{
                    backgroundColor: 'transparent',
                    color: text,
                    padding: '14px 28px',
                    borderRadius: '12px',
                    border: '1px solid #334155',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  data-edit-path="layout.hero.cta.1.label"
                  onClick={(e) => clickGuard(e, 'layout.hero.cta.1.label')}
                >
                  {ctaSecondaryText}
                </button>
              </div>
            </div>

            <div
              style={{ flex: 1, display: 'flex', justifyContent: 'center' }}
              data-edit-path="layout.hero.image"
              onClick={(e) => clickGuard(e, 'layout.hero.image')}
            >
              <img
                src={heroImage}
                alt="Featured Product"
                style={{
                  maxWidth: isMobile ? '280px' : '400px',
                  maxHeight: '400px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 20px 40px rgba(56, 189, 248, 0.3))',
                }}
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Description (replaces categories) */}
      {showDescription && (
        <section
          style={{ padding: '20px 24px', borderBottom: '1px solid #1e293b' }}
          data-edit-path="layout.categories"
          onClick={(e) => clickGuard(e, 'layout.categories')}
        >
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: muted, marginBottom: 8 }}>Description</div>
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

      {/* Products Grid */}
      <section
        style={{ padding: isMobile ? '32px 16px' : '56px 24px' }}
        data-edit-path="layout.featured"
        onClick={(e) => clickGuard(e, 'layout.featured')}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ marginBottom: '36px' }}>
            <h2
              style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: headingWeight as any, marginBottom: '8px' }}
              data-edit-path="layout.featured.title"
              onClick={(e) => clickGuard(e, 'layout.featured.title')}
            >
              {sectionTitle}
            </h2>
            <p
              style={{ color: muted, fontSize: '14px' }}
              data-edit-path="layout.featured.subtitle"
              onClick={(e) => clickGuard(e, 'layout.featured.subtitle')}
            >
              {sectionSubtitle}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(3, 1fr)' : `repeat(${gridColumns}, 1fr)`,
              gap: isMobile ? '12px' : `${gridGap}px`,
            }}
            data-edit-path="layout.grid"
            onClick={(e) => clickGuard(e, 'layout.grid')}
          >
            {filteredProducts.slice(0, 12).map((product) => (
              <div
                key={product.id}
                style={{
                  backgroundColor: cardBg,
                  borderRadius: `${cardRadius}px`,
                  border: '1px solid #1e293b',
                  overflow: 'hidden',
                  transition: `all ${animationSpeed}ms ease`,
                  cursor: canManage ? 'default' : 'pointer',
                }}
                data-edit-path={`layout.featured.items.${product.id}`}
                onClick={(e) => {
                  if (!canManage && product?.slug) {
                    props.navigate(product.slug);
                  } else if (canManage) {
                    clickGuard(e, `layout.featured.items.${product.id}`);
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = `scale(${hoverScale})`;
                  e.currentTarget.style.boxShadow = '0 0 24px rgba(56,189,248,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', backgroundColor: '#0f172a', padding: '12px' }}>
                  <img
                    src={product.images?.[0] || '/placeholder.png'}
                    alt={product.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
                  />
                  {product.is_featured && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        backgroundColor: accent,
                        color: '#020617',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      HOT
                    </span>
                  )}
                </div>
                <div style={{ padding: isMobile ? '12px' : '16px' }}>
                  <h3
                    style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: 500, marginBottom: '6px', color: text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    data-edit-path={`layout.featured.items.${product.id}.title`}
                    onClick={(e) => clickGuard(e, `layout.featured.items.${product.id}.title`)}
                  >
                    {product.title}
                  </h3>
                  {product.category && (
                    <p style={{ fontSize: '11px', color: muted, marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.category}</p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ color: accent, fontSize: isMobile ? '15px' : '17px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {props.formatPrice?.(product.price) || `${product.price} DZD`}
                    </span>
                  </div>
                  <button
                    style={{
                      width: '100%',
                      backgroundColor: `${accent}15`,
                      border: `1px solid ${accent}30`,
                      color: accent,
                      padding: '10px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                    data-edit-path="layout.featured.addLabel"
                    onClick={(e) => clickGuard(e, 'layout.featured.addLabel')}
                  >
                    {addToCartLabel}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid #1e293b',
          padding: '48px 24px',
          backgroundColor: footerBg,
        }}
        data-edit-path="layout.footer"
        onClick={(e) => clickGuard(e, 'layout.footer')}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'center' : 'flex-start', gap: '32px', marginBottom: '32px' }}>
            <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
              <div style={{ color: text, fontWeight: headingWeight as any, fontSize: '18px', marginBottom: '8px' }}>{storeName}</div>
              <div
                style={{ color: footerText, fontSize: '13px' }}
                data-edit-path="layout.footer.copyright"
                onClick={(e) => clickGuard(e, 'layout.footer.copyright')}
              >
                {copyright}
              </div>
            </div>
            {footerLinks.length > 0 && (
              <div
                style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-start' }}
                data-edit-path="layout.footer.links"
                onClick={(e) => clickGuard(e, 'layout.footer.links')}
              >
                {footerLinks.map((link, i) => (
                  <a key={i} href={link.url} style={{ color: muted, fontSize: '13px', textDecoration: 'none' }}>
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
          {socialLinks.length > 0 && (
            <div
              style={{ display: 'flex', gap: '20px', justifyContent: isMobile ? 'center' : 'flex-start', paddingTop: '24px', borderTop: '1px solid #1e293b' }}
              data-edit-path="layout.footer.social"
              onClick={(e) => clickGuard(e, 'layout.footer.social')}
            >
              {socialLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  style={{ color: muted, fontSize: '13px', textDecoration: 'none', textTransform: 'capitalize' }}
                >
                  {link.platform}
                </a>
              ))}
            </div>
          )}
        </div>
      </footer>

      {/* Custom CSS */}
      {customCss && <style>{customCss}</style>}
    </div>
  );
}
