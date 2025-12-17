import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TemplateWrapper from '@/components/TemplateWrapper';

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

export default function StorefrontPreview() {
  const { storeSlug, templateId } = useParams();
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStoreData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch store settings
        const settingsRes = await fetch(`/api/storefront/${storeSlug}/settings`);
        if (!settingsRes.ok) {
          throw new Error('Failed to load store settings');
        }
        const settingsData = await settingsRes.json();

        // Fetch store products
        const productsRes = await fetch(`/api/storefront/${storeSlug}/products`);
        if (!productsRes.ok) {
          throw new Error('Failed to load products');
        }
        const productsData = await productsRes.json();

        // Build store data
        const data: StoreData = {
          storeName: settingsData.store_name || 'My Store',
          storeLogo: settingsData.store_logo,
          heroImage: settingsData.hero_image,
          heroTitle: settingsData.hero_title,
          heroSubtitle: settingsData.hero_subtitle,
          categories: settingsData.categories || [],
          products: Array.isArray(productsData)
            ? productsData.map((p: any) => ({
                id: String(p.id),
                title: p.title,
                price: p.price,
                category: p.category,
                images: p.images || [],
                tags: p.tags || [],
              }))
            : [],
        };

        setStoreData(data);

        // Load template settings if they exist
        const templateSettings = settingsData.template_settings || {};
        setSettings(templateSettings);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error loading store data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (storeSlug && templateId) {
      loadStoreData();
    }
  }, [storeSlug, templateId]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 font-semibold">Error loading storefront</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading store...</p>
        </div>
      </div>
    );
  }

  return (
    <TemplateWrapper
      templateId={templateId || 'default'}
      storeData={storeData}
      settings={settings}
      loading={loading}
    />
  );
}
