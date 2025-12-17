import React, { useState, useEffect } from 'react';

interface FashionSettings {
  heroHeading: string;
  heroSubtitle: string;
  ctaButtonText: string;
  brandName: string;
  currencySymbol: string;
  accentColor: string;
}

interface FashionSettingsPageProps {
  onSave?: (settings: FashionSettings) => void;
  initialSettings?: Partial<FashionSettings>;
}

const defaultSettings: FashionSettings = {
  heroHeading: 'Build a wardrobe that behaves like software.',
  heroSubtitle: 'Fewer pieces, more combinations. Coats, trousers, and layers designed to work in any city, any season.',
  ctaButtonText: 'Browse collection',
  brandName: 'WardrobeOS',
  currencySymbol: 'DZD',
  accentColor: '#f97316',
};

export default function FashionSettings({ onSave, initialSettings }: FashionSettingsPageProps) {
  const [settings, setSettings] = useState<FashionSettings>({
    ...defaultSettings,
    ...initialSettings,
  });

  useEffect(() => {
    // Load settings from window if available
    const windowSettings = (window as any).TEMPLATE_SETTINGS;
    if (windowSettings) {
      setSettings(prev => ({
        ...prev,
        ...windowSettings,
      }));
    }
  }, []);

  const handleChange = (key: keyof FashionSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    // Save to window
    (window as any).TEMPLATE_SETTINGS = settings;
    onSave?.(settings);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Fashion Template Settings</h1>
        <p className="text-gray-600">Customize the appearance and text of your fashion storefront.</p>
      </div>

      <div className="space-y-4 bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Hero Section</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Brand Name
          </label>
          <input
            type="text"
            value={settings.brandName}
            onChange={(e) => handleChange('brandName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="e.g., WardrobeOS"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hero Heading
          </label>
          <textarea
            value={settings.heroHeading}
            onChange={(e) => handleChange('heroHeading', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Main heading for hero section"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hero Subtitle
          </label>
          <textarea
            value={settings.heroSubtitle}
            onChange={(e) => handleChange('heroSubtitle', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Description text for hero section"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CTA Button Text
          </label>
          <input
            type="text"
            value={settings.ctaButtonText}
            onChange={(e) => handleChange('ctaButtonText', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="e.g., Browse collection"
          />
        </div>
      </div>

      <div className="space-y-4 bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Styling</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Accent Color
          </label>
          <div className="flex gap-3 items-center">
            <input
              type="color"
              value={settings.accentColor}
              onChange={(e) => handleChange('accentColor', e.target.value)}
              className="h-10 w-20 rounded border border-gray-300 cursor-pointer"
            />
            <input
              type="text"
              value={settings.accentColor}
              onChange={(e) => handleChange('accentColor', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md flex-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="#f97316"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Used for buttons, active filters, and highlights</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency Symbol
          </label>
          <input
            type="text"
            value={settings.currencySymbol}
            onChange={(e) => handleChange('currencySymbol', e.target.value)}
            maxLength={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="e.g., DZD"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md font-medium hover:bg-orange-600 transition"
        >
          Save Settings
        </button>
        <button
          onClick={() => setSettings({ ...defaultSettings })}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition"
        >
          Reset to Default
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> These settings will be stored in <code className="bg-white px-1 rounded">window.TEMPLATE_SETTINGS</code> and used by the template component.
        </p>
      </div>
    </div>
  );
}
