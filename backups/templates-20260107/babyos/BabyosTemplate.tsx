import React from 'react';
import type { TemplateProps } from '../../types';
import type {
  HeaderNode,
  HeroNode,
  ProductGridNode,
  ProductNode,
  FooterNode,
} from './schema-types';
import { buildUniversalSchemaFromSettingsAndProducts, looksLikeUniversalStoreSchema } from '@/lib/storeSchema';
import { resolveResponsiveNumber, type Breakpoint } from '../shiro-hana/responsive';

/* ═══════════════════════════════════════════════════════════════════════════
   BABYOS TEMPLATE - Fully editable colors and text
   ═══════════════════════════════════════════════════════════════════════════ */

// Default color palette
const DEFAULTS = {
  bg: '#FDF8F3',
  accent: '#F97316',
  text: '#1C1917',
  muted: '#78716C',
  mutedLight: '#A8A29E',
  border: '#E7E5E4',
  borderLight: '#F5F5F4',
  cardBg: '#FFFFFF',
  gradientStart: '#FDEBD0',
  gradientMid: '#FDF6E9',
  gradientEnd: '#E8F4F8',
  // New defaults
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontWeight: '400',
  borderRadius: '8',
  spacing: '16',
  animationSpeed: '200',
  gridColumns: '4',
  categoryPillBg: '#F5F5F4',
  categoryPillText: '#78716C',
  categoryPillActiveBg: '#F97316',
  categoryPillActiveText: '#FFFFFF',
};

// Social link type
interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

// Navigation link type
interface NavLink {
  label: string;
  url: string;
}

// Theme context to pass colors through components
interface ThemeColors {
  bg: string;
  accent: string;
  text: string;
  muted: string;
  mutedLight: string;
  border: string;
  borderLight: string;
  cardBg: string;
  headerBg: string;
  headerText: string;
  heroTitleColor: string;
  heroTitleSize: string;
  heroSubtitleColor: string;
  heroSubtitleSize: string;
  heroKickerColor: string;
  sectionTitleColor: string;
  sectionTitleSize: string;
  sectionSubtitleColor: string;
  productTitleColor: string;
  productPriceColor: string;
  footerText: string;
  footerLinkColor: string;
  // New theme properties
  fontFamily: string;
  fontWeight: string;
  headingFontWeight: string;
  borderRadius: string;
  cardBorderRadius: string;
  buttonBorderRadius: string;
  spacing: string;
  sectionSpacing: string;
  animationSpeed: string;
  hoverScale: string;
  gridColumns: string;
  gridGap: string;
  categoryPillBg: string;
  categoryPillText: string;
  categoryPillActiveBg: string;
  categoryPillActiveText: string;
  categoryPillBorderRadius: string;
  customCss: string;
  socialLinks: SocialLink[];
  navLinks: NavLink[];
}

type ResponsiveInfo = {
  width: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoint: 'mobile' | 'tablet' | 'desktop';
};

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function resolveAssetUrl(assetKey: string, overrides: Record<string, string>, assets: Record<string, any>): string {
  const direct = asString(overrides[assetKey]);
  if (direct) return direct;
  if (/^https?:\/\//i.test(assetKey)) return assetKey;
  if (assetKey.startsWith('/')) return assetKey;
  const url = asString(assets?.[assetKey]?.url) || `/assets/${assetKey}`;
  if (/example\.com/i.test(url)) return '/placeholder.png';
  return url || '/placeholder.png';
}

function clamp01(v: unknown, fallback = 0.5): number {
  const n = typeof v === 'number' ? v : fallback;
  return Math.max(0, Math.min(1, n));
}

/* ═══════════════════════════════════════════════════════════════════════════
   HEADER - Fully editable
   Logo left, Nav links center, Search + Cart right
   ═══════════════════════════════════════════════════════════════════════════ */
function Header({ storeName, logoUrl, theme, onSelect }: { storeName: string; logoUrl?: string; theme: ThemeColors; onSelect: (p: string) => void }) {
  const [logoError, setLogoError] = React.useState(false);
  const [lastLogoUrl, setLastLogoUrl] = React.useState(logoUrl);
  
  // Reset error state when logoUrl changes
  if (logoUrl !== lastLogoUrl) {
    setLastLogoUrl(logoUrl);
    setLogoError(false);
  }
  
  const showLogo = logoUrl && logoUrl.trim() !== '' && !logoError;
  const displayName = storeName && storeName.trim() !== '' ? storeName : 'YOUR STORE';
  const navLinks = theme.navLinks || [];
  
  return (
    <header
      style={{ backgroundColor: theme.headerBg }}
      data-edit-path="layout.header"
      onClick={() => onSelect('layout.header')}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
          {/* Logo + Store Name */}
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '120px' }}
            data-edit-path="layout.header.logo"
            onClick={(e) => { e.stopPropagation(); onSelect('layout.header.logo'); }}
          >
            {showLogo && (
              <img 
                src={logoUrl} 
                alt={displayName} 
                style={{ 
                  height: '40px', 
                  width: '40px', 
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: `2px solid ${theme.accent}`
                }}
                onError={() => setLogoError(true)}
              />
            )}
            <span style={{ color: theme.headerText, fontWeight: theme.headingFontWeight as any, fontSize: '14px', letterSpacing: '0.08em' }}>
              {displayName}
            </span>
          </div>

          {/* Navigation Links (center) */}
          {navLinks.length > 0 && (
            <nav
              style={{ display: 'flex', alignItems: 'center', gap: '24px' }}
              data-edit-path="layout.header.nav"
              onClick={(e) => { e.stopPropagation(); onSelect('layout.header.nav'); }}
            >
              {navLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  style={{
                    color: theme.headerText,
                    fontSize: '11px',
                    fontWeight: 500,
                    letterSpacing: '0.08em',
                    textDecoration: 'none',
                    transition: `opacity ${theme.animationSpeed}ms ease`,
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.opacity = '0.7')}
                  onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  {link.label.toUpperCase()}
                </a>
              ))}
            </nav>
          )}

          {/* Right side - Search + Cart */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ color: theme.mutedLight, fontSize: '11px', letterSpacing: '0.1em', fontWeight: 500 }}>SEARCH</span>
            <span style={{ color: theme.border }}>|</span>
            <span style={{ color: theme.mutedLight, fontSize: '11px', letterSpacing: '0.1em', fontWeight: 500 }}>CART (0)</span>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HERO SECTION - Fully editable colors and text
   Left: gradient card with content
   Right: image with floating product card
   ═══════════════════════════════════════════════════════════════════════════ */
function Hero({ node, responsive, theme, onSelect, resolveAsset, settings }: any) {
  const hero: HeroNode = node || ({} as any);
  const bp = responsive.breakpoint as Breakpoint;
  const resolveNumber = (v: any): number | undefined => resolveResponsiveNumber(v, bp);

  const title = hero?.title?.value || 'A soft, modern universe for every little moment.';
  const subtitle = hero?.subtitle?.value || 'Shop cuddly toys, cozy essentials, nursery finds and tiny gifts — curated for newborns and toddlers in one balanced, playful store.';
  const kicker = settings?.template_hero_kicker || (hero as any)?.kicker?.value || 'NEW SEASON • SOFT & PLAYFUL';

  const img = hero?.image;
  const imgSrc = img?.assetKey ? resolveAsset(img.assetKey) : '/placeholder.png';
  const posX = clamp01(resolveNumber((img as any)?.posX), 0.5);
  const posY = clamp01(resolveNumber((img as any)?.posY), 0.5);

  const ctas = Array.isArray(hero?.cta) ? hero.cta : [];
  const primaryBtnText = settings?.template_button_text || ctas[0]?.label?.value || 'SHOP BABY ESSENTIALS';
  const secondaryBtnText = settings?.template_button2_text || ctas[1]?.label?.value || 'VIEW ALL TOYS';

  const titleSize = settings?.template_hero_title_size || (responsive.isDesktop ? '32' : '24');
  const subtitleSize = settings?.template_hero_subtitle_size || '13';

  return (
    <section
      style={{ backgroundColor: theme.bg, padding: responsive.isDesktop ? '32px 0' : '20px 0' }}
      data-edit-path="layout.hero"
      onClick={() => onSelect('layout.hero')}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: responsive.isDesktop ? '1.1fr 0.9fr' : '1fr',
          gap: '20px',
        }}>
          {/* Left Content Card - Gradient background */}
          <div
            style={{
              background: `linear-gradient(135deg, ${DEFAULTS.gradientStart} 0%, ${DEFAULTS.gradientMid} 40%, ${DEFAULTS.gradientEnd} 100%)`,
              borderRadius: '24px',
              padding: responsive.isDesktop ? '32px' : '24px',
            }}
          >
            {/* Kicker Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(255,255,255,0.8)',
                border: `1px solid ${theme.border}`,
                borderRadius: '100px',
                padding: '6px 12px',
                marginBottom: '16px',
              }}
              data-edit-path="layout.hero.kicker"
              onClick={(e) => { e.stopPropagation(); onSelect('layout.hero.kicker'); }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: theme.accent }} />
              <span style={{ fontSize: '9px', fontWeight: 500, letterSpacing: '0.12em', color: theme.heroKickerColor }}>
                {kicker}
              </span>
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: `${titleSize}px`,
                fontWeight: 600,
                lineHeight: 1.2,
                color: theme.heroTitleColor,
                marginBottom: '12px',
                maxWidth: '400px',
              }}
              data-edit-path="layout.hero.title"
              onClick={(e) => { e.stopPropagation(); onSelect('layout.hero.title'); }}
            >
              {title}
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: `${subtitleSize}px`,
                lineHeight: 1.6,
                color: theme.heroSubtitleColor,
                marginBottom: '20px',
                maxWidth: '380px',
              }}
              data-edit-path="layout.hero.subtitle"
              onClick={(e) => { e.stopPropagation(); onSelect('layout.hero.subtitle'); }}
            >
              {subtitle}
            </p>

            {/* Age Filter Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
              {['0-6 MONTHS', '6-12 MONTHS', '1-3 YEARS'].map((age, i) => (
                <button
                  key={age}
                  style={{
                    backgroundColor: i === 0 ? '#FEF3C7' : theme.cardBg,
                    border: `1px solid ${i === 0 ? '#F59E0B' : theme.border}`,
                    borderRadius: '100px',
                    padding: '8px 16px',
                    fontSize: '10px',
                    fontWeight: 500,
                    letterSpacing: '0.05em',
                    color: theme.text,
                    cursor: 'pointer',
                  }}
                >
                  {age}
                </button>
              ))}
            </div>

            {/* CTA Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
              <a
                href="#"
                style={{
                  display: 'inline-block',
                  backgroundColor: theme.accent,
                  border: 'none',
                  borderRadius: '100px',
                  padding: '12px 20px',
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                }}
                data-edit-path="layout.hero.cta.0.label"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelect('layout.hero.cta.0.label'); }}
              >
                {primaryBtnText}
              </a>
              <a
                href="#"
                style={{
                  display: 'inline-block',
                  backgroundColor: 'transparent',
                  border: `1px solid ${settings?.template_button2_border || theme.border}`,
                  borderRadius: '100px',
                  padding: '12px 20px',
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  color: theme.text,
                  textDecoration: 'none',
                }}
                data-edit-path="layout.hero.cta.1.label"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onSelect('layout.hero.cta.1.label'); }}
              >
                {secondaryBtnText}
              </a>
            </div>

            {/* Bottom emoji icons row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '10px', color: theme.mutedLight, marginRight: '4px' }}>◎</span>
              {['🧸', '👕', '🍼', '🛒', '🛏️', '🛁'].map((emoji, i) => (
                <span
                  key={i}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: theme.cardBg,
                    border: `1px solid ${theme.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                  }}
                >
                  {emoji}
                </span>
              ))}
              <span style={{ fontSize: '10px', color: theme.mutedLight, marginLeft: '4px' }}>◎</span>
            </div>
          </div>

          {/* Right Image/Video Card */}
          <div
            style={{
              position: 'relative',
              borderRadius: '24px',
              overflow: 'hidden',
              backgroundColor: theme.borderLight,
              minHeight: responsive.isDesktop ? '100%' : '280px',
            }}
            data-edit-path="layout.hero.image"
            onClick={(e) => { e.stopPropagation(); onSelect('layout.hero.image'); }}
          >
            {/* Video or Image based on hero_video_url */}
            {settings?.hero_video_url ? (
              <video
                src={settings.hero_video_url}
                autoPlay
                muted
                loop
                playsInline
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <img
                src={imgSrc}
                alt=""
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: `${Math.round(posX * 100)}% ${Math.round(posY * 100)}%`,
                }}
                onError={(e) => { if (!e.currentTarget.src.endsWith('/placeholder.png')) e.currentTarget.src = '/placeholder.png'; }}
              />
            )}

            {/* Floating Product Card - Bottom left */}
            <div
              style={{
                position: 'absolute',
                left: '16px',
                bottom: '16px',
                backgroundColor: 'rgba(255,255,255,0.97)',
                borderRadius: '16px',
                padding: '12px',
                maxWidth: '180px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
              data-edit-path="layout.hero.badge"
              onClick={(e) => { e.stopPropagation(); onSelect('layout.hero.badge'); }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span
                  style={{
                    backgroundColor: '#FED7AA',
                    color: '#EA580C',
                    fontSize: '8px',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    padding: '3px 6px',
                    borderRadius: '4px',
                  }}
                >
                  HOT
                </span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: theme.text, marginBottom: '2px' }}>
                {settings?.template_hero_badge_title || asString((hero as any)?.badge?.left?.value) || 'Soft Plush Elephant'}
              </div>
              <div style={{ fontSize: '11px', color: theme.mutedLight }}>
                {settings?.template_hero_badge_subtitle || asString((hero as any)?.badge?.right?.value) || 'Limited offer'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CATEGORY PILLS - Fully editable
   "BROWSE BY CATEGORY" label + horizontal pills with icons
   ═══════════════════════════════════════════════════════════════════════════ */
const CATEGORY_ICONS: Record<string, string> = {
  all: '◎',
  toys: '🧸',
  clothing: '👕',
  feeding: '🍼',
  strollers: '🛒',
  nursery: '🛏️',
  bath: '🛁',
  gift: '🎁',
};

function CategoryPills({ categories, active, theme, onPick, onSelect }: { categories: string[]; active: string; theme: ThemeColors; onPick: (c: string) => void; onSelect: (p: string) => void }) {
  const defaultCats = ['All', 'Toys', 'Clothing', 'Feeding', 'Strollers', 'Nursery', 'Bath', 'Gift'];
  const displayCats = categories.length > 0 ? ['All', ...categories.filter(c => c.toLowerCase() !== 'all')] : defaultCats;

  return (
    <div 
      style={{ backgroundColor: theme.bg, borderBottom: `1px solid ${theme.borderLight}`, padding: '16px 0' }}
      data-edit-path="layout.categories"
      onClick={() => onSelect('layout.categories')}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: theme.mutedLight, fontSize: '10px', fontWeight: 500, letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
            BROWSE BY CATEGORY
          </span>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {displayCats.map((cat) => {
              const isActive = cat.toLowerCase() === (active || 'all').toLowerCase();
              const icon = CATEGORY_ICONS[cat.toLowerCase()] || '•';
              return (
                <button
                  key={cat}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onPick(cat.toLowerCase() === 'all' ? '' : cat);
                  }}
                  className="theme-hover-scale"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: isActive ? theme.categoryPillActiveBg : theme.categoryPillBg,
                    border: `1px solid ${isActive ? theme.categoryPillActiveBg : theme.border}`,
                    borderRadius: `${theme.categoryPillBorderRadius}px`,
                    padding: '6px 12px',
                    fontSize: '10px',
                    fontWeight: 500,
                    letterSpacing: '0.05em',
                    color: isActive ? theme.categoryPillActiveText : theme.categoryPillText,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: `all ${theme.animationSpeed}ms ease`,
                  }}
                >
                  <span style={{ fontSize: '12px' }}>{icon}</span>
                  <span>{cat.toUpperCase()}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURED SECTION - Fully editable
   Left: description card with gradient
   Right: product cards
   ═══════════════════════════════════════════════════════════════════════════ */
function FeaturedSection({ node, responsive, theme, settings, onSelect, resolveAsset, formatPrice }: any) {
  const grid: ProductGridNode = node || ({} as any);
  const items: ProductNode[] = Array.isArray(grid.items) ? grid.items : [];
  const bp = responsive.breakpoint as Breakpoint;
  const resolveNumber = (v: any): number | undefined => resolveResponsiveNumber(v, bp);

  const title = settings?.template_featured_title || grid?.title?.value || 'Plush friends and warm layers.';
  const subtitle = settings?.template_featured_subtitle || grid?.subtitle?.value || 'A small edit of plush toys, blankets and first-tier softs designed to feel soft against sensitive skin. Gentle colors, cozy textures, and everyday comfort.';
  const sectionTitleSize = settings?.template_section_title_size || '20';

  const featuredItems = items.slice(0, 3);

  const renderCard = (p: ProductNode, idx: number) => {
    const img = p.image;
    const imgSrc = img?.assetKey ? resolveAsset(img.assetKey) : '/placeholder.png';
    const posX = clamp01(resolveNumber((img as any)?.posX), 0.5);
    const posY = clamp01(resolveNumber((img as any)?.posY), 0.5);
    const tag = String(p?.tags?.[0] || p?.category || '').trim().toUpperCase().slice(0, 8) || 'SOFT';
    const price = formatPrice ? formatPrice(Number(p.price || 0)) : String(p.price || '');
    const addLabel = String(settings?.template_add_to_cart_label || 'VIEW');

    return (
      <div
        key={p.id}
        style={{
          backgroundColor: settings?.template_card_bg || theme.cardBg,
          borderRadius: '16px',
          overflow: 'hidden',
          border: `1px solid ${theme.borderLight}`,
        }}
        data-edit-path={`layout.featured.items.${p.id}`}
        onClick={(e) => { e.stopPropagation(); onSelect(`layout.featured.items.${p.id}`); }}
      >
        {/* Image */}
        <div style={{ position: 'relative', aspectRatio: '4/3', backgroundColor: theme.borderLight }}>
          <img
            src={imgSrc}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: `${Math.round(posX * 100)}% ${Math.round(posY * 100)}%`,
            }}
            onError={(e) => { if (!e.currentTarget.src.endsWith('/placeholder.png')) e.currentTarget.src = '/placeholder.png'; }}
          />
          {/* Tag badge - top left */}
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              backgroundColor: theme.accent,
              color: '#FFFFFF',
              fontSize: '8px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              padding: '4px 8px',
              borderRadius: '4px',
            }}
          >
            {tag}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '12px' }}>
          {/* Title */}
          <div
            style={{ fontSize: '13px', fontWeight: 600, color: settings?.template_product_title_color || theme.productTitleColor, marginBottom: '10px', lineHeight: 1.3 }}
            data-edit-path={`layout.featured.items.${p.id}.title`}
            onClick={(e) => { e.stopPropagation(); onSelect(`layout.featured.items.${p.id}.title`); }}
          >
            {p.title?.value || 'Product'}
          </div>

          {/* Bottom row: tag pill + price pill + VIEW button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  backgroundColor: theme.accent,
                  color: '#FFFFFF',
                  fontSize: '8px',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  padding: '5px 10px',
                  borderRadius: '100px',
                }}
              >
                {tag.slice(0, 6)}
              </span>
              <span
                style={{
                  backgroundColor: theme.cardBg,
                  border: `1px solid ${theme.border}`,
                  color: settings?.template_product_price_color || theme.productPriceColor,
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '100px',
                }}
              >
                {price}
              </span>
            </div>
            <button
              style={{
                backgroundColor: theme.accent,
                color: '#FFFFFF',
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '0.05em',
                padding: '6px 12px',
                borderRadius: '100px',
                border: 'none',
                cursor: 'pointer',
              }}
              data-edit-path="layout.featured.addLabel"
              onClick={(e) => { e.stopPropagation(); onSelect('layout.featured.addLabel'); }}
            >
              {addLabel}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section style={{ backgroundColor: theme.bg, padding: '24px 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: responsive.isDesktop ? '1fr 2fr' : '1fr',
          gap: '16px',
        }}>
          {/* Left Description Card */}
          <div
            style={{
              background: `linear-gradient(135deg, ${DEFAULTS.gradientStart} 0%, ${DEFAULTS.gradientMid} 40%, ${DEFAULTS.gradientEnd} 100%)`,
              borderRadius: '24px',
              padding: '24px',
            }}
            data-edit-path="layout.featured"
            onClick={() => onSelect('layout.featured')}
          >
            <div style={{ fontSize: '9px', fontWeight: 500, letterSpacing: '0.15em', color: theme.mutedLight, marginBottom: '12px' }}>
              SOFT & SNUGLY PICKS
            </div>
            <h2
              style={{ fontSize: `${sectionTitleSize}px`, fontWeight: 600, color: settings?.template_section_title_color || theme.sectionTitleColor, marginBottom: '12px', lineHeight: 1.3 }}
              data-edit-path="layout.featured.title"
              onClick={(e) => { e.stopPropagation(); onSelect('layout.featured.title'); }}
            >
              {title}
            </h2>
            <p
              style={{ fontSize: '12px', lineHeight: 1.6, color: settings?.template_section_subtitle_color || theme.sectionSubtitleColor, marginBottom: '16px' }}
              data-edit-path="layout.featured.subtitle"
              onClick={(e) => { e.stopPropagation(); onSelect('layout.featured.subtitle'); }}
            >
              {subtitle}
            </p>
            {/* Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['Soft & cozy', 'New in', 'Best sellers'].map((tag) => (
                <span
                  key={tag}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '100px',
                    padding: '6px 12px',
                    fontSize: '10px',
                    color: theme.muted,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Right Product Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: responsive.isDesktop ? 'repeat(4, 1fr)' : responsive.isTablet ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
            gap: '12px',
          }}>
            {featuredItems.map((p, i) => renderCard(p, i))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PRODUCT GRID - Fully editable
   ═══════════════════════════════════════════════════════════════════════════ */
function ProductGrid({ node, responsive, theme, settings, onSelect, resolveAsset, formatPrice }: any) {
  const grid: ProductGridNode = node || ({} as any);
  const items: ProductNode[] = Array.isArray(grid.items) ? grid.items : [];
  const bp = responsive.breakpoint as Breakpoint;
  const resolveNumber = (v: any): number | undefined => resolveResponsiveNumber(v, bp);

  const heading = grid?.title?.value || 'Pieces in this universe';
  const gridItems = items.slice(3, 12); // Skip first 3 shown in featured
  
  // Use configurable grid columns: Desktop uses setting (default 4), Tablet 3, Mobile 2
  const configCols = parseInt(theme.gridColumns) || 4;
  const cols = responsive.isDesktop ? configCols : responsive.isTablet ? 3 : 2;
  const gap = parseInt(theme.gridGap) || 12;

  const renderCard = (p: ProductNode) => {
    const img = p.image;
    const imgSrc = img?.assetKey ? resolveAsset(img.assetKey) : '/placeholder.png';
    const posX = clamp01(resolveNumber((img as any)?.posX), 0.5);
    const posY = clamp01(resolveNumber((img as any)?.posY), 0.5);
    const tag = String(p?.tags?.[0] || p?.category || '').trim().toUpperCase().slice(0, 8) || 'NEW';
    const price = formatPrice ? formatPrice(Number(p.price || 0)) : String(p.price || '');
    const addLabel = String(settings?.template_add_to_cart_label || 'VIEW');

    return (
      <div
        key={p.id}
        className="theme-hover-scale theme-fade-in"
        style={{
          backgroundColor: settings?.template_card_bg || theme.cardBg,
          borderRadius: `${theme.cardBorderRadius}px`,
          overflow: 'hidden',
          border: `1px solid ${theme.borderLight}`,
          transition: `all ${theme.animationSpeed}ms ease`,
        }}
        data-edit-path={`layout.featured.items.${p.id}`}
        onClick={(e) => { e.stopPropagation(); onSelect(`layout.featured.items.${p.id}`); }}
      >
        {/* Image */}
        <div style={{ position: 'relative', aspectRatio: '4/3', backgroundColor: theme.borderLight }}>
          <img
            src={imgSrc}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: `${Math.round(posX * 100)}% ${Math.round(posY * 100)}%`,
            }}
            onError={(e) => { if (!e.currentTarget.src.endsWith('/placeholder.png')) e.currentTarget.src = '/placeholder.png'; }}
          />
          {/* Tag badge */}
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              backgroundColor: theme.accent,
              color: '#FFFFFF',
              fontSize: '8px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              padding: '4px 8px',
              borderRadius: '4px',
            }}
          >
            {tag}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '8px' }}>
          <div
            style={{ fontSize: '11px', fontWeight: 600, color: settings?.template_product_title_color || theme.productTitleColor, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '6px' }}
            data-edit-path={`layout.featured.items.${p.id}.title`}
            onClick={(e) => { e.stopPropagation(); onSelect(`layout.featured.items.${p.id}.title`); }}
          >
            {p.title?.value || 'Product'}
          </div>

          {/* Price and tag row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
            <span
              style={{
                backgroundColor: theme.accent,
                color: '#FFFFFF',
                fontSize: '7px',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '100px',
                whiteSpace: 'nowrap',
              }}
            >
              {tag.slice(0, 4)}
            </span>
            <span
              style={{
                color: settings?.template_product_price_color || theme.productPriceColor,
                fontSize: '10px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              {price}
            </span>
          </div>

          {/* View button */}
          <button
            style={{
              backgroundColor: theme.accent,
              color: '#FFFFFF',
              fontSize: '8px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '100px',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              width: '100%',
            }}
            data-edit-path="layout.featured.addLabel"
            onClick={(e) => { e.stopPropagation(); onSelect('layout.featured.addLabel'); }}
          >
            {addLabel}
          </button>
        </div>
      </div>
    );
  };

  return (
    <section style={{ backgroundColor: theme.bg, padding: '24px 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2
            style={{ fontSize: '18px', fontWeight: 600, color: settings?.template_section_title_color || theme.sectionTitleColor }}
            data-edit-path="layout.featured.title"
            onClick={() => onSelect('layout.featured.title')}
          >
            {heading}
          </h2>
          <span style={{ fontSize: '10px', color: theme.mutedLight, letterSpacing: '0.08em' }}>
            {gridItems.length} ITEMS →
          </span>
        </div>

        {/* Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: `${gap}px`,
          }}
          data-edit-path="layout.grid"
          onClick={() => onSelect('layout.grid')}
        >
          {gridItems.map(renderCard)}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FOOTER - Fully editable
   Copyright left, links + social right
   ═══════════════════════════════════════════════════════════════════════════ */

// Social icon SVGs
const SOCIAL_ICONS: Record<string, string> = {
  facebook: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z',
  twitter: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z',
  instagram: 'M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M6.5 2h11A4.5 4.5 0 0122 6.5v11a4.5 4.5 0 01-4.5 4.5h-11A4.5 4.5 0 012 17.5v-11A4.5 4.5 0 016.5 2z',
  youtube: 'M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z M9.75 15.02l5.75-3.27-5.75-3.27v6.54z',
  linkedin: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z M2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z',
  tiktok: 'M9 12a4 4 0 104 4V4a5 5 0 005 5',
  pinterest: 'M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.42 7.63 11.17-.1-.94-.2-2.4.04-3.43.22-.93 1.4-5.94 1.4-5.94s-.36-.72-.36-1.77c0-1.66.96-2.9 2.16-2.9 1.02 0 1.5.76 1.5 1.68 0 1.02-.65 2.55-.99 3.97-.28 1.19.6 2.16 1.78 2.16 2.13 0 3.77-2.25 3.77-5.5 0-2.87-2.06-4.88-5.01-4.88-3.42 0-5.43 2.56-5.43 5.21 0 1.03.39 2.14.89 2.74.1.12.11.22.08.34-.09.38-.3 1.19-.34 1.36-.05.22-.18.27-.4.16-1.49-.7-2.43-2.87-2.43-4.62 0-3.76 2.74-7.22 7.89-7.22 4.14 0 7.36 2.95 7.36 6.9 0 4.11-2.6 7.43-6.2 7.43-1.21 0-2.35-.63-2.74-1.37l-.74 2.83c-.27 1.04-1 2.35-1.49 3.14 1.13.35 2.32.53 3.56.53 6.63 0 12-5.37 12-12S18.63 0 12 0z',
};

function Footer({ node, theme, settings, onSelect }: { node: FooterNode; theme: ThemeColors; settings: any; onSelect: (p: string) => void }) {
  const safeNode = node || ({} as any);
  const copyright = settings?.template_copyright || (safeNode as any)?.copyright?.value || '© 2026 Babyos • Made for Baby Store';
  const socialLinks = theme.socialLinks || [];

  return (
    <footer
      style={{ backgroundColor: theme.bg, borderTop: `1px solid ${theme.border}`, padding: '20px 0' }}
      data-edit-path="layout.footer"
      onClick={() => onSelect('layout.footer')}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          {/* Copyright */}
          <div
            style={{ fontSize: '11px', color: settings?.template_footer_text || theme.footerText }}
            data-edit-path="layout.footer.copyright"
            onClick={(e) => { e.stopPropagation(); onSelect('layout.footer.copyright'); }}
          >
            {copyright}
          </div>

          {/* Links */}
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: settings?.template_footer_link_color || theme.footerLinkColor }}
            data-edit-path="layout.footer.links"
            onClick={(e) => { e.stopPropagation(); onSelect('layout.footer.links'); }}
          >
            {(safeNode.links && safeNode.links.length > 0) ? (
              safeNode.links.slice(0, 4).map((l: any, i: number) => (
                <React.Fragment key={i}>
                  {i > 0 && <span style={{ color: theme.border }}>|</span>}
                  <a
                    href={l?.action || '#'}
                    style={{ color: settings?.template_footer_link_color || theme.footerLinkColor, textDecoration: 'none', transition: `opacity ${theme.animationSpeed}ms ease` }}
                    onMouseOver={(e) => (e.currentTarget.style.opacity = '0.7')}
                    onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    {l?.label?.value || 'Link'}
                  </a>
                </React.Fragment>
              ))
            ) : (
              <>
                <a href="#" style={{ color: settings?.template_footer_link_color || theme.footerLinkColor, textDecoration: 'none' }}>Help</a>
                <span style={{ color: theme.border }}>|</span>
                <a href="#" style={{ color: settings?.template_footer_link_color || theme.footerLinkColor, textDecoration: 'none' }}>My Orders</a>
                <span style={{ color: theme.border }}>|</span>
                <a href="#" style={{ color: settings?.template_footer_link_color || theme.footerLinkColor, textDecoration: 'none' }}>FAQ</a>
                <span style={{ color: theme.border }}>|</span>
                <a href="#" style={{ color: settings?.template_footer_link_color || theme.footerLinkColor, textDecoration: 'none' }}>Contact</a>
              </>
            )}
          </div>

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div 
              style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
              data-edit-path="layout.footer.social"
              onClick={(e) => { e.stopPropagation(); onSelect('layout.footer.social'); }}
            >
              {socialLinks.map((social, idx) => {
                const iconPath = SOCIAL_ICONS[social.platform.toLowerCase()] || '';
                return (
                  <a
                    key={idx}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="theme-hover-scale"
                    style={{
                      color: settings?.template_footer_link_color || theme.footerLinkColor,
                      transition: `all ${theme.animationSpeed}ms ease`,
                    }}
                    title={social.platform}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={iconPath} />
                    </svg>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN TEMPLATE EXPORT
   ═══════════════════════════════════════════════════════════════════════════ */
export default function BabyosTemplate(props: TemplateProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const forcedBreakpoint = (props as any).forcedBreakpoint as 'mobile' | 'tablet' | 'desktop' | undefined;
  const [responsive, setResponsive] = React.useState<ResponsiveInfo>({
    width: 0,
    isMobile: true,
    isTablet: false,
    isDesktop: false,
    breakpoint: 'mobile',
  });

  // Update responsive immediately when forcedBreakpoint changes
  React.useEffect(() => {
    if (forcedBreakpoint) {
      const isMobile = forcedBreakpoint === 'mobile';
      const isTablet = forcedBreakpoint === 'tablet';
      const isDesktop = forcedBreakpoint === 'desktop';
      setResponsive({ width: isDesktop ? 1024 : isTablet ? 768 : 375, isMobile, isTablet, isDesktop, breakpoint: forcedBreakpoint });
    }
  }, [forcedBreakpoint]);

  React.useLayoutEffect(() => {
    // If forcedBreakpoint is provided, skip ResizeObserver
    if (forcedBreakpoint) return;

    const el = rootRef.current;
    if (!el) return;

    const compute = () => {
      const w = el.getBoundingClientRect().width;
      const isMobile = w < 640;
      const isTablet = w >= 640 && w < 1024;
      const isDesktop = w >= 1024;
      const breakpoint: ResponsiveInfo['breakpoint'] = isDesktop ? 'desktop' : isTablet ? 'tablet' : 'mobile';
      setResponsive({ width: w, isMobile, isTablet, isDesktop, breakpoint });
    };

    compute();
    const ro = new ResizeObserver(() => compute());
    ro.observe(el);
    return () => ro.disconnect();
  }, [forcedBreakpoint]);

  // Get settings
  const settings = props.settings as any;

  // Parse social links from settings
  const parseSocialLinks = (): SocialLink[] => {
    try {
      const raw = settings?.template_social_links;
      if (typeof raw === 'string' && raw.trim()) return JSON.parse(raw);
      if (Array.isArray(raw)) return raw;
    } catch {}
    return [];
  };

  // Parse nav links from settings
  const parseNavLinks = (): NavLink[] => {
    try {
      const raw = settings?.template_nav_links;
      if (typeof raw === 'string' && raw.trim()) return JSON.parse(raw);
      if (Array.isArray(raw)) return raw;
    } catch {}
    return [];
  };

  // Build theme from settings with defaults
  const theme: ThemeColors = {
    bg: settings?.template_bg_color || DEFAULTS.bg,
    accent: settings?.template_accent_color || DEFAULTS.accent,
    text: settings?.template_text_color || DEFAULTS.text,
    muted: settings?.template_muted_color || DEFAULTS.muted,
    mutedLight: DEFAULTS.mutedLight,
    border: DEFAULTS.border,
    borderLight: DEFAULTS.borderLight,
    cardBg: settings?.template_card_bg || DEFAULTS.cardBg,
    headerBg: settings?.template_header_bg || DEFAULTS.bg,
    headerText: settings?.template_header_text || DEFAULTS.accent,
    heroTitleColor: settings?.template_hero_title_color || DEFAULTS.text,
    heroTitleSize: settings?.template_hero_title_size || '32',
    heroSubtitleColor: settings?.template_hero_subtitle_color || DEFAULTS.muted,
    heroSubtitleSize: settings?.template_hero_subtitle_size || '13',
    heroKickerColor: settings?.template_hero_kicker_color || DEFAULTS.muted,
    sectionTitleColor: settings?.template_section_title_color || DEFAULTS.text,
    sectionTitleSize: settings?.template_section_title_size || '20',
    sectionSubtitleColor: settings?.template_section_subtitle_color || DEFAULTS.muted,
    productTitleColor: settings?.template_product_title_color || DEFAULTS.text,
    productPriceColor: settings?.template_product_price_color || DEFAULTS.text,
    footerText: settings?.template_footer_text || DEFAULTS.mutedLight,
    footerLinkColor: settings?.template_footer_link_color || DEFAULTS.muted,
    // New theme properties
    fontFamily: settings?.template_font_family || DEFAULTS.fontFamily,
    fontWeight: settings?.template_font_weight || DEFAULTS.fontWeight,
    headingFontWeight: settings?.template_heading_font_weight || '600',
    borderRadius: settings?.template_border_radius || DEFAULTS.borderRadius,
    cardBorderRadius: settings?.template_card_border_radius || '12',
    buttonBorderRadius: settings?.template_button_border_radius || '9999',
    spacing: settings?.template_spacing || DEFAULTS.spacing,
    sectionSpacing: settings?.template_section_spacing || '48',
    animationSpeed: settings?.template_animation_speed || DEFAULTS.animationSpeed,
    hoverScale: settings?.template_hover_scale || '1.02',
    gridColumns: settings?.template_grid_columns || DEFAULTS.gridColumns,
    gridGap: settings?.template_grid_gap || '24',
    categoryPillBg: settings?.template_category_pill_bg || DEFAULTS.categoryPillBg,
    categoryPillText: settings?.template_category_pill_text || DEFAULTS.categoryPillText,
    categoryPillActiveBg: settings?.template_category_pill_active_bg || DEFAULTS.categoryPillActiveBg,
    categoryPillActiveText: settings?.template_category_pill_active_text || DEFAULTS.categoryPillActiveText,
    categoryPillBorderRadius: settings?.template_category_pill_border_radius || '9999',
    customCss: settings?.template_custom_css || '',
    socialLinks: parseSocialLinks(),
    navLinks: parseNavLinks(),
  };

  // Schema resolution
  const storedSchema = settings?.store_schema;
  const schemaCandidate = looksLikeUniversalStoreSchema(storedSchema)
    ? storedSchema
    : buildUniversalSchemaFromSettingsAndProducts(settings, settings?.template || 'babyos', props.products as any);

  const page: any = schemaCandidate;
  const layout = page?.layout || {};
  const assets = page?.assets || {};

  // Resolve assets
  const overrides: Record<string, string> = {
    logo: asString(settings?.store_logo),
    hero: asString(settings?.banner_url),
  };
  const resolveAsset = (k: string) => resolveAssetUrl(k, overrides, assets);

  // Extract nodes
  const headerNode = layout.header as HeaderNode;
  const heroNode = layout.hero as HeroNode;
  const featuredNode = (layout.featured || (Array.isArray(layout.sections) ? layout.sections.find((s: any) => s?.type === 'grid') : null)) as ProductGridNode;
  const footerNode = layout.footer as FooterNode;

  // Store info
  const storeName = String(settings?.store_name || '').toUpperCase();
  const storeDescription = String(settings?.store_description || '');

  // Compose hero with fallbacks
  const heroTitle = String((heroNode as any)?.title?.value || '') || String(settings?.template_hero_heading || '') || 'A soft, modern universe for every little moment.';
  const heroSubtitle = String((heroNode as any)?.subtitle?.value || '') || String(settings?.template_hero_subtitle || '') || storeDescription || 'Shop cuddly toys, cozy essentials, nursery finds and tiny gifts — curated for newborns and toddlers in one balanced, playful store.';

  const composedHero: HeroNode = {
    ...(heroNode as any),
    title: { ...(heroNode?.title || { type: 'text', value: '' } as any), value: heroTitle },
    subtitle: heroSubtitle ? { ...(heroNode?.subtitle || { type: 'text', value: '' } as any), value: heroSubtitle } : undefined,
    kicker: (heroNode as any)?.kicker || { type: 'text', value: 'NEW SEASON • SOFT & PLAYFUL' },
    cta: (heroNode as any)?.cta?.length
      ? (heroNode as any).cta
      : [
          { label: { type: 'text', value: 'SHOP BABY ESSENTIALS' }, action: '/products', variant: 'primary' },
          { label: { type: 'text', value: 'VIEW ALL TOYS' }, action: '/products', variant: 'outline' },
        ],
  };

  const categories = Array.isArray(props.categories) ? props.categories.filter(Boolean) : [];

  const onSelect = (path: string) => {
    const anyProps = props as any;
    if (typeof anyProps.onSelect === 'function') anyProps.onSelect(path);
  };

  // Build dynamic CSS variables and custom CSS
  const cssVariables = `
    :root {
      --theme-bg: ${theme.bg};
      --theme-accent: ${theme.accent};
      --theme-text: ${theme.text};
      --theme-muted: ${theme.muted};
      --theme-border: ${theme.border};
      --theme-card-bg: ${theme.cardBg};
      --theme-font-family: ${theme.fontFamily};
      --theme-font-weight: ${theme.fontWeight};
      --theme-heading-font-weight: ${theme.headingFontWeight};
      --theme-border-radius: ${theme.borderRadius}px;
      --theme-card-border-radius: ${theme.cardBorderRadius}px;
      --theme-button-border-radius: ${theme.buttonBorderRadius}px;
      --theme-spacing: ${theme.spacing}px;
      --theme-section-spacing: ${theme.sectionSpacing}px;
      --theme-animation-speed: ${theme.animationSpeed}ms;
      --theme-hover-scale: ${theme.hoverScale};
      --theme-grid-columns: ${theme.gridColumns};
      --theme-grid-gap: ${theme.gridGap}px;
    }
    
    /* Animation utility classes */
    .theme-hover-scale { transition: transform var(--theme-animation-speed) ease; }
    .theme-hover-scale:hover { transform: scale(var(--theme-hover-scale)); }
    .theme-fade-in { animation: themeFadeIn var(--theme-animation-speed) ease-out; }
    @keyframes themeFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    
    /* Custom CSS from settings */
    ${theme.customCss}
  `;

  return (
    <div
      ref={rootRef}
      style={{ 
        minHeight: '100vh', 
        backgroundColor: theme.bg, 
        color: theme.text, 
        fontFamily: theme.fontFamily,
        fontWeight: theme.fontWeight as any,
      }}
      data-edit-path="__root"
      onClick={() => onSelect('__root')}
    >
      {/* Inject CSS variables and custom CSS */}
      <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
      
      <Header storeName={storeName} logoUrl={settings?.store_logo} theme={theme} onSelect={onSelect} />
      <Hero node={composedHero} responsive={responsive} theme={theme} settings={settings} onSelect={onSelect} resolveAsset={resolveAsset} />
      <CategoryPills categories={categories} active={props.categoryFilter || ''} theme={theme} onPick={(c) => props.setCategoryFilter?.(c)} onSelect={onSelect} />
      <FeaturedSection node={featuredNode} responsive={responsive} theme={theme} settings={settings} onSelect={onSelect} resolveAsset={resolveAsset} formatPrice={props.formatPrice} />
      <ProductGrid node={featuredNode} responsive={responsive} theme={theme} settings={settings} onSelect={onSelect} resolveAsset={resolveAsset} formatPrice={props.formatPrice} />
      <Footer node={footerNode} theme={theme} settings={settings} onSelect={onSelect} />
    </div>
  );
}
