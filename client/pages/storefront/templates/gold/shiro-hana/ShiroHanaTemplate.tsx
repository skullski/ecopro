import React from 'react';
import type { TemplateProps } from '../../types';
import shiroHanaHome from '../shiro-hana-home.json';
import { Hero } from './hero';
import { ProductGrid } from './productsgrid';
import { Header, Footer } from './header-footer';
import type { FeaturedGridNode, FooterNode, HeaderNode, HeroNode, ProductNode } from './schema-types';
import { migrateShiroHanaDoc } from './migrations';
import { resolveResponsiveNumber } from './responsive';
import { buildUniversalSchemaFromSettingsAndProducts, looksLikeUniversalStoreSchema } from '@/lib/storeSchema';

type ResponsiveInfo = {
  width: number;
  isSm: boolean;
  isMd: boolean;
  breakpoint: 'mobile' | 'tablet' | 'desktop';
};

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function resolveAssetUrl(assetKey: string, overrides: Record<string, string>, assets: Record<string, any>): string {
  const direct = asString(overrides[assetKey]);
  if (direct) return direct;
  if (isHttpUrl(assetKey)) return assetKey;
  if (assetKey.startsWith('/')) return assetKey;
  const url = asString(assets?.[assetKey]?.url) || `/assets/${assetKey}`;
  // The shipped template JSON uses example CDN URLs which are not real.
  // Fall back to our local placeholder so the preview never looks broken.
  if (/^https?:\/\/cdn\.example\.com\//i.test(url) || /^https?:\/\/[^/]*example\.com\//i.test(url)) {
    return '/placeholder.png';
  }
  return url || '/placeholder.png';
}

function overridesForBackground(settings: any): Record<string, string> {
  void settings;
  return {};
}

const DEFAULTS = {
  bg: '#FDF8F3',
  accent: '#F97316',
  text: '#1C1917',
  muted: '#78716C',
  mutedLight: '#A8A29E',
  border: '#E7E5E4',
  borderLight: '#F5F5F4',
  cardBg: '#FFFFFF',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontWeight: '400',
  headingFontWeight: '600',
  borderRadius: '8',
  cardBorderRadius: '12',
  buttonBorderRadius: '9999',
  spacing: '16',
  sectionSpacing: '48',
  animationSpeed: '200',
  hoverScale: '1.02',
  gridColumns: '4',
  gridGap: '24',
  categoryPillBg: '#F5F5F4',
  categoryPillText: '#78716C',
  categoryPillActiveBg: '#F97316',
  categoryPillActiveText: '#FFFFFF',
  categoryPillBorderRadius: '9999',
};

type SocialLink = { platform: string; url: string; icon?: string };
type NavLink = { label: string; url: string };

function safeParseJsonArray<T = any>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (typeof raw !== 'string') return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function CategoryPills({ categories, active, theme, onPick, onSelect }: { categories: string[]; active: string; theme: any; onPick: (c: string) => void; onSelect: (p: string) => void }) {
  const defaultCats = ['All', 'New', 'Popular', 'Gifts'];
  const displayCats = categories.length > 0 ? ['All', ...categories.filter((c) => String(c).toLowerCase() !== 'all')] : defaultCats;
  const activeKey = String(active || '').trim() || 'All';

  const pillRadius = `${parseInt(String(theme?.categoryPillBorderRadius || DEFAULTS.categoryPillBorderRadius), 10) || 9999}px`;
  return (
    <section className="w-full py-3" data-edit-path="layout.categories" onClick={() => onSelect('layout.categories')}>
      <div className="container mx-auto px-6 flex flex-wrap gap-2">
        {displayCats.map((c) => {
          const isActive = String(c).toLowerCase() === String(activeKey).toLowerCase();
          return (
            <button
              key={c}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPick(c);
              }}
              style={{
                borderRadius: pillRadius,
                backgroundColor: isActive ? (theme?.categoryPillActiveBg || DEFAULTS.categoryPillActiveBg) : (theme?.categoryPillBg || DEFAULTS.categoryPillBg),
                color: isActive ? (theme?.categoryPillActiveText || DEFAULTS.categoryPillActiveText) : (theme?.categoryPillText || DEFAULTS.categoryPillText),
                padding: '6px 12px',
                fontSize: '12px',
                border: `1px solid ${theme?.borderLight || DEFAULTS.borderLight}`,
              }}
            >
              {c}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default function ShiroHanaTemplate(props: TemplateProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const [responsive, setResponsive] = React.useState<ResponsiveInfo>({ width: 0, isSm: false, isMd: false, breakpoint: 'mobile' });

  React.useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const compute = () => {
      const w = el.getBoundingClientRect().width;
      // Treat tablet as a real middle breakpoint (e.g., 768–1023px).
      // Keep `isSm` aligned with Tailwind's sm (>=640).
      // Make `isMd` represent desktop-only so tablet doesn't render desktop layout.
      const isSm = w >= 640;
      const isMd = w >= 1024;
      const breakpoint: ResponsiveInfo['breakpoint'] = isMd ? 'desktop' : w >= 768 ? 'tablet' : 'mobile';
      setResponsive({ width: w, isSm, isMd, breakpoint });
    };

    compute();

    const ro = new ResizeObserver(() => compute());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Single template editor: support both new + legacy stored schema keys.
  const docKey = 'template_page_shiro_hana_home';
  const legacyDocKey = 'gold_page_shiro_hana_home';
  const defaultLegacyPage = shiroHanaHome as any;

  const storedSchema = (props.settings as any)?.store_schema;
  const rawLegacyPage: any = (props.settings as any)?.[docKey] || (props.settings as any)?.[legacyDocKey] || defaultLegacyPage;

  const schemaCandidate = looksLikeUniversalStoreSchema(storedSchema)
    ? storedSchema
    : (looksLikeUniversalStoreSchema(rawLegacyPage)
        ? rawLegacyPage
        : buildUniversalSchemaFromSettingsAndProducts(props.settings as any, 'shiro-hana', props.products as any));

  const legacyPage: any = looksLikeUniversalStoreSchema(rawLegacyPage)
    ? rawLegacyPage
    : (migrateShiroHanaDoc(rawLegacyPage).doc || rawLegacyPage);

  const isUsingUniversalSchema = looksLikeUniversalStoreSchema(schemaCandidate);
  const page: any = isUsingUniversalSchema ? schemaCandidate : legacyPage;

  const layout = page?.layout || {};
  const assets = page?.assets || {};

  const bg = page?.styles?.background;
  const bgEnabled = !!bg && bg.enabled === true;
  const bgAssetKey = typeof bg?.assetKey === 'string' && bg.assetKey ? bg.assetKey : 'page-bg';
  const bgUrl = bgEnabled ? resolveAssetUrl(bgAssetKey, overridesForBackground(props.settings), assets) : '';
  const bgFit = (bg?.fit === 'contain' ? 'contain' : 'cover') as 'cover' | 'contain';
  const bgPosXRaw = resolveResponsiveNumber(bg?.posX, responsive.breakpoint);
  const bgPosYRaw = resolveResponsiveNumber(bg?.posY, responsive.breakpoint);
  const bgOpacityRaw = resolveResponsiveNumber(bg?.opacity, responsive.breakpoint);
  const bgPosX = typeof bgPosXRaw === 'number' ? Math.max(0, Math.min(1, bgPosXRaw)) : 0.5;
  const bgPosY = typeof bgPosYRaw === 'number' ? Math.max(0, Math.min(1, bgPosYRaw)) : 0.5;
  const bgOpacity = typeof bgOpacityRaw === 'number' ? Math.max(0, Math.min(1, bgOpacityRaw)) : 1;

  const enableDarkModeSetting = (props.settings as any)?.enable_dark_mode;
  const forcedMode = typeof enableDarkModeSetting === 'boolean' ? (enableDarkModeSetting ? 'dark' : 'light') : null;
  const mode = forcedMode ?? (String(page?.styles?.theme || page?.styles?.themeMode || 'light').toLowerCase() === 'dark' ? 'dark' : 'light');
  const cssVar = (name: string) => `hsl(var(--${name}))`;

  const navLinks = safeParseJsonArray<NavLink>((props.settings as any)?.template_nav_links)
    .map((l) => ({ label: asString((l as any)?.label), url: asString((l as any)?.url) }))
    .filter((l) => l.label && l.url);
  const socialLinks = safeParseJsonArray<SocialLink>((props.settings as any)?.template_social_links)
    .map((l) => ({ platform: asString((l as any)?.platform), url: asString((l as any)?.url), icon: asString((l as any)?.icon) }))
    .filter((l) => l.platform && l.url);

  const onSelect = (path: string) => {
    const anyProps = props as any;
    if (typeof anyProps.onSelect === 'function') anyProps.onSelect(path);
  };

  const canManage = typeof (props as any)?.onSelect === 'function';

  const resolvedBg = asString((props.settings as any)?.template_bg_color) || page?.styles?.backgroundColor || page?.styles?.colors?.background || cssVar('background');
  const resolvedText = asString((props.settings as any)?.template_text_color) || page?.styles?.textColor || page?.styles?.colors?.text || cssVar('foreground');
  const resolvedMuted = asString((props.settings as any)?.template_muted_color) || page?.styles?.colors?.muted || cssVar('muted-foreground');
  const resolvedAccent = asString((props.settings as any)?.template_accent_color) || page?.styles?.accentColor || page?.styles?.primaryColor || page?.styles?.colors?.accent || page?.styles?.accent || cssVar('primary');
  const resolvedSurface = asString((props.settings as any)?.template_card_bg) || page?.styles?.colors?.surface || cssVar('card');

  const theme = {
    colors: {
      background: resolvedBg,
      surface: resolvedSurface,
      text: resolvedText,
      muted: resolvedMuted,
      accent: resolvedAccent,
    },
    fonts: {
      heading: page?.styles?.fonts?.heading,
      body: asString((props.settings as any)?.template_font_family) || page?.styles?.fonts?.body,
    },
    radius: page?.styles?.tokens?.radius,
    space: page?.styles?.tokens?.space,

    // Babyos-compatible theme keys (used by editor bindings)
    bg: resolvedBg,
    accent: resolvedAccent,
    text: resolvedText,
    muted: resolvedMuted,
    mutedLight: asString((props.settings as any)?.template_footer_text) || DEFAULTS.mutedLight,
    border: DEFAULTS.border,
    borderLight: DEFAULTS.borderLight,
    cardBg: resolvedSurface,
    headerBg: asString((props.settings as any)?.template_header_bg) || resolvedBg,
    headerText: asString((props.settings as any)?.template_header_text) || resolvedAccent,
    heroTitleColor: asString((props.settings as any)?.template_hero_title_color) || resolvedText,
    heroTitleSize: asString((props.settings as any)?.template_hero_title_size) || '32',
    heroSubtitleColor: asString((props.settings as any)?.template_hero_subtitle_color) || resolvedMuted,
    heroSubtitleSize: asString((props.settings as any)?.template_hero_subtitle_size) || '13',
    heroKickerColor: asString((props.settings as any)?.template_hero_kicker_color) || resolvedMuted,
    heroKickerText: asString((props.settings as any)?.template_hero_kicker),
    heroBadgeTitle: asString((props.settings as any)?.template_hero_badge_title),
    heroBadgeSubtitle: asString((props.settings as any)?.template_hero_badge_subtitle),
    button2Border: asString((props.settings as any)?.template_button2_border) || DEFAULTS.border,
    sectionTitleColor: asString((props.settings as any)?.template_section_title_color) || resolvedText,
    sectionTitleSize: asString((props.settings as any)?.template_section_title_size) || '20',
    sectionSubtitleColor: asString((props.settings as any)?.template_section_subtitle_color) || resolvedMuted,
    featuredTitle: asString((props.settings as any)?.template_featured_title),
    featuredSubtitle: asString((props.settings as any)?.template_featured_subtitle),
    productTitleColor: asString((props.settings as any)?.template_product_title_color) || resolvedText,
    productPriceColor: asString((props.settings as any)?.template_product_price_color) || resolvedText,
    footerText: asString((props.settings as any)?.template_footer_text) || DEFAULTS.mutedLight,
    footerLinkColor: asString((props.settings as any)?.template_footer_link_color) || resolvedMuted,
    fontFamily: asString((props.settings as any)?.template_font_family) || DEFAULTS.fontFamily,
    fontWeight: asString((props.settings as any)?.template_font_weight) || DEFAULTS.fontWeight,
    headingFontWeight: asString((props.settings as any)?.template_heading_font_weight) || DEFAULTS.headingFontWeight,
    borderRadius: asString((props.settings as any)?.template_border_radius) || DEFAULTS.borderRadius,
    cardBorderRadius: asString((props.settings as any)?.template_card_border_radius) || DEFAULTS.cardBorderRadius,
    buttonBorderRadius: asString((props.settings as any)?.template_button_border_radius) || DEFAULTS.buttonBorderRadius,
    spacing: asString((props.settings as any)?.template_spacing) || DEFAULTS.spacing,
    sectionSpacing: asString((props.settings as any)?.template_section_spacing) || DEFAULTS.sectionSpacing,
    animationSpeed: asString((props.settings as any)?.template_animation_speed) || DEFAULTS.animationSpeed,
    hoverScale: asString((props.settings as any)?.template_hover_scale) || DEFAULTS.hoverScale,
    gridColumns: asString((props.settings as any)?.template_grid_columns) || DEFAULTS.gridColumns,
    gridGap: asString((props.settings as any)?.template_grid_gap) || DEFAULTS.gridGap,
    categoryPillBg: asString((props.settings as any)?.template_category_pill_bg) || DEFAULTS.categoryPillBg,
    categoryPillText: asString((props.settings as any)?.template_category_pill_text) || DEFAULTS.categoryPillText,
    categoryPillActiveBg: asString((props.settings as any)?.template_category_pill_active_bg) || DEFAULTS.categoryPillActiveBg,
    categoryPillActiveText: asString((props.settings as any)?.template_category_pill_active_text) || DEFAULTS.categoryPillActiveText,
    categoryPillBorderRadius: asString((props.settings as any)?.template_category_pill_border_radius) || DEFAULTS.categoryPillBorderRadius,
    customCss: asString((props.settings as any)?.template_custom_css),
    navLinks,
    socialLinks,

    // Gate edit-click interception outside the editor
    canManage,
  };

  const headerNode = layout.header as HeaderNode;
  const heroNode = layout.hero as HeroNode;
  const featuredNode = (layout.featured || (Array.isArray(layout.sections) ? layout.sections.find((s: any) => s?.type === 'grid' || s?.type === 'product-grid') : null)) as FeaturedGridNode;
  const footerNode = layout.footer as FooterNode;

  const storeName = (props.settings.store_name || '').trim();
  const storeDescription = (props.settings.store_description || '').trim();

  const overrides: Record<string, string> = {
    logo: asString(props.settings.store_logo),
    hero: asString(props.settings.banner_url),
    'logo-main': asString(props.settings.store_logo),
    'hero-sushi': asString(props.settings.banner_url),
  };

  const accent =
    asString(props.settings.template_accent_color) ||
    asString(props.primaryColor) ||
    (page?.styles?.accentColor ? String(page.styles.accentColor) : '') ||
    (page?.styles?.primaryColor ? String(page.styles.primaryColor) : '') ||
    (page?.styles?.accent ? String(page.styles.accent) : '');

  const docHeroTitle = asString(heroNode?.title?.value).trim();
  const docHeroSubtitle = asString(heroNode?.subtitle?.value).trim();
  const docHeroButtonText = asString(heroNode?.cta?.[0]?.label?.value).trim();

  const settingsHeroTitle = (props.settings.template_hero_heading || '').trim();
  const settingsHeroSubtitle = (props.settings.template_hero_subtitle || '').trim();
  const settingsHeroButtonText = (props.settings.template_button_text || '').trim();
  const settingsHeroButton2Text = asString((props.settings as any)?.template_button2_text).trim();

  const resolvedHeroTitle = docHeroTitle || settingsHeroTitle;
  const resolvedHeroSubtitle = docHeroSubtitle || settingsHeroSubtitle || storeDescription;
  const resolvedHeroButtonText = docHeroButtonText || settingsHeroButtonText;
  const resolvedHeroButton2Text = asString(heroNode?.cta?.[1]?.label?.value).trim() || settingsHeroButton2Text;

  const cta0LabelBase: any = heroNode?.cta?.[0]?.label && typeof heroNode.cta[0].label === 'object' ? heroNode.cta[0].label : null;
  const cta1LabelBase: any = heroNode?.cta?.[1]?.label && typeof heroNode.cta[1].label === 'object' ? heroNode.cta[1].label : null;

  const heroVideoUrl = asString((props.settings as any)?.hero_video_url);

  const schemaFeaturedItems = Array.isArray(featuredNode?.items) ? featuredNode.items : [];

  const addLabel = asString((props.settings as any)?.template_add_to_cart_label) || asString(featuredNode?.addLabel?.value) || 'Add';
  const listForDisplay = (Array.isArray(props.filtered) && props.filtered.length ? props.filtered : props.products) || [];
  const productItems: ProductNode[] = listForDisplay.slice(0, 6).map((p) => ({
    id: String(p.id),
    title: { type: 'text', value: String(p.title || '') },
    description: p.description ? { type: 'text', value: String(p.description) } : undefined,
    price: Number(p.price || 0),
    image: { type: 'image', assetKey: (p.images && p.images[0]) ? String(p.images[0]) : 'tuna-1', alt: String(p.title || '') },
    size: 'medium',
  }));

  const featuredItems = props.canManage === false ? schemaFeaturedItems : (productItems.length > 0 ? productItems : schemaFeaturedItems);

  return (
    <div
      ref={rootRef}
      className={`min-h-screen relative ${mode === 'dark' ? 'dark' : ''}`}
      style={{
        backgroundColor: theme.colors.background || undefined,
        color: theme.colors.text || undefined,
        fontFamily: theme.fonts.body || undefined,
        ['--theme-bg' as any]: theme.bg,
        ['--theme-accent' as any]: theme.accent,
        ['--theme-text' as any]: theme.text,
        ['--theme-muted' as any]: theme.muted,
        ['--theme-border' as any]: theme.border,
        ['--theme-border-light' as any]: theme.borderLight,
        ['--theme-card-bg' as any]: theme.cardBg,
        ['--theme-font-family' as any]: theme.fontFamily,
        ['--theme-font-weight' as any]: theme.fontWeight,
        ['--theme-heading-font-weight' as any]: theme.headingFontWeight,
        ['--theme-border-radius' as any]: `${theme.borderRadius}px`,
        ['--theme-card-border-radius' as any]: `${theme.cardBorderRadius}px`,
        ['--theme-button-border-radius' as any]: `${theme.buttonBorderRadius}px`,
        ['--theme-spacing' as any]: `${theme.spacing}px`,
        ['--theme-section-spacing' as any]: `${theme.sectionSpacing}px`,
        ['--theme-animation-speed' as any]: `${theme.animationSpeed}ms`,
        ['--theme-hover-scale' as any]: theme.hoverScale,
        ['--theme-grid-columns' as any]: theme.gridColumns,
        ['--theme-grid-gap' as any]: `${theme.gridGap}px`,
      }}
      data-edit-path="__root"
      onClick={() => onSelect('__root')}
    >
      {theme.customCss ? <style>{theme.customCss}</style> : null}
      {bgEnabled && bgUrl ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `url(${bgUrl})`,
            backgroundSize: bgFit,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: `${Math.round(bgPosX * 100)}% ${Math.round(bgPosY * 100)}%`,
            opacity: bgOpacity,
          }}
        />
      ) : null}

      <div className="relative z-10">
        <Header
          node={headerNode}
          onSelect={onSelect}
          resolveAssetUrl={(k: string) => resolveAssetUrl(k, overrides, assets)}
          theme={theme}
          responsive={responsive}
        />

        <main>
          {storeName ? (
            <section className="w-full py-3">
              <div className="container mx-auto px-6 flex items-center gap-3">
                <div
                  className="text-sm font-semibold"
                  data-edit-path="__settings.store_name"
                  onClick={() => onSelect('__settings.store_name')}
                >
                  {storeName}
                </div>
              </div>
            </section>
          ) : null}

          <CategoryPills
            categories={Array.isArray(props.categories) ? props.categories.filter(Boolean) : []}
            active={props.categoryFilter || ''}
            theme={theme}
            onPick={(c) => props.setCategoryFilter?.(c)}
            onSelect={onSelect}
          />

          <Hero
            node={{
              ...heroNode,
              title: { type: 'text', value: resolvedHeroTitle },
              subtitle: resolvedHeroSubtitle ? { type: 'text', value: resolvedHeroSubtitle } : undefined,
              cta: heroNode?.cta?.length
                ? [
                    {
                      ...heroNode.cta[0],
                      label: {
                        ...(cta0LabelBase || {}),
                        type: 'text' as const,
                        value: resolvedHeroButtonText || String(heroNode.cta[0].label?.value || ''),
                      },
                    },
                    ...(resolvedHeroButton2Text
                      ? [
                          {
                            ...(heroNode.cta[1] || {}),
                            label: {
                              ...(cta1LabelBase || {}),
                              type: 'text' as const,
                              value: resolvedHeroButton2Text,
                            },
                            action: typeof heroNode?.cta?.[1]?.action === 'string' ? heroNode.cta[1].action : '/products',
                          },
                        ]
                      : []),
                  ]
                : resolvedHeroButtonText
                ? [
                    { label: { type: 'text', value: resolvedHeroButtonText }, action: '/reserve' },
                    ...(resolvedHeroButton2Text ? [{ label: { type: 'text', value: resolvedHeroButton2Text }, action: '/products' }] : []),
                  ]
                : [],
            }}
            onSelect={onSelect}
            resolveAssetUrl={(k: string) => resolveAssetUrl(k, overrides, assets)}
            ctaStyle={accent ? { backgroundColor: accent } : undefined}
            theme={theme}
            responsive={responsive}
            videoUrl={heroVideoUrl}
            canManage={canManage}
          />

          <ProductGrid
            items={featuredItems}
            columns={asString((props.settings as any)?.template_grid_columns) || (featuredNode as any)?.columns || 3}
            gap={asString((props.settings as any)?.template_grid_gap) || (featuredNode as any)?.gap}
            paddingY={(featuredNode as any)?.paddingY}
            paddingX={(featuredNode as any)?.paddingX}
            backgroundColor={String((featuredNode as any)?.backgroundColor || '') || undefined}
            card={(featuredNode as any)?.card}
            onSelect={onSelect}
            resolveAssetUrl={(k: string) => resolveAssetUrl(k, overrides, assets)}
            formatPrice={props.formatPrice}
            ctaStyle={accent ? { backgroundColor: accent } : undefined}
            addLabel={addLabel}
            theme={theme}
            responsive={responsive}
          />
        </main>

        <Footer node={footerNode} onSelect={onSelect} theme={theme} responsive={responsive} />
      </div>
    </div>
  );
}
