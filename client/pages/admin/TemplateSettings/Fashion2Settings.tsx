import React from 'react';
import BaseTemplateSettings, { BaseTemplateSettings as BaseSettings } from '../../../components/BaseTemplateSettings';

const defaultSettings: BaseSettings = {
  heroHeading: 'Discover Our Fashion Collection',
  heroSubtitle: 'Explore the latest trends and styles.',
  ctaButtonText: 'Shop Now',
  brandName: 'Fashion 2',
  currencySymbol: 'USD',
  accentColor: '#f97316',
};

export default function Fashion2Settings() {
  return (
    <BaseTemplateSettings
      templateName="Fashion 2"
      defaultSettings={defaultSettings}
    />
  );
}
