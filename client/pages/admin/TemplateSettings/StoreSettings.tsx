import React from 'react';
import BaseTemplateSettings, { BaseTemplateSettings as BaseSettings } from '../../../components/BaseTemplateSettings';

const defaultSettings: BaseSettings = {
  heroHeading: 'Welcome to Our Store',
  heroSubtitle: 'Discover our amazing collection',
  ctaButtonText: 'Shop Now',
  brandName: 'Store',
  currencySymbol: 'USD',
  accentColor: '#8b5cf6',
};

export default function StoreSettings() {
  return (
    <BaseTemplateSettings
      templateName="Store"
      defaultSettings={defaultSettings}
    />
  );
}
