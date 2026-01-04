export type TemplateEditContract = {
  editPaths: string[];
  settingKeys: string[];
};

// Canonical, reusable contract for template editors and templates.
// This is intentionally framework-agnostic so you can use it when building new templates.
// Source of truth for descriptions remains docs/TEMPLATE_EDITS_REFERENCE.md.
export const TEMPLATE_EDITS_CONTRACT: TemplateEditContract = {
  editPaths: [
    // Header
    'layout.header',
    'layout.header.logo',
    'layout.header.nav',

    // Hero
    'layout.hero',
    'layout.hero.title',
    'layout.hero.subtitle',
    'layout.hero.kicker',
    'layout.hero.cta',
    'layout.hero.image',
    'layout.hero.badge',

    // Categories
    'layout.categories',

    // Featured / grid
    'layout.featured',
    'layout.featured.title',
    'layout.featured.subtitle',
    'layout.featured.items',
    'layout.featured.addLabel',
    'layout.grid',

    // Footer
    'layout.footer',
    'layout.footer.copyright',
    'layout.footer.links',
    'layout.footer.social',

    // Global
    '__root',
    '__settings',
    '__settings.store_name',
  ],

  settingKeys: [
    // Store basics
    'store_logo',
    'store_name',
    'store_description',

    // Header
    'template_header_bg',
    'template_header_text',
    'template_nav_links',

    // Hero
    'template_hero_heading',
    'template_hero_title_color',
    'template_hero_title_size',
    'template_hero_subtitle',
    'template_hero_subtitle_color',
    'template_hero_subtitle_size',
    'template_hero_kicker',
    'template_hero_kicker_color',
    'template_button_text',
    'template_button2_text',
    'template_accent_color',
    'template_button2_border',
    'banner_url',
    'hero_video_url',
    'template_hero_badge_title',
    'template_hero_badge_subtitle',

    // Category pills
    'template_category_pill_bg',
    'template_category_pill_text',
    'template_category_pill_active_bg',
    'template_category_pill_active_text',
    'template_category_pill_border_radius',

    // Featured / grid
    'template_featured_title',
    'template_featured_subtitle',
    'template_section_title_color',
    'template_section_title_size',
    'template_section_subtitle_color',
    'template_grid_columns',
    'template_grid_gap',
    'template_card_bg',
    'template_card_border_radius',
    'template_product_title_color',
    'template_product_price_color',
    'template_add_to_cart_label',

    // Footer
    'template_copyright',
    'template_footer_text',
    'template_footer_link_color',
    'template_social_links',

    // Typography
    'template_font_family',
    'template_font_weight',
    'template_heading_font_weight',

    // Border radius
    'template_border_radius',
    'template_button_border_radius',

    // Spacing
    'template_spacing',
    'template_section_spacing',

    // Animations
    'template_animation_speed',
    'template_hover_scale',

    // Custom CSS
    'template_custom_css',
  ],
};
