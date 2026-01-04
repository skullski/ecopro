import React, { useEffect, useMemo, useRef, useState } from 'react';
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

function normalizeUrl(url: string): string {
  const u = url.trim();
  if (!u) return '';
  if (u.startsWith('/')) return u;
  if (/^https?:\/\//i.test(u)) return u;
  return '/' + u.replace(/^\/+/, '');
}

export default function JewelryTemplate(props: TemplateProps) {
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

  const storeName = asString(settings.store_name) || 'JEWELRYOS';

  const heroKicker = asString(settings.template_hero_kicker) || 'Gold & silver jewelry / 2025';
  const heroTitle = asString(settings.template_hero_heading) || 'Timeless jewelry,\ndesigned in gold and light.';
  const heroSubtitle =
    asString(settings.template_hero_subtitle) ||
    'A focused collection of rings, bracelets, necklaces and earrings in 18K gold, silver and diamonds. Built for quiet luxury, worn every day.';

  const accent = asString(settings.template_accent_color) || '#d4af37';
  const heroImage = asString(settings.banner_url) || (props.products?.[0]?.images?.[0] || '/placeholder.png');

  const ctaLabel = asString(settings.template_button_text) || 'Explore the collection';

  const badgeLabel = asString(settings.template_hero_badge_title) || 'Highlight piece';
  const badgeTitleOverride = asString(settings.template_hero_badge_subtitle) || '';

  const navLinks = safeParseJsonArray<NavLink>((settings as any).template_nav_links)
    .map((l) => ({ label: asString((l as any)?.label), url: normalizeUrl(asString((l as any)?.url)) }))
    .filter((l) => l.label && l.url);

  const fallbackNav: NavLink[] = [
    { label: asString((settings as any).template_nav_collections) || 'Collections', url: '/products' },
    { label: asString((settings as any).template_nav_gold) || 'Gold', url: '/products' },
    { label: asString((settings as any).template_nav_engagement) || 'Engagement', url: '/products' },
  ];

  const navSearch = asString((settings as any).template_nav_search) || 'Search';
  const navBag = asString((settings as any).template_nav_bag) || 'Bag (0)';

  const tags = useMemo(() => {
    const raw = asString((settings as any).template_hero_tags);
    const parts = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length) return parts.slice(0, 3);
    return ['18K Gold', 'Sterling Silver', 'Diamonds & Pearls'];
  }, [settings]);

  const products = (Array.isArray(props.filtered) && props.filtered.length ? props.filtered : props.products) || [];
  const heroHighlight = products[0];

  const gridTitle = asString((settings as any).template_grid_title) || 'Pieces in this collection';
  const gridCountSuffix = asString((settings as any).template_grid_count_suffix) || 'pieces';

  const featuredTitle = asString((settings as any).template_featured_title) || 'The Gold Edit';
  const featuredSubtitle =
    asString((settings as any).template_featured_subtitle) ||
    'Sculpted rings and chains in warm 18K gold. Soft light, precise edges and a focus on proportion.';
  const featuredNote = asString((settings as any).template_featured_note) || 'Each piece is designed to stack quietly or stand alone.';

  const featuredImage1 = asString((settings as any).template_edit_image_1) || heroImage;
  const featuredImage2 = asString((settings as any).template_edit_image_2) || heroImage;

  const categoryList = ['' as const, ...(Array.isArray(props.categories) ? props.categories : [])].slice(0, 12);

  const copyright =
    asString((settings as any).template_copyright) || `© ${new Date().getFullYear()} ${storeName} · Minimal Luxury Jewelry`;
  const footerText = asString((settings as any).template_footer_text) || '#6b7280';
  const footerLinkColor = asString((settings as any).template_footer_link_color) || '#6b7280';
  const socialLinks = safeParseJsonArray<SocialLink>((settings as any).template_social_links)
    .map((l) => ({
      platform: asString((l as any)?.platform),
      url: normalizeUrl(asString((l as any)?.url)),
      icon: asString((l as any)?.icon),
    }))
    .filter((l) => l.platform && l.url);

  const customCss = asString((settings as any).template_custom_css);

  return (
    <div
      className="min-h-screen bg-white text-gray-900"
      style={{ fontFamily: asString(settings.template_font_family) || 'system-ui, -apple-system, sans-serif' }}
      data-edit-path="__root"
      onClick={() => onSelect('__root')}
    >
      <div ref={containerRef}>
      {customCss ? <style dangerouslySetInnerHTML={{ __html: customCss }} /> : null}

      {/* HEADER */}
      <header
        className="border-b border-gray-200 bg-white/90 backdrop-blur-sm sticky top-0 z-20"
        data-edit-path="layout.header"
        onClick={() => onSelect('layout.header')}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
          <div
            className="text-xs tracking-[0.3em] uppercase text-gray-700 whitespace-nowrap"
            data-edit-path="layout.header.logo"
            onClick={(e) => clickGuard(e, 'layout.header.logo')}
          >
            {storeName.toUpperCase()}
          </div>

          <nav
            className={
              (breakpoint === 'desktop' ? 'flex' : 'hidden') +
              ' gap-6 text-[11px] uppercase tracking-[0.16em] text-gray-500 whitespace-nowrap'
            }
            data-edit-path="layout.header.nav"
            onClick={(e) => clickGuard(e, 'layout.header.nav')}
          >
            {(navLinks.length ? navLinks : fallbackNav).map((l) => (
              <a
                key={l.label}
                href={l.url}
                className="hover:text-gray-900"
                style={{ textDecoration: 'none' }}
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

          <div className="flex gap-4 text-[11px] text-gray-500 uppercase tracking-[0.16em] whitespace-nowrap">
            <button
              type="button"
              className="hover:text-gray-900"
              style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
              onClick={() => {
                if (!canManage) return;
                onSelect('layout.header');
              }}
            >
              {navSearch}
            </button>
            <button
              type="button"
              className="hover:text-gray-900"
              style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
              onClick={() => props.navigate('/checkout')}
            >
              {navBag}
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section
        className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-10 sm:pb-14"
        data-edit-path="layout.hero"
        onClick={() => onSelect('layout.hero')}
      >
        <div
          className={
            (breakpoint === 'desktop' ? 'grid grid-cols-[1.3fr,1.1fr]' : 'grid grid-cols-1') +
            ' gap-8 lg:gap-10 items-center'
          }
        >
          <div>
            <div
              className="text-[11px] tracking-[0.28em] uppercase text-gray-500 mb-3"
              data-edit-path="layout.hero.kicker"
              onClick={(e) => clickGuard(e, 'layout.hero.kicker')}
            >
              {heroKicker}
            </div>

            <h1
              className="text-3xl md:text-4xl font-serif text-gray-900 mb-4 leading-tight break-normal"
              style={{ whiteSpace: 'pre-line' }}
              data-edit-path="layout.hero.title"
              onClick={(e) => clickGuard(e, 'layout.hero.title')}
            >
              {heroTitle}
            </h1>

            <p
              className="text-sm text-gray-600 mb-5 max-w-md"
              data-edit-path="layout.hero.subtitle"
              onClick={(e) => clickGuard(e, 'layout.hero.subtitle')}
            >
              {heroSubtitle}
            </p>

            <div className="flex flex-wrap gap-3 mb-4 text-[11px] text-gray-500">
              {tags.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-full border"
                  style={{ borderColor: `${accent}33`, color: accent }}
                >
                  {t}
                </span>
              ))}
            </div>

            <button
              type="button"
              className="text-[11px] uppercase tracking-[0.22em] px-5 py-2 rounded-full border transition"
              style={{ borderColor: accent, color: accent, background: 'transparent' }}
              data-edit-path="layout.hero.cta"
              onClick={(e) => clickGuard(e, 'layout.hero.cta')}
            >
              {ctaLabel}
            </button>
          </div>

          <div className="relative">
            <img
              src={heroImage}
              alt={asString((settings as any).template_hero_image_alt) || 'Hero jewelry'}
              className="w-full h-[320px] sm:h-[420px] object-cover block rounded-[24px]"
              style={{ border: `1px solid ${accent}66` }}
              data-edit-path="layout.hero.image"
              onClick={(e) => clickGuard(e, 'layout.hero.image')}
              onError={(e) => {
                if (!e.currentTarget.src.endsWith('/placeholder.png')) e.currentTarget.src = '/placeholder.png';
              }}
            />

            <div
              className="absolute bottom-4 left-4 px-4 py-3 bg-white/90 backdrop-blur-sm border rounded-xl max-w-[calc(100%-2rem)]"
              style={{ borderColor: accent, boxShadow: `0 0 22px ${accent}55, 0 0 6px ${accent}95` }}
              data-edit-path="layout.hero.badge"
              onClick={(e) => clickGuard(e, 'layout.hero.badge')}
            >
              <div className="text-[10px] uppercase tracking-[0.18em] mb-1" style={{ color: accent }}>
                {badgeLabel}
              </div>
              <div className="text-xs font-serif text-gray-900">
                {badgeTitleOverride || asString(heroHighlight?.title) || 'Highlight'}
              </div>
              {heroHighlight ? (
                <div className="text-[11px] font-semibold mt-1" style={{ color: accent }}>
                  {props.formatPrice(heroHighlight.price)}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* COLLECTION FILTERS */}
      <section
        className="max-w-6xl mx-auto px-6 pb-6"
        data-edit-path="layout.categories"
        onClick={() => onSelect('layout.categories')}
      >
        <div className="flex flex-wrap gap-3">
          {categoryList.map((cat, idx) => {
            const label = cat ? String(cat) : 'All';
            const active = (props.categoryFilter || '') === (cat ? String(cat) : '');
            return (
              <button
                key={`${label}-${idx}`}
                type="button"
                onClick={() => props.setCategoryFilter(cat ? String(cat) : '')}
                className="rounded-full border px-4 py-2 text-[11px] tracking-[0.16em] uppercase transition"
                style={{
                  borderColor: active ? accent : '#d1d5db',
                  color: active ? accent : '#6b7280',
                  boxShadow: active ? `0 0 12px ${accent}45, 0 0 4px ${accent}90` : 'none',
                  background: '#ffffff',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {/* FEATURED ROW */}
      <section
        className="max-w-6xl mx-auto px-6 pb-12"
        data-edit-path="layout.featured"
        onClick={() => onSelect('layout.featured')}
      >
        <div className={(breakpoint === 'desktop' ? 'grid grid-cols-2' : 'grid grid-cols-1') + ' gap-8 items-center'}>
          <div className="space-y-4">
            <h2
              className="font-serif text-[24px] font-semibold text-gray-900"
              data-edit-path="layout.featured.title"
              onClick={(e) => clickGuard(e, 'layout.featured.title')}
            >
              {featuredTitle}
            </h2>
            <p
              className="text-sm text-gray-600"
              data-edit-path="layout.featured.subtitle"
              onClick={(e) => clickGuard(e, 'layout.featured.subtitle')}
            >
              {featuredSubtitle}
            </p>
            <p className="text-xs text-gray-500">{featuredNote}</p>
          </div>

          <div className={(breakpoint === 'mobile' ? 'grid grid-cols-1' : 'grid grid-cols-2') + ' gap-4'}>
            {[featuredImage1, featuredImage2].map((src, i) => (
              <img
                key={i}
                src={src}
                className="h-44 w-full object-cover rounded-2xl border"
                style={{ borderColor: `${accent}55`, boxShadow: `0 0 22px ${accent}55, 0 0 6px ${accent}95` }}
                alt={i === 0 ? 'Gold detail 1' : 'Gold detail 2'}
                data-edit-path={`layout.featured.items.edit_${i + 1}.image`}
                onClick={(e) => clickGuard(e, `layout.featured.items.edit_${i + 1}.image`)}
                onError={(e) => {
                  if (!e.currentTarget.src.endsWith('/placeholder.png')) e.currentTarget.src = '/placeholder.png';
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCT GRID */}
      <section
        className="max-w-6xl mx-auto px-4 sm:px-6 pb-14 sm:pb-16"
        data-edit-path="layout.grid"
        onClick={() => onSelect('layout.grid')}
      >
        <div className="flex items-center justify-between mb-5">
          <h2
            className="font-serif text-[24px] font-semibold text-gray-900"
            data-edit-path="layout.grid.title"
            onClick={(e) => clickGuard(e, 'layout.grid.title')}
          >
            {gridTitle}
          </h2>
          <span className="text-xs text-gray-500">
            {products.length} {gridCountSuffix}
          </span>
        </div>

        <div className="grid gap-4 sm:gap-6 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
          {products.map((p) => {
            const img = asString(p?.images?.[0]) || '/placeholder.png';
            return (
              <div
                key={p.id}
                className="bg-white rounded-[18px] border border-gray-200 overflow-hidden transition"
                data-edit-path={`layout.featured.items.${p.id}`}
                onClick={(e) => clickGuard(e, `layout.featured.items.${p.id}`)}
              >
                <img
                  src={img}
                  alt={asString(p?.title)}
                  className="w-full aspect-[3/4] object-cover block"
                  onError={(e) => {
                    if (!e.currentTarget.src.endsWith('/placeholder.png')) e.currentTarget.src = '/placeholder.png';
                  }}
                />
                <div className="p-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-serif text-gray-900">{p.title}</div>
                    {p.category ? <div className="text-[11px] text-gray-500 mt-1">{p.category}</div> : null}
                  </div>
                  <div className="text-right text-[12px] font-semibold" style={{ color: accent }}>
                    {props.formatPrice(p.price)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className="border-t border-gray-200 bg-white"
        data-edit-path="layout.footer"
        onClick={() => onSelect('layout.footer')}
      >
        <div className="max-w-6xl mx-auto px-6 py-6 text-[11px] flex flex-col sm:flex-row gap-2 sm:justify-between" style={{ color: footerText }}>
          <span
            data-edit-path="layout.footer.copyright"
            onClick={(e) => clickGuard(e, 'layout.footer.copyright')}
          >
            {copyright}
          </span>

          <div className="flex gap-4" data-edit-path="layout.footer.links" onClick={(e) => clickGuard(e, 'layout.footer.links')}>
            <span style={{ color: footerLinkColor }}>Materials</span>
            <span style={{ color: footerLinkColor }}>Care</span>
            <span style={{ color: footerLinkColor }}>Warranty</span>
          </div>

          {socialLinks.length ? (
            <div className="flex gap-4" data-edit-path="layout.footer.social" onClick={(e) => clickGuard(e, 'layout.footer.social')}>
              {socialLinks.slice(0, 3).map((s) => (
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
    </div>
  );
}
