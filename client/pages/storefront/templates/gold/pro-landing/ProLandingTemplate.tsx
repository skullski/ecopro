import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

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

function isRtlText(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

function parseImageList(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string' && v.trim().length > 0);
  if (typeof value !== 'string') return [];
  const trimmed = value.trim();
  if (!trimmed) return [];
  // JSON array support
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.filter((v): v is string => typeof v === 'string' && v.trim().length > 0);
    } catch {
      // fall through
    }
  }
  // Comma/newline separated
  return trimmed
    .split(/[\n,]/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

type Variant = { id: string; label: string; price?: number; original_price?: number; note?: string };

function parseVariants(value: unknown): Variant[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((v) => {
        if (!v || typeof v !== 'object') return null;
        const obj = v as any;
        const id = String(obj.id || obj.label || '').trim();
        const label = String(obj.label || obj.name || '').trim();
        if (!label) return null;
        return {
          id: id || label,
          label,
          price: typeof obj.price === 'number' ? obj.price : safePrice(obj.price),
          original_price: typeof obj.original_price === 'number' ? obj.original_price : safePrice(obj.original_price),
          note: typeof obj.note === 'string' ? obj.note : undefined,
        };
      })
      .filter(Boolean) as Variant[];
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      return parseVariants(parsed);
    } catch {
      return [];
    }
  }
  return [];
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

  const storeName = asString(settings.store_name) || 'Pro Landing';
  const heroTitle = asString(settings.template_hero_heading) || storeName;
  const heroSubtitle =
    asString(settings.template_hero_subtitle) ||
    'A professional one-product landing page optimized for mobile conversions.';

  const explicitDir = asString((settings as any).template_direction).toLowerCase();
  const autoRtl = isRtlText(`${storeName} ${heroTitle} ${heroSubtitle}`);
  const dir: 'rtl' | 'ltr' = explicitDir === 'rtl' || explicitDir === 'ltr' ? (explicitDir as any) : autoRtl ? 'rtl' : 'ltr';
  const isRtl = dir === 'rtl';

  const bg = asString(settings.template_bg_color) || '#ffffff';
  const text = asString(settings.template_text_color) || '#0f172a';
  const muted = asString(settings.template_muted_color) || '#6b7280';
  const accent = asString(settings.template_accent_color) || '#b45309';
  const cardBg = asString((settings as any).template_card_bg) || '#ffffff';
  const border = 'rgba(15,23,42,0.12)';
  const soft = 'rgba(15,23,42,0.04)';

  const cta = asString(settings.template_button_text) || (isRtl ? 'اطلب الآن' : 'Order Now');

  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 44, 24, 96);
  const cardRadius = resolveInt(settings.template_card_border_radius, 18, 0, 32);
  const buttonRadius = resolveInt((settings as any).template_button_border_radius, 14, 0, 50);

  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 12) || [];
  const mainProduct = products[0];
  const storeSlug = asString((settings as any).store_slug);
  const checkoutTheme = {
    bg,
    text,
    muted,
    accent,
    cardBg,
    border,
  };

  const mainSlug = (mainProduct as any)?.slug || '/products';
  const priceValue = mainProduct ? safePrice((mainProduct as any).price) : 0;
  const originalValue = mainProduct ? safePrice((mainProduct as any).original_price) : 0;
  const mainPrice = mainProduct ? formatPrice(priceValue) : '';
  const originalPrice = originalValue > priceValue ? formatPrice(originalValue) : '';

  const descText = (asString((settings as any).template_description_text) || asString(settings.store_description)).trim();
  const descColor = asString((settings as any).template_description_color) || muted;
  const descSize = resolveInt((settings as any).template_description_size, 15, 10, 28);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const [faqOpen, setFaqOpen] = React.useState<number | null>(0);

  const images: string[] = Array.isArray((mainProduct as any)?.images)
    ? ((mainProduct as any).images as unknown[]).filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
    : [];
  const [activeImg, setActiveImg] = React.useState<string>(() => productImage(mainProduct));
  React.useEffect(() => {
    setActiveImg(productImage(mainProduct));
  }, [mainProduct ? (mainProduct as any).id : undefined]);

  const storyImages = (() => {
    const fromSetting = parseImageList((settings as any).template_story_images);
    if (fromSetting.length) return fromSetting;
    // Fallback: use remaining product images as story strip
    return images.slice(1, 7);
  })();

  const variants = (() => {
    const parsed = parseVariants((settings as any).template_variants);
    if (parsed.length) return parsed;
    if (mainProduct && originalValue > priceValue) {
      return [
        {
          id: 'promo',
          label: isRtl ? 'عرض خاص' : 'Special Offer',
          price: priceValue,
          original_price: originalValue,
          note: isRtl ? 'كمية محدودة' : 'Limited stock',
        },
      ];
    }
    return [];
  })();
  const [selectedVariantId, setSelectedVariantId] = React.useState<string>(() => variants[0]?.id || '');
  React.useEffect(() => {
    setSelectedVariantId(variants[0]?.id || '');
  }, [variants.length]);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId) || null;
  const displayPrice = (() => {
    if (!mainProduct) return '';
    const vPrice = selectedVariant?.price;
    if (typeof vPrice === 'number' && Number.isFinite(vPrice) && vPrice > 0) return formatPrice(vPrice);
    return mainPrice;
  })();
  const displayOriginal = (() => {
    if (!mainProduct) return '';
    const vOrig = selectedVariant?.original_price;
    if (typeof vOrig === 'number' && Number.isFinite(vOrig) && vOrig > 0) {
      const vPrice = selectedVariant?.price || 0;
      if (vOrig > vPrice) return formatPrice(vOrig);
    }
    return originalPrice;
  })();

  const proofText =
    asString((settings as any).template_social_proof_text) || (isRtl ? '190 مبيع' : '190 sold');
  const ratingText = asString((settings as any).template_rating_text) || '★★★★★ 4.8';
  const badge1 = asString((settings as any).template_badge_1) || (isRtl ? 'الدفع عند الاستلام' : 'Cash on delivery');
  const badge2 = asString((settings as any).template_badge_2) || (isRtl ? 'توصيل سريع' : 'Fast delivery');
  const badge3 = asString((settings as any).template_badge_3) || (isRtl ? 'ضمان' : 'Guarantee');

  const [qty, setQty] = React.useState(1);
  const incQty = () => setQty((q) => Math.min(99, q + 1));
  const decQty = () => setQty((q) => Math.max(1, q - 1));

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
      style={{
        minHeight: '100vh',
        background: bg,
        color: text,
        fontFamily: isRtl ? 'Cairo, Inter, system-ui, sans-serif' : 'Inter, system-ui, sans-serif',
        direction: dir,
      }}
    >
      {/* Header */}
      <header
        data-edit-path="layout.header"
        onClick={() => canManage && onSelect('layout.header')}
        style={{ position: 'sticky', top: 0, zIndex: 30, background: bg, borderBottom: `1px solid ${border}` }}
      >
        <div
          style={{
            maxWidth: 1160,
            margin: '0 auto',
            padding: '12px 18px',
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
                  color: '#fff',
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
              <div style={{ fontSize: 12, color: muted }}>{isRtl ? 'صفحة منتج واحدة' : 'Single Product Landing'}</div>
            </div>
          </div>

          {!isMobile && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={(e) => {
                  stopIfManage(e);
                  scrollTo('story');
                }}
                style={{ background: 'transparent', border: `1px solid ${border}`, color: text, borderRadius: 999, padding: '8px 12px', cursor: 'pointer', fontWeight: 800, fontSize: 12 }}
              >
                {isRtl ? 'المميزات' : 'Benefits'}
              </button>
              <button
                onClick={(e) => {
                  stopIfManage(e);
                  scrollTo('reviews');
                }}
                style={{ background: 'transparent', border: `1px solid ${border}`, color: text, borderRadius: 999, padding: '8px 12px', cursor: 'pointer', fontWeight: 800, fontSize: 12 }}
              >
                {isRtl ? 'المراجعات' : 'Reviews'}
              </button>
              <button
                onClick={(e) => {
                  stopIfManage(e);
                  scrollTo('faq');
                }}
                style={{ background: 'transparent', border: `1px solid ${border}`, color: text, borderRadius: 999, padding: '8px 12px', cursor: 'pointer', fontWeight: 800, fontSize: 12 }}
              >
                {isRtl ? 'الأسئلة' : 'FAQ'}
              </button>
            </nav>
          )}

          <button
            data-edit-path="layout.hero.cta"
            onClick={(e) => {
              stopIfManage(e);
              scrollTo('checkout');
            }}
            style={{
              background: accent,
              border: 0,
              borderRadius: buttonRadius,
              padding: '10px 14px',
              fontWeight: 900,
              cursor: 'pointer',
              color: '#fff',
              fontSize: 13,
              whiteSpace: 'nowrap',
            }}
          >
            {cta}
          </button>
        </div>
      </header>

      {/* Top: product page layout (like your screenshots) */}
      <section
        data-edit-path="layout.hero"
        onClick={() => canManage && onSelect('layout.hero')}
        style={{ padding: `${Math.round(sectionSpacing * 0.7)}px ${baseSpacing}px ${sectionSpacing}px` }}
      >
        <div
          style={{
            maxWidth: 1160,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '420px 1fr',
            gap: isMobile ? 18 : 28,
            alignItems: 'center',
          }}
        >
          {/* Order card / Inline Checkout */}
          <div
            id="checkout"
            style={{
              background: cardBg,
              border: `1px solid ${border}`,
              borderRadius: cardRadius,
              padding: 14,
              position: isMobile ? 'relative' : 'sticky',
              top: 86,
            }}
          >
            <EmbeddedCheckout
              storeSlug={storeSlug}
              product={mainProduct as any}
              formatPrice={formatPrice}
              theme={checkoutTheme}
              disabled={canManage}
              heading={cta}
              subheading={canManage ? (isRtl ? 'مُعطّل في وضع التحرير' : 'Disabled in editor preview') : isRtl ? 'الدفع عند الاستلام • توصيل سريع' : 'Cash on delivery • Fast delivery'}
              dir={dir}
            />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              {[badge1, badge2, badge3].filter(Boolean).map((b) => (
                <span key={b} style={{ fontSize: 12, color: muted, border: `1px solid ${border}`, borderRadius: 999, padding: '6px 10px', background: '#fff' }}>
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Gallery */}
          <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: cardRadius, overflow: 'hidden' }}>
            <div style={{ background: '#fff' }}>
              <div style={{ position: 'relative', aspectRatio: isMobile ? '4/3' : '16/11', background: '#f3f4f6' }}>
                <img src={activeImg} alt={mainProduct ? productTitle(mainProduct) : ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              {images.length > 1 && (
                <div style={{ padding: 12, display: 'flex', gap: 10, overflowX: 'auto' }}>
                  {images.slice(0, 8).map((img) => {
                    const active = img === activeImg;
                    return (
                      <button
                        key={img}
                        onClick={(e) => {
                          stopIfManage(e);
                          setActiveImg(img);
                        }}
                        style={{
                          border: `2px solid ${active ? accent : 'transparent'}`,
                          borderRadius: 12,
                          padding: 0,
                          background: 'transparent',
                          cursor: 'pointer',
                          flex: '0 0 auto',
                        }}
                      >
                        <img src={img} alt="" style={{ width: 78, height: 62, objectFit: 'cover', borderRadius: 10, display: 'block' }} />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Story / long images (like your vertical creatives) */}
      <section id="story" style={{ padding: `0 ${baseSpacing}px ${sectionSpacing}px` }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 950 as any, fontSize: 18 }}>{isRtl ? 'لماذا تختارنا؟' : 'Why choose us?'}</div>
              <div data-edit-path="layout.hero.subtitle" style={{ marginTop: 6, color: muted, fontSize: 13 }}>
                {heroSubtitle}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 420px', gap: 16, alignItems: 'start' }}>
            <div
              data-edit-path="layout.categories"
              onClick={() => canManage && onSelect('layout.categories')}
              style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: cardRadius, padding: 18 }}
            >
              <div style={{ color: accent, fontWeight: 950 as any, fontSize: 12, letterSpacing: '0.12em' }}>
                {isRtl ? 'مميزات' : 'BENEFITS'}
              </div>
              <div style={{ marginTop: 10, color: descColor, fontSize: descSize, lineHeight: 1.95 }}>
                {descText || (canManage ? (isRtl ? 'اضغط للتعديل: اكتب قصة المنتج والفوائد.' : 'Click to edit: add product story and benefits.') : '')}
              </div>
              <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
                {[
                  isRtl ? 'جودة عالية ونتيجة ممتازة' : 'High quality with great results',
                  isRtl ? 'سهولة التركيب والاستعمال' : 'Easy to use and install',
                  isRtl ? 'توصيل سريع والدفع عند الاستلام' : 'Fast delivery + cash on delivery',
                ].map((t) => (
                  <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', border: `1px solid ${border}`, borderRadius: 14, padding: 12, background: soft }}>
                    <div style={{ width: 10, height: 10, borderRadius: 999, background: accent, marginTop: 4 }} />
                    <div style={{ fontWeight: 900, fontSize: 13 }}>{t}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {storyImages.length ? (
                storyImages.map((img) => (
                  <div key={img} style={{ borderRadius: cardRadius, overflow: 'hidden', border: `1px solid ${border}`, background: '#f3f4f6' }}>
                    <img src={img} alt="" style={{ width: '100%', height: 'auto', display: 'block' }} />
                  </div>
                ))
              ) : (
                <div style={{ borderRadius: cardRadius, border: `1px dashed ${border}`, padding: 16, color: muted, fontSize: 12 }}>
                  {isRtl
                    ? 'لإظهار صور عمودية: أضف صوراً إضافية للمنتج أو ضع روابط في template_story_images.'
                    : 'To show vertical creatives: add more product images or set template_story_images.'}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" style={{ padding: `0 ${baseSpacing}px ${sectionSpacing}px` }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ fontWeight: 950 as any, fontSize: 18 }}>{isRtl ? 'مراجعات الزبائن' : 'Customer reviews'}</div>
          <div style={{ marginTop: 6, color: muted, fontSize: 13 }}>
            {isRtl ? 'صور وتجارب حقيقية تزيد الثقة.' : 'Social proof that increases trust.'}
          </div>

          <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 12 }}>
            {[0, 1].map((idx) => (
              <div key={idx} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: cardRadius, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 999, background: soft, border: `1px solid ${border}` }} />
                    <div>
                      <div style={{ fontWeight: 950 as any, fontSize: 13 }}>{isRtl ? 'زبون' : 'Customer'} #{idx + 1}</div>
                      <div style={{ fontSize: 12, color: muted }}>{ratingText}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: muted }}>{isRtl ? 'مؤكد' : 'Verified'}</div>
                </div>
                <div style={{ marginTop: 10, color: text, fontSize: 13, lineHeight: 1.9 }}>
                  {isRtl
                    ? 'منتج رائع، جودة ممتازة والتوصيل كان سريع. أنصح به.'
                    : 'Great product, solid quality, and fast delivery. Highly recommended.'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding: `0 ${baseSpacing}px ${sectionSpacing}px` }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', background: cardBg, border: `1px solid ${border}`, borderRadius: cardRadius, padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 950 as any, fontSize: 16 }}>{isRtl ? 'الأسئلة الشائعة' : 'FAQ'}</div>
              <div style={{ marginTop: 6, color: muted, fontSize: 13 }}>
                {isRtl ? 'أجب على أهم الأسئلة قبل الشراء.' : 'Answer objections before purchase.'}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
            {[
              {
                q: isRtl ? 'كيف يكون الدفع؟' : 'How do I pay?',
                a: isRtl ? 'الدفع عند الاستلام. تدفع عند وصول المنتج.' : 'Cash on delivery (COD). You pay when you receive the product.',
              },
              {
                q: isRtl ? 'كم مدة التوصيل؟' : 'How long does delivery take?',
                a: isRtl
                  ? 'عادةً من 24 إلى 72 ساعة حسب الولاية وتوفر التوصيل.'
                  : 'Usually 24–72 hours depending on your city and delivery availability.',
              },
              {
                q: isRtl ? 'هل يوجد ضمان أو إرجاع؟' : 'Is there a warranty or return policy?',
                a: isRtl
                  ? 'نعم — ضع تفاصيل الضمان والإرجاع في قسم الوصف لزيادة الثقة.'
                  : 'Yes — add your warranty/return details in the description section for full clarity.',
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
                  style={{
                    textAlign: isRtl ? 'right' : 'left',
                    background: soft,
                    border: `1px solid ${border}`,
                    borderRadius: 14,
                    padding: 14,
                    cursor: 'pointer',
                    color: text,
                  }}
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
              background: '#ffffff',
              border: `1px solid ${border}`,
              borderRadius: 18,
              padding: '12px 14px',
              boxShadow: '0 18px 45px rgba(15,23,42,0.14)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 950 as any, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{productTitle(mainProduct)}</div>
              <div style={{ color: muted, fontSize: 12 }}>{displayPrice} • {isRtl ? 'الدفع عند الاستلام' : 'Cash on delivery'}</div>
            </div>
            <button
              onClick={() => navigate(mainSlug)}
              style={{ background: accent, border: 0, borderRadius: 999, padding: '10px 14px', fontWeight: 950 as any, cursor: 'pointer', color: '#fff' }}
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
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 12 }}>© {new Date().getFullYear()} {storeName}</div>
          <div style={{ fontSize: 12 }}>Powered by EcoPro</div>
        </div>
      </footer>
    </div>
  );
}
