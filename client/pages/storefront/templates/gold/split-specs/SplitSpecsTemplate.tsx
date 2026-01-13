import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';

/**
 * SPLIT SPECS - Single product template with spec/FAQ emphasis.
 * Features: Clean split layout, specs list, FAQ blocks, optional upsells.
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

export default function SplitSpecsTemplate(props: TemplateProps) {
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
    const check = () => setIsMobile(window.innerWidth < 960);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [(props as any).forcedBreakpoint]);

  const bg = asString(settings.template_bg_color) || '#ffffff';
  const text = asString(settings.template_text_color) || '#0f172a';
  const muted = asString(settings.template_muted_color) || '#475569';
  const accent = asString(settings.template_accent_color) || '#2563eb';

  const storeName = asString(settings.store_name) || 'Split Specs';
  const heroTitle = asString(settings.template_hero_heading) || 'Everything you need. Nothing you don\'t.';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'A one-product page designed around details, trust, and clarity.';
  const cta = asString(settings.template_button_text) || 'Order Now';

  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 12) || [];
  const mainProduct = products[0];

  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 56, 24, 96);
  const cardRadius = resolveInt(settings.template_card_border_radius, 14, 0, 32);

  const specRows: Array<[string, string]> = [
    ['Shipping', 'Fast delivery'],
    ['Payment', 'Cash on delivery'],
    ['Support', 'WhatsApp available'],
    ['Returns', 'Easy returns policy'],
  ];

  const faqs: Array<{ q: string; a: string }> = [
    { q: 'When do I pay?', a: 'You pay when the delivery arrives (cash on delivery).' },
    { q: 'How long is delivery?', a: 'Delivery time depends on your city. Most orders arrive quickly.' },
    { q: 'Is it original?', a: 'Add your authenticity statement in the description section.' },
  ];

  return (
    <div
      data-edit-path="__root"
      onClick={() => canManage && onSelect('__root')}
      className="ecopro-storefront"
      style={{ minHeight: '100vh', background: bg, color: text, fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif' }}
    >
      <header
        data-edit-path="layout.header"
        onClick={() => canManage && onSelect('layout.header')}
        style={{ borderBottom: '1px solid #e2e8f0', background: '#fff', position: 'sticky', top: 0, zIndex: 20 }}
      >
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt={storeName} style={{ width: 34, height: 34, borderRadius: 10, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 34, height: 34, borderRadius: 10, background: '#0f172a', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900 }}>S</div>
            )}
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 900, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{storeName}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Single Product</div>
            </div>
          </div>
          <button
            onClick={() => navigate(mainProduct?.slug || '/products')}
            style={{ background: accent, border: 0, borderRadius: 999, padding: '10px 14px', color: '#fff', fontWeight: 900, cursor: 'pointer', fontSize: 13 }}
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
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '0.95fr 1.05fr', gap: isMobile ? 18 : 30, alignItems: 'start' }}>
          <div>
            <h1 data-edit-path="layout.hero.title" style={{ margin: 0, fontSize: isMobile ? 30 : 42, lineHeight: 1.12, fontWeight: 950, letterSpacing: '-0.02em' }}>
              {heroTitle}
            </h1>
            <p data-edit-path="layout.hero.subtitle" style={{ marginTop: 14, color: muted, fontSize: 14, lineHeight: 1.9, maxWidth: 520 }}>
              {heroSubtitle}
            </p>

            {mainProduct && (
              <div style={{ marginTop: 18, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ fontSize: 28, fontWeight: 950 }}>{formatPrice(Number((mainProduct as any).price) || 0)}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>COD • Fast delivery</div>
              </div>
            )}

            <div style={{ marginTop: 18, border: '1px solid #e2e8f0', borderRadius: cardRadius, overflow: 'hidden' }}>
              {specRows.map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '12px 14px', borderTop: '1px solid #e2e8f0' }}>
                  <div style={{ color: '#64748b', fontSize: 13 }}>{k}</div>
                  <div style={{ fontWeight: 800, fontSize: 13 }}>{v}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                data-edit-path="layout.hero.cta"
                onClick={() => navigate(mainProduct?.slug || '/products')}
                style={{ background: accent, border: 0, borderRadius: 999, padding: '12px 16px', color: '#fff', fontWeight: 950, cursor: 'pointer' }}
              >
                {cta}
              </button>
              <button
                onClick={() => navigate('/products')}
                style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: 999, padding: '12px 16px', color: text, fontWeight: 900, cursor: 'pointer' }}
              >
                View product page
              </button>
            </div>
          </div>

          <div style={{ borderRadius: cardRadius, overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <div style={{ aspectRatio: isMobile ? '4/3' : '1/1' }}>
              <img src={productImage(mainProduct)} alt={mainProduct ? productTitle(mainProduct) : ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            {mainProduct && (
              <div style={{ padding: 14, background: '#fff' }}>
                <div style={{ fontWeight: 950 }}>{productTitle(mainProduct)}</div>
                <div style={{ marginTop: 6, color: '#64748b', fontSize: 13 }}>High-quality • COD • Support</div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section style={{ padding: `0 ${baseSpacing}px ${sectionSpacing}px` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
          {faqs.map((f) => (
            <div key={f.q} style={{ border: '1px solid #e2e8f0', borderRadius: cardRadius, padding: 16, background: '#fff' }}>
              <div style={{ fontWeight: 950 }}>{f.q}</div>
              <div style={{ marginTop: 8, color: muted, fontSize: 13, lineHeight: 1.8 }}>{f.a}</div>
            </div>
          ))}
        </div>
      </section>

      {products.length > 1 && (
        <section data-edit-path="layout.grid" onClick={() => canManage && onSelect('layout.grid')} style={{ padding: `${sectionSpacing}px ${baseSpacing}px ${sectionSpacing * 1.4}px` }}>
          <div style={{ maxWidth: 1180, margin: '0 auto' }}>
            <h2 data-edit-path="layout.featured.title" style={{ margin: 0, fontSize: 18, fontWeight: 950 }}>More products</h2>
            <p data-edit-path="layout.featured.subtitle" style={{ marginTop: 6, color: muted, fontSize: 13 }}>Shown only when you add extra products.</p>

            <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 12 }}>
              {products.slice(1, 9).map((p) => (
                <button
                  key={(p as any).id}
                  onClick={() => navigate((p as any).slug || '/products')}
                  style={{ textAlign: 'left', background: '#fff', border: '1px solid #e2e8f0', borderRadius: cardRadius, overflow: 'hidden', cursor: 'pointer', padding: 0 }}
                >
                  <div style={{ aspectRatio: '4/3', background: '#f1f5f9' }}>
                    <img src={productImage(p)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: 12 }}>
                    <div style={{ fontWeight: 950, fontSize: 13, lineHeight: 1.2 }}>{productTitle(p)}</div>
                    <div style={{ marginTop: 6, color: '#64748b', fontSize: 12 }}>{formatPrice(Number((p as any).price) || 0)}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer data-edit-path="layout.footer" onClick={() => canManage && onSelect('layout.footer')} style={{ borderTop: '1px solid #e2e8f0', padding: '26px 18px', color: '#64748b' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12 }}>© {new Date().getFullYear()} {storeName}</div>
          <div style={{ fontSize: 12 }}>Powered by EcoPro</div>
        </div>
      </footer>
    </div>
  );
}
