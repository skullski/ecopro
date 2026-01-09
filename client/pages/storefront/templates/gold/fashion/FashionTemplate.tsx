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

export default function FashionTemplate(props: TemplateProps) {
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

  // Theme colors
  const bg = asString(settings.template_bg_color) || '#050509';
  const text = asString(settings.template_text_color) || '#e5e5e5';
  const muted = asString(settings.template_muted_color) || '#71717a';
  const accent = asString(settings.template_accent_color) || '#f97316';
  const headerBg = asString(settings.template_header_bg) || '#050509';
  const headerText = asString(settings.template_header_text) || '#e5e5e5';
  const cardBg = asString(settings.template_card_bg) || '#050509';
  const footerBg = asString(settings.template_footer_bg) || bg;

  const fontFamily = asString(settings.template_font_family) || 'system-ui, -apple-system, sans-serif';
  const headingWeight = asString(settings.template_heading_font_weight) || '600';
  const cardRadius = resolveInt(settings.template_card_border_radius, 18, 0, 32);

  // Advanced settings
  const spacing = asString(settings.template_spacing) || 'normal';
  const animationSpeed = asString(settings.template_animation_speed) || '0.3s';
  const hoverScale = asString(settings.template_hover_scale) || '1.02';
  const gridColumns = resolveInt(settings.template_grid_columns, 4, 1, 6);
  const customCss = asString(settings.template_custom_css);

  // Category pill settings
  const categoryPillBg = asString(settings.template_category_pill_bg) || 'rgba(255,255,255,0.1)';
  const categoryPillText = asString(settings.template_category_pill_text) || muted;
  const categoryPillActiveBg = asString(settings.template_category_pill_active_bg) || accent;
  const categoryPillActiveText = asString(settings.template_category_pill_active_text) || '#ffffff';
  const categoryPillRadius = resolveInt(settings.template_category_pill_border_radius, 9999, 0, 9999);

  // Hero content
  const heroTitle = asString(settings.template_hero_heading) || 'Modern wardrobe,\nbuilt in cold tones.';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'A curated selection of structured coats, minimal sneakers, and statement pieces. Designed for the modern minimalist.';
  const heroKicker = asString(settings.template_hero_kicker) || 'FASHION · NEW SEASON 2025';
  const ctaText = asString(settings.template_button_text) || 'SHOP COLLECTION';
  const ctaSecondaryText = asString(settings.template_button_secondary_text) || 'VIEW LOOKBOOK';
  const heroBadge = asString(settings.template_hero_badge) || 'NEW ARRIVALS';
  const heroImage = asString(settings.banner_url) || (props.products?.[0]?.images?.[0] || '/placeholder.png');

  const storeName = asString(settings.store_name) || 'WARDROBE';

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

  const sectionTitle = asString(settings.template_featured_title) || 'The Edit';
  const sectionSubtitle = asString(settings.template_featured_subtitle) || 'Curated pieces for the modern wardrobe';
  const addToCartLabel = asString(settings.template_add_to_cart_label) || 'Add to Bag';

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

  // Debug breakpoint detection
  console.log('[FashionTemplate] Breakpoint:', breakpoint, 'isMobile:', isMobile, 'isTablet:', isTablet, 'gridColumns:', gridColumns);

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
          borderBottom: '1px solid #1f2933',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
        data-edit-path="layout.header"
        onClick={(e) => clickGuard(e, 'layout.header')}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              data-edit-path="layout.header.logo"
              onClick={(e) => clickGuard(e, 'layout.header.logo')}
            >
              {settings.store_logo && (
                <img
                  src={settings.store_logo}
                  alt={storeName}
                  style={{ height: '32px', width: '32px', borderRadius: '50%', objectFit: 'cover' }}
                />
              )}
              <span style={{ color: headerText, fontWeight: headingWeight as any, fontSize: '14px', letterSpacing: '0.12em' }}>
                {storeName}
              </span>
            </div>

            {!isMobile && navLinks.length > 0 && (
              <nav
                style={{ display: 'flex', gap: '24px' }}
                data-edit-path="layout.header.nav"
                onClick={(e) => clickGuard(e, 'layout.header.nav')}
              >
                {navLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    style={{
                      color: muted,
                      fontSize: '11px',
                      textDecoration: 'none',
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
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
              <span style={{ color: muted, fontSize: '12px', cursor: 'pointer' }}>Search</span>
              <span style={{ color: text, fontSize: '12px', cursor: 'pointer' }}>Bag (0)</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          minHeight: isMobile ? '60vh' : '70vh',
          position: 'relative',
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        data-edit-path="layout.hero"
        onClick={(e) => clickGuard(e, 'layout.hero')}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(5,5,9,0.92), rgba(5,5,9,0.5))',
          }}
          data-edit-path="layout.hero.image"
          onClick={(e) => clickGuard(e, 'layout.hero.image')}
        />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto', padding: '80px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
          <div style={{ maxWidth: isMobile ? '100%' : '600px' }}>
            {/* Badge */}
            <div
              style={{
                display: 'inline-block',
                backgroundColor: `${accent}22`,
                color: accent,
                padding: '6px 12px',
                borderRadius: '999px',
                fontSize: '10px',
                letterSpacing: '0.12em',
                marginBottom: '16px',
                fontWeight: 600,
              }}
              data-edit-path="layout.hero.badge"
              onClick={(e) => clickGuard(e, 'layout.hero.badge')}
            >
              {heroBadge}
            </div>
            <div
              style={{ color: muted, fontSize: '11px', letterSpacing: '0.16em', marginBottom: '16px' }}
              data-edit-path="layout.hero.kicker"
              onClick={(e) => clickGuard(e, 'layout.hero.kicker')}
            >
              {heroKicker}
            </div>
            <h1
              style={{
                fontSize: isMobile ? '28px' : '42px',
                fontWeight: headingWeight as any,
                lineHeight: 1.15,
                marginBottom: '20px',
                whiteSpace: 'pre-line',
              }}
              data-edit-path="layout.hero.title"
              onClick={(e) => clickGuard(e, 'layout.hero.title')}
            >
              {heroTitle}
            </h1>
            <p
              style={{ color: muted, fontSize: isMobile ? '13px' : '14px', lineHeight: 1.7, marginBottom: '32px', maxWidth: '480px' }}
              data-edit-path="layout.hero.subtitle"
              onClick={(e) => clickGuard(e, 'layout.hero.subtitle')}
            >
              {heroSubtitle}
            </p>
            {/* Dual CTA buttons */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                style={{
                  backgroundColor: accent,
                  color: '#050509',
                  padding: '12px 24px',
                  borderRadius: '999px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  cursor: 'pointer',
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
                  padding: '12px 24px',
                  borderRadius: '999px',
                  border: '1px solid #3f3f46',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  cursor: 'pointer',
                }}
                data-edit-path="layout.hero.cta.1.label"
                onClick={(e) => clickGuard(e, 'layout.hero.cta.1.label')}
              >
                {ctaSecondaryText}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Description (replaces categories) */}
      {showDescription && (
        <section
          style={{ padding: '24px', borderBottom: '1px solid #1f2933' }}
          data-edit-path="layout.categories"
          onClick={(e) => clickGuard(e, 'layout.categories')}
        >
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <p
              style={{
                margin: 0,
                color: descriptionColor,
                fontSize: `${descriptionSize}px`,
                fontStyle: descriptionStyle === 'italic' ? 'italic' : 'normal',
                fontWeight: descriptionWeight,
                lineHeight: 1.65,
              }}
            >
              {descriptionText || (canManage ? 'Add description...' : '')}
            </p>
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section
        style={{ padding: isMobile ? '32px 16px' : '48px 24px' }}
        data-edit-path="layout.featured"
        onClick={(e) => clickGuard(e, 'layout.featured')}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ marginBottom: '32px' }}>
            <h2
              style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: headingWeight as any, marginBottom: '8px' }}
              data-edit-path="layout.featured.title"
              onClick={(e) => clickGuard(e, 'layout.featured.title')}
            >
              {sectionTitle}
            </h2>
            <p
              style={{ color: muted, fontSize: '13px' }}
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
              gap: isMobile ? '12px' : '20px',
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
                  border: '1px solid #1f2933',
                  overflow: 'hidden',
                  transition: animationSpeed,
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
              >
                <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden' }}>
                  <img
                    src={product.images?.[0] || '/placeholder.png'}
                    alt={product.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
                  />
                  {product.category && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        backgroundColor: `${accent}33`,
                        color: accent,
                        padding: '4px 8px',
                        borderRadius: '999px',
                        fontSize: '9px',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {product.category}
                    </span>
                  )}
                </div>
                <div style={{ padding: isMobile ? '10px' : '14px' }}>
                  <h3
                    style={{ fontSize: isMobile ? '12px' : '13px', fontWeight: 500, marginBottom: '4px', color: text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    data-edit-path={`layout.featured.items.${product.id}.title`}
                    onClick={(e) => clickGuard(e, `layout.featured.items.${product.id}.title`)}
                  >
                    {product.title}
                  </h3>
                  <div style={{ color: accent, fontSize: isMobile ? '12px' : '13px', fontWeight: 600, marginBottom: '8px', whiteSpace: 'nowrap' }}>
                    {props.formatPrice?.(product.price) || `${product.price} DZD`}
                  </div>
                  <button
                    style={{
                      width: '100%',
                      backgroundColor: 'transparent',
                      border: '1px solid #3f3f46',
                      color: text,
                      padding: '8px',
                      borderRadius: '999px',
                      fontSize: '10px',
                      fontWeight: 500,
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
          borderTop: '1px solid #1f2933',
          padding: '40px 24px',
          backgroundColor: footerBg,
        }}
        data-edit-path="layout.footer"
        onClick={(e) => clickGuard(e, 'layout.footer')}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'center' : 'flex-start', gap: '24px', marginBottom: '24px' }}>
            <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
              <div style={{ color: text, fontWeight: headingWeight as any, fontSize: '16px', letterSpacing: '0.12em', marginBottom: '8px' }}>{storeName}</div>
              <div
                style={{ color: footerText, fontSize: '12px' }}
                data-edit-path="layout.footer.copyright"
                onClick={(e) => clickGuard(e, 'layout.footer.copyright')}
              >
                {copyright}
              </div>
            </div>
            {footerLinks.length > 0 && (
              <div
                style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-start' }}
                data-edit-path="layout.footer.links"
                onClick={(e) => clickGuard(e, 'layout.footer.links')}
              >
                {footerLinks.map((link, i) => (
                  <a key={i} href={link.url} style={{ color: muted, fontSize: '12px', textDecoration: 'none' }}>
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
          {socialLinks.length > 0 && (
            <div
              style={{ display: 'flex', gap: '16px', justifyContent: isMobile ? 'center' : 'flex-start', paddingTop: '16px', borderTop: '1px solid #1f2933' }}
              data-edit-path="layout.footer.social"
              onClick={(e) => clickGuard(e, 'layout.footer.social')}
            >
              {socialLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  style={{ color: muted, fontSize: '12px', textDecoration: 'none', textTransform: 'capitalize' }}
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
