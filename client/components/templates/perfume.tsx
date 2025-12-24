import React, { useState, useMemo } from 'react';
import { TemplateProps } from '@/pages/storefront/templates/types';
import { useTemplateUniversalSettings } from '@/hooks/useTemplateUniversalSettings';

export default function PerfumeTemplate(props: TemplateProps) {
  const universalSettings = useTemplateUniversalSettings();
  const { navigate, storeSlug } = props;
  const [filter, setFilter] = useState('all');

  const products = props.products || [];
  const settings = props.settings || {};

  // Extract universal settings with defaults
  const {
    primary_color = '#f59e0b',
    secondary_color = '#000000',
    accent_color = '#f59e0b',
    text_color = '#eeeeee',
    secondary_text_color = '#a1a1a1',
    font_family = 'Inter',
    border_radius = 18,
    enable_animations = true,
  } = useMemo(() => universalSettings as any || {}, [universalSettings]);

  const storeName = settings.store_name || 'Premium Scents';
  const bannerImage = settings.banner_url || 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1600&q=80';
  const heroVideoUrl = settings.hero_video_url || null;

  const emptyTitle = settings.template_empty_title || 'No Fragrances Yet';
  const emptySubtitle = settings.template_empty_subtitle || 'Add fragrances to your store to see them displayed here.';
  const emptyHint = settings.template_empty_hint || 'Products will appear automatically once you add them to your store.';

  const heroHeading = settings.template_hero_heading || 'A New Way to Experience Scent';
  const heroSubtitle =
    settings.template_hero_subtitle ||
    'Three realms. One universe. Discover fragrances crafted for mood, presence, and identity.';

  const editorial1Title = settings.template_editorial_1_title || 'Realm I — Noir Extrait';
  const editorial1Text =
    settings.template_editorial_1_text ||
    'Built for night-heavy rooms. Amber, smoke, and vanilla crafted to leave a trail of warmth and mystery.';
  const editorial2Title = settings.template_editorial_2_title || 'Realm II — Golden Luxe';
  const editorial2Text =
    settings.template_editorial_2_text ||
    'Bright, structured, and modern. Neroli, citrus, and musk for clean daytime presence.';
  const editorial3Title = settings.template_editorial_3_title || 'Realm III — Dreamscape';
  const editorial3Text =
    settings.template_editorial_3_text ||
    'Minimal, airy, and skin-like. Soft musks and woods that feel like a second skin.';

  const filterAllLabel = settings.template_filter_all_label || 'All';
  const filterDarkLabel = settings.template_filter_dark_label || 'Noir';
  const filterGoldLabel = settings.template_filter_gold_label || 'Gold';
  const filterDreamLabel = settings.template_filter_dream_label || 'Dream';

  const featuredTitle = settings.template_featured_title || 'Featured';
  const exploreMoreTitle = settings.template_explore_more_title || 'Explore More';
  const allScentsTitle = settings.template_all_scents_title || 'All Scents';
  const buyNowLabel = settings.template_buy_now_label || 'Buy Now';
  const footerRights = settings.template_footer_rights || 'All rights reserved.';

  // Parse custom categories from template settings if available
  const customCategories = useMemo(() => {
    try {
      const cats = (settings as any).template_categories;
      if (typeof cats === 'string') {
        return JSON.parse(cats);
      }
      return Array.isArray(cats) ? cats : null;
    } catch {
      return null;
    }
  }, [settings]);

  // Normalize products with realm mapping
  const getRealm = (product: any) => {
    const realm = product.realm || product.category || 'gold';
    return realm.toLowerCase();
  };

  const normalizedProducts = products.map((p: any, idx: number) => {
    const realm = getRealm(p);
    return {
      ...p,
      images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [bannerImage],
      realm,
      realmLabel: realm === 'dark' ? 'Realm I' : realm === 'gold' ? 'Realm II' : 'Realm III',
      family: p.family || 'Premium',
      intensity: p.intensity || 'Day',
      notes: Array.isArray(p.notes) ? p.notes : ['Fragrance', 'Aroma'],
    };
  });

  // Get realm badge colors
  const getRealmColor = (realm: string) => {
    if (realm === 'dark') return { bg: '#78350f', text: '#fef3c7', label: 'Noir' };
    if (realm === 'gold') return { bg: '#713f12', text: '#fef08a', label: 'Gold' };
    return { bg: '#0c4a6e', text: '#bae6fd', label: 'Dream' };
  };

  // Extract realms from products or use custom categories
  let realms: any[] = [];
  if (customCategories && customCategories.length > 0) {
    realms = ['all', ...customCategories.map((c: any) => c.name || c)];
  } else {
    realms = ['all', ...new Set(normalizedProducts.map((p: any) => p.realm))];
  }
  
  const filtered = filter === 'all' ? normalizedProducts : normalizedProducts.filter((p: any) => p.realm === filter);

  // Product Card Component
  const ProductCard = ({ p }: any) => {
    const realmColor = getRealmColor(p.realm);
    return (
      <div
        className="rounded-xl overflow-hidden group cursor-pointer transition"
        style={{
          backgroundColor: '#0b0b0f',
          border: '1px solid #1f1f2b',
        }}
        onClick={() => navigate(p.slug && p.slug.length > 0 ? `/store/${storeSlug}/${p.slug}` : `/product/${p.id}`)}
      >
        <div className="relative h-64 overflow-hidden">
          <img
            src={p.images[0]}
            alt={p.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>

          <div
            className="absolute top-3 left-3 px-3 py-1 text-[10px] uppercase tracking-widest font-semibold rounded-full"
            style={{ backgroundColor: realmColor.bg, color: realmColor.text }}
          >
            {p.realmLabel}
          </div>
        </div>

        <div className="p-4">
          <h3 className="text-sm font-semibold text-zinc-100">{p.name}</h3>
          <p className="text-xs text-zinc-400 mb-2">
            {p.family} · {p.intensity}
          </p>

          <div className="space-y-1 text-[11px] text-zinc-300 opacity-80 group-hover:opacity-100 transition-opacity">
            {p.notes.slice(0, 3).map((note: string, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zinc-600"></span>
                <span>{note}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 font-semibold text-sm" style={{ color: primary_color }}>
            {p.price} DZD
          </div>

          <button
            className="w-full mt-3 py-2 rounded-lg font-semibold text-xs hover:opacity-90 transition text-white"
            style={{ backgroundColor: primary_color }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`checkout/${p.id}`);
            }}
          >
            {buyNowLabel}
          </button>
        </div>
      </div>
    );
  };

  // Render empty state
  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: secondary_color }}>
        <div className="text-center max-w-md mx-auto p-4 md:p-6">
          <div className="text-6xl mb-4">🧴</div>
          <h1 className="text-xl md:text-2xl font-serif font-bold mb-4" style={{ color: text_color }}>{emptyTitle}</h1>
          <p className="mb-6" style={{ color: secondary_text_color }}>{emptySubtitle}</p>
          <p className="text-sm" style={{ color: secondary_text_color }}>{emptyHint}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: secondary_color, color: text_color }} className="min-h-screen">
      {/* HERO SECTION */}
      <section
        className="relative h-screen max-h-[90vh] overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: heroVideoUrl ? 'none' : `url(${bannerImage})` }}
      >
        {heroVideoUrl && (
          <video
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
              zIndex: 0,
            }}
          >
            <source src={heroVideoUrl} type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.6), rgba(0,0,0,0.9))' }}></div>

        <div className="absolute bottom-16 left-10 max-w-2xl pr-6">
          <h1 className="text-5xl md:text-6xl font-serif font-semibold mb-3" style={{ color: text_color }}>
            {heroHeading}
          </h1>
          <p className="text-base md:text-lg" style={{ color: secondary_text_color }}>
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* REALM EDITORIAL BLOCKS */}
      <section className="max-w-6xl mx-auto px-6 py-20 space-y-20">
        {/* Realm I - Dark */}
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <img src={bannerImage} alt="Realm I" className="rounded-xl opacity-80" />
          <div>
            <h2 className="text-3xl font-serif mb-3" style={{ color: '#fef3c7' }}>
              {editorial1Title}
            </h2>
            <p className="text-base leading-relaxed" style={{ color: secondary_text_color }}>
              {editorial1Text}
            </p>
          </div>
        </div>

        {/* Realm II - Gold */}
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-3xl font-serif mb-3" style={{ color: '#fef08a' }}>
              {editorial2Title}
            </h2>
            <p className="text-base leading-relaxed" style={{ color: secondary_text_color }}>
              {editorial2Text}
            </p>
          </div>
          <img src={bannerImage} alt="Realm II" className="rounded-xl opacity-80" />
        </div>

        {/* Realm III - Dream */}
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <img src={bannerImage} alt="Realm III" className="rounded-xl opacity-80" />
          <div>
            <h2 className="text-3xl font-serif mb-3" style={{ color: '#bae6fd' }}>
              {editorial3Title}
            </h2>
            <p className="text-base leading-relaxed" style={{ color: secondary_text_color }}>
              {editorial3Text}
            </p>
          </div>
        </div>
      </section>

      {/* FILTERS */}
      <section className="max-w-6xl mx-auto px-6 mb-8">
        <div className="flex gap-3 flex-wrap">
          {[
            ['all', filterAllLabel],
            ['dark', filterDarkLabel],
            ['gold', filterGoldLabel],
            ['art', filterDreamLabel],
          ].map(([v, label]) => (
            <button
              key={v}
              onClick={() => setFilter(v as any)}
              className="px-4 py-2 rounded-full border text-[11px] font-semibold uppercase tracking-widest transition"
              style={{
                borderColor: filter === v ? primary_color : '#3f3f46',
                color: filter === v ? primary_color : secondary_text_color,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* FEATURED ROW */}
      <section className="max-w-6xl mx-auto px-6 mb-16">
        <h2 className="text-2xl font-serif mb-6">{featuredTitle}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {filtered.slice(0, 2).map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      {/* CAROUSEL */}
      <section className="max-w-6xl mx-auto px-6 mb-16">
        <h2 className="text-2xl font-serif mb-6">{exploreMoreTitle}</h2>
        <div className="flex gap-6 overflow-x-auto pb-4" style={{ scrollSnapType: 'x mandatory' }}>
          {filtered.map((p) => (
            <div key={p.id} style={{ scrollSnapAlign: 'start' }} className="min-w-[280px]">
              <ProductCard p={p} />
            </div>
          ))}
        </div>
      </section>

      {/* GRID */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-serif mb-6">{allScentsTitle}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-8" style={{ borderColor: `${primary_color}30` }}>
        <div className="max-w-6xl mx-auto px-6 text-center text-sm" style={{ color: secondary_text_color }}>
          <p>&copy; {new Date().getFullYear()} {storeName}. {footerRights}</p>
        </div>
      </footer>
    </div>
  );
}

export const TEMPLATE_EDITOR_SECTIONS = [
  {
    title: 'Perfume: Empty State',
    fields: [
      { key: 'template_empty_title', label: 'Empty Title', type: 'text', defaultValue: 'No Fragrances Yet' },
      { key: 'template_empty_subtitle', label: 'Empty Subtitle', type: 'text', defaultValue: 'Add fragrances to your store to see them displayed here.' },
      { key: 'template_empty_hint', label: 'Empty Hint', type: 'text', defaultValue: 'Products will appear automatically once you add them to your store.' },
    ],
  },
  {
    title: 'Perfume: Hero',
    fields: [
      { key: 'template_hero_heading', label: 'Hero Heading', type: 'text', defaultValue: 'A New Way to Experience Scent' },
      {
        key: 'template_hero_subtitle',
        label: 'Hero Subtitle',
        type: 'text',
        defaultValue: 'Three realms. One universe. Discover fragrances crafted for mood, presence, and identity.',
      },
    ],
  },
  {
    title: 'Perfume: Editorial Blocks',
    fields: [
      { key: 'template_editorial_1_title', label: 'Editorial 1 Title', type: 'text', defaultValue: 'Realm I — Noir Extrait' },
      {
        key: 'template_editorial_1_text',
        label: 'Editorial 1 Text',
        type: 'text',
        defaultValue: 'Built for night-heavy rooms. Amber, smoke, and vanilla crafted to leave a trail of warmth and mystery.',
      },
      { key: 'template_editorial_2_title', label: 'Editorial 2 Title', type: 'text', defaultValue: 'Realm II — Golden Luxe' },
      {
        key: 'template_editorial_2_text',
        label: 'Editorial 2 Text',
        type: 'text',
        defaultValue: 'Bright, structured, and modern. Neroli, citrus, and musk for clean daytime presence.',
      },
      { key: 'template_editorial_3_title', label: 'Editorial 3 Title', type: 'text', defaultValue: 'Realm III — Dreamscape' },
      {
        key: 'template_editorial_3_text',
        label: 'Editorial 3 Text',
        type: 'text',
        defaultValue: 'Minimal, airy, and skin-like. Soft musks and woods that feel like a second skin.',
      },
    ],
  },
  {
    title: 'Perfume: Filters & Labels',
    fields: [
      { key: 'template_filter_all_label', label: 'Filter Label (All)', type: 'text', defaultValue: 'All' },
      { key: 'template_filter_dark_label', label: 'Filter Label (Dark)', type: 'text', defaultValue: 'Noir' },
      { key: 'template_filter_gold_label', label: 'Filter Label (Gold)', type: 'text', defaultValue: 'Gold' },
      { key: 'template_filter_dream_label', label: 'Filter Label (Dream)', type: 'text', defaultValue: 'Dream' },
      { key: 'template_featured_title', label: 'Featured Title', type: 'text', defaultValue: 'Featured' },
      { key: 'template_explore_more_title', label: 'Explore More Title', type: 'text', defaultValue: 'Explore More' },
      { key: 'template_all_scents_title', label: 'All Scents Title', type: 'text', defaultValue: 'All Scents' },
      { key: 'template_buy_now_label', label: 'Buy Now Label', type: 'text', defaultValue: 'Buy Now' },
      { key: 'template_footer_rights', label: 'Footer Rights Text', type: 'text', defaultValue: 'All rights reserved.' },
    ],
  },
] as const;
