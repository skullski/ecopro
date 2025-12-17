import { useEffect, useState } from 'react';

/**
 * Hook to read template data from window.TEMPLATE_DATA
 * This allows the template to access store/product data
 */
export function useTemplateData<T = any>(): T | null {
  const [data, setData] = useState<T | null>(null);

  useEffect(() => {
    const templateData = (window as any).TEMPLATE_DATA as T | undefined;
    if (templateData) {
      setData(templateData);
    }
  }, []);

  return data;
}

/**
 * Hook to read template settings from window.TEMPLATE_SETTINGS
 * This allows the template to respect user customizations
 */
export function useTemplateSettings<T = any>(): T | null {
  const [settings, setSettings] = useState<T | null>(null);

  useEffect(() => {
    const templateSettings = (window as any).TEMPLATE_SETTINGS as T | undefined;
    if (templateSettings) {
      setSettings(templateSettings);
    }
  }, []);

  return settings;
}

/**
 * Hook to get both data and settings together
 */
export function useTemplate<TData = any, TSettings = any>(): {
  data: TData | null;
  settings: TSettings | null;
} {
  const data = useTemplateData<TData>();
  const settings = useTemplateSettings<TSettings>();

  return { data, settings };
}
