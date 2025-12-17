import React from 'react';
import BaseTemplateSettings, { BaseTemplateSettings as BaseSettings } from '../../../components/BaseTemplateSettings';

const defaultSettings: BaseSettings = {
  heroHeading: 'Premium Food Selection',
  heroSubtitle: 'Fresh and authentic ingredients.',
  ctaButtonText: 'Shop Food',
  brandName: 'Food Market',
  currencySymbol: 'USD',
  accentColor: '#a3c76d',
};

export default function FoodSettings() {
  return (
    <BaseTemplateSettings
      templateName="Food"
      defaultSettings={defaultSettings}
    />
  );
}
