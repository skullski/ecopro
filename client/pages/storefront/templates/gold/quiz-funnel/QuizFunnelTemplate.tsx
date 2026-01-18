import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * QUIZ FUNNEL - Interactive quiz-based landing page that guides users to products.
 * Design: Step-by-step quiz, progress bar, personalized results, gamified experience.
 */

function asString(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function resolveInt(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = typeof value === 'number' ? value : parseInt(String(value || ''), 10);
  const safe = Number.isFinite(parsed) ? parsed : fallback;
  return Math.max(min, Math.min(max, safe));
}

function productImage(p: StoreProduct | undefined): string {
  if (!p) return '/placeholder.png';
  const img = Array.isArray((p as any).images) ? (p as any).images.find(Boolean) : undefined;
  return typeof img === 'string' && img ? img : '/placeholder.png';
}

export default function QuizFunnelTemplate(props: TemplateProps) {
  const { settings, formatPrice } = props;
  const canManage = Boolean(props.canManage);
  const onSelect = (path: string) => {
    if (canManage && typeof (props as any).onSelect === 'function') {
      (props as any).onSelect(path);
    }
  };

  const [isMobile, setIsMobile] = React.useState((props as any).forcedBreakpoint === 'mobile');
  React.useEffect(() => {
    const bp = (props as any).forcedBreakpoint;
    if (bp) { setIsMobile(bp === 'mobile'); return; }
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [(props as any).forcedBreakpoint]);

  // Theme - Friendly teal/green
  const bg = asString(settings.template_bg_color) || '#f0fdf4';
  const text = asString(settings.template_text_color) || '#0f172a';
  const muted = asString(settings.template_muted_color) || '#64748b';
  const accent = asString(settings.template_accent_color) || '#059669';
  const cardBg = asString((settings as any).template_card_bg) || '#ffffff';
  const border = 'rgba(0,0,0,0.06)';

  // Content
  const storeName = asString(settings.store_name) || 'Find Your Match';
  const heroTitle = asString(settings.template_hero_heading) || 'Discover Your Perfect Product';
  const heroSubtitle = asString(settings.template_hero_subtitle) || 'Take our quick 30-second quiz to find the product that\'s made just for you!';
  const ctaText = asString(settings.template_button_text) || 'Start Quiz';

  // Spacing
  const baseSpacing = resolveInt(settings.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(settings.template_section_spacing, 60, 24, 96);
  const cardRadius = resolveInt(settings.template_card_border_radius, 20, 0, 32);

  // Products
  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 12) || [];
  const mainProduct = products[0];
  const storeSlug = asString((settings as any).store_slug);

  const checkoutTheme = { bg, text, muted, accent, cardBg, border };

  // Quiz state
  const [quizStep, setQuizStep] = React.useState(0); // 0 = intro, 1-3 = questions, 4 = result
  const [answers, setAnswers] = React.useState<number[]>([]);

  const questions = [
    {
      q: 'What matters most to you?',
      options: ['Quality & Durability', 'Value for Money', 'Style & Design', 'Fast Delivery'],
    },
    {
      q: 'How often will you use this?',
      options: ['Daily', 'Weekly', 'Occasionally', 'For special occasions'],
    },
    {
      q: 'What\'s your budget?',
      options: ['Under $50', '$50 - $100', '$100 - $200', 'No limit'],
    },
  ];

  const stopIfManage = (e: React.MouseEvent) => {
    if (!canManage) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const handleAnswer = (answerIndex: number) => {
    if (canManage) return;
    setAnswers([...answers, answerIndex]);
    setQuizStep(quizStep + 1);
  };

  const resetQuiz = () => {
    setQuizStep(0);
    setAnswers([]);
  };

  return (
    <div
      data-edit-path="__root"
      onClick={() => canManage && onSelect('__root')}
      className="ecopro-storefront"
      style={{ minHeight: '100vh', background: bg, color: text, fontFamily: 'system-ui, sans-serif' }}
    >
      {/* Header */}
      <header
        data-edit-path="layout.header"
        onClick={(e) => { stopIfManage(e); onSelect('layout.header'); }}
        style={{ padding: '16px 20px', background: cardBg, borderBottom: `1px solid ${border}` }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {asString(settings.store_logo) ? (
              <img src={asString(settings.store_logo)} alt={storeName} style={{ width: 40, height: 40, borderRadius: 12, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 40, height: 40, borderRadius: 12, background: accent, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 20 }}>
                ?
              </div>
            )}
            <span style={{ fontWeight: 800, fontSize: 16 }}>{storeName}</span>
          </div>
          <span style={{ fontSize: 13, color: muted }}>🎯 Takes only 30 seconds</span>
        </div>
      </header>

      {/* Progress Bar */}
      {quizStep > 0 && quizStep < 4 && (
        <div style={{ background: cardBg, padding: '16px 20px', borderBottom: `1px solid ${border}` }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12, color: muted }}>
              <span>Question {quizStep} of 3</span>
              <span>{Math.round((quizStep / 3) * 100)}% Complete</span>
            </div>
            <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${(quizStep / 3) * 100}%`,
                  height: '100%',
                  background: accent,
                  borderRadius: 3,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Quiz Content */}
      <section
        data-edit-path="layout.hero"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero'); }}
        style={{ padding: `${sectionSpacing}px ${baseSpacing}px`, minHeight: 'calc(100vh - 200px)', display: 'flex', alignItems: 'center' }}
      >
        <div style={{ maxWidth: 700, margin: '0 auto', width: '100%' }}>
          {/* Intro */}
          {quizStep === 0 && (
            <div style={{ textAlign: 'center' }}>
              <div
                data-edit-path="layout.hero.badge"
                onClick={(e) => { stopIfManage(e); onSelect('layout.hero.badge'); }}
                style={{ display: 'inline-block', background: `${accent}15`, color: accent, padding: '10px 20px', borderRadius: 999, fontSize: 14, fontWeight: 700, marginBottom: 24 }}
              >
                🎯 Personalized Product Match
              </div>

              <h1
                data-edit-path="layout.hero.title"
                onClick={(e) => { stopIfManage(e); onSelect('layout.hero.title'); }}
                style={{ fontSize: isMobile ? 32 : 48, fontWeight: 900, lineHeight: 1.1, marginBottom: 16 }}
              >
                {heroTitle}
              </h1>

              <p
                data-edit-path="layout.hero.subtitle"
                onClick={(e) => { stopIfManage(e); onSelect('layout.hero.subtitle'); }}
                style={{ fontSize: 17, color: muted, lineHeight: 1.6, marginBottom: 40 }}
              >
                {heroSubtitle}
              </p>

              <div
                data-edit-path="layout.hero.image"
                onClick={(e) => { stopIfManage(e); onSelect('layout.hero.image'); }}
                style={{ display: 'flex', justifyContent: 'center', gap: -20, marginBottom: 40 }}
              >
                {products.slice(0, 3).map((p, i) => (
                  <div
                    key={p.id}
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '4px solid #fff',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      marginLeft: i > 0 ? -20 : 0,
                      zIndex: 3 - i,
                    }}
                  >
                    <img src={productImage(p)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>

              <button
                data-edit-path="layout.hero.cta"
                onClick={(e) => {
                  stopIfManage(e);
                  if (!canManage) setQuizStep(1);
                  onSelect('layout.hero.cta');
                }}
                style={{
                  background: accent,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 999,
                  padding: '18px 48px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontSize: 16,
                  boxShadow: `0 4px 20px ${accent}40`,
                }}
              >
                {ctaText} →
              </button>

              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 24, fontSize: 13, color: muted }}>
                <span>⏱ 30 seconds</span>
                <span>📊 98% match rate</span>
                <span>🎁 Free results</span>
              </div>
            </div>
          )}

          {/* Questions */}
          {quizStep > 0 && quizStep < 4 && (
            <div style={{ background: cardBg, borderRadius: cardRadius, padding: isMobile ? 24 : 40, boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
              <h2 style={{ fontSize: 24, fontWeight: 900, textAlign: 'center', marginBottom: 32 }}>
                {questions[quizStep - 1].q}
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 16 }}>
                {questions[quizStep - 1].options.map((option, i) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(i)}
                    style={{
                      background: 'transparent',
                      border: `2px solid ${border}`,
                      borderRadius: cardRadius - 8,
                      padding: 20,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => !canManage && (e.currentTarget.style.borderColor = accent)}
                    onMouseLeave={(e) => !canManage && (e.currentTarget.style.borderColor = String(border))}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        border: `2px solid ${muted}`,
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 12,
                        fontWeight: 700,
                        color: muted,
                      }}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span style={{ fontSize: 15, fontWeight: 600 }}>{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {quizStep === 4 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 60, marginBottom: 16 }}>🎉</div>
              <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
                We Found Your Perfect Match!
              </h2>
              <p style={{ color: muted, marginBottom: 32 }}>
                Based on your answers, we've found the ideal product for you
              </p>

              <div style={{ background: cardBg, borderRadius: cardRadius, padding: 24, marginBottom: 24, boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexDirection: isMobile ? 'column' : 'row', textAlign: isMobile ? 'center' : 'left' }}>
                  <img src={productImage(mainProduct)} alt="" style={{ width: 120, height: 120, borderRadius: cardRadius - 4, objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'inline-block', background: `${accent}15`, color: accent, padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                      98% Match
                    </div>
                    <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>{mainProduct?.name || 'Perfect Product'}</h3>
                    <div style={{ fontSize: 24, fontWeight: 900, color: accent }}>
                      {mainProduct ? formatPrice(mainProduct.price) : '$99.00'}
                    </div>
                  </div>
                </div>
              </div>

              <EmbeddedCheckout
                storeSlug={storeSlug}
                product={mainProduct as any}
                formatPrice={formatPrice}
                theme={checkoutTheme}
                disabled={canManage}
                heading="Get Your Match"
                subheading={canManage ? 'Disabled in editor' : '✨ Personalized just for you'}
              />

              <button
                onClick={resetQuiz}
                style={{
                  marginTop: 24,
                  background: 'transparent',
                  border: 'none',
                  color: muted,
                  cursor: 'pointer',
                  fontSize: 14,
                  textDecoration: 'underline',
                }}
              >
                Retake Quiz
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Social Proof (only on intro) */}
      {quizStep === 0 && (
        <section
          data-edit-path="layout.featured"
          onClick={(e) => { stopIfManage(e); onSelect('layout.featured'); }}
          style={{ padding: `${sectionSpacing * 0.5}px ${baseSpacing}px`, background: cardBg, borderTop: `1px solid ${border}` }}
        >
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
            <h2
              data-edit-path="layout.featured.title"
              onClick={(e) => { stopIfManage(e); onSelect('layout.featured.title'); }}
              style={{ fontSize: 20, fontWeight: 800, marginBottom: 24 }}
            >
              Join 50,000+ Happy Customers
            </h2>
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 40 }}>
              {[
                { val: '50K+', label: 'Quiz Takers' },
                { val: '4.9★', label: 'Rating' },
                { val: '98%', label: 'Match Rate' },
              ].map((stat) => (
                <div key={stat.label}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: accent }}>{stat.val}</div>
                  <div style={{ fontSize: 13, color: muted }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={(e) => { stopIfManage(e); onSelect('layout.footer'); }}
        style={{ borderTop: `1px solid ${border}`, padding: `${baseSpacing * 1.5}px ${baseSpacing}px`, textAlign: 'center', background: cardBg }}
      >
        <p
          data-edit-path="layout.footer.copyright"
          onClick={(e) => { stopIfManage(e); onSelect('layout.footer.copyright'); }}
          style={{ fontSize: 13, color: muted }}
        >
          {asString((settings as any).template_copyright) || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`}
        </p>
      </footer>
    </div>
  );
}
