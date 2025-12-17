import React from 'react';
import BaseTemplateSettings, { BaseTemplateSettings as BaseSettings } from '../../../components/BaseTemplateSettings';

const defaultSettings: BaseSettings = {
  heroHeading: 'Beauty & Cosmetics',
  heroSubtitle: 'Enhance your natural beauty.',
  ctaButtonText: 'Discover',
  brandName: 'Beauty',
  currencySymbol: 'USD',
  accentColor: '#f97316',
};

export default function BeautySettings() {
  return (
    <BaseTemplateSettings
      templateName="Beauty"
      defaultSettings={defaultSettings}
    />
  );
}
