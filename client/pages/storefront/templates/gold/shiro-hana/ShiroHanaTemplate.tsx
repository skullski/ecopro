import React from 'react';
import type { TemplateProps } from '../../types';
import shiroHanaHome from '../shiro-hana-home.json';
import { Hero } from './hero';
import { ProductGrid } from './productsgrid';
import { Header, Footer } from './header-footer';
import type { FeaturedGridNode, FooterNode, HeaderNode, HeroNode, ProductNode } from './schema-types';
import { migrateShiroHanaDoc } from './migrations';
import { resolveResponsiveNumber } from './responsive';

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
  return asString(assets?.[assetKey]?.url) || `/assets/${assetKey}`;
}

function overridesForBackground(settings: any): Record<string, string> {
  // Background image is controlled by schema assets (or a direct URL assetKey).
  // We intentionally do NOT bind it to store_logo/banner_url.
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
      const isSm = w >= 640;
      const isMd = w >= 768;
      const breakpoint: ResponsiveInfo['breakpoint'] = isMd ? 'desktop' : isSm ? 'tablet' : 'mobile';
      setResponsive({ width: w, isSm, isMd, breakpoint });
    };

    compute();

    // ResizeObserver for container-width responsive behavior in editor preview frames.
    const ro = new ResizeObserver(() => compute());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const rawPage: any = (props.settings as any)?.gold_page_shiro_hana_home || (shiroHanaHome as any);
  const page: any = migrateShiroHanaDoc(rawPage).doc || rawPage;
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
  const mode = forcedMode ?? (String(page?.styles?.theme || 'light').toLowerCase() === 'dark' ? 'dark' : 'light');
  const cssVar = (name: string) => `hsl(var(--${name}))`;

  const theme = {
    colors: {
      background: page?.styles?.colors?.background || cssVar('background'),
      surface: page?.styles?.colors?.surface || cssVar('card'),
      text: page?.styles?.colors?.text || cssVar('foreground'),
      muted: page?.styles?.colors?.muted || cssVar('muted-foreground'),
      accent: page?.styles?.colors?.accent || page?.styles?.accent || cssVar('primary'),
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
  const featuredNode = layout.featured as FeaturedGridNode;
  const footerNode = layout.footer as FooterNode;

  const storeName = (props.settings.store_name || '').trim();
  const storeDescription = (props.settings.store_description || '').trim();

  const overrides: Record<string, string> = {
    'logo-main': asString(props.settings.store_logo),
    'hero-sushi': asString(props.settings.banner_url),
  };

  const accent =
    asString(props.settings.template_accent_color) ||
    asString(props.primaryColor) ||
    (page?.styles?.accent ? String(page.styles.accent) : '');

  const resolvedHeroTitle = (props.settings.template_hero_heading || '').trim() || asString(heroNode?.title?.value);
  const resolvedHeroSubtitle = (props.settings.template_hero_subtitle || '').trim() || storeDescription || asString(heroNode?.subtitle?.value);
  const resolvedHeroButtonText =
    (props.settings.template_button_text || '').trim() ||
    (heroNode?.cta?.[0]?.label?.value ? String(heroNode.cta[0].label.value) : '');

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
