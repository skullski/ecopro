import { TemplateProps } from './types';
import BagsTemplate from './gold/bags/BagsTemplate';
import JewelryTemplate from './gold/jewelry/JewelryTemplate';
import FashionTemplate from './gold/fashion/FashionTemplate';
import ElectronicsTemplate from './gold/electronics/ElectronicsTemplate';
import BeautyTemplate from './gold/beauty/BeautyTemplate';
import FoodTemplate from './gold/food/FoodTemplate';
import CafeTemplate from './gold/cafe/CafeTemplate';
import FurnitureTemplate from './gold/furniture/FurnitureTemplate';
import PerfumeTemplate from './gold/perfume/PerfumeTemplate';
import MinimalTemplate from './gold/minimal/MinimalTemplate';
import ClassicTemplate from './gold/classic/ClassicTemplate';
import ModernTemplate from './gold/modern/ModernTemplate';
// New templates
import SportsTemplate from './gold/sports/SportsTemplate';
import BooksTemplate from './gold/books/BooksTemplate';
import PetsTemplate from './gold/pets/PetsTemplate';
import ToysTemplate from './gold/toys/ToysTemplate';
import GardenTemplate from './gold/garden/GardenTemplate';
import ArtTemplate from './gold/art/ArtTemplate';
import MusicTemplate from './gold/music/MusicTemplate';
import HealthTemplate from './gold/health/HealthTemplate';
import WatchesTemplate from './gold/watches/WatchesTemplate';
import ShoesTemplate from './gold/shoes/ShoesTemplate';
import GamingTemplate from './gold/gaming/GamingTemplate';
import AutomotiveTemplate from './gold/automotive/AutomotiveTemplate';
import CraftsTemplate from './gold/crafts/CraftsTemplate';
import OutdoorTemplate from './gold/outdoor/OutdoorTemplate';
import VintageTemplate from './gold/vintage/VintageTemplate';
import TechTemplate from './gold/tech/TechTemplate';
import OrganicTemplate from './gold/organic/OrganicTemplate';
import LuxuryTemplate from './gold/luxury/LuxuryTemplate';
import KidsTemplate from './gold/kids/KidsTemplate';
import TravelTemplate from './gold/travel/TravelTemplate';
import PhotographyTemplate from './gold/photography/PhotographyTemplate';
import WeddingTemplate from './gold/wedding/WeddingTemplate';
import FitnessTemplate from './gold/fitness/FitnessTemplate';
import GiftsTemplate from './gold/gifts/GiftsTemplate';
import CandlesTemplate from './gold/candles/CandlesTemplate';
import SkincareTemplate from './gold/skincare/SkincareTemplate';
import SupplementsTemplate from './gold/supplements/SupplementsTemplate';
import PhoneAccessoriesTemplate from './gold/phone-accessories/PhoneAccessoriesTemplate';
import ToolsTemplate from './gold/tools/ToolsTemplate';
import OfficeTemplate from './gold/office/OfficeTemplate';
import StationeryTemplate from './gold/stationery/StationeryTemplate';
import NeonTemplate from './gold/neon/NeonTemplate';
import PastelTemplate from './gold/pastel/PastelTemplate';
import MonochromeTemplate from './gold/monochrome/MonochromeTemplate';
import GradientTemplate from './gold/gradient/GradientTemplate';
import FloristTemplate from './gold/florist/FloristTemplate';
import EyewearTemplate from './gold/eyewear/EyewearTemplate';
import LingerieTemplate from './gold/lingerie/LingerieTemplate';
import SwimwearTemplate from './gold/swimwear/SwimwearTemplate';
import StreetWearTemplate from './gold/streetwear/StreetWearTemplate';
import WineTemplate from './gold/wine/WineTemplate';
import ChocolateTemplate from './gold/chocolate/ChocolateTemplate';
import TeaTemplate from './gold/tea/TeaTemplate';
import ProTemplate from './gold/pro/ProTemplate';
import ProAuroraTemplate from './gold/pro-aurora/ProAuroraTemplate';
import ProVertexTemplate from './gold/pro-vertex/ProVertexTemplate';
import ProAtelierTemplate from './gold/pro-atelier/ProAtelierTemplate';
import ProOrbitTemplate from './gold/pro-orbit/ProOrbitTemplate';
import ProZenTemplate from './gold/pro-zen/ProZenTemplate';
import ProStudioTemplate from './gold/pro-studio/ProStudioTemplate';
import ProMosaicTemplate from './gold/pro-mosaic/ProMosaicTemplate';
import ProGridTemplate from './gold/pro-grid/ProGridTemplate';
import ProCatalogTemplate from './gold/pro-catalog/ProCatalogTemplate';
// Screenshot-inspired templates - Batch 1 (Green/Sage)
import SageBoutiqueTemplate from './gold/sage-boutique/SageBoutiqueTemplate';
import MintEleganceTemplate from './gold/mint-elegance/MintEleganceTemplate';
import ForestStoreTemplate from './gold/forest-store/ForestStoreTemplate';
// Screenshot-inspired templates - Batch 2 (Orange/Coral)
import SunsetShopTemplate from './gold/sunset-shop/SunsetShopTemplate';
import CoralMarketTemplate from './gold/coral-market/CoralMarketTemplate';
import AmberStoreTemplate from './gold/amber-store/AmberStoreTemplate';
// Screenshot-inspired templates - Batch 3 (Magenta/Pink)
import MagentaMallTemplate from './gold/magenta-mall/MagentaMallTemplate';
import BerryMarketTemplate from './gold/berry-market/BerryMarketTemplate';
import RoseCatalogTemplate from './gold/rose-catalog/RoseCatalogTemplate';
// Screenshot-inspired templates - Batch 4 (Lime/Green)
import LimeDirectTemplate from './gold/lime-direct/LimeDirectTemplate';
import EmeraldShopTemplate from './gold/emerald-shop/EmeraldShopTemplate';
import NeonStoreTemplate from './gold/neon-store/NeonStoreTemplate';
// Screenshot-inspired templates - Batch 5 (Clean/Minimal)
import CleanSingleTemplate from './gold/clean-single/CleanSingleTemplate';
import PureProductTemplate from './gold/pure-product/PureProductTemplate';
import SnowShopTemplate from './gold/snow-shop/SnowShopTemplate';
// Screenshot-inspired templates - Batch 6 (Gallery)
import GalleryProTemplate from './gold/gallery-pro/GalleryProTemplate';
import ShowcasePlusTemplate from './gold/showcase-plus/ShowcasePlusTemplate';
import ExhibitStoreTemplate from './gold/exhibit-store/ExhibitStoreTemplate';

/**
 * Available template IDs.
 */
export type TemplateId = 
  | 'bags' 
  | 'jewelry'
  | 'fashion'
  | 'electronics'
  | 'beauty'
  | 'food'
  | 'cafe'
  | 'furniture'
  | 'perfume'
  | 'minimal'
  | 'classic'
  | 'modern'
  | 'sports'
  | 'books'
  | 'pets'
  | 'toys'
  | 'garden'
  | 'art'
  | 'music'
  | 'health'
  | 'watches'
  | 'shoes'
  | 'gaming'
  | 'automotive'
  | 'crafts'
  | 'outdoor'
  | 'vintage'
  | 'tech'
  | 'organic'
  | 'luxury'
  | 'kids'
  | 'travel'
  | 'photography'
  | 'wedding'
  | 'fitness'
  | 'gifts'
  | 'candles'
  | 'skincare'
  | 'supplements'
  | 'phone-accessories'
  | 'tools'
  | 'office'
  | 'stationery'
  | 'neon'
  | 'pastel'
  | 'monochrome'
  | 'gradient'
  | 'florist'
  | 'eyewear'
  | 'lingerie'
  | 'swimwear'
  | 'streetwear'
  | 'wine'
  | 'chocolate'
  | 'tea'
  | 'pro'
  | 'pro-aurora'
  | 'pro-vertex'
  | 'pro-atelier'
  | 'pro-orbit'
  | 'pro-zen'
  | 'pro-studio'
  | 'pro-mosaic'
  | 'pro-grid'
  | 'pro-catalog'
  // Screenshot-inspired templates
  | 'sage-boutique'
  | 'mint-elegance'
  | 'forest-store'
  | 'sunset-shop'
  | 'coral-market'
  | 'amber-store'
  | 'magenta-mall'
  | 'berry-market'
  | 'rose-catalog'
  | 'lime-direct'
  | 'emerald-shop'
  | 'neon-store'
  | 'clean-single'
  | 'pure-product'
  | 'snow-shop'
  | 'gallery-pro'
  | 'showcase-plus'
  | 'exhibit-store';

/**
 * Normalize template ID.
 */
export function normalizeTemplateId(t: string): TemplateId {
  const raw = String(t || '')
    .trim()
    .toLowerCase()
    .replace(/^gold-/, '')
    .replace(/-gold$/, '');
  if (!raw) return 'pro';
  // Removed templates (backwards compatibility)
  if (raw === 'shiro-hana') return 'pro';
  if (raw === 'babyos' || raw === 'baby') return 'kids';
  // Pro variants
  if (raw === 'pro-aurora' || raw === 'aurora-pro') return 'pro-aurora';
  if (raw === 'pro-vertex' || raw === 'vertex-pro') return 'pro-vertex';
  if (raw === 'pro-atelier' || raw === 'atelier-pro') return 'pro-atelier';
  if (raw === 'pro-orbit' || raw === 'orbit-pro') return 'pro-orbit';
  if (raw === 'pro-zen' || raw === 'zen-pro') return 'pro-zen';
  if (raw === 'pro-studio' || raw === 'studio-pro') return 'pro-studio';
  if (raw === 'pro-mosaic' || raw === 'mosaic-pro') return 'pro-mosaic';
  if (raw === 'pro-grid' || raw === 'grid-pro') return 'pro-grid';
  if (raw === 'pro-catalog' || raw === 'catalog-pro') return 'pro-catalog';
  // Original templates
  if (raw === 'minimal' || raw === 'simple') return 'minimal';
  if (raw === 'classic' || raw === 'traditional') return 'classic';
  if (raw === 'modern' || raw === 'bold') return 'modern';
  if (raw === 'jewelry') return 'jewelry';
  if (raw === 'bags') return 'bags';
  if (raw === 'fashion') return 'fashion';
  if (raw === 'electronics') return 'electronics';
  if (raw === 'beauty' || raw === 'cosmetics') return 'beauty';
  if (raw === 'food' || raw === 'restaurant') return 'food';
  if (raw === 'cafe' || raw === 'bakery' || raw === 'coffee') return 'cafe';
  if (raw === 'furniture' || raw === 'home') return 'furniture';
  if (raw === 'perfume' || raw === 'fragrance') return 'perfume';
  // New templates
  if (raw === 'sports' || raw === 'athletic') return 'sports';
  if (raw === 'books' || raw === 'bookstore') return 'books';
  if (raw === 'pets' || raw === 'pet') return 'pets';
  if (raw === 'toys' || raw === 'toy') return 'toys';
  if (raw === 'garden' || raw === 'plants') return 'garden';
  if (raw === 'art' || raw === 'gallery') return 'art';
  if (raw === 'music' || raw === 'instruments') return 'music';
  if (raw === 'health' || raw === 'pharmacy' || raw === 'wellness') return 'health';
  if (raw === 'watches' || raw === 'watch') return 'watches';
  if (raw === 'shoes' || raw === 'footwear' || raw === 'sneakers') return 'shoes';
  if (raw === 'gaming' || raw === 'games') return 'gaming';
  if (raw === 'automotive' || raw === 'auto' || raw === 'car') return 'automotive';
  if (raw === 'crafts' || raw === 'handmade' || raw === 'craft') return 'crafts';
  if (raw === 'outdoor' || raw === 'camping') return 'outdoor';
  if (raw === 'vintage' || raw === 'antique' || raw === 'retro') return 'vintage';
  if (raw === 'tech' || raw === 'gadgets') return 'tech';
  if (raw === 'organic' || raw === 'natural' || raw === 'eco') return 'organic';
  if (raw === 'luxury' || raw === 'premium') return 'luxury';
  if (raw === 'kids' || raw === 'children') return 'kids';
  if (raw === 'travel' || raw === 'luggage') return 'travel';
  if (raw === 'photography' || raw === 'camera' || raw === 'photo') return 'photography';
  if (raw === 'wedding' || raw === 'bridal') return 'wedding';
  if (raw === 'fitness' || raw === 'gym') return 'fitness';
  if (raw === 'gifts' || raw === 'gift') return 'gifts';
  if (raw === 'candles' || raw === 'candle') return 'candles';
  if (raw === 'skincare' || raw === 'skin') return 'skincare';
  if (raw === 'supplements' || raw === 'vitamins') return 'supplements';
  if (raw === 'phone-accessories' || raw === 'phone' || raw === 'mobile') return 'phone-accessories';
  if (raw === 'tools' || raw === 'hardware') return 'tools';
  if (raw === 'office' || raw === 'workspace') return 'office';
  if (raw === 'stationery' || raw === 'paper') return 'stationery';
  if (raw === 'neon' || raw === 'cyberpunk') return 'neon';
  if (raw === 'pastel' || raw === 'soft') return 'pastel';
  if (raw === 'monochrome' || raw === 'mono' || raw === 'bw') return 'monochrome';
  if (raw === 'gradient' || raw === 'colorful') return 'gradient';
  if (raw === 'florist' || raw === 'flowers' || raw === 'flower') return 'florist';
  if (raw === 'eyewear' || raw === 'glasses' || raw === 'optical') return 'eyewear';
  if (raw === 'lingerie' || raw === 'intimate') return 'lingerie';
  if (raw === 'swimwear' || raw === 'swim' || raw === 'beach') return 'swimwear';
  if (raw === 'streetwear' || raw === 'street' || raw === 'urban') return 'streetwear';
  if (raw === 'wine' || raw === 'winery' || raw === 'alcohol') return 'wine';
  if (raw === 'chocolate' || raw === 'chocolates') return 'chocolate';
  if (raw === 'tea' || raw === 'teahouse') return 'tea';
  if (raw === 'pro' || raw === 'professional') return 'pro';
  // Screenshot-inspired templates
  if (raw === 'sage-boutique' || raw === 'sage') return 'sage-boutique';
  if (raw === 'mint-elegance' || raw === 'mint') return 'mint-elegance';
  if (raw === 'forest-store' || raw === 'forest') return 'forest-store';
  if (raw === 'sunset-shop' || raw === 'sunset') return 'sunset-shop';
  if (raw === 'coral-market' || raw === 'coral') return 'coral-market';
  if (raw === 'amber-store' || raw === 'amber') return 'amber-store';
  if (raw === 'magenta-mall' || raw === 'magenta') return 'magenta-mall';
  if (raw === 'berry-market' || raw === 'berry') return 'berry-market';
  if (raw === 'rose-catalog' || raw === 'rose') return 'rose-catalog';
  if (raw === 'lime-direct' || raw === 'lime') return 'lime-direct';
  if (raw === 'emerald-shop' || raw === 'emerald') return 'emerald-shop';
  if (raw === 'neon-store') return 'neon-store';
  if (raw === 'clean-single' || raw === 'clean') return 'clean-single';
  if (raw === 'pure-product' || raw === 'pure') return 'pure-product';
  if (raw === 'snow-shop' || raw === 'snow') return 'snow-shop';
  if (raw === 'gallery-pro' || raw === 'gallery') return 'gallery-pro';
  if (raw === 'showcase-plus' || raw === 'showcase') return 'showcase-plus';
  if (raw === 'exhibit-store' || raw === 'exhibit') return 'exhibit-store';
  return 'pro';
}

/**
 * Render the storefront using the template system.
 */
export function RenderStorefront(t: TemplateId | string, props: TemplateProps) {
  const id = normalizeTemplateId(String(t || (props.settings as any)?.template || ''));

  // Global UX rule: storefront templates must not show categories.
  // Enforce centrally so it applies to public storefront + editor previews.
  const sanitizedProps: TemplateProps = {
    ...props,
    products: (props.products || []).map((p) => ({ ...p, category: undefined })),
    filtered: (props.filtered || []).map((p) => ({ ...p, category: undefined })),
    categories: [],
    categoryFilter: '',
    setCategoryFilter: () => {
      /* no-op */
    },
  };

  // Original templates
  if (id === 'minimal') return <MinimalTemplate {...sanitizedProps} />;
  if (id === 'classic') return <ClassicTemplate {...sanitizedProps} />;
  if (id === 'modern') return <ModernTemplate {...sanitizedProps} />;
  if (id === 'jewelry') return <JewelryTemplate {...sanitizedProps} />;
  if (id === 'bags') return <BagsTemplate {...sanitizedProps} />;
  if (id === 'fashion') return <FashionTemplate {...sanitizedProps} />;
  if (id === 'electronics') return <ElectronicsTemplate {...sanitizedProps} />;
  if (id === 'beauty') return <BeautyTemplate {...sanitizedProps} />;
  if (id === 'food') return <FoodTemplate {...sanitizedProps} />;
  if (id === 'cafe') return <CafeTemplate {...sanitizedProps} />;
  if (id === 'furniture') return <FurnitureTemplate {...sanitizedProps} />;
  if (id === 'perfume') return <PerfumeTemplate {...sanitizedProps} />;
  // New templates
  if (id === 'sports') return <SportsTemplate {...sanitizedProps} />;
  if (id === 'books') return <BooksTemplate {...sanitizedProps} />;
  if (id === 'pets') return <PetsTemplate {...sanitizedProps} />;
  if (id === 'toys') return <ToysTemplate {...sanitizedProps} />;
  if (id === 'garden') return <GardenTemplate {...sanitizedProps} />;
  if (id === 'art') return <ArtTemplate {...sanitizedProps} />;
  if (id === 'music') return <MusicTemplate {...sanitizedProps} />;
  if (id === 'health') return <HealthTemplate {...sanitizedProps} />;
  if (id === 'watches') return <WatchesTemplate {...sanitizedProps} />;
  if (id === 'shoes') return <ShoesTemplate {...sanitizedProps} />;
  if (id === 'gaming') return <GamingTemplate {...sanitizedProps} />;
  if (id === 'automotive') return <AutomotiveTemplate {...sanitizedProps} />;
  if (id === 'crafts') return <CraftsTemplate {...sanitizedProps} />;
  if (id === 'outdoor') return <OutdoorTemplate {...sanitizedProps} />;
  if (id === 'vintage') return <VintageTemplate {...sanitizedProps} />;
  if (id === 'tech') return <TechTemplate {...sanitizedProps} />;
  if (id === 'organic') return <OrganicTemplate {...sanitizedProps} />;
  if (id === 'luxury') return <LuxuryTemplate {...sanitizedProps} />;
  if (id === 'kids') return <KidsTemplate {...sanitizedProps} />;
  if (id === 'travel') return <TravelTemplate {...sanitizedProps} />;
  if (id === 'photography') return <PhotographyTemplate {...sanitizedProps} />;
  if (id === 'wedding') return <WeddingTemplate {...sanitizedProps} />;
  if (id === 'fitness') return <FitnessTemplate {...sanitizedProps} />;
  if (id === 'gifts') return <GiftsTemplate {...sanitizedProps} />;
  if (id === 'candles') return <CandlesTemplate {...sanitizedProps} />;
  if (id === 'skincare') return <SkincareTemplate {...sanitizedProps} />;
  if (id === 'supplements') return <SupplementsTemplate {...sanitizedProps} />;
  if (id === 'phone-accessories') return <PhoneAccessoriesTemplate {...sanitizedProps} />;
  if (id === 'tools') return <ToolsTemplate {...sanitizedProps} />;
  if (id === 'office') return <OfficeTemplate {...sanitizedProps} />;
  if (id === 'stationery') return <StationeryTemplate {...sanitizedProps} />;
  if (id === 'neon') return <NeonTemplate {...sanitizedProps} />;
  if (id === 'pastel') return <PastelTemplate {...sanitizedProps} />;
  if (id === 'monochrome') return <MonochromeTemplate {...sanitizedProps} />;
  if (id === 'gradient') return <GradientTemplate {...sanitizedProps} />;
  if (id === 'florist') return <FloristTemplate {...sanitizedProps} />;
  if (id === 'eyewear') return <EyewearTemplate {...sanitizedProps} />;
  if (id === 'lingerie') return <LingerieTemplate {...sanitizedProps} />;
  if (id === 'swimwear') return <SwimwearTemplate {...sanitizedProps} />;
  if (id === 'streetwear') return <StreetWearTemplate {...sanitizedProps} />;
  if (id === 'wine') return <WineTemplate {...sanitizedProps} />;
  if (id === 'chocolate') return <ChocolateTemplate {...sanitizedProps} />;
  if (id === 'tea') return <TeaTemplate {...sanitizedProps} />;
  if (id === 'pro') return <ProTemplate {...sanitizedProps} />;
  if (id === 'pro-aurora') return <ProAuroraTemplate {...sanitizedProps} />;
  if (id === 'pro-vertex') return <ProVertexTemplate {...sanitizedProps} />;
  if (id === 'pro-atelier') return <ProAtelierTemplate {...sanitizedProps} />;
  if (id === 'pro-orbit') return <ProOrbitTemplate {...sanitizedProps} />;
  if (id === 'pro-zen') return <ProZenTemplate {...sanitizedProps} />;
  if (id === 'pro-studio') return <ProStudioTemplate {...sanitizedProps} />;
  if (id === 'pro-mosaic') return <ProMosaicTemplate {...sanitizedProps} />;
  if (id === 'pro-grid') return <ProGridTemplate {...sanitizedProps} />;
  if (id === 'pro-catalog') return <ProCatalogTemplate {...sanitizedProps} />;
  // Screenshot-inspired templates
  if (id === 'sage-boutique') return <SageBoutiqueTemplate {...sanitizedProps} />;
  if (id === 'mint-elegance') return <MintEleganceTemplate {...sanitizedProps} />;
  if (id === 'forest-store') return <ForestStoreTemplate {...sanitizedProps} />;
  if (id === 'sunset-shop') return <SunsetShopTemplate {...sanitizedProps} />;
  if (id === 'coral-market') return <CoralMarketTemplate {...sanitizedProps} />;
  if (id === 'amber-store') return <AmberStoreTemplate {...sanitizedProps} />;
  if (id === 'magenta-mall') return <MagentaMallTemplate {...sanitizedProps} />;
  if (id === 'berry-market') return <BerryMarketTemplate {...sanitizedProps} />;
  if (id === 'rose-catalog') return <RoseCatalogTemplate {...sanitizedProps} />;
  if (id === 'lime-direct') return <LimeDirectTemplate {...sanitizedProps} />;
  if (id === 'emerald-shop') return <EmeraldShopTemplate {...sanitizedProps} />;
  if (id === 'neon-store') return <NeonStoreTemplate {...sanitizedProps} />;
  if (id === 'clean-single') return <CleanSingleTemplate {...sanitizedProps} />;
  if (id === 'pure-product') return <PureProductTemplate {...sanitizedProps} />;
  if (id === 'snow-shop') return <SnowShopTemplate {...sanitizedProps} />;
  if (id === 'gallery-pro') return <GalleryProTemplate {...sanitizedProps} />;
  if (id === 'showcase-plus') return <ShowcasePlusTemplate {...sanitizedProps} />;
  if (id === 'exhibit-store') return <ExhibitStoreTemplate {...sanitizedProps} />;
  return <ProTemplate {...sanitizedProps} />;
}

// Re-export all templates
export { BagsTemplate };
export { JewelryTemplate };
export { FashionTemplate };
export { ElectronicsTemplate };
export { BeautyTemplate };
export { FoodTemplate };
export { CafeTemplate };
export { FurnitureTemplate };
export { PerfumeTemplate };
export { MinimalTemplate };
export { ClassicTemplate };
export { ModernTemplate };
// New templates
export { SportsTemplate };
export { BooksTemplate };
export { PetsTemplate };
export { ToysTemplate };
export { GardenTemplate };
export { ArtTemplate };
export { MusicTemplate };
export { HealthTemplate };
export { WatchesTemplate };
export { ShoesTemplate };
export { GamingTemplate };
export { AutomotiveTemplate };
export { CraftsTemplate };
export { OutdoorTemplate };
export { VintageTemplate };
export { TechTemplate };
export { OrganicTemplate };
export { LuxuryTemplate };
export { KidsTemplate };
export { TravelTemplate };
export { PhotographyTemplate };
export { WeddingTemplate };
export { FitnessTemplate };
export { GiftsTemplate };
export { CandlesTemplate };
export { SkincareTemplate };
export { SupplementsTemplate };
export { PhoneAccessoriesTemplate };
export { ToolsTemplate };
export { OfficeTemplate };
export { StationeryTemplate };
export { NeonTemplate };
export { PastelTemplate };
export { MonochromeTemplate };
export { GradientTemplate };
export { FloristTemplate };
export { EyewearTemplate };
export { LingerieTemplate };
export { SwimwearTemplate };
export { StreetWearTemplate };
export { WineTemplate };
export { ChocolateTemplate };
export { TeaTemplate };
export { ProTemplate };
export { ProAuroraTemplate };
export { ProVertexTemplate };
export { ProAtelierTemplate };
export { ProOrbitTemplate };
export { ProZenTemplate };
export { ProStudioTemplate };
export { ProMosaicTemplate };
export { ProGridTemplate };
export { ProCatalogTemplate };
// Screenshot-inspired templates
export { SageBoutiqueTemplate };
export { MintEleganceTemplate };
export { ForestStoreTemplate };
export { SunsetShopTemplate };
export { CoralMarketTemplate };
export { AmberStoreTemplate };
export { MagentaMallTemplate };
export { BerryMarketTemplate };
export { RoseCatalogTemplate };
export { LimeDirectTemplate };
export { EmeraldShopTemplate };
export { NeonStoreTemplate };
export { CleanSingleTemplate };
export { PureProductTemplate };
export { SnowShopTemplate };
export { GalleryProTemplate };
export { ShowcasePlusTemplate };
export { ExhibitStoreTemplate };
