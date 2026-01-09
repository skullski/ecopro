import React, { useEffect, useMemo, useRef, useState } from 'react';
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

export default function ProTemplate(props: TemplateProps) {
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

  const [categoryFilter, setCategoryFilter] = useState<string>('');

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
  const isMobile = breakpoint === 'mobile';
  const isDesktop = breakpoint === 'desktop';

  const descriptionText = (asString(settings.template_description_text) || asString(settings.store_description)).trim();
  const descriptionColor = asString(settings.template_description_color) || asString(settings.template_muted_color) || '#9ca3af';
  const descriptionSize = resolveInt(settings.template_description_size, 14, 10, 32);
  const descriptionStyle = asString(settings.template_description_style) || 'normal';
  const descriptionWeight = resolveInt(settings.template_description_weight, 400, 100, 900);
  const showDescription = canManage || Boolean(descriptionText);

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

  // Theme tokens (use existing editor keys)
  const bg = asString(settings.template_bg_color) || '#0b1220';
  const text = asString(settings.template_text_color) || '#e5e7eb';
  const muted = asString(settings.template_muted_color) || '#9ca3af';
  const accent = asString(settings.template_accent_color) || '#2563eb';
  const border = asString(settings.template_border_color) || 'rgba(148,163,184,0.25)';
  const cardBg = asString(settings.template_card_bg) || 'rgba(255,255,255,0.04)';

  const headerBg = asString(settings.template_header_bg) || 'rgba(2,6,23,0.7)';
  const headerText = asString(settings.template_header_text) || '#e5e7eb';

  const fontFamily = asString(settings.template_font_family) || 'system-ui, -apple-system, sans-serif';
  const fontWeight = asString(settings.template_font_weight) || '400';
  const headingWeight = asString(settings.template_heading_font_weight) || '700';

  const radius = resolveInt(settings.template_border_radius, 12, 0, 24);
  const cardRadius = resolveInt(settings.template_card_border_radius, 14, 0, 32);
  const buttonRadius = resolveInt(settings.template_button_border_radius, 9999, 0, 50);
  const spacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 56, 24, 96);
  const animationSpeed = resolveInt(settings.template_animation_speed, 200, 100, 500);
  const hoverScale = Number(settings.template_hover_scale || '1.02') || 1.02;

  const storeName = asString(settings.store_name) || 'PRO STORE';

  const heroKicker = asString(settings.template_hero_kicker) || 'TRUSTED • FAST DELIVERY • QUALITY GUARANTEED';
  const heroTitle = asString(settings.template_hero_heading) || 'Upgrade your store experience.';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'A professional layout built for conversion, clarity, and confidence.';
  const heroTitleColor = asString(settings.template_hero_title_color) || text;
  const heroTitleSize = resolveInt(settings.template_hero_title_size, isMobile ? 34 : 44, 18, 72);
  const heroSubtitleColor = asString(settings.template_hero_subtitle_color) || muted;
  const heroSubtitleSize = resolveInt(settings.template_hero_subtitle_size, 14, 10, 22);
  const heroKickerColor = asString(settings.template_hero_kicker_color) || muted;

  const ctaText = asString(settings.template_button_text) || 'Shop Products';
  const cta2Text = asString(settings.template_button2_text) || 'View Categories';
  const cta2Border = asString(settings.template_button2_border) || border;

  const bannerUrl = asString(settings.banner_url) || '';

  const navLinks = safeParseJsonArray<NavLink>(settings.template_nav_links)
    .map((l) => ({ label: asString((l as any)?.label), url: normalizeUrl(asString((l as any)?.url)) }))
    .filter((l) => l.label && l.url);

  const socialLinks = safeParseJsonArray<SocialLink>(settings.template_social_links)
    .map((l) => ({ platform: asString((l as any)?.platform), url: asString((l as any)?.url) }))
    .filter((l) => l.platform && l.url);

  const allProducts = useMemo(() => {
    const list = (Array.isArray(props.filtered) && props.filtered.length ? props.filtered : props.products) || [];
    return list;
  }, [props.filtered, props.products]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    allProducts.forEach((p) => {
      if (p.category) set.add(String(p.category));
    });
    return Array.from(set);
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    if (!categoryFilter) return allProducts;
    return allProducts.filter((p) => String(p.category || '') === categoryFilter);
  }, [allProducts, categoryFilter]);

  const featured = useMemo(() => {
    const byFlag = allProducts.filter((p) => Boolean((p as any).is_featured));
    const pick = byFlag.length ? byFlag : allProducts;
    return pick.slice(0, 6);
  }, [allProducts]);

  const gridTitle = asString(settings.template_grid_title) || 'Browse Products';
  const gridColumns = resolveInt(settings.template_grid_columns, 4, 2, 6);
  const gridGap = resolveInt(settings.template_grid_gap, 20, 8, 48);

  const sectionTitleColor = asString(settings.template_section_title_color) || text;
  const sectionTitleSize = resolveInt(settings.template_section_title_size, 18, 14, 28);
  const sectionSubtitleColor = asString(settings.template_section_subtitle_color) || muted;

  const featuredTitle = asString(settings.template_featured_title) || 'Featured';
  const featuredSubtitle = asString(settings.template_featured_subtitle) || 'Highlighted picks from your catalog';
  const addLabel = asString(settings.template_add_to_cart_label) || 'View';

  const productTitleColor = asString(settings.template_product_title_color) || text;
  const productPriceColor = asString(settings.template_product_price_color) || text;

  const footerBg = asString(settings.template_footer_bg) || 'rgba(2,6,23,0.85)';
  const footerText = asString(settings.template_footer_text) || muted;
  const footerLink = asString(settings.template_footer_link_color) || '#cbd5e1';
  const copyright = asString(settings.template_copyright) || `© ${new Date().getFullYear()} ${storeName}`;

  const customCss = asString(settings.template_custom_css);

  const contentMax = 1180;

  const cols = isMobile ? 2 : isDesktop ? gridColumns : Math.min(gridColumns, 3);

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: '100vh',
        backgroundColor: bg,
        color: text,
        fontFamily,
        fontWeight: fontWeight as any,
      }}
      data-edit-path="__root"
      onClick={() => onSelect('__root')}
    >
      {customCss ? <style>{customCss}</style> : null}

      {/* Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(10px)',
          backgroundColor: headerBg,
          borderBottom: `1px solid ${border}`,
        }}
        data-edit-path="layout.header"
        onClick={(e) => clickGuard(e, 'layout.header')}
      >
        <div style={{ maxWidth: contentMax, margin: '0 auto', padding: `0 ${spacing}px` }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'auto 1fr auto',
              gap: isMobile ? 12 : 16,
              alignItems: 'center',
              height: isMobile ? 64 : 72,
            }}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: canManage ? 'default' : 'pointer' }}
              data-edit-path="layout.header.logo"
              onClick={(e) => clickGuard(e, 'layout.header.logo')}
            >
              {settings.store_logo ? (
                <img
                  src={asString(settings.store_logo)}
                  alt={storeName}
                  style={{ width: 32, height: 32, borderRadius: 10, objectFit: 'contain', border: `1px solid ${border}` }}
                />
              ) : (
                <div style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', border: `1px solid ${border}` }} />
              )}
              <div style={{ lineHeight: 1.1 }}>
                <div style={{ color: headerText, fontWeight: headingWeight as any, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: 12 }}>
                  {storeName}
                </div>
                <div style={{ color: muted, fontSize: 12 }}>Storefront</div>
              </div>
            </div>

            {!isMobile && (
              <nav
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, color: footerLink }}
                data-edit-path="layout.header.nav"
                onClick={(e) => clickGuard(e, 'layout.header.nav')}
              >
                {(navLinks.length ? navLinks : [{ label: 'Shop', url: '/products' }, { label: 'About', url: '/about' }, { label: 'Contact', url: '/contact' }]).map((l, i) => (
                  <a
                    key={i}
                    href={l.url}
                    style={{
                      color: footerLink,
                      textDecoration: 'none',
                      fontSize: 13,
                      padding: '10px 6px',
                      borderRadius: 10,
                      transition: `background ${animationSpeed}ms ease`,
                    }}
                  >
                    {l.label}
                  </a>
                ))}
              </nav>
            )}

            <div style={{ display: 'flex', justifyContent: isMobile ? 'flex-start' : 'flex-end', gap: 10 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  borderRadius: radius,
                  border: `1px solid ${border}`,
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  color: muted,
                  width: isMobile ? '100%' : 240,
                }}
              >
                <span style={{ fontSize: 12 }}>Search</span>
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 12 }}>⌘K</span>
              </div>
              {!isMobile && (
                <div style={{
                  padding: '10px 12px',
                  borderRadius: radius,
                  border: `1px solid ${border}`,
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  color: muted,
                  fontSize: 12,
                }}>Cart (0)</div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section
        style={{
          padding: `${sectionSpacing}px ${spacing}px`,
          borderBottom: `1px solid ${border}`,
          background: `radial-gradient(1000px 500px at 20% 0%, rgba(37,99,235,0.22) 0%, rgba(37,99,235,0) 60%)`,
        }}
        data-edit-path="layout.hero"
        onClick={(e) => clickGuard(e, 'layout.hero')}
      >
        <div style={{ maxWidth: contentMax, margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isDesktop ? '1.05fr 0.95fr' : '1fr',
              gap: isDesktop ? 28 : 18,
              alignItems: 'stretch',
            }}
          >
            <div style={{
              padding: isDesktop ? 8 : 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  borderRadius: 9999,
                  border: `1px solid ${border}`,
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  width: 'fit-content',
                  color: heroKickerColor,
                  fontSize: 11,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  marginBottom: 14,
                }}
                data-edit-path="layout.hero.kicker"
                onClick={(e) => clickGuard(e, 'layout.hero.kicker')}
              >
                <span style={{ width: 8, height: 8, borderRadius: 9999, backgroundColor: accent }} />
                <span>{heroKicker}</span>
              </div>

              <h1
                style={{
                  fontSize: heroTitleSize,
                  lineHeight: 1.08,
                  margin: 0,
                  color: heroTitleColor,
                  fontWeight: headingWeight as any,
                  letterSpacing: '-0.02em',
                }}
                data-edit-path="layout.hero.title"
                onClick={(e) => clickGuard(e, 'layout.hero.title')}
              >
                {heroTitle}
              </h1>

              <p
                style={{
                  marginTop: 12,
                  marginBottom: 0,
                  color: heroSubtitleColor,
                  fontSize: heroSubtitleSize,
                  lineHeight: 1.7,
                  maxWidth: 560,
                }}
                data-edit-path="layout.hero.subtitle"
                onClick={(e) => clickGuard(e, 'layout.hero.subtitle')}
              >
                {heroSubtitle}
              </p>

              <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  style={{
                    backgroundColor: accent,
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '12px 18px',
                    borderRadius: buttonRadius,
                    fontWeight: 650,
                    cursor: 'pointer',
                    transition: `transform ${animationSpeed}ms ease`,
                  }}
                  data-edit-path="layout.hero.cta"
                  onClick={(e) => clickGuard(e, 'layout.hero.cta')}
                >
                  {ctaText}
                </button>
                <button
                  type="button"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    color: text,
                    border: `1px solid ${cta2Border}`,
                    padding: '12px 18px',
                    borderRadius: buttonRadius,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: `transform ${animationSpeed}ms ease`,
                  }}
                  data-edit-path="layout.hero.cta"
                  onClick={(e) => clickGuard(e, 'layout.hero.cta')}
                >
                  {cta2Text}
                </button>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap', color: muted, fontSize: 12 }}>
                <span style={{ border: `1px solid ${border}`, padding: '6px 10px', borderRadius: 9999 }}>Secure checkout</span>
                <span style={{ border: `1px solid ${border}`, padding: '6px 10px', borderRadius: 9999 }}>Fast shipping</span>
                <span style={{ border: `1px solid ${border}`, padding: '6px 10px', borderRadius: 9999 }}>Support 24/7</span>
              </div>
            </div>

            <div
              style={{
                borderRadius: Math.max(radius, 14),
                border: `1px solid ${border}`,
                overflow: 'hidden',
                backgroundColor: cardBg,
                minHeight: isDesktop ? 360 : 220,
                position: 'relative',
              }}
              data-edit-path="layout.hero.image"
              onClick={(e) => clickGuard(e, 'layout.hero.image')}
            >
              {bannerUrl ? (
                <img
                  src={bannerUrl}
                  alt="Hero"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div style={{
                  height: '100%',
                  display: 'grid',
                  placeItems: 'center',
                  padding: 20,
                  color: muted,
                }}>
                  <div style={{ textAlign: 'center', maxWidth: 360 }}>
                    <div style={{ fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Hero Image</div>
                    <div style={{ marginTop: 8, fontSize: 13 }}>Upload a banner to complete the professional look.</div>
                  </div>
                </div>
              )}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, rgba(2,6,23,0) 0%, rgba(2,6,23,0.35) 100%)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: `${sectionSpacing}px ${spacing}px` }}>
        <div style={{ maxWidth: contentMax, margin: '0 auto', display: 'grid', gridTemplateColumns: isDesktop && showDescription ? '260px 1fr' : '1fr', gap: isDesktop ? 24 : 18 }}>
          {/* Description */}
          {showDescription ? (
          <aside
            style={{
              border: `1px solid ${border}`,
              borderRadius: radius,
              backgroundColor: cardBg,
              padding: 14,
              height: 'fit-content',
            }}
            data-edit-path="layout.categories"
            onClick={(e) => clickGuard(e, 'layout.categories')}
          >
            <div style={{ fontSize: 12, color: muted, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Description</div>
            <p
              style={{
                marginTop: 10,
                marginBottom: 0,
                color: descriptionColor,
                fontSize: `${descriptionSize}px`,
                fontStyle: descriptionStyle === 'italic' ? 'italic' : 'normal',
                fontWeight: descriptionWeight,
                lineHeight: 1.7,
              }}
            >
              {descriptionText || (canManage ? 'Add description...' : '')}
            </p>
          </aside>
          ) : null}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {/* Featured */}
            <div
              style={{
                border: `1px solid ${border}`,
                borderRadius: radius,
                backgroundColor: cardBg,
                padding: 16,
              }}
              data-edit-path="layout.featured"
              onClick={(e) => clickGuard(e, 'layout.featured')}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div
                    style={{
                      fontSize: sectionTitleSize,
                      fontWeight: headingWeight as any,
                      color: sectionTitleColor,
                      marginBottom: 6,
                    }}
                    data-edit-path="layout.featured.title"
                    onClick={(e) => clickGuard(e, 'layout.featured.title')}
                  >
                    {featuredTitle}
                  </div>
                  <div
                    style={{ color: sectionSubtitleColor, fontSize: 13, maxWidth: 620 }}
                    data-edit-path="layout.featured.subtitle"
                    onClick={(e) => clickGuard(e, 'layout.featured.subtitle')}
                  >
                    {featuredSubtitle}
                  </div>
                </div>
                <div style={{ color: muted, fontSize: 12 }}>Showing {filteredProducts.length} items</div>
              </div>

              <div
                style={{
                  marginTop: 14,
                  display: 'flex',
                  gap: 12,
                  overflowX: 'auto',
                  paddingBottom: 4,
                }}
                data-edit-path="layout.featured.items"
                onClick={(e) => clickGuard(e, 'layout.featured.items')}
              >
                {featured.length ? (
                  featured.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        flex: '0 0 auto',
                        width: isMobile ? 240 : 280,
                        borderRadius: cardRadius,
                        border: `1px solid ${border}`,
                        backgroundColor: 'rgba(255,255,255,0.03)',
                        overflow: 'hidden',
                        cursor: canManage ? 'default' : 'pointer',
                        transform: 'translateZ(0)',
                        transition: `transform ${animationSpeed}ms ease`,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!canManage && p.slug) props.navigate(p.slug);
                        if (canManage) onSelect('layout.featured.items');
                      }}
                      onMouseEnter={(e) => {
                        if (!canManage) (e.currentTarget as HTMLDivElement).style.transform = `scale(${hoverScale})`;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
                      }}
                    >
                      <div style={{ height: 150, backgroundColor: 'rgba(255,255,255,0.04)' }}>
                        {Array.isArray((p as any).images) && (p as any).images?.[0] ? (
                          <img src={(p as any).images[0]} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : null}
                      </div>
                      <div style={{ padding: 14 }}>
                        <div style={{ color: muted, fontSize: 12 }}>{asString((p as any).category) || 'Featured'}</div>
                        <div style={{ marginTop: 6, color: productTitleColor, fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>
                          {p.title}
                        </div>
                        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                          <div style={{ color: productPriceColor, fontWeight: 750 }}>{props.formatPrice(p.price)}</div>
                          <button
                            type="button"
                            style={{
                              backgroundColor: accent,
                              color: '#ffffff',
                              border: 'none',
                              padding: '8px 12px',
                              borderRadius: buttonRadius,
                              cursor: 'pointer',
                              fontSize: 12,
                              fontWeight: 650,
                            }}
                            data-edit-path="layout.featured.addLabel"
                            onClick={(e) => clickGuard(e, 'layout.featured.addLabel')}
                          >
                            {addLabel}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: muted, padding: 10 }}>Add products to your store to populate this section.</div>
                )}
              </div>
            </div>

            {/* Grid */}
            <div
              style={{
                border: `1px solid ${border}`,
                borderRadius: radius,
                backgroundColor: cardBg,
                padding: 16,
              }}
              data-edit-path="layout.grid"
              onClick={(e) => clickGuard(e, 'layout.grid')}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                <div style={{
                  fontSize: sectionTitleSize,
                  fontWeight: headingWeight as any,
                  color: sectionTitleColor,
                }}>
                  {gridTitle}
                </div>
                {categoryFilter ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      if (canManage) return clickGuard(e, 'layout.categories');
                      setCategoryFilter('');
                    }}
                    style={{
                      border: `1px solid ${border}`,
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      color: muted,
                      padding: '8px 10px',
                      borderRadius: buttonRadius,
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    Clear filter
                  </button>
                ) : null}
              </div>

              <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: gridGap }}>
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      borderRadius: cardRadius,
                      border: `1px solid ${border}`,
                      backgroundColor: cardBg,
                      overflow: 'hidden',
                      cursor: canManage ? 'default' : 'pointer',
                      transition: `transform ${animationSpeed}ms ease`,
                    }}
                    data-edit-path={`layout.grid.item.${p.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!canManage && p.slug) props.navigate(p.slug);
                      if (canManage) onSelect('layout.grid');
                    }}
                    onMouseEnter={(e) => {
                      if (!canManage) (e.currentTarget as HTMLDivElement).style.transform = `scale(${hoverScale})`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
                    }}
                  >
                    <div style={{ height: 180, backgroundColor: 'rgba(255,255,255,0.03)' }}>
                      {Array.isArray((p as any).images) && (p as any).images?.[0] ? (
                        <img src={(p as any).images[0]} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : null}
                    </div>
                    <div style={{ padding: 14 }}>
                      <div style={{ color: muted, fontSize: 12 }}>{asString((p as any).category) || 'Product'}</div>
                      <div style={{ marginTop: 6, color: productTitleColor, fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>
                        {p.title}
                      </div>
                      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                        <div style={{ color: productPriceColor, fontWeight: 750 }}>{props.formatPrice(p.price)}</div>
                        <button
                          type="button"
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.03)',
                            color: text,
                            border: `1px solid ${border}`,
                            padding: '8px 12px',
                            borderRadius: buttonRadius,
                            cursor: 'pointer',
                            fontSize: 12,
                            fontWeight: 650,
                          }}
                          data-edit-path="layout.featured.addLabel"
                          onClick={(e) => clickGuard(e, 'layout.featured.addLabel')}
                        >
                          {addLabel}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: `${Math.round(sectionSpacing * 0.8)}px ${spacing}px`,
          backgroundColor: footerBg,
          borderTop: `1px solid ${border}`,
        }}
        data-edit-path="layout.footer"
        onClick={(e) => clickGuard(e, 'layout.footer')}
      >
        <div style={{ maxWidth: contentMax, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1.2fr 0.8fr' : '1fr', gap: 18, alignItems: 'start' }}>
            <div>
              <div style={{ fontWeight: headingWeight as any, letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: 12 }}>{storeName}</div>
              <div style={{ marginTop: 10, color: footerText, fontSize: 13, maxWidth: 520 }}>
                Professional storefront layout designed to look premium on mobile and desktop.
              </div>
              <div
                style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}
                data-edit-path="layout.footer.social"
                onClick={(e) => clickGuard(e, 'layout.footer.social')}
              >
                {(socialLinks.length ? socialLinks : [{ platform: 'instagram', url: 'https://instagram.com/' }, { platform: 'facebook', url: 'https://facebook.com/' }]).map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    style={{
                      color: footerLink,
                      textDecoration: 'none',
                      border: `1px solid ${border}`,
                      padding: '8px 10px',
                      borderRadius: 9999,
                      fontSize: 12,
                    }}
                  >
                    {s.platform}
                  </a>
                ))}
              </div>
            </div>

            <div style={{
              border: `1px solid ${border}`,
              borderRadius: radius,
              padding: 14,
              backgroundColor: 'rgba(255,255,255,0.03)',
            }}>
              <div style={{ color: footerText, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Support</div>
              <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                <a href="/" style={{ color: footerLink, textDecoration: 'none' }}>Shipping</a>
                <a href="/" style={{ color: footerLink, textDecoration: 'none' }}>Returns</a>
                <a href="/" style={{ color: footerLink, textDecoration: 'none' }}>Contact</a>
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 18,
              paddingTop: 16,
              borderTop: `1px solid ${border}`,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              justifyContent: 'space-between',
              alignItems: 'center',
              color: footerText,
              fontSize: 12,
            }}
            data-edit-path="layout.footer.copyright"
            onClick={(e) => clickGuard(e, 'layout.footer.copyright')}
          >
            <div>{copyright}</div>
            <div>Powered by EcoPro</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
