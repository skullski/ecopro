import React, { useEffect, useRef, useState } from 'react';
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

function clampNumber(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function resolveInt(value: unknown, fallback: number, min: number, max: number): number {
  const str = String(value ?? '').trim();
  if (str === '') return fallback;
  const n = Number(str);
  if (!Number.isFinite(n)) return fallback;
  return clampNumber(Math.round(n), min, max);
}

function normalizeUrl(url: string): string {
  const u = url.trim();
  if (!u) return '';
  if (u.startsWith('/')) return u;
  if (/^https?:\/\//i.test(u)) return u;
  return '/' + u.replace(/^\/+/, '');
}

type Material = 'leather' | 'canvas' | 'nylon' | 'suede' | 'exotic';

function materialShadow(material: Material): string {
  switch (material) {
    case 'leather':
      return '0 32px 60px rgba(80, 60, 40, 0.36), 0 6px 16px rgba(55, 41, 30, 0.8)';
    case 'canvas':
      return '0 32px 60px rgba(176, 167, 151, 0.4), 0 6px 16px rgba(120, 112, 98, 0.75)';
    case 'nylon':
      return '0 32px 60px rgba(75, 85, 99, 0.4), 0 6px 16px rgba(31, 41, 55, 0.8)';
    case 'suede':
      return '0 32px 60px rgba(163, 132, 104, 0.4), 0 6px 16px rgba(120, 95, 72, 0.75)';
    case 'exotic':
    default:
      return '0 32px 60px rgba(30, 24, 18, 0.55), 0 6px 18px rgba(17, 14, 10, 0.9)';
  }
}

function detectMaterial(title: string, index: number): Material {
  const t = title.toLowerCase();
  if (t.includes('leather')) return 'leather';
  if (t.includes('canvas')) return 'canvas';
  if (t.includes('nylon')) return 'nylon';
  if (t.includes('suede')) return 'suede';
  if (t.includes('exotic')) return 'exotic';
  const seq: Material[] = ['leather', 'canvas', 'nylon', 'suede', 'exotic'];
  return seq[Math.abs(index) % seq.length];
}

export default function BagsTemplate(props: TemplateProps) {
  const settings = props.settings || ({} as any);
  const canManage = props.canManage !== false;
  const forcedBreakpoint = (props as any).forcedBreakpoint as Breakpoint | undefined;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [detectedBreakpoint, setDetectedBreakpoint] = useState<Breakpoint>(() => {
    // Initialize based on window width if available
    if (typeof window !== 'undefined') {
      const w = window.innerWidth;
      return w >= 1024 ? 'desktop' : w >= 768 ? 'tablet' : 'mobile';
    }
    return 'desktop';
  });

  useEffect(() => {
    // Skip detection if forcedBreakpoint is provided
    if (forcedBreakpoint) return;
    
    // Use window width for breakpoint detection, not container width
    const updateBreakpoint = () => {
      const w = window.innerWidth;
      const bp: Breakpoint = w >= 1024 ? 'desktop' : w >= 768 ? 'tablet' : 'mobile';
      setDetectedBreakpoint(bp);
    };
    
    updateBreakpoint(); // Initial check
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, [forcedBreakpoint]);

  // Use forced breakpoint if provided, otherwise use detected
  const breakpoint = forcedBreakpoint || detectedBreakpoint;

  const onSelect = (path: string) => {
    const anyProps = props as any;
    if (!canManage) return;
    if (typeof anyProps.onSelect === 'function') anyProps.onSelect(path);
  };

  const bg = asString(settings.template_bg_color) || '#FDF8F3';
  const text = asString(settings.template_text_color) || '#1C1917';
  const muted = asString(settings.template_muted_color) || '#78716C';
  const headerText = asString(settings.template_header_text) || '#6b7280';

  const cardBg = asString(settings.template_card_bg) || '#FFFFFF';
  const borderRadius = resolveInt(settings.template_border_radius, 8, 0, 24);

  const fontFamily = asString(settings.template_font_family) || 'system-ui, -apple-system, sans-serif';
  const headingFontFamily = 'Georgia, serif';
  const fontWeight = asString(settings.template_font_weight) || '400';
  const headingWeight = asString(settings.template_heading_font_weight) || '600';

  const heroTitle = asString(settings.template_hero_heading) || 'Cold silhouettes,\ncut in leather and light.';
  const heroSubtitle =
    asString(settings.template_hero_subtitle) ||
    'A focused edit of structured totes, city crossbody bags and evening silhouettes. Built in neutral materials for everyday precision.';
  const heroKicker = asString(settings.template_hero_kicker) || 'Bags / Leather · Canvas · Nylon';

  const heroTitleColor = asString(settings.template_hero_title_color) || '#111827';
  const heroSubtitleColor = asString(settings.template_hero_subtitle_color) || '#4b5563';
  const heroTitleSize = resolveInt(settings.template_hero_title_size, 40, 18, 72);
  const heroSubtitleSize = resolveInt(settings.template_hero_subtitle_size, 14, 10, 20);

  const badgeTitle = asString(settings.template_hero_badge_title) || 'HIGHLIGHT PIECE';
  const badgeSubtitle = asString(settings.template_hero_badge_subtitle) || '';

  const storeName = asString(settings.store_name) || 'BAGSOS';

  const navLinks = safeParseJsonArray<NavLink>((settings as any).template_nav_links)
    .map((l) => ({ label: asString((l as any)?.label), url: normalizeUrl(asString((l as any)?.url)) }))
    .filter((l) => l.label && l.url);

  const fallbackNav: NavLink[] = [
    { label: 'Editorial', url: '/products' },
    { label: 'Leather', url: '/products' },
    { label: 'Mini', url: '/products' },
  ];

  const heroImage = asString(settings.banner_url) || (props.products?.[0]?.images?.[0] || '/placeholder.png');

  const products = (Array.isArray(props.filtered) && props.filtered.length ? props.filtered : props.products) || [];
  const heroProduct = products[0];
  const chapterProducts = products.slice(0, 3);
  const gridProducts = products;

  // Advanced settings
  const spacing = asString((settings as any).template_spacing) || 'normal';
  const animationSpeed = asString((settings as any).template_animation_speed) || '0.3s';
  const hoverScale = asString((settings as any).template_hover_scale) || '1.02';
  const gridColumns = resolveInt((settings as any).template_grid_columns, 4, 1, 6);
  const customCss = asString((settings as any).template_custom_css);

  const categoryPillBg = asString((settings as any).template_category_pill_bg) || 'rgba(255,255,255,0.7)';
  const categoryPillText = asString((settings as any).template_category_pill_text) || '#6b7280';
  const categoryPillActiveBg = asString((settings as any).template_category_pill_active_bg) || '#111827';
  const categoryPillActiveText = asString((settings as any).template_category_pill_active_text) || '#f9fafb';
  const categoryPillRadius = resolveInt((settings as any).template_category_pill_border_radius, 9999, 0, 9999);

  const sectionTitle = asString((settings as any).template_featured_title) || 'Bags in this collection';
  const sectionTitleColor = asString((settings as any).template_section_title_color) || '#111827';
  const sectionTitleSize = resolveInt((settings as any).template_section_title_size, 20, 12, 36);

  const chapterTitle = asString((settings as any).template_featured_title) || 'Leather silhouettes';
  const chapterSubtitle =
    asString((settings as any).template_featured_subtitle) ||
    'Structured lines in cold leather tones. Clean forms with enough volume for the city.';

  const copyright = asString((settings as any).template_copyright) || `© ${new Date().getFullYear()} ${storeName}`;
  const footerText = asString((settings as any).template_footer_text) || muted;
  const footerLinkColor = asString((settings as any).template_footer_link_color) || text;
  const socialLinks = safeParseJsonArray<SocialLink>((settings as any).template_social_links)
    .map((l) => ({ platform: asString((l as any)?.platform), url: normalizeUrl(asString((l as any)?.url)), icon: asString((l as any)?.icon) }))
    .filter((l) => l.platform && l.url);

  const clickGuard = (e: React.MouseEvent, path: string) => {
    if (!canManage) return;
    e.preventDefault();
    e.stopPropagation();
    onSelect(path);
  };

  const paperBorder = '1px solid #d1d5db';
  const hairline = '1px solid #e5e7eb';

  const heroFrameShadow = '0 40px 70px rgba(15, 23, 42, 0.32), 0 6px 18px rgba(15, 23, 42, 0.55)';

  const categoryList = ['' as const, ...(Array.isArray(props.categories) ? props.categories : [])].slice(0, 12);

  const FooterLinks = ({
    label,
    href,
  }: {
    label: string;
    href: string;
  }) => {
    if (canManage) {
      return (
        <a
          href={href}
          style={{ color: footerLinkColor, textDecoration: 'none' }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelect('layout.footer.links');
          }}
        >
          {label}
        </a>
      );
    }

    return (
      <a href={href} style={{ color: footerLinkColor, textDecoration: 'none' }}>
        {label}
      </a>
    );
  };

  const BagTile = ({
    product,
    index,
    tall,
    path,
  }: {
    product: any;
    index: number;
    tall?: boolean;
    path: string;
  }) => {
    const img = asString(product?.images?.[0]) || '/placeholder.png';
    const title = asString(product?.title) || 'Untitled';
    const material = detectMaterial(title, index);

    // Navigate to product checkout when customer clicks (not in edit mode)
    const handleProductClick = () => {
      if (!canManage && product?.slug) {
        props.navigate(product.slug);
      }
    };

    return (
      <div 
        style={{ display: 'flex', flexDirection: 'column', gap: 8, cursor: canManage ? 'default' : 'pointer' }}
        onClick={handleProductClick}
      >
        <div
          style={{ backgroundColor: cardBg, boxShadow: materialShadow(material), height: tall ? 320 : 280 }}
          data-edit-path={`${path}.image`}
          onClick={(e) => { if (canManage) clickGuard(e, `${path}.image`); }}
        >
          <img
            src={img}
            alt={title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
            onError={(e) => {
              if (!e.currentTarget.src.endsWith('/placeholder.png')) e.currentTarget.src = '/placeholder.png';
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{ fontFamily: headingFontFamily, fontSize: 14, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              data-edit-path={`${path}.title`}
              onClick={(e) => { if (canManage) clickGuard(e, `${path}.title`); }}
            >
              {title}
            </div>
            <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9ca3af', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {String(product?.category || '').trim() ? String(product.category) : 'Bag'}
            </div>
          </div>
          <div
            style={{ textAlign: 'right', fontSize: 13, color: '#111827', whiteSpace: 'nowrap', flexShrink: 0 }}
            data-edit-path={`${path}.price`}
            onClick={(e) => { if (canManage) clickGuard(e, `${path}.price`); }}
          >
            {props.formatPrice(product?.price)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: `url(${heroImage})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'scroll',
        color: text,
        fontFamily,
        fontWeight: Number(fontWeight) || 400,
      }}
    >
      <div
        className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-16"
        style={{
          background: 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(12px)',
        }}
        data-edit-path="__root"
        onClick={() => onSelect('__root')}
      >
      <div ref={containerRef}>
      {/* HEADER */}
      <header
        style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '18px 0' }}
        data-edit-path="layout.header"
        onClick={() => onSelect('layout.header')}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#374151', whiteSpace: 'nowrap' }}
          data-edit-path="layout.header.logo"
          onClick={(e) => clickGuard(e, 'layout.header.logo')}
        >
          {settings.store_logo && (
            <img
              src={settings.store_logo}
              alt={storeName}
              style={{ height: '36px', width: '36px', objectFit: 'contain', borderRadius: '4px' }}
            />
          )}
          {storeName}
        </div>

        <nav
          className="hidden lg:flex"
          style={{
            gap: 28,
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: headerText,
            whiteSpace: 'nowrap',
            overflowX: 'auto',
            maxWidth: '100%',
          }}
          data-edit-path="layout.header.nav"
          onClick={(e) => clickGuard(e, 'layout.header.nav')}
        >
          {(navLinks.length ? navLinks : fallbackNav).map((l) => (
            <a
              key={l.label}
              href={l.url}
              style={{ color: headerText, textDecoration: 'none', whiteSpace: 'nowrap' }}
              onClick={(e) => {
                if (!canManage) return;
                e.preventDefault();
                e.stopPropagation();
                onSelect('layout.header.nav');
              }}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div
          style={{
            display: 'flex',
            gap: 20,
            fontSize: 11,
            color: headerText,
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', color: headerText }}
            onClick={() => {
              if (!canManage) return;
              // keep behavior minimal; search input is controlled elsewhere in the storefront
              onSelect('layout.header');
            }}
          >
            Search
          </button>
          <button
            type="button"
            style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', color: headerText }}
            onClick={() => props.navigate('/checkout')}
          >
            Bag (0)
          </button>
        </div>
      </header>

      {/* HERO */}
      <section
        className={(breakpoint === 'desktop' ? 'grid grid-cols-[0.9fr,1.1fr]' : 'grid grid-cols-1') + ' gap-8 lg:gap-10 items-end'}
        style={{ padding: '40px 0' }}
        data-edit-path="layout.hero"
        onClick={() => onSelect('layout.hero')}
      >
        <div>
          <div
            style={{ fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#6b7280', marginBottom: 12 }}
            data-edit-path="layout.hero.kicker"
            onClick={(e) => clickGuard(e, 'layout.hero.kicker')}
          >
            {heroKicker}
          </div>

          <h1
            style={{
              margin: 0,
              fontFamily: headingFontFamily,
              fontSize: `clamp(26px, 6vw, ${heroTitleSize}px)`,
              lineHeight: 1.1,
              fontWeight: 500,
              color: heroTitleColor,
              whiteSpace: 'pre-line',
              marginBottom: 16,
            }}
            data-edit-path="layout.hero.title"
            onClick={(e) => clickGuard(e, 'layout.hero.title')}
          >
            {heroTitle}
          </h1>

          <p
            style={{
              fontSize: `clamp(12px, 3.2vw, ${heroSubtitleSize}px)`,
              color: heroSubtitleColor,
              maxWidth: 448,
              margin: 0,
              marginBottom: 24,
            }}
            data-edit-path="layout.hero.subtitle"
            onClick={(e) => clickGuard(e, 'layout.hero.subtitle')}
          >
            {heroSubtitle}
          </p>

          <div
            style={{ display: 'none' }}
            data-edit-path="layout.hero.cta"
            onClick={(e) => clickGuard(e, 'layout.hero.cta')}
          />
        </div>

        <div style={{ position: 'relative' }}>
          <div
            style={{ backgroundColor: cardBg, boxShadow: heroFrameShadow }}
            data-edit-path="layout.hero.image"
            onClick={(e) => clickGuard(e, 'layout.hero.image')}
          >
            <img
              src={heroImage}
              alt="Hero"
              style={{ width: '100%', height: 'clamp(320px, 58vh, 460px)', objectFit: 'cover', display: 'block' }}
              onError={(e) => {
                if (!e.currentTarget.src.endsWith('/placeholder.png')) e.currentTarget.src = '/placeholder.png';
              }}
            />
          </div>

          <div
            style={{
              position: 'absolute',
              left: 16,
              bottom: 16,
              background: 'rgba(255,255,255,0.95)',
              padding: '12px 16px',
              border: paperBorder,
              maxWidth: 'calc(100% - 32px)',
            }}
            data-edit-path="layout.hero.badge"
            onClick={(e) => clickGuard(e, 'layout.hero.badge')}
          >
            <div style={{ fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#6b7280', marginBottom: 6 }}>
              {badgeTitle}
            </div>
            <div style={{ fontFamily: headingFontFamily, fontSize: 14, color: '#111827' }}>
              {badgeSubtitle || asString(heroProduct?.title) || 'Highlight'}
            </div>
            {heroProduct ? (
              <div style={{ fontSize: 11, color: '#374151', marginTop: 4 }}>{props.formatPrice(heroProduct.price)}</div>
            ) : null}
          </div>
        </div>
      </section>

      {/* FILTERS */}
      <section
        style={{ padding: '16px 0', borderTop: hairline, borderBottom: hairline, marginBottom: 40 }}
        data-edit-path="layout.categories"
        onClick={() => onSelect('layout.categories')}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {categoryList.map((cat, idx) => {
            const label = cat ? String(cat) : 'All';
            const active = (props.categoryFilter || '') === (cat ? String(cat) : '');
            return (
              <button
                key={`${label}-${idx}`}
                type="button"
                onClick={() => props.setCategoryFilter(cat ? String(cat) : '')}
                style={{
                  borderRadius: categoryPillRadius,
                  border: paperBorder,
                  padding: '6px 14px',
                  fontSize: 10,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  background: active ? categoryPillActiveBg : categoryPillBg,
                  color: active ? categoryPillActiveText : categoryPillText,
                  backdropFilter: 'blur(6px)',
                  transition: `all ${animationSpeed} ease`,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {/* CHAPTER */}
      <section
        style={{ padding: '40px 0', borderBottom: hairline, marginBottom: 40 }}
        data-edit-path="layout.featured"
        onClick={() => onSelect('layout.featured')}
      >
        <div className={(breakpoint === 'desktop' ? 'grid grid-cols-[0.35fr,1.65fr]' : 'grid grid-cols-1') + ' gap-10 items-start'}>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ width: 1, background: 'linear-gradient(to bottom, #9ca3af, #d1d5db)' }} />
            <div>
              <div style={{ fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#6b7280', marginBottom: 8 }}>
                CHAPTER I
              </div>
              <h2
                style={{ fontFamily: headingFontFamily, fontSize: 26, fontWeight: 500, color: '#111827', margin: 0, marginBottom: 12 }}
                data-edit-path="layout.featured.title"
                onClick={(e) => clickGuard(e, 'layout.featured.title')}
              >
                {chapterTitle}
              </h2>
              <p
                style={{ fontSize: 14, color: '#4b5563', margin: 0 }}
                data-edit-path="layout.featured.subtitle"
                onClick={(e) => clickGuard(e, 'layout.featured.subtitle')}
              >
                {chapterSubtitle}
              </p>
            </div>
          </div>

          <div
            className="grid gap-5"
            style={{
              gridTemplateColumns: breakpoint === 'desktop' ? `repeat(${gridColumns}, 1fr)` : breakpoint === 'tablet' ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)'
            }}
          >
            {chapterProducts.length
              ? chapterProducts.map((p, i) => (
                  <div
                    key={p.id}
                    style={{ transition: `all ${animationSpeed} ease` }}
                    data-edit-path={`layout.featured.items.${p.id}`}
                    onClick={(e) => clickGuard(e, `layout.featured.items.${p.id}`)}
                  >
                    <BagTile
                      product={p}
                      index={i}
                      tall={i === 0}
                      path={`layout.featured.items.${p.id}`}
                    />
                  </div>
                ))
              : null}
          </div>
        </div>
      </section>

      {/* GRID */}
      <section
        style={{ paddingBottom: 80 }}
        data-edit-path="layout.grid"
        onClick={() => onSelect('layout.grid')}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 6 }}>
              PIECES
            </div>
            <h2
              style={{ fontFamily: headingFontFamily, fontSize: sectionTitleSize, color: sectionTitleColor, fontWeight: 500, margin: 0 }}
              data-edit-path="layout.grid.title"
              onClick={(e) => clickGuard(e, 'layout.grid.title')}
            >
              {sectionTitle}
            </h2>
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.18em', whiteSpace: 'nowrap' }}>
            {Math.max(0, gridProducts.length)} pieces
          </div>
        </div>

        <div
          className="grid gap-8"
          style={{
            gridTemplateColumns: breakpoint === 'desktop' ? `repeat(${gridColumns}, 1fr)` : breakpoint === 'tablet' ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)'
          }}
        >
          {gridProducts.map((p, index) => (
            <div
              key={p.id}
              style={{ transition: `all ${animationSpeed} ease` }}
              data-edit-path={`layout.featured.items.${p.id}`}
              onClick={(e) => clickGuard(e, `layout.featured.items.${p.id}`)}
            >
              <BagTile product={p} index={index} tall={index % 3 === 0} path={`layout.featured.items.${p.id}`} />
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{ borderTop: hairline, paddingTop: 20, marginTop: 16 }}
        data-edit-path="layout.footer"
        onClick={() => onSelect('layout.footer')}
      >
        <div
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, fontSize: 11, color: footerText, textTransform: 'uppercase', letterSpacing: '0.18em',
          }}
          className="sm:flex-row sm:items-center"
        >
          <div
            style={{ fontSize: 11, color: footerText }}
            data-edit-path="layout.footer.copyright"
            onClick={(e) => clickGuard(e, 'layout.footer.copyright')}
          >
            {copyright}
          </div>

          <div style={{ display: 'flex', gap: 16 }} data-edit-path="layout.footer.links" onClick={(e) => clickGuard(e, 'layout.footer.links')}>
            <FooterLinks label="Materials" href="/" />
            <FooterLinks label="Care" href="/" />
            <FooterLinks label="Warranty" href="/" />
          </div>

          {socialLinks.length ? (
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11, color: footerLinkColor }}
              data-edit-path="layout.footer.social"
              onClick={(e) => clickGuard(e, 'layout.footer.social')}
            >
              {socialLinks.slice(0, 5).map((s) => (
                <a
                  key={`${s.platform}-${s.url}`}
                  href={s.url}
                  style={{ color: footerLinkColor, textDecoration: 'none' }}
                  onClick={(e) => {
                    if (!canManage) return;
                    e.preventDefault();
                    e.stopPropagation();
                    onSelect('layout.footer.social');
                  }}
                >
                  {s.platform}
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </footer>
      </div>
      
      {/* Custom CSS */}
      {customCss && <style>{customCss}</style>}
      </div>
    </div>
  );
}
