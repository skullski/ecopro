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

  // Single template - always use shiro-hana
  const legacyDocKey = 'gold_page_shiro_hana_home';
  const defaultLegacyPage = shiroHanaHome as any;

  const storedSchema = (props.settings as any)?.store_schema;
  const rawLegacyPage: any = (props.settings as any)?.[legacyDocKey] || defaultLegacyPage;

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

  const theme = {
    colors: {
      background: page?.styles?.backgroundColor || page?.styles?.colors?.background || cssVar('background'),
      surface: page?.styles?.colors?.surface || cssVar('card'),
      text: page?.styles?.textColor || page?.styles?.colors?.text || cssVar('foreground'),
      muted: page?.styles?.colors?.muted || cssVar('muted-foreground'),
      accent:
        page?.styles?.accentColor ||
        page?.styles?.primaryColor ||
        page?.styles?.colors?.accent ||
        page?.styles?.accent ||
        cssVar('primary'),
    },
    fonts: {
      heading: page?.styles?.fonts?.heading,
      body: page?.styles?.fonts?.body,
    },
    radius: page?.styles?.tokens?.radius,
    space: page?.styles?.tokens?.space,
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

  const resolvedHeroTitle = docHeroTitle || settingsHeroTitle;
  const resolvedHeroSubtitle = docHeroSubtitle || settingsHeroSubtitle || storeDescription;
  const resolvedHeroButtonText = docHeroButtonText || settingsHeroButtonText;

  const heroVideoUrl = asString((props.settings as any)?.hero_video_url);

  const schemaFeaturedItems = Array.isArray(featuredNode?.items) ? featuredNode.items : [];

  const addLabel = asString(featuredNode?.addLabel?.value) || 'Add';
  const productItems: ProductNode[] = (props.products || []).slice(0, 6).map((p) => ({
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
      }}
      data-edit-path="__root"
    >
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
          onSelect={() => null}
          resolveAssetUrl={(k: string) => resolveAssetUrl(k, overrides, assets)}
          theme={theme}
          responsive={responsive}
        />

        <main>
          <section className="w-full py-3">
            <div className="container mx-auto px-6 flex items-center gap-3">
              {storeName ? (
                <div
                  className="text-sm font-semibold"
                  data-edit-path="__settings.store_name"
                >
                  {storeName}
                </div>
              ) : null}
            </div>
          </section>

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
                        ...(heroNode.cta[0].label && typeof heroNode.cta[0].label === 'object' ? heroNode.cta[0].label : { type: 'text', value: '' }),
                        value: resolvedHeroButtonText || String(heroNode.cta[0].label?.value || ''),
                      },
                    },
                  ]
                : resolvedHeroButtonText
                ? [{ label: { type: 'text', value: resolvedHeroButtonText }, action: '/reserve' }]
                : [],
            }}
            onSelect={() => null}
            resolveAssetUrl={(k: string) => resolveAssetUrl(k, overrides, assets)}
            ctaStyle={accent ? { backgroundColor: accent } : undefined}
            theme={theme}
            responsive={responsive}
            videoUrl={heroVideoUrl}
          />

          <ProductGrid
            items={featuredItems}
            columns={(featuredNode as any)?.columns || 3}
            gap={(featuredNode as any)?.gap}
            paddingY={(featuredNode as any)?.paddingY}
            paddingX={(featuredNode as any)?.paddingX}
            backgroundColor={String((featuredNode as any)?.backgroundColor || '') || undefined}
            card={(featuredNode as any)?.card}
            onSelect={() => null}
            resolveAssetUrl={(k: string) => resolveAssetUrl(k, overrides, assets)}
            formatPrice={props.formatPrice}
            ctaStyle={accent ? { backgroundColor: accent } : undefined}
            addLabel={addLabel}
            theme={theme}
            responsive={responsive}
          />
        </main>

        <Footer node={footerNode} onSelect={() => null} theme={theme} responsive={responsive} />
      </div>
    </div>
  );
}
