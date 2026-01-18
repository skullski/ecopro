import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * FOCUS ONE - High-conversion single product landing.
 * Features: Split hero, benefits, testimonials, sticky CTA, optional upsells.
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

export default function FocusOneTemplate(props: TemplateProps) {
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
  const accent = asString(settings.template_accent_color) || '#22c55e';
  const cardBg = asString(settings.template_card_bg) || '#0f172a';

  const storeName = asString(settings.store_name) || 'Focus One';
  const heroTitle = asString(settings.template_hero_heading) || 'Sell one product like a pro.';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Simple landing page, strong story, clean checkout flow.';
  const cta = asString(settings.template_button_text) || 'Buy Now';

  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 12) || [];
  const mainProduct = products[0];
  const [selectedProduct, setSelectedProduct] = React.useState<StoreProduct | undefined>(mainProduct);
  React.useEffect(() => {
    setSelectedProduct(mainProduct);
  }, [mainProduct ? (mainProduct as any).id : undefined]);

  const storeSlug = asString((settings as any).store_slug);
  const checkoutTheme = {
    bg,
    text,
    muted,
    accent,
    cardBg,
    border: 'rgba(148,163,184,0.18)',
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 56, 24, 96);
  const cardRadius = resolveInt(settings.template_card_border_radius, 16, 0, 32);
  const buttonRadius = resolveInt((settings as any).template_button_border_radius, 14, 0, 50);

  const stickyPrice = selectedProduct ? formatPrice(Number((selectedProduct as any).price) || 0) : '';

  return (
    <div
      data-edit-path="__root"
      onClick={() => canManage && onSelect('__root')}
      className="ecopro-storefront"
      style={{ minHeight: '100vh', background: bg, color: text, fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <header
        data-edit-path="layout.header"
        onClick={() => canManage && onSelect('layout.header')}
        style={{ position: 'sticky', top: 0, zIndex: 20, background: bg, borderBottom: '1px solid rgba(148,163,184,0.18)' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt={storeName} style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: 10, background: accent, display: 'grid', placeItems: 'center', color: '#04110a', fontWeight: 900 }}>F</div>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 14, letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{storeName}</div>
              <div style={{ fontSize: 12, color: muted }}>Single Product Landing</div>
            </div>
          </div>

          <button
            onClick={() => scrollTo('checkout')}
            style={{ background: accent, border: 0, borderRadius: buttonRadius, padding: '10px 14px', fontWeight: 800, cursor: 'pointer', color: '#04110a', fontSize: 13 }}
          >
            {cta}
          </button>
        </div>
      </header>

      <section
        data-edit-path="layout.hero"
        onClick={() => canManage && onSelect('layout.hero')}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.1fr 0.9fr', gap: isMobile ? 18 : 28, alignItems: 'center' }}>
          <div>
            <div data-edit-path="layout.hero.kicker" style={{ color: accent, fontWeight: 800, letterSpacing: '0.14em', fontSize: 12 }}>ONE PRODUCT • HIGH CONVERSION</div>
            <h1 data-edit-path="layout.hero.title" style={{ margin: '14px 0 0', fontSize: isMobile ? 34 : 54, lineHeight: 1.05, fontWeight: 900, letterSpacing: '-0.03em' }}>
              {heroTitle}
            </h1>
            <p data-edit-path="layout.hero.subtitle" style={{ marginTop: 14, color: muted, fontSize: isMobile ? 14 : 16, lineHeight: 1.8, maxWidth: 560 }}>
              {heroSubtitle}
            </p>

            <div style={{ marginTop: 18, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {['Cash on delivery', 'Fast delivery', 'Trusted quality'].map((t) => (
                <span key={t} style={{ border: '1px solid rgba(148,163,184,0.2)', borderRadius: 999, padding: '8px 12px', fontSize: 12, color: text, background: 'rgba(15,23,42,0.5)' }}>
                  {t}
                </span>
              ))}
            </div>

            {selectedProduct && (
              <div style={{ marginTop: 22, display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <div style={{ fontSize: isMobile ? 28 : 34, fontWeight: 900 }}>{formatPrice(Number((selectedProduct as any).price) || 0)}</div>
                <div style={{ color: muted, fontSize: 13 }}>Free shipping in select areas</div>
              </div>
            )}

            <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                data-edit-path="layout.hero.cta"
                onClick={() => scrollTo('checkout')}
                style={{ background: accent, border: 0, borderRadius: buttonRadius, padding: '14px 18px', fontWeight: 900, cursor: 'pointer', color: '#04110a' }}
              >
                {cta}
              </button>
              <button
                onClick={() => navigate('/products')}
                style={{ background: 'transparent', border: '1px solid rgba(148,163,184,0.25)', borderRadius: buttonRadius, padding: '14px 18px', fontWeight: 800, cursor: 'pointer', color: text }}
              >
                View Details
              </button>
            </div>
          </div>

          <div style={{ borderRadius: cardRadius, overflow: 'hidden', background: cardBg, border: '1px solid rgba(148,163,184,0.16)' }}>
            <div style={{ position: 'relative', aspectRatio: isMobile ? '4/3' : '1/1', background: '#0a0f1b' }}>
              <img src={productImage(mainProduct)} alt={mainProduct ? productTitle(mainProduct) : ''} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.96 }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.65) 100%)' }} />
              {selectedProduct && (
                <div style={{ position: 'absolute', left: 14, right: 14, bottom: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: 900, lineHeight: 1.2 }}>{productTitle(selectedProduct)}</div>
                  <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <div style={{ color: muted, fontSize: 12 }}>In stock • COD</div>
                    <button
                      onClick={() => scrollTo('checkout')}
                      style={{ background: accent, border: 0, borderRadius: 999, padding: '10px 12px', fontWeight: 900, cursor: 'pointer', color: '#04110a', fontSize: 12 }}
                    >
                      {cta}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="checkout" style={{ padding: `0 ${baseSpacing}px ${sectionSpacing}px` }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <EmbeddedCheckout
            storeSlug={storeSlug}
            product={selectedProduct as any}
            formatPrice={formatPrice}
            theme={checkoutTheme}
            disabled={canManage}
            heading={cta}
            subheading={canManage ? 'Disabled in editor preview' : 'Cash on delivery • Fast delivery'}
          />
        </div>
      </section>

      <section style={{ padding: `0 ${baseSpacing}px ${sectionSpacing}px` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 14 }}>
          {[{ t: 'Quick setup', d: 'Perfect for one-product sellers.' }, { t: 'Trust badges', d: 'Clear guarantees & delivery.' }, { t: 'Mobile-first', d: 'Sticky CTA for conversion.' }].map((c) => (
            <div key={c.t} style={{ background: cardBg, border: '1px solid rgba(148,163,184,0.16)', borderRadius: cardRadius, padding: 16 }}>
              <div style={{ fontWeight: 900 }}>{c.t}</div>
              <div style={{ marginTop: 6, color: muted, fontSize: 13, lineHeight: 1.7 }}>{c.d}</div>
            </div>
          ))}
        </div>
      </section>

      {(products.length > 1) && (
        <section
          data-edit-path="layout.grid"
          onClick={() => canManage && onSelect('layout.grid')}
          style={{ padding: `${sectionSpacing}px ${baseSpacing}px ${sectionSpacing * 1.4}px` }}
        >
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <h2 data-edit-path="layout.featured.title" style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>More products</h2>
            <p data-edit-path="layout.featured.subtitle" style={{ color: muted, marginTop: 6, fontSize: 13 }}>Optional upsells (shown only if you add more than one product).</p>

            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 12 }}>
              {products.slice(1, 9).map((p) => (
                <button
                  key={(p as any).id}
                  onClick={() => {
                    setSelectedProduct(p);
                    scrollTo('checkout');
                  }}
                  style={{ textAlign: 'left', background: cardBg, border: '1px solid rgba(148,163,184,0.16)', borderRadius: cardRadius, overflow: 'hidden', cursor: 'pointer', padding: 0 }}
                >
                  <div style={{ aspectRatio: '4/3', background: '#0a0f1b' }}>
                    <img src={productImage(p)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: 12 }}>
                    <div style={{ fontWeight: 900, fontSize: 13, lineHeight: 1.2 }}>{productTitle(p)}</div>
                    <div style={{ marginTop: 6, color: muted, fontSize: 12 }}>{formatPrice(Number((p as any).price) || 0)}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {!isMobile && selectedProduct && (
        <div style={{ position: 'fixed', left: 18, right: 18, bottom: 18, zIndex: 30, pointerEvents: 'none' }}>
          <div
            style={{
              pointerEvents: 'auto',
              maxWidth: 900,
              margin: '0 auto',
              background: 'rgba(2,6,23,0.78)',
              border: '1px solid rgba(148,163,184,0.18)',
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
              <div style={{ fontWeight: 900, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{productTitle(selectedProduct)}</div>
              <div style={{ color: muted, fontSize: 12 }}>{stickyPrice} • Cash on delivery</div>
            </div>
            <button
              onClick={() => scrollTo('checkout')}
              style={{ background: accent, border: 0, borderRadius: 999, padding: '10px 14px', fontWeight: 900, cursor: 'pointer', color: '#04110a' }}
            >
              {cta}
            </button>
          </div>
        </div>
      )}

      <footer data-edit-path="layout.footer" onClick={() => canManage && onSelect('layout.footer')} style={{ padding: '30px 18px', borderTop: '1px solid rgba(148,163,184,0.18)', color: muted }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12 }}>© {new Date().getFullYear()} {storeName}</div>
          <div style={{ fontSize: 12 }}>Powered by EcoPro</div>
        </div>
      </footer>
    </div>
  );
}
