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
  const n = Number(String(value ?? '').trim());
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

export default function CafeTemplate(props: TemplateProps) {
  const settings = props.settings || ({} as any);
  const canManage = props.canManage !== false;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    if (!containerRef.current) return;
    if (typeof ResizeObserver === 'undefined') return;

    const el = containerRef.current;
    const ro = new ResizeObserver((entries) => {
      const w = Math.round(entries[0]?.contentRect?.width || el.getBoundingClientRect().width || 0);
      const bp: Breakpoint = w >= 1024 ? 'desktop' : w >= 768 ? 'tablet' : 'mobile';
      setBreakpoint(bp);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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

  // Theme colors - Warm bakery/cafe theme
  const bg = asString(settings.template_bg_color) || '#fef7ed';
  const text = asString(settings.template_text_color) || '#422006';
  const muted = asString(settings.template_muted_color) || '#92400e';
  const accent = asString(settings.template_accent_color) || '#d97706';
  const headerBg = asString(settings.template_header_bg) || '#fffbf5';
  const headerText = asString(settings.template_header_text) || '#422006';
  const cardBg = asString(settings.template_card_bg) || '#ffffff';
  const footerBg = asString(settings.template_footer_bg) || '#fffbf5';

  const fontFamily = asString(settings.template_font_family) || '"Playfair Display", Georgia, serif';
  const headingWeight = asString(settings.template_heading_font_weight) || '700';
  const cardRadius = resolveInt(settings.template_card_border_radius, 16, 0, 32);

  // Advanced settings
  const spacing = asString(settings.template_spacing) || 'normal';
  const animationSpeed = asString(settings.template_animation_speed) || '0.3s';
  const hoverScale = asString(settings.template_hover_scale) || '1.02';
  const gridColumns = resolveInt(settings.template_grid_columns, 3, 1, 6);
  const customCss = asString(settings.template_custom_css);

  // Category pill settings
  const categoryPillBg = asString(settings.template_category_pill_bg) || 'rgba(217,119,6,0.1)';
  const categoryPillText = asString(settings.template_category_pill_text) || muted;
  const categoryPillActiveBg = asString(settings.template_category_pill_active_bg) || accent;
  const categoryPillActiveText = asString(settings.template_category_pill_active_text) || '#ffffff';
  const categoryPillRadius = resolveInt(settings.template_category_pill_border_radius, 9999, 0, 9999);

  // Hero content
  const heroTitle = asString(settings.template_hero_heading) || 'Baked with Love,\nServed with Joy';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Artisan pastries, freshly brewed coffee, and homemade treats. Visit us for a taste of comfort.';
  const heroKicker = asString(settings.template_hero_kicker) || 'BAKERY · COFFEE · TREATS';
  const ctaText = asString(settings.template_button_text) || 'SEE MENU';
  const ctaSecondaryText = asString(settings.template_button_secondary_text) || 'VISIT US';
  const heroBadge = asString(settings.template_hero_badge) || '☕ FRESH DAILY';
  const heroImage = asString(settings.banner_url) || (props.products?.[0]?.images?.[0] || '/placeholder.png');

  const storeName = asString(settings.store_name) || 'ARTISAN CAFE';

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

  const sectionTitle = asString(settings.template_featured_title) || 'Today\'s Specials';
  const sectionSubtitle = asString(settings.template_featured_subtitle) || 'Fresh from our ovens this morning';
  const addToCartLabel = asString(settings.template_add_to_cart_label) || 'Add to Order';

  const copyright = asString(settings.template_copyright) || `© ${new Date().getFullYear()} ${storeName}`;
  const footerText = asString(settings.template_footer_text) || muted;

  const socialLinks = safeParseJsonArray<SocialLink>(settings.template_social_links)
    .map((l) => ({ platform: asString((l as any)?.platform), url: normalizeUrl(asString((l as any)?.url)) }))
    .filter((l) => l.platform && l.url);

  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: '100vh',
        backgroundColor: bg,
        color: text,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
      data-edit-path="__root"
      onClick={() => onSelect('__root')}
    >
      {/* Header */}
      <header
        style={{
          backgroundColor: headerBg,
          borderBottom: '1px solid #fed7aa',
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
              style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
              data-edit-path="layout.header.logo"
              onClick={(e) => clickGuard(e, 'layout.header.logo')}
            >
              {settings.store_logo && (
                <img
                  src={settings.store_logo}
                  alt={storeName}
                  style={{ height: '44px', width: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fed7aa' }}
                />
              )}
              <span style={{ color: headerText, fontWeight: headingWeight as any, fontSize: '18px', fontFamily }}>
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
                      fontSize: '14px',
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
              <span style={{ color: muted, fontSize: '14px' }}>☕</span>
              <button
                style={{
                  backgroundColor: accent,
                  color: '#fff',
                  padding: '8px 18px',
                  borderRadius: '999px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Order
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          padding: isMobile ? '40px 20px' : '80px 24px',
          background: `linear-gradient(135deg, ${bg} 0%, #ffedd5 100%)`,
        }}
        data-edit-path="layout.hero"
        onClick={(e) => clickGuard(e, 'layout.hero')}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', gap: '48px' }}>
          <div style={{ flex: 1 }}>
            {/* Badge */}
            <div
              style={{
                display: 'inline-block',
                backgroundColor: '#fef3c7',
                color: accent,
                padding: '8px 16px',
                borderRadius: '999px',
                fontSize: '12px',
                marginBottom: '20px',
                fontWeight: 600,
              }}
              data-edit-path="layout.hero.badge"
              onClick={(e) => clickGuard(e, 'layout.hero.badge')}
            >
              {heroBadge}
            </div>
            <div
              style={{
                color: accent,
                fontSize: '11px',
                letterSpacing: '0.12em',
                marginBottom: '16px',
              }}
              data-edit-path="layout.hero.kicker"
              onClick={(e) => clickGuard(e, 'layout.hero.kicker')}
            >
              {heroKicker}
            </div>
            <h1
              style={{
                fontSize: isMobile ? '32px' : '48px',
                fontWeight: headingWeight as any,
                lineHeight: 1.15,
                marginBottom: '24px',
                whiteSpace: 'pre-line',
                fontFamily,
              }}
              data-edit-path="layout.hero.title"
              onClick={(e) => clickGuard(e, 'layout.hero.title')}
            >
              {heroTitle}
            </h1>
            <p
              style={{ color: muted, fontSize: isMobile ? '15px' : '16px', lineHeight: 1.7, marginBottom: '32px', maxWidth: '480px' }}
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
                  color: '#fff',
                  padding: '14px 28px',
                  borderRadius: '999px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(217, 119, 6, 0.3)',
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
                  borderRadius: '999px',
                  border: '2px solid #fed7aa',
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
              alt="Featured"
              style={{
                maxWidth: isMobile ? '300px' : '420px',
                maxHeight: '420px',
                objectFit: 'cover',
                borderRadius: '24px',
                boxShadow: '0 24px 48px rgba(146, 64, 14, 0.2)',
                border: '4px solid #fff',
              }}
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
            />
          </div>
        </div>
      </section>

      {/* Category Pills */}
      <section
        style={{ padding: '20px 24px', backgroundColor: cardBg, borderBottom: '1px solid #fed7aa' }}
        data-edit-path="layout.categories"
        onClick={(e) => clickGuard(e, 'layout.categories')}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={(e) => { e.stopPropagation(); setCategoryFilter(''); }}
            style={{
              borderRadius: `${categoryPillRadius}px`,
              padding: '8px 18px',
              fontSize: '13px',
              border: '2px solid #fed7aa',
              backgroundColor: categoryFilter === '' ? categoryPillActiveBg : categoryPillBg,
              color: categoryFilter === '' ? categoryPillActiveText : categoryPillText,
              cursor: 'pointer',
              fontWeight: 500,
              transition: `all ${animationSpeed} ease`,
            }}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={(e) => { e.stopPropagation(); setCategoryFilter(cat); }}
              style={{
                borderRadius: `${categoryPillRadius}px`,
                padding: '8px 18px',
                fontSize: '13px',
                border: '2px solid #fed7aa',
                backgroundColor: categoryFilter === cat ? categoryPillActiveBg : categoryPillBg,
                color: categoryFilter === cat ? categoryPillActiveText : categoryPillText,
                cursor: 'pointer',
                fontWeight: 500,
                transition: `all ${animationSpeed} ease`,
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Products Grid */}
      <section
        style={{ padding: isMobile ? '32px 16px' : '64px 24px' }}
        data-edit-path="layout.featured"
        onClick={(e) => clickGuard(e, 'layout.featured')}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ marginBottom: '40px', textAlign: 'center' }}>
            <h2
              style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: headingWeight as any, marginBottom: '12px', fontFamily }}
              data-edit-path="layout.featured.title"
              onClick={(e) => clickGuard(e, 'layout.featured.title')}
            >
              {sectionTitle}
            </h2>
            <p
              style={{ color: muted, fontSize: '15px' }}
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
              gap: isMobile ? '16px' : '24px',
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
                  border: '1px solid #fed7aa',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                data-edit-path={`layout.featured.items.${product.id}`}
                onClick={(e) => clickGuard(e, `layout.featured.items.${product.id}`)}
              >
                <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden' }}>
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
                        top: '10px',
                        left: '10px',
                        backgroundColor: '#fef3c7',
                        color: accent,
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '10px',
                        fontWeight: 600,
                      }}
                    >
                      ⭐ Popular
                    </span>
                  )}
                </div>
                <div style={{ padding: isMobile ? '12px' : '16px' }}>
                  <h3
                    style={{ fontSize: isMobile ? '14px' : '15px', fontWeight: 600, marginBottom: '6px', color: text }}
                    data-edit-path={`layout.featured.items.${product.id}.title`}
                    onClick={(e) => clickGuard(e, `layout.featured.items.${product.id}.title`)}
                  >
                    {product.title}
                  </h3>
                  {product.category && (
                    <p style={{ fontSize: '12px', color: muted, marginBottom: '8px' }}>{product.category}</p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ color: accent, fontSize: isMobile ? '15px' : '17px', fontWeight: 700 }}>
                      {props.formatPrice?.(product.price) || `${product.price} DZD`}
                    </span>
                  </div>
                  <button
                    style={{
                      width: '100%',
                      backgroundColor: accent,
                      color: '#fff',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
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
          borderTop: '1px solid #fed7aa',
          padding: '48px 24px',
          backgroundColor: footerBg,
        }}
        data-edit-path="layout.footer"
        onClick={(e) => clickGuard(e, 'layout.footer')}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'center' : 'flex-start', gap: '32px', marginBottom: '32px', textAlign: isMobile ? 'center' : 'left' }}>
            <div>
              <div style={{ color: text, fontWeight: 700, fontSize: '20px', marginBottom: '8px', fontFamily }}>{storeName}</div>
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
              style={{ display: 'flex', gap: '20px', justifyContent: isMobile ? 'center' : 'flex-start', paddingTop: '24px', borderTop: '1px solid #fed7aa' }}
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
