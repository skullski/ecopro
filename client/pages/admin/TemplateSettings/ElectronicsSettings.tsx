import React from 'react';
import BaseTemplateSettings, { BaseTemplateSettings as BaseSettings } from '../../../components/BaseTemplateSettings';

const defaultSettings: BaseSettings = {
  heroHeading: 'Next Generation Tech',
  heroSubtitle: 'Cutting-edge technology at your fingertips.',
  ctaButtonText: 'Shop Now',
  brandName: 'ElectroVerse',
  currencySymbol: 'USD',
  accentColor: '#38bdf8',
};

export default function ElectronicsSettings() {
  return (
    <BaseTemplateSettings
      templateName="Electronics"
      defaultSettings={defaultSettings}
    />
  );
}
