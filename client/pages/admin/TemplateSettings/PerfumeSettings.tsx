import React from 'react';
import BaseTemplateSettings, { BaseTemplateSettings as BaseSettings } from '../../../components/BaseTemplateSettings';

const defaultSettings: BaseSettings = {
  heroHeading: 'A New Way to Experience Scent',
  heroSubtitle: 'Three realms. One universe.',
  ctaButtonText: 'Explore Fragrances',
  brandName: 'Perfume',
  currencySymbol: 'USD',
  accentColor: '#f59e0b',
};

export default function PerfumeSettings() {
  return (
    <BaseTemplateSettings
      templateName="Perfume"
      defaultSettings={defaultSettings}
    />
  );
}
