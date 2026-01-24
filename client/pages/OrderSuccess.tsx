import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';

export default function OrderSuccess() {
  const navigate = useNavigate();
  const { t, locale, setLocale } = useTranslation();

  React.useEffect(() => {
    const prev = locale;
    if (prev !== 'ar') setLocale('ar');
    return () => {
      if (prev !== 'ar') setLocale(prev);
    };
  }, [locale, setLocale]);

  const storeSlug = (localStorage.getItem('currentStoreSlug') || '').trim();
  const storefrontHome = storeSlug ? `/store/${encodeURIComponent(storeSlug)}` : '/';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-slate-50 to-blue-50">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-6 text-center">
          <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-emerald-700" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{t('checkout.success')}</h1>
          <p className="mt-2 text-slate-600">{t('checkout.successDesc')}</p>

          <div className="mt-6">
            <Button className="w-full bg-slate-900 hover:bg-slate-950" onClick={() => navigate(storefrontHome)}>
              {t('checkout.returnToStore')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
