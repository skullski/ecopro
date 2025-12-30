import React from 'react';
import { TemplateProps } from '@/pages/storefront/templates/types';
import BabyTemplate, { TEMPLATE_EDITOR_SECTIONS as BABY_TEMPLATE_EDITOR_SECTIONS } from './baby';

export default function BabyGoldTemplate(props: TemplateProps) {
  // Gold Baby must look identical to the Silver Baby template.
  return <BabyTemplate {...props} />;
}

// Reuse the same schema sections; the Gold editor can render these.
export const TEMPLATE_EDITOR_SECTIONS = BABY_TEMPLATE_EDITOR_SECTIONS;
