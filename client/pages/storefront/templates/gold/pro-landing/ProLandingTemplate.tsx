import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';

/**
 * PRO LANDING - Professional single-product landing page.
 * Goal: give one-product sellers a true “landing page” experience (story → proof → FAQ → buy).
 */

function asString(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function resolveInt(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = typeof value === 'number' ? value : parseInt(String(value || ''), 10);
  const safe = Number.isFinite(parsed) ? parsed : fallback;
  return Math.max(min, Math.min(max, safe));
}

function productTitle(p: StoreProduct): string {
  return String((p as any).title || (p as any).name || '').trim() || 'Product';
}

function productImage(p: StoreProduct | undefined): string {
  if (!p) return '/placeholder.png';
  const img = Array.isArray((p as any).images) ? (p as any).images.find(Boolean) : undefined;
  return typeof img === 'string' && img ? img : '/placeholder.png';
}

function safePrice(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(String(value ?? '').trim());
  return Number.isFinite(n) ? n : 0;
}

export default function ProLandingTemplate(props: TemplateProps) {
  const { settings, formatPrice, navigate } = props;
  const canManage = Boolean(props.canManage);
  const onSelect = (path: string) => {
    if (canManage && typeof (props as any).onSelect === 'function') {
      (props as any).onSelect(path);
    }
  };

  const [isMobile, setIsMobile] = React.useState((props as any).forcedBreakpoint === 'mobile');
  React.useEffect(() => {
    const bp = (props as any).forcedBreakpoint;
    if (bp) {
      setIsMobile(bp === 'mobile');
      return;
    }
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [(props as any).forcedBreakpoint]);

  const bg = asString(settings.template_bg_color) || '#0b1220';
  const text = asString(settings.template_text_color) || '#e5e7eb';
  const muted = asString(settings.template_muted_color) || '#94a3b8';
  const accent = asString(settings.template_accent_color) || '#2563eb';
  const cardBg = asString(settings.template_card_bg) || '#0f172a';
  const border = 'rgba(148,163,184,0.18)';

  const storeName = asString(settings.store_name) || 'Pro Landing';
  const heroTitle = asString(settings.template_hero_heading) || 'A professional landing page for your one best product.';
  const heroSubtitle =
    asString(settings.template_hero_subtitle) ||
    'Tell a clear story, build trust, and convert on mobile — with a clean “Buy Now” flow.';
  const cta = asString(settings.template_button_text) || 'Buy Now';

  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 64, 24, 96);
  const cardRadius = resolveInt(settings.template_card_border_radius, 18, 0, 32);
  const buttonRadius = resolveInt((settings as any).template_button_border_radius, 14, 0, 50);

  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 12) || [];
  const mainProduct = products[0];

  const mainSlug = (mainProduct as any)?.slug || '/products';
  const mainPrice = mainProduct ? formatPrice(safePrice((mainProduct as any).price)) : '';

  const descText = (asString((settings as any).template_description_text) || asString(settings.store_description)).trim();
  const descColor = asString((settings as any).template_description_color) || muted;
  const descSize = resolveInt((settings as any).template_description_size, 15, 10, 28);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const [faqOpen, setFaqOpen] = React.useState<number | null>(0);

  const stopIfManage = (e: React.MouseEvent) => {
    if (!canManage) return;
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      data-edit-path="__root"
      onClick={() => canManage && onSelect('__root')}
      className="ecopro-storefront"
      style={{ minHeight: '100vh', background: bg, color: text, fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      {/* Header */}
      <header
        data-edit-path="layout.header"
        onClick={() => canManage && onSelect('layout.header')}
        style={{ position: 'sticky', top: 0, zIndex: 30, background: bg, borderBottom: `1px solid ${border}` }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            {asString(settings.store_logo) ? (
              <img
                src={asString(settings.store_logo)}
                alt={storeName}
                style={{ width: 38, height: 38, borderRadius: 12, objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: accent,
                  color: '#071426',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 900,
                }}
              >
                {storeName.trim().slice(0, 1).toUpperCase() || 'P'}
              </div>
            )}

            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 900, fontSize: 14, letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {storeName}
              </div>
              <div style={{ fontSize: 12, color: muted }}>Professional Single-Product Landing</div>
            </div>
          </div>

          {!isMobile && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={(e) => {
                  stopIfManage(e);
                  scrollTo('details');
                }}
                style={{ background: 'transparent', border: `1px solid ${border}`, color: text, borderRadius: 999, padding: '8px 12px', cursor: 'pointer', fontWeight: 800, fontSize: 12 }}
              >
                Details
              </button>
              <button
                onClick={(e) => {
                  stopIfManage(e);
                  scrollTo('faq');
                }}
                style={{ background: 'transparent', border: `1px solid ${border}`, color: text, borderRadius: 999, padding: '8px 12px', cursor: 'pointer', fontWeight: 800, fontSize: 12 }}
              >
                FAQ
              </button>
            </nav>
          )}

          <button
            data-edit-path="layout.hero.cta"
            onClick={(e) => {
              stopIfManage(e);
              navigate(mainSlug);
            }}
            style={{
              background: accent,
              border: 0,
              borderRadius: buttonRadius,
              padding: '10px 14px',
              fontWeight: 900,
              cursor: 'pointer',
              color: '#071426',
              fontSize: 13,
              whiteSpace: 'nowrap',
            }}
          >
            {cta}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section
        data-edit-path="layout.hero"
        onClick={() => canManage && onSelect('layout.hero')}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px ${Math.round(sectionSpacing * 0.75)}px` }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1.08fr 0.92fr',
            gap: isMobile ? 18 : 28,
            alignItems: 'center',
          }}
        >
          <div>
            <div data-edit-path="layout.hero.kicker" style={{ color: accent, fontWeight: 900, letterSpacing: '0.14em', fontSize: 12 }}>
              CONVERSION-FIRST • MOBILE-FIRST
            </div>

            <h1
              data-edit-path="layout.hero.title"
              style={{ margin: '14px 0 0', fontSize: isMobile ? 34 : 56, lineHeight: 1.03, fontWeight: 950 as any, letterSpacing: '-0.03em' }}
            >
              {heroTitle}
            </h1>

            <p
              data-edit-path="layout.hero.subtitle"
              style={{ marginTop: 14, color: muted, fontSize: isMobile ? 14 : 16, lineHeight: 1.85, maxWidth: 620 }}
            >
              {heroSubtitle}
            </p>

            <div style={{ marginTop: 18, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {['Cash on delivery', 'Fast delivery', 'Support included'].map((t) => (
                <span
                  key={t}
                  style={{
                    border: `1px solid ${border}`,
                    borderRadius: 999,
                    padding: '8px 12px',
                    fontSize: 12,
                    color: text,
                    background: 'rgba(15, 23, 42, 0.55)',
                  }}
                >
                  {t}
                </span>
              ))}
            </div>

            {mainProduct ? (
              <div style={{ marginTop: 22, display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ fontSize: isMobile ? 28 : 36, fontWeight: 950 as any }}>{mainPrice}</div>
                <div style={{ color: muted, fontSize: 13 }}>Limited stock • Easy returns</div>
              </div>
            ) : (
              <div style={{ marginTop: 22, color: muted, fontSize: 13 }}>Add at least one product to show price & hero image.</div>
            )}

            <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                data-edit-path="layout.hero.cta"
                onClick={(e) => {
                  stopIfManage(e);
                  navigate(mainSlug);
                }}
                style={{ background: accent, border: 0, borderRadius: buttonRadius, padding: '14px 18px', fontWeight: 950 as any, cursor: 'pointer', color: '#071426' }}
              >
                {cta}
              </button>
              <button
                onClick={(e) => {
                  stopIfManage(e);
                  scrollTo('details');
                }}
                style={{ background: 'transparent', border: `1px solid ${border}`, borderRadius: buttonRadius, padding: '14px 18px', fontWeight: 900, cursor: 'pointer', color: text }}
              >
                Learn More
              </button>
            </div>

            <div style={{ marginTop: 18, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { t: 'Trust badges', d: 'Show delivery & guarantees.' },
                { t: 'FAQ section', d: 'Handle objections fast.' },
                { t: 'Sticky buy bar', d: 'Always visible CTA.' },
              ].map((c) => (
                <div key={c.t} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: cardRadius, padding: 14 }}>
                  <div style={{ fontWeight: 950 as any, fontSize: 13 }}>{c.t}</div>
                  <div style={{ marginTop: 6, color: muted, fontSize: 12, lineHeight: 1.65 }}>{c.d}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Product card */}
          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: cardRadius, overflow: 'hidden' }}>
            <div style={{ position: 'relative', aspectRatio: isMobile ? '4/3' : '1/1', background: '#050913' }}>
              <img
                src={productImage(mainProduct)}
                alt={mainProduct ? productTitle(mainProduct) : ''}
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.96 }}
              />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 38%, rgba(0,0,0,0.75) 100%)' }} />

              <div style={{ position: 'absolute', left: 14, right: 14, bottom: 14 }}>
                <div style={{ fontWeight: 950 as any, fontSize: 14, lineHeight: 1.25 }}>{mainProduct ? productTitle(mainProduct) : 'Your product name'}</div>
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ fontSize: 12, color: muted }}>★★★★★ 4.9 (1,200+)</div>
                  <button
                    onClick={(e) => {
                      stopIfManage(e);
                      navigate(mainSlug);
                    }}
                    style={{ background: accent, border: 0, borderRadius: 999, padding: '10px 12px', fontWeight: 950 as any, cursor: 'pointer', color: '#071426', fontSize: 12 }}
                  >
                    {cta}
                  </button>
                </div>
              </div>
            </div>

            <div style={{ padding: 14, display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
              {[
                { k: 'Delivery', v: '24–72 hours' },
                { k: 'Payment', v: 'Cash on delivery' },
                { k: 'Support', v: 'WhatsApp available' },
              ].map((row) => (
                <div key={row.k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, borderBottom: `1px solid ${border}`, paddingBottom: 10 }}>
                  <div style={{ color: muted, fontSize: 12 }}>{row.k}</div>
                  <div style={{ fontWeight: 900, fontSize: 12 }}>{row.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Details */}
      <section id="details" style={{ padding: `0 ${baseSpacing}px ${sectionSpacing}px` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
          <div
            data-edit-path="layout.categories"
            onClick={() => canManage && onSelect('layout.categories')}
            style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: cardRadius, padding: 18 }}
          >
            <div style={{ fontWeight: 950 as any, fontSize: 14 }}>Why you’ll love it</div>
            <div style={{ marginTop: 10, color: descColor, fontSize: descSize, lineHeight: 1.9 }}>
              {descText || (canManage ? 'Click and edit: add your product story, benefits, and what makes it unique.' : '')}
            </div>
          </div>

          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: cardRadius, padding: 18 }}>
            <div style={{ fontWeight: 950 as any, fontSize: 14 }}>What you get</div>
            <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
              {[
                { t: 'Premium build', d: 'Designed to last with quality materials.' },
                { t: 'Fast setup', d: 'Clear checkout flow with COD.' },
                { t: 'Confidence', d: 'Guarantee + support reduces hesitation.' },
              ].map((b) => (
                <div key={b.t} style={{ border: `1px solid ${border}`, borderRadius: 14, padding: 14, background: 'rgba(2,6,23,0.35)' }}>
                  <div style={{ fontWeight: 950 as any, fontSize: 13 }}>{b.t}</div>
                  <div style={{ marginTop: 6, color: muted, fontSize: 12, lineHeight: 1.7 }}>{b.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Optional upsells (only if more than one product) */}
      {products.length > 1 && (
        <section
          data-edit-path="layout.grid"
          onClick={() => canManage && onSelect('layout.grid')}
          style={{ padding: `0 ${baseSpacing}px ${sectionSpacing}px` }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div data-edit-path="layout.featured.title" style={{ fontWeight: 950 as any, fontSize: 16 }}>
                  Optional upsells
                </div>
                <div data-edit-path="layout.featured.subtitle" style={{ marginTop: 6, color: muted, fontSize: 13 }}>
                  Shown only if you add multiple products.
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: 14,
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                gap: 12,
              }}
            >
              {products.slice(1, 9).map((p) => (
                <button
                  key={(p as any).id}
                  onClick={(e) => {
                    stopIfManage(e);
                    navigate((p as any).slug || '/products');
                  }}
                  style={{ textAlign: 'left', background: cardBg, border: `1px solid ${border}`, borderRadius: cardRadius, overflow: 'hidden', cursor: 'pointer', padding: 0 }}
                >
                  <div style={{ aspectRatio: '4/3', background: '#050913' }}>
                    <img src={productImage(p)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: 12 }}>
                    <div style={{ fontWeight: 950 as any, fontSize: 13, lineHeight: 1.2 }}>{productTitle(p)}</div>
                    <div style={{ marginTop: 6, color: muted, fontSize: 12 }}>{formatPrice(safePrice((p as any).price))}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section id="faq" style={{ padding: `0 ${baseSpacing}px ${sectionSpacing}px` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', background: cardBg, border: `1px solid ${border}`, borderRadius: cardRadius, padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 950 as any, fontSize: 16 }}>FAQ</div>
              <div style={{ marginTop: 6, color: muted, fontSize: 13 }}>Answer the top objections before your customer asks.</div>
            </div>
          </div>

          <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
            {[
              {
                q: 'How do I pay?',
                a: 'Cash on delivery (COD). You pay when you receive the product.',
              },
              {
                q: 'How long does delivery take?',
                a: 'Usually 24–72 hours depending on your city and delivery availability.',
              },
              {
                q: 'Is there a warranty or return policy?',
                a: 'Yes — add your warranty/return details in the description section for full clarity.',
              },
            ].map((item, idx) => {
              const open = faqOpen === idx;
              return (
                <button
                  key={item.q}
                  onClick={(e) => {
                    stopIfManage(e);
                    setFaqOpen((prev) => (prev === idx ? null : idx));
                  }}
                  style={{ textAlign: 'left', background: 'rgba(2,6,23,0.35)', border: `1px solid ${border}`, borderRadius: 14, padding: 14, cursor: 'pointer', color: text }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ fontWeight: 950 as any, fontSize: 13 }}>{item.q}</div>
                    <div style={{ color: muted, fontWeight: 900 }}>{open ? '−' : '+'}</div>
                  </div>
                  {open && <div style={{ marginTop: 10, color: muted, fontSize: 12, lineHeight: 1.8 }}>{item.a}</div>}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sticky buy bar (desktop) */}
      {!isMobile && mainProduct && (
        <div style={{ position: 'fixed', left: 18, right: 18, bottom: 18, zIndex: 40, pointerEvents: 'none' }}>
          <div
            style={{
              pointerEvents: 'auto',
              maxWidth: 950,
              margin: '0 auto',
              background: 'rgba(2,6,23,0.78)',
              border: `1px solid ${border}`,
              borderRadius: 18,
              padding: '12px 14px',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 950 as any, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{productTitle(mainProduct)}</div>
              <div style={{ color: muted, fontSize: 12 }}>{mainPrice} • Cash on delivery</div>
            </div>
            <button
              onClick={() => navigate(mainSlug)}
              style={{ background: accent, border: 0, borderRadius: 999, padding: '10px 14px', fontWeight: 950 as any, cursor: 'pointer', color: '#071426' }}
            >
              {cta}
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={() => canManage && onSelect('layout.footer')}
        style={{ padding: '30px 18px', borderTop: `1px solid ${border}`, color: muted }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12 }}>© {new Date().getFullYear()} {storeName}</div>
          <div style={{ fontSize: 12 }}>Powered by EcoPro</div>
        </div>
      </footer>
    </div>
  );
}
