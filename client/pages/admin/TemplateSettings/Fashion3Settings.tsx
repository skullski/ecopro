import React from 'react';
import BaseTemplateSettings, { BaseTemplateSettings as BaseSettings } from '../../../components/BaseTemplateSettings';

const defaultSettings: BaseSettings = {
  heroHeading: 'Fashion Essentials',
  heroSubtitle: 'Curated pieces for every occasion.',
  ctaButtonText: 'Explore',
  brandName: 'Fashion 3',
  currencySymbol: 'USD',
  accentColor: '#f97316',
};

export default function Fashion3Settings() {
  return (
    <BaseTemplateSettings
      templateName="Fashion 3"
      defaultSettings={defaultSettings}
    />
  );
}
