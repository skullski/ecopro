import React from 'react';
import BaseTemplateSettings, { BaseTemplateSettings as BaseSettings } from '../../../components/BaseTemplateSettings';

const defaultSettings: BaseSettings = {
  heroHeading: 'Modern Furniture & Home Decor',
  heroSubtitle: 'Design your dream space.',
  ctaButtonText: 'Shop Furniture',
  brandName: 'Furniture',
  currencySymbol: 'USD',
  accentColor: '#8b5cf6',
};

export default function FurnitureSettings() {
  return (
    <BaseTemplateSettings
      templateName="Furniture"
      defaultSettings={defaultSettings}
    />
  );
}
