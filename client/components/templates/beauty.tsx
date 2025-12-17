import React from 'react';
import { useTemplateData, useTemplateSettings } from '../../hooks/useTemplateData';

export default function BeautyTemplate() {
  const data = useTemplateData();
  const settings = useTemplateSettings();

  const storeName = data?.storeName || 'Beauty';
  const products = data?.products || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{storeName}</h1>
        <p className="text-gray-600 mb-4">Beauty Template - Coming Soon</p>
        <p className="text-sm text-gray-500">
          Loaded {products.length} products from window.TEMPLATE_DATA
        </p>
        <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-700">This template is ready for implementation.</p>
          <p className="text-sm text-gray-600 mt-2">
            Review beaty.html and convert following the pattern from fashion.tsx
          </p>
        </div>
      </div>
    </div>
  );
}
