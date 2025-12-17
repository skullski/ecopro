import { useEffect } from 'react';
import { getTemplateComponent } from '@/components/TemplateRegistry';

interface StoreData {
  storeName: string;
  storeLogo?: string;
  heroImage?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  categories: string[];
  products: Array<{
    id: string;
    title: string;
    price: number;
    category?: string;
    images: string[];
    tags?: string[];
  }>;
}

interface TemplateSettings {
  wallpaper?: string;
  colorPalette?: string;
  heroLayout?: string;
  cardStyle?: string;
  featuredLayout?: string;
  [key: string]: any;
}

interface TemplateWrapperProps {
  templateId: string;
  storeData: StoreData;
  settings?: TemplateSettings;
  loading?: boolean;
}

export default function TemplateWrapper({
  templateId,
  storeData,
  settings = {},
  loading = false,
}: TemplateWrapperProps) {
  const TemplateComponent = getTemplateComponent(templateId);

  useEffect(() => {
    // Inject data globally for template access
    (window as any).TEMPLATE_DATA = storeData;
    (window as any).TEMPLATE_SETTINGS = settings;
  }, [storeData, settings]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent dark:border-indigo-400"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading template...</p>
        </div>
      </div>
    );
  }

  if (!TemplateComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 font-semibold">Template not found: {templateId}</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">Please select a valid template.</p>
        </div>
      </div>
    );
  }

  return <TemplateComponent />;
}
