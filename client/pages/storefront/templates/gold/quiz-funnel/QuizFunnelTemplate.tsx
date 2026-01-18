import React from 'react';
import type { TemplateProps, StoreProduct } from '../../types';
import EmbeddedCheckout from '../shared/EmbeddedCheckout';

/**
 * QUIZ FUNNEL - Interactive quiz-based funnel landing page.
 * Design: Step progress bar, quiz questions, personalized results.
 * ALL TEXT IS EDITABLE via settings keys.
 */

function asString(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function resolveInt(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = typeof value === 'number' ? value : parseInt(String(value || ''), 10);
  const safe = Number.isFinite(parsed) ? parsed : fallback;
  return Math.max(min, Math.min(max, safe));
}

function productImages(p: StoreProduct | undefined): string[] {
  if (!p) return ['/placeholder.png'];
  const imgs = Array.isArray((p as any).images) ? (p as any).images.filter((v: any) => typeof v === 'string' && v.trim()) : [];
  return imgs.length ? imgs : ['/placeholder.png'];
}

function safePrice(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(String(value ?? '').trim());
  return Number.isFinite(n) ? n : 0;
}

export default function QuizFunnelTemplate(props: TemplateProps) {
  const { settings, formatPrice } = props;
  const s = settings as any;
  const canManage = Boolean(props.canManage);
  const onSelect = (path: string) => {
    if (canManage && typeof (props as any).onSelect === 'function') {
      (props as any).onSelect(path);
    }
  };

  const [isMobile, setIsMobile] = React.useState((props as any).forcedBreakpoint === 'mobile');
  const [currentStep, setCurrentStep] = React.useState(0); // 0 = intro, 1-3 = questions, 4 = results
  const [answers, setAnswers] = React.useState<number[]>([]);

  React.useEffect(() => {
    const bp = (props as any).forcedBreakpoint;
    if (bp) { setIsMobile(bp === 'mobile'); return; }
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [(props as any).forcedBreakpoint]);

  // Theme colors
  const bg = asString(s.template_bg_color) || '#faf5ff';
  const text = asString(s.template_text_color) || '#1e1b4b';
  const muted = asString(s.template_muted_color) || '#6b7280';
  const accent = asString(s.template_accent_color) || '#8b5cf6';
  const cardBg = asString(s.template_card_bg) || '#ffffff';
  const border = 'rgba(0,0,0,0.06)';

  // EDITABLE Content from settings
  const storeName = asString(s.store_name) || 'Quiz Funnel';
  const heroTitle = asString(s.template_hero_heading) || 'Find Your Perfect Match';
  const heroSubtitle = asString(s.template_hero_subtitle) || 'Answer 3 quick questions and we\'ll recommend the perfect product for you.';
  const ctaText = asString(s.template_button_text) || 'Start Quiz';
  const heroKicker = asString(s.template_hero_kicker) || '30-SECOND QUIZ';

  // Quiz Questions (editable)
  const q1Title = asString(s.template_q1_title) || 'What\'s your primary goal?';
  const q1Opt1 = asString(s.template_q1_opt1) || 'Save time';
  const q1Opt2 = asString(s.template_q1_opt2) || 'Save money';
  const q1Opt3 = asString(s.template_q1_opt3) || 'Better quality';
  const q1Opt4 = asString(s.template_q1_opt4) || 'All of the above';

  const q2Title = asString(s.template_q2_title) || 'How often would you use this?';
  const q2Opt1 = asString(s.template_q2_opt1) || 'Daily';
  const q2Opt2 = asString(s.template_q2_opt2) || 'Weekly';
  const q2Opt3 = asString(s.template_q2_opt3) || 'Monthly';
  const q2Opt4 = asString(s.template_q2_opt4) || 'Occasionally';

  const q3Title = asString(s.template_q3_title) || 'What\'s most important to you?';
  const q3Opt1 = asString(s.template_q3_opt1) || 'Ease of use';
  const q3Opt2 = asString(s.template_q3_opt2) || 'Durability';
  const q3Opt3 = asString(s.template_q3_opt3) || 'Design';
  const q3Opt4 = asString(s.template_q3_opt4) || 'Price';

  // Results (editable)
  const resultTitle = asString(s.template_result_title) || '🎉 Perfect Match Found!';
  const resultSubtitle = asString(s.template_result_subtitle) || 'Based on your answers, we found the perfect product for you.';
  const resultCTA = asString(s.template_result_cta) || 'Claim Your Match';

  // Spacing
  const baseSpacing = resolveInt(s.template_spacing, 16, 8, 32);
  const sectionSpacing = resolveInt(s.template_section_spacing, 56, 24, 96);
  const cardRadius = resolveInt(s.template_card_border_radius, 16, 0, 32);
  const buttonRadius = resolveInt(s.template_button_border_radius, 12, 0, 50);

  // Products
  const products = (props.filtered?.length ? props.filtered : props.products)?.slice(0, 12) || [];
  const mainProduct = products[0];
  const images = productImages(mainProduct);
  const [activeImage, setActiveImage] = React.useState(0);

  const storeSlug = asString(s.store_slug);

  const checkoutTheme = { bg: cardBg, text, muted, accent, cardBg, border };

  const stopIfManage = (e: React.MouseEvent) => {
    if (!canManage) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const questions = [
    { title: q1Title, options: [q1Opt1, q1Opt2, q1Opt3, q1Opt4] },
    { title: q2Title, options: [q2Opt1, q2Opt2, q2Opt3, q2Opt4] },
    { title: q3Title, options: [q3Opt1, q3Opt2, q3Opt3, q3Opt4] },
  ];

  const handleAnswer = (answerIdx: number) => {
    const newAnswers = [...answers, answerIdx];
    setAnswers(newAnswers);
    setCurrentStep(currentStep + 1);
  };

  const totalSteps = questions.length + 1; // +1 for results
  const progress = currentStep === 0 ? 0 : (currentStep / totalSteps) * 100;

  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers([]);
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
        onClick={(e) => { stopIfManage(e); onSelect('layout.header'); }}
        style={{ position: 'sticky', top: 0, zIndex: 30, background: bg, borderBottom: `1px solid ${border}`, padding: isMobile ? '10px 12px' : '14px 20px' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {asString(s.store_logo) ? (
              <img src={asString(s.store_logo)} alt={storeName} style={{ width: isMobile ? 32 : 38, height: isMobile ? 32 : 38, borderRadius: 10, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: isMobile ? 32 : 38, height: isMobile ? 32 : 38, borderRadius: 10, background: accent, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: isMobile ? 14 : 16 }}>
                {storeName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <span style={{ fontWeight: 800, fontSize: isMobile ? 13 : 15 }}>{storeName}</span>
          </div>
          {currentStep > 0 && currentStep <= questions.length && (
            <div style={{ fontSize: isMobile ? 11 : 13, color: muted }}>
              Question {currentStep} of {questions.length}
            </div>
          )}
        </div>
      </header>

      {/* Progress Bar */}
      {currentStep > 0 && (
        <div style={{ background: 'rgba(0,0,0,0.05)', height: 4 }}>
          <div style={{ 
            background: accent, 
            height: '100%', 
            width: `${progress}%`, 
            transition: 'width 0.3s ease' 
          }} />
        </div>
      )}

      {/* Main Content */}
      <section
        data-edit-path="layout.hero"
        onClick={(e) => { stopIfManage(e); onSelect('layout.hero'); }}
        style={{ padding: isMobile ? `${sectionSpacing * 0.6}px ${baseSpacing}px` : `${sectionSpacing}px ${baseSpacing}px` }}
      >
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          
          {/* Step 0: Intro */}
          {currentStep === 0 && (
            <div style={{ textAlign: 'center' }}>
              <div
                data-edit-path="layout.hero.kicker"
                onClick={(e) => { stopIfManage(e); onSelect('layout.hero.kicker'); }}
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  background: `${accent}15`, 
                  padding: '8px 16px', 
                  borderRadius: 20, 
                  marginBottom: 20,
                  fontSize: isMobile ? 11 : 13,
                  fontWeight: 700,
                  color: accent,
                }}
              >
                ⏱️ {heroKicker}
              </div>

              <h1
                data-edit-path="layout.hero.title"
                onClick={(e) => { stopIfManage(e); onSelect('layout.hero.title'); }}
                style={{ fontSize: isMobile ? 28 : 44, fontWeight: 900, lineHeight: 1.15, marginBottom: 16 }}
              >
                {heroTitle}
              </h1>

              <p
                data-edit-path="layout.hero.subtitle"
                onClick={(e) => { stopIfManage(e); onSelect('layout.hero.subtitle'); }}
                style={{ fontSize: isMobile ? 14 : 18, color: muted, marginBottom: 32, lineHeight: 1.6 }}
              >
                {heroSubtitle}
              </p>

              <div
                data-edit-path="layout.hero.image"
                onClick={(e) => { stopIfManage(e); onSelect('layout.hero.image'); }}
                style={{ borderRadius: cardRadius, overflow: 'hidden', marginBottom: 32, border: `1px solid ${border}` }}
              >
                <img src={images[0]} alt="" style={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover' }} />
              </div>

              <button
                data-edit-path="layout.hero.cta"
                onClick={(e) => { stopIfManage(e); if (!canManage) setCurrentStep(1); }}
                style={{ 
                  background: accent, 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: buttonRadius, 
                  padding: isMobile ? '14px 32px' : '16px 48px', 
                  fontWeight: 700, 
                  cursor: 'pointer', 
                  fontSize: isMobile ? 14 : 16,
                  width: '100%',
                  maxWidth: 300,
                }}
              >
                {ctaText} →
              </button>
            </div>
          )}

          {/* Steps 1-3: Questions */}
          {currentStep >= 1 && currentStep <= questions.length && (
            <div
              data-edit-path="layout.categories"
              onClick={(e) => { stopIfManage(e); onSelect('layout.categories'); }}
            >
              <h2 style={{ fontSize: isMobile ? 22 : 32, fontWeight: 800, marginBottom: 24, textAlign: 'center' }}>
                {questions[currentStep - 1].title}
              </h2>

              <div style={{ display: 'grid', gap: isMobile ? 10 : 14 }}>
                {questions[currentStep - 1].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { stopIfManage(e); if (!canManage) handleAnswer(idx); }}
                    style={{
                      background: cardBg,
                      border: `2px solid ${border}`,
                      borderRadius: cardRadius,
                      padding: isMobile ? '16px 20px' : '20px 24px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: isMobile ? 14 : 16,
                      fontWeight: 600,
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!canManage) {
                        (e.target as HTMLElement).style.borderColor = accent;
                        (e.target as HTMLElement).style.background = `${accent}08`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.borderColor = border;
                      (e.target as HTMLElement).style.background = cardBg;
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ 
                        width: 24, 
                        height: 24, 
                        borderRadius: '50%', 
                        border: `2px solid ${accent}`, 
                        display: 'grid', 
                        placeItems: 'center',
                        fontSize: 12,
                        fontWeight: 700,
                        color: accent,
                      }}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      {option}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Results */}
          {currentStep > questions.length && (
            <div
              data-edit-path="layout.featured"
              onClick={(e) => { stopIfManage(e); onSelect('layout.featured'); }}
            >
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <h2
                  data-edit-path="layout.featured.title"
                  onClick={(e) => { stopIfManage(e); onSelect('layout.featured.title'); }}
                  style={{ fontSize: isMobile ? 24 : 36, fontWeight: 900, marginBottom: 12 }}
                >
                  {resultTitle}
                </h2>
                <p style={{ fontSize: isMobile ? 14 : 16, color: muted }}>{resultSubtitle}</p>
              </div>

              {/* Product */}
              <div style={{ 
                background: cardBg, 
                borderRadius: cardRadius, 
                overflow: 'hidden', 
                border: `1px solid ${border}`,
                marginBottom: 24,
              }}>
                <div
                  data-edit-path="layout.hero.image"
                  onClick={(e) => { stopIfManage(e); onSelect('layout.hero.image'); }}
                >
                  <img src={images[activeImage] || images[0]} alt="" style={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover' }} />
                  {images.length > 1 && (
                    <div style={{ padding: 10, display: 'flex', gap: 8, overflowX: 'auto', background: 'rgba(0,0,0,0.02)' }}>
                      {images.slice(0, 10).map((img, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => { stopIfManage(e); setActiveImage(idx); }}
                          style={{
                            flex: '0 0 auto',
                            width: isMobile ? 44 : 54,
                            height: isMobile ? 44 : 54,
                            borderRadius: 8,
                            border: idx === activeImage ? `2px solid ${accent}` : `1px solid ${border}`,
                            padding: 0,
                            background: 'transparent',
                            cursor: 'pointer',
                            overflow: 'hidden',
                          }}
                        >
                          <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Match score */}
              <div
                data-edit-path="layout.hero.badge"
                onClick={(e) => { stopIfManage(e); onSelect('layout.hero.badge'); }}
                style={{ 
                  background: `linear-gradient(135deg, ${accent}15, ${accent}05)`,
                  border: `1px solid ${accent}30`,
                  borderRadius: cardRadius,
                  padding: isMobile ? 16 : 20,
                  textAlign: 'center',
                  marginBottom: 24,
                }}
              >
                <div style={{ fontSize: isMobile ? 11 : 13, color: muted, marginBottom: 4 }}>Your Match Score</div>
                <div style={{ fontSize: isMobile ? 32 : 44, fontWeight: 900, color: accent }}>98%</div>
                <div style={{ fontSize: isMobile ? 12 : 14, color: text }}>Perfect for your needs!</div>
              </div>

              <EmbeddedCheckout
                storeSlug={storeSlug}
                product={mainProduct as any}
                formatPrice={formatPrice}
                theme={checkoutTheme}
                disabled={canManage}
                heading={resultCTA}
                subheading={canManage ? 'Disabled in editor' : (asString(s.template_checkout_subheading) || '✨ Personalized recommendation')}
              />

              <button
                onClick={(e) => { stopIfManage(e); if (!canManage) resetQuiz(); }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: muted,
                  cursor: 'pointer',
                  fontSize: isMobile ? 12 : 14,
                  marginTop: 16,
                  width: '100%',
                  textAlign: 'center',
                }}
              >
                ← Retake Quiz
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer
        data-edit-path="layout.footer"
        onClick={(e) => { stopIfManage(e); onSelect('layout.footer'); }}
        style={{ borderTop: `1px solid ${border}`, padding: `${baseSpacing * 1.5}px ${baseSpacing}px`, textAlign: 'center' }}
      >
        <p
          data-edit-path="layout.footer.copyright"
          onClick={(e) => { stopIfManage(e); onSelect('layout.footer.copyright'); }}
          style={{ fontSize: isMobile ? 11 : 13, color: muted }}
        >
          {asString(s.template_copyright) || `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`}
        </p>
      </footer>
    </div>
  );
}
