import React from 'react';
import BaseTemplateSettings, { BaseTemplateSettings as BaseSettings } from '../../../components/BaseTemplateSettings';

const defaultSettings: BaseSettings = {
  heroHeading: 'Premium Bags Collection',
  heroSubtitle: 'Discover luxury bags crafted with precision.',
  ctaButtonText: 'Explore Collection',
  brandName: 'Bags',
  currencySymbol: 'USD',
  accentColor: '#6b7280',
};

export default function BagsSettings() {
  return (
    <BaseTemplateSettings
      templateName="Bags"
      defaultSettings={defaultSettings}
    />
  );
}
