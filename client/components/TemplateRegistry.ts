// Template Registry - Central place to register all available templates

// Template Components
import FashionTemplate from './templates/fashion';
import Fashion2Template from './templates/fashion2';
import Fashion3Template from './templates/fashion3';
import BabyTemplate from './templates/baby';
import BagsTemplate from './templates/bags';
import BeautyTemplate from './templates/beauty';
import CafeTemplate from './templates/cafe';
import ElectronicsTemplate from './templates/electronics';
import FoodTemplate from './templates/food';
import FurnitureTemplate from './templates/furniture';
import JewelryTemplate from './templates/jewelry';
import PerfumeTemplate from './templates/perfume';

// Settings Components
import FashionSettings from '../pages/admin/TemplateSettings/FashionSettings';
import Fashion2Settings from '../pages/admin/TemplateSettings/Fashion2Settings';
import Fashion3Settings from '../pages/admin/TemplateSettings/Fashion3Settings';
import BabySettings from '../pages/admin/TemplateSettings/BabySettings';
import BagsSettings from '../pages/admin/TemplateSettings/BagsSettings';
import BeautySettings from '../pages/admin/TemplateSettings/BeautySettings';
import CafeSettings from '../pages/admin/TemplateSettings/CafeSettings';
import ElectronicsSettings from '../pages/admin/TemplateSettings/ElectronicsSettings';
import FoodSettings from '../pages/admin/TemplateSettings/FoodSettings';
import FurnitureSettings from '../pages/admin/TemplateSettings/FurnitureSettings';
import JewelrySettings from '../pages/admin/TemplateSettings/JewelrySettings';
import PerfumeSettings from '../pages/admin/TemplateSettings/PerfumeSettings';

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  preview?: string;
  component: any;
  settingsComponent: any;
}

export const TEMPLATES: TemplateMetadata[] = [
  {
    id: 'fashion',
    name: 'Fashion',
    description: 'Premium fashion storefront with multi-filter system',
    category: 'apparel',
    preview: '/templates/fashion-preview.png',
    component: FashionTemplate,
    settingsComponent: FashionSettings,
  },
  {
    id: 'fashion2',
    name: 'Fashion II',
    description: 'Alternative fashion layout with gallery view',
    category: 'apparel',
    preview: '/templates/fashion2-preview.png',
    component: Fashion2Template,
    settingsComponent: Fashion2Settings,
  },
  {
    id: 'fashion3',
    name: 'Fashion III',
    description: 'Minimalist fashion with focus on individual pieces',
    category: 'apparel',
    preview: '/templates/fashion3-preview.png',
    component: Fashion3Template,
    settingsComponent: Fashion3Settings,
  },
  {
    id: 'baby',
    name: 'Baby Store',
    description: 'Warm and friendly baby products showcase',
    category: 'retail',
    preview: '/templates/baby-preview.png',
    component: BabyTemplate,
    settingsComponent: BabySettings,
  },
  {
    id: 'bags',
    name: 'Bags',
    description: 'Editorial luxury bags with material-focused design',
    category: 'luxury',
    preview: '/templates/bags-preview.png',
    component: BagsTemplate,
    settingsComponent: BagsSettings,
  },
  {
    id: 'beauty',
    name: 'Beauty',
    description: 'Modern beauty and cosmetics storefront',
    category: 'beauty',
    preview: '/templates/beauty-preview.png',
    component: BeautyTemplate,
    settingsComponent: BeautySettings,
  },
  {
    id: 'cafe',
    name: 'Cafe',
    description: 'Coffee and cafe products with warm aesthetic',
    category: 'food-beverage',
    preview: '/templates/cafe-preview.png',
    component: CafeTemplate,
    settingsComponent: CafeSettings,
  },
  {
    id: 'electronics',
    name: 'Electronics',
    description: 'Tech store with glassmorphism and modern UI',
    category: 'tech',
    preview: '/templates/electronics-preview.png',
    component: ElectronicsTemplate,
    settingsComponent: ElectronicsSettings,
  },
  {
    id: 'food',
    name: 'Food',
    description: 'Japanese minimal food storefront',
    category: 'food-beverage',
    preview: '/templates/food-preview.png',
    component: FoodTemplate,
    settingsComponent: FoodSettings,
  },
  {
    id: 'furniture',
    name: 'Furniture',
    description: 'Modern furniture with spatial design focus',
    category: 'home',
    preview: '/templates/furniture-preview.png',
    component: FurnitureTemplate,
    settingsComponent: FurnitureSettings,
  },
  {
    id: 'jewelry',
    name: 'Jewelry',
    description: 'Luxury jewelry with premium presentation',
    category: 'luxury',
    preview: '/templates/jewelry-preview.png',
    component: JewelryTemplate,
    settingsComponent: JewelrySettings,
  },
  {
    id: 'perfume',
    name: 'Perfume',
    description: 'Premium fragrance with realm-based categorization',
    category: 'luxury',
    preview: '/templates/perfume-preview.png',
    component: PerfumeTemplate,
    settingsComponent: PerfumeSettings,
  },
];

export const getTemplate = (templateId: string): TemplateMetadata | undefined => {
  return TEMPLATES.find(t => t.id === templateId);
};

export const getTemplateComponent = (templateId: string) => {
  const template = getTemplate(templateId);
  return template?.component;
};

export const getTemplateSettings = (templateId: string) => {
  const template = getTemplate(templateId);
  return template?.settingsComponent;
};

export const getTemplatesByCategory = (category: string): TemplateMetadata[] => {
  return TEMPLATES.filter(t => t.category === category);
};

export const getTemplateList = (): TemplateMetadata[] => {
  return TEMPLATES;
};
