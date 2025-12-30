/**
 * Shiro Hana Template Schema Types
 * 
 * This file re-exports types from the Universal Store Schema.
 * All templates should use the Universal Schema as the single source of truth.
 * 
 * When the Universal Schema is updated, all templates automatically get the updates.
 */

// Re-export everything from Universal Schema
export type {
  // Core types
  Exposure,
  BreakpointKey,
  ResponsiveValue,
  
  // Primitive nodes
  TextNode,
  ImageNode,
  VideoNode,
  CtaNode,
  LinkNode,
  
  // Asset management
  Asset,
  AssetsMap,
  
  // Meta
  StoreMeta,
  
  // Section types
  HeaderNode,
  HeroNode,
  HeroLayout,
  ProductNode,
  ProductLayout,
  ProductSize,
  ProductShape,
  ProductStyle,
  ProductBadge,
  HoverEffect,
  ProductGridNode,
  GridLayout,
  BannerNode,
  TestimonialNode,
  TestimonialItem,
  CarouselNode,
  CarouselItem,
  CollectionNode,
  CollectionItem,
  FeaturesNode,
  FeatureItem,
  CustomNode,
  FooterNode,
  FooterColumn,
  
  // Section union
  SectionNode,
  SectionType,
  
  // Theme & Styles
  ThemeMode,
  BackgroundConfig,
  FontConfig,
  SpacingTokens,
  StylesConfig,
  
  // Layout
  LayoutConfig,
  
  // SEO
  SeoConfig,
  
  // Main schema
  UniversalStoreSchema,
} from '@/../../shared/universal-store-schema';

// Re-export helper functions
export {
  BASIC_FIELDS,
  ADVANCED_FIELDS,
  isBasicField,
  isAdvancedField,
  DEFAULT_SCHEMA,
  createStoreSchema,
  getVisibleSections,
  mergeSchema,
} from '@/../../shared/universal-store-schema';

// ============================================================================
// LEGACY TYPE ALIASES (for backward compatibility)
// ============================================================================

import type { ProductGridNode } from '@/../../shared/universal-store-schema';

/**
 * @deprecated Use ProductGridNode instead
 */
export type FeaturedGridNode = ProductGridNode;
