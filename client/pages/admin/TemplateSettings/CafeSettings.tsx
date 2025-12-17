import React from 'react';
import BaseTemplateSettings, { BaseTemplateSettings as BaseSettings } from '../../../components/BaseTemplateSettings';

const defaultSettings: BaseSettings = {
  heroHeading: 'Premium Coffee & Cafe Products',
  heroSubtitle: 'Experience the perfect brew.',
  ctaButtonText: 'Shop Cafe',
  brandName: 'Cafe',
  currencySymbol: 'USD',
  accentColor: '#d97706',
};

export default function CafeSettings() {
  return (
    <BaseTemplateSettings
      templateName="Cafe"
      defaultSettings={defaultSettings}
    />
  );
}
