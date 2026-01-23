// Pricing Page - Compact single tier
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MessageCircle, Loader, Check, Rocket, Gift, Shield, Infinity } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';

type PublicBillingInfo = {
  trialDays: number;
  subscriptionPriceUsd: number;
};

export default function Pricing() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [publicBilling, setPublicBilling] = useState<PublicBillingInfo | null>(null);

  const FEATURES = [
    t('pricing.features.unlimited'),
    t('pricing.features.staff'),
    t('pricing.features.stock'),
    t('pricing.features.templates'),
    t('pricing.features.storefront'),
    t('pricing.features.bots'),
    t('pricing.features.pixels'),
    t('pricing.features.analytics'),
    t('pricing.features.delivery'),
    t('pricing.features.vouchers'),
    t('pricing.features.noCommissions'),
  ];

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/auth/me');
        setIsLoggedIn(res.ok);
      } catch {
        setIsLoggedIn(false);
      }
    };
    check();
  }, []);

  useEffect(() => {
    const loadPublicBilling = async () => {
      try {
        const res = await fetch('/api/billing/public');
        if (!res.ok) return;
        const data = (await res.json()) as PublicBillingInfo;
        if (data && typeof data.trialDays === 'number' && typeof data.subscriptionPriceUsd === 'number') {
          setPublicBilling(data);
        }
      } catch {
        // ignore
      }
    };
    loadPublicBilling();
  }, []);

  const handleRequestCode = async () => {
    if (!isLoggedIn) {
      navigate('/signup');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch<any>('/api/chat/create-admin-chat', {
        method: 'POST',
        body: JSON.stringify({ tier: 'unlimited' })
      });
      if (response.chat?.id) {
        const chatId = Number(response.chat.id);
        try {
          await apiFetch<any>(`/api/chat/${chatId}/message`, {
            method: 'POST',
            body: JSON.stringify({
              chat_id: chatId,
              message_type: 'text',
              message_content:
                'Hi admin, I want to pay/activate the Unlimited plan. Please send me the payment link or guide me to complete payment.',
              metadata: {
                intent: 'payment_request',
                tier: 'unlimited',
                source: 'pricing_page',
              },
            }),
          });
        } catch {
          // If message send fails, still route user to chat.
        }

        navigate('/chat', { state: { chatId, adminChat: true } });
      } else {
        setError('Failed to create chat. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to request code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md">
        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 p-5 text-white text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Infinity className="w-6 h-6" />
              <h1 className="text-xl font-bold">{t('pricing.unlimitedPlan')}</h1>
            </div>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-black">2000</span>
              <span className="text-lg opacity-90">{t('pricing.dzdMonth')}</span>
            </div>
            <p className="text-sm opacity-80 mt-1">
              ~${publicBilling?.subscriptionPriceUsd ?? 7}/{t('pricing.month')}
            </p>
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Trial badge */}
            <div className="flex items-center justify-center gap-2 mb-4 py-2 px-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <Gift className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                {t('pricing.freeTrial', { days: publicBilling?.trialDays ?? 30 })}
              </span>
            </div>

            {/* Features */}
            <ul className="space-y-2 mb-5">
              {FEATURES.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Button
              onClick={handleRequestCode}
              disabled={loading}
              className="w-full h-11 font-semibold bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white"
            >
              {loading ? (
                <><Loader className="w-4 h-4 mr-2 animate-spin" />{t('pricing.processing')}</>
              ) : isLoggedIn ? (
                <><MessageCircle className="w-4 h-4 mr-2" />{t('pricing.requestCode')}</>
              ) : (
                <><Rocket className="w-4 h-4 mr-2" />{t('pricing.startTrial')}</>
              )}
            </Button>

            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
              {t('pricing.activationNote')}
            </p>

            {/* Trust */}
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3 flex items-center justify-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              {t('pricing.trustBadge')}
            </p>
          </div>
        </div>

        {/* Login link */}
        {!isLoggedIn && (
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
            {t('pricing.haveAccount')}{" "}
            <Link to="/login" className="text-indigo-600 hover:underline font-medium">{t('pricing.login')}</Link>
          </p>
        )}
      </div>
    </div>
  );
}
