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

export default function PerfumeTemplate(props: TemplateProps) {
  const settings = props.settings || ({} as any);
  const canManage = props.canManage !== false;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');

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

  // Theme colors - Dark luxury perfume theme
  const bg = asString(settings.template_bg_color) || '#000000';
  const text = asString(settings.template_text_color) || '#ffffff';
  const muted = asString(settings.template_muted_color) || '#a1a1aa';
  const accent = asString(settings.template_accent_color) || '#f59e0b';
  const headerBg = asString(settings.template_header_bg) || 'rgba(0,0,0,0.8)';
  const headerText = asString(settings.template_header_text) || '#ffffff';
  const cardBg = asString(settings.template_card_bg) || '#18181b';
  const footerBg = asString(settings.template_footer_bg) || bg;

  const fontFamily = asString(settings.template_font_family) || '"Cormorant Garamond", Georgia, serif';
  const headingWeight = asString(settings.template_heading_font_weight) || '400';
  const cardRadius = resolveInt(settings.template_card_border_radius, 4, 0, 32);

  // Hero content
  const heroTitle = asString(settings.template_hero_heading) || 'The Art of\nFragrance';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Discover our curated collection of rare and exquisite perfumes. Each scent tells a story.';
  const heroKicker = asString(settings.template_hero_kicker) || 'LUXURY FRAGRANCES';
  const ctaText = asString(settings.template_button_text) || 'EXPLORE COLLECTION';
  const ctaSecondaryText = asString(settings.template_button_secondary_text) || 'OUR STORY';
  const heroBadge = asString(settings.template_hero_badge) || '✦ EXCLUSIVE';
  const heroImage = asString(settings.banner_url) || (props.products?.[0]?.images?.[0] || '/placeholder.png');

  const storeName = asString(settings.store_name) || 'ESSENCE';

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

  const sectionTitle = asString(settings.template_featured_title) || 'Signature Collection';
  const sectionSubtitle = asString(settings.template_featured_subtitle) || 'Timeless scents for the discerning';
  const addToCartLabel = asString(settings.template_add_to_cart_label) || 'Add to Bag';

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
          backdropFilter: 'blur(12px)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
        data-edit-path="layout.header"
        onClick={(e) => clickGuard(e, 'layout.header')}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
              data-edit-path="layout.header.logo"
              onClick={(e) => clickGuard(e, 'layout.header.logo')}
            >
              {settings.store_logo && (
                <img
                  src={settings.store_logo}
                  alt={storeName}
                  style={{ height: '40px', width: '40px', objectFit: 'contain' }}
                />
              )}
              <span style={{ color: headerText, fontWeight: 300, fontSize: '22px', letterSpacing: '0.2em', fontFamily }}>
                {storeName}
              </span>
            </div>

            {!isMobile && navLinks.length > 0 && (
              <nav
                style={{ display: 'flex', gap: '40px' }}
                data-edit-path="layout.header.nav"
                onClick={(e) => clickGuard(e, 'layout.header.nav')}
              >
                {navLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    style={{
                      color: muted,
                      fontSize: '12px',
                      textDecoration: 'none',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            )}

            <div
              style={{ display: 'flex', alignItems: 'center', gap: '20px' }}
              data-edit-path="layout.header.actions"
              onClick={(e) => clickGuard(e, 'layout.header.actions')}
            >
              <span style={{ color: muted, fontSize: '12px', letterSpacing: '0.1em', cursor: 'pointer' }}>SEARCH</span>
              <span style={{ color: accent, fontSize: '12px', letterSpacing: '0.1em', cursor: 'pointer' }}>BAG (0)</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Full viewport */}
      <section
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
        data-edit-path="layout.hero"
        onClick={(e) => clickGuard(e, 'layout.hero')}
      >
        {/* Background Image with gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 100%), url("${heroImage}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          data-edit-path="layout.hero.image"
          onClick={(e) => clickGuard(e, 'layout.hero.image')}
        />
        
        <div style={{ position: 'relative', maxWidth: '1400px', margin: '0 auto', padding: isMobile ? '100px 24px 60px' : '0 48px', width: '100%' }}>
          <div style={{ maxWidth: '600px' }}>
            {/* Badge */}
            <div
              style={{
                display: 'inline-block',
                color: accent,
                padding: '0',
                fontSize: '12px',
                letterSpacing: '0.2em',
                marginBottom: '20px',
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
                letterSpacing: '0.3em',
                marginBottom: '24px',
                borderBottom: `1px solid ${accent}`,
                paddingBottom: '8px',
                display: 'inline-block',
              }}
              data-edit-path="layout.hero.kicker"
              onClick={(e) => clickGuard(e, 'layout.hero.kicker')}
            >
              {heroKicker}
            </div>
            <h1
              style={{
                fontSize: isMobile ? '40px' : '64px',
                fontWeight: headingWeight as any,
                lineHeight: 1.1,
                marginBottom: '28px',
                whiteSpace: 'pre-line',
                fontStyle: 'italic',
                fontFamily,
              }}
              data-edit-path="layout.hero.title"
              onClick={(e) => clickGuard(e, 'layout.hero.title')}
            >
              {heroTitle}
            </h1>
            <p
              style={{ color: muted, fontSize: '16px', lineHeight: 1.8, marginBottom: '40px', maxWidth: '480px' }}
              data-edit-path="layout.hero.subtitle"
              onClick={(e) => clickGuard(e, 'layout.hero.subtitle')}
            >
              {heroSubtitle}
            </p>
            {/* Dual CTA buttons */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button
                style={{
                  backgroundColor: 'transparent',
                  color: text,
                  padding: '16px 40px',
                  borderRadius: '0',
                  border: `1px solid ${accent}`,
                  fontSize: '11px',
                  fontWeight: 400,
                  letterSpacing: '0.2em',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                data-edit-path="layout.hero.cta.0.label"
                onClick={(e) => clickGuard(e, 'layout.hero.cta.0.label')}
              >
                {ctaText}
              </button>
              <button
                style={{
                  backgroundColor: 'transparent',
                  color: muted,
                  padding: '16px 40px',
                  borderRadius: '0',
                  border: `1px solid rgba(255,255,255,0.2)`,
                  fontSize: '11px',
                  fontWeight: 400,
                  letterSpacing: '0.2em',
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

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', textAlign: 'center' }}>
          <div style={{ color: muted, fontSize: '10px', letterSpacing: '0.15em', marginBottom: '12px' }}>SCROLL</div>
          <div style={{ width: '1px', height: '40px', backgroundColor: muted, margin: '0 auto' }}></div>
        </div>
      </section>

      {/* Products Grid */}
      <section
        style={{ padding: isMobile ? '60px 20px' : '100px 48px', backgroundColor: bg }}
        data-edit-path="layout.featured"
        onClick={(e) => clickGuard(e, 'layout.featured')}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ marginBottom: '60px', textAlign: 'center' }}>
            <h2
              style={{ fontSize: isMobile ? '32px' : '44px', fontWeight: headingWeight as any, marginBottom: '16px', fontStyle: 'italic', fontFamily }}
              data-edit-path="layout.featured.title"
              onClick={(e) => clickGuard(e, 'layout.featured.title')}
            >
              {sectionTitle}
            </h2>
            <p
              style={{ color: muted, fontSize: '14px', letterSpacing: '0.1em' }}
              data-edit-path="layout.featured.subtitle"
              onClick={(e) => clickGuard(e, 'layout.featured.subtitle')}
            >
              {sectionSubtitle}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? 'repeat(3, 1fr)' : 'repeat(5, 1fr)',
              gap: isMobile ? '16px' : '24px',
            }}
            data-edit-path="layout.grid"
            onClick={(e) => clickGuard(e, 'layout.grid')}
          >
            {products.slice(0, 8).map((product) => (
              <div
                key={product.id}
                style={{
                  backgroundColor: cardBg,
                  borderRadius: `${cardRadius}px`,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.3s ease',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
                data-edit-path={`layout.featured.items.${product.id}`}
                onClick={(e) => clickGuard(e, `layout.featured.items.${product.id}`)}
              >
                <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden' }}>
                  <img
                    src={product.images?.[0] || '/placeholder.png'}
                    alt={product.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png'; }}
                  />
                  {product.is_featured && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        backgroundColor: accent,
                        color: '#000',
                        padding: '4px 10px',
                        fontSize: '9px',
                        fontWeight: 600,
                        letterSpacing: '0.1em',
                      }}
                    >
                      EXCLUSIVE
                    </span>
                  )}
                </div>
                <div style={{ padding: isMobile ? '16px' : '20px', textAlign: 'center' }}>
                  <h3
                    style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: 400, marginBottom: '8px', color: text, fontStyle: 'italic', fontFamily }}
                    data-edit-path={`layout.featured.items.${product.id}.title`}
                    onClick={(e) => clickGuard(e, `layout.featured.items.${product.id}.title`)}
                  >
                    {product.title}
                  </h3>
                  {product.category && (
                    <p style={{ fontSize: '10px', color: muted, marginBottom: '12px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>{product.category}</p>
                  )}
                  <div style={{ color: accent, fontSize: isMobile ? '15px' : '17px', fontWeight: 400, marginBottom: '16px' }}>
                    {props.formatPrice?.(product.price) || `${product.price} DZD`}
                  </div>
                  <button
                    style={{
                      width: '100%',
                      backgroundColor: 'transparent',
                      border: `1px solid ${accent}`,
                      color: accent,
                      padding: '10px',
                      fontSize: '10px',
                      fontWeight: 400,
                      letterSpacing: '0.15em',
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
          borderTop: '1px solid rgba(255,255,255,0.1)',
          padding: '60px 24px',
          backgroundColor: footerBg,
        }}
        data-edit-path="layout.footer"
        onClick={(e) => clickGuard(e, 'layout.footer')}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ color: text, fontWeight: 300, fontSize: '24px', letterSpacing: '0.2em', fontStyle: 'italic', fontFamily }}>{storeName}</div>
            {footerLinks.length > 0 && (
              <div
                style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', justifyContent: 'center' }}
                data-edit-path="layout.footer.links"
                onClick={(e) => clickGuard(e, 'layout.footer.links')}
              >
                {footerLinks.map((link, i) => (
                  <a key={i} href={link.url} style={{ color: muted, fontSize: '11px', textDecoration: 'none', letterSpacing: '0.1em' }}>
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
          {socialLinks.length > 0 && (
            <div
              style={{ display: 'flex', gap: '28px', justifyContent: 'center', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.1)', marginBottom: '24px' }}
              data-edit-path="layout.footer.social"
              onClick={(e) => clickGuard(e, 'layout.footer.social')}
            >
              {socialLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  style={{ color: muted, fontSize: '11px', textDecoration: 'none', letterSpacing: '0.15em', textTransform: 'uppercase' }}
                >
                  {link.platform}
                </a>
              ))}
            </div>
          )}
          <div
            style={{ color: footerText, fontSize: '11px', letterSpacing: '0.1em', textAlign: 'center' }}
            data-edit-path="layout.footer.copyright"
            onClick={(e) => clickGuard(e, 'layout.footer.copyright')}
          >
            {copyright}
          </div>
        </div>
      </footer>
    </div>
  );
}
