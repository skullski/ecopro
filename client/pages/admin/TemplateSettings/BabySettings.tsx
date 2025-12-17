import React from 'react';
import BaseTemplateSettings, { BaseTemplateSettings as BaseSettings } from '../../../components/BaseTemplateSettings';

const defaultSettings: BaseSettings = {
  heroHeading: 'Welcome to Our Baby Store',
  heroSubtitle: 'Everything you need for your little ones.',
  ctaButtonText: 'Shop Baby Products',
  brandName: 'Baby Store',
  currencySymbol: 'USD',
  accentColor: '#f59e0b',
};

export default function BabySettings() {
  return (
    <BaseTemplateSettings
      templateName="Baby Store"
      defaultSettings={defaultSettings}
    />
  );
}
