
import { useTranslation } from "../lib/i18n";
import React from 'react';

export default function Billing() {
  const { t } = useTranslation();
  return <div>{t('billing.placeholder')}</div>;
}
