import React from 'react';
import BaseTemplateSettings, { BaseTemplateSettings as BaseSettings } from '../../../components/BaseTemplateSettings';

const defaultSettings: BaseSettings = {
  heroHeading: 'Luxury Jewelry Collection',
  heroSubtitle: 'Timeless elegance and sophistication.',
  ctaButtonText: 'Explore Jewelry',
  brandName: 'Jewelry',
  currencySymbol: 'USD',
  accentColor: '#fbbf24',
};

export default function JewelrySettings() {
  return (
    <BaseTemplateSettings
      templateName="Jewelry"
      defaultSettings={defaultSettings}
    />
  );
}
