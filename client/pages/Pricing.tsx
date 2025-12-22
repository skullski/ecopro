import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";

export default function Pricing() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-8 sm:py-12 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4ODg4ODgiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAgNGgtMnYyaDJ2LTJ6bS0yIDJoLTJ2Mmgydi0yek0zMiAzOGgtMnYyaDJ2LTJ6bS0yLTJoLTJ2Mmgydi0yek0yOCAzNGgtMnYyaDJ2LTJ6bS02IDB2LTJoLTJ2Mmgyem0tMiAydi0ySDR2Mmgyem0tMiAydi0ySDR2MmgyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
        </div>

        <div className="container relative z-10 mx-auto px-4 max-w-5xl">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border shadow-lg mb-4">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-xs font-medium">{t('pricing.badge') || '100% Free Forever'}</span>
            </div>
            
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600">
                {t('pricing.title') || 'Simple Pricing'}
              </span>
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
              {t('pricing.subtitle') || 'No hidden fees. No subscriptions. No premium barriers.'}
            </p>
          </div>

          {/* Pricing Card */}
          <div className="max-w-3xl mx-auto">
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl border-2 border-indigo-100 dark:border-indigo-900 overflow-hidden">
              {/* Gradient Accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 via-cyan-600 to-purple-600"></div>
              
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold mb-0.5">{t('pricing.plan.free') || 'Free Plan'}</h2>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{t('pricing.plan.desc') || 'Everything you need to succeed'}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600">
                      {t('pricing.plan.price') || '$0'}
                    </div>
                    <p className="text-xs text-gray-500">{t('pricing.plan.forever') || 'Forever'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
                  {[
                    t('pricing.feature.unlimited') || 'Unlimited product listings',
                    t('pricing.feature.custom') || 'Custom storefront',
                    t('pricing.feature.orders') || 'Order management',
                    t('pricing.feature.analytics') || 'Real-time analytics',
                    t('pricing.feature.responsive') || 'Mobile responsive',
                    t('pricing.feature.payments') || 'Secure payments',
                    t('pricing.feature.support') || '24/7 support',
                    t('pricing.feature.noFees') || 'No transaction fees'
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link to="/signup">
                  <Button size="default" className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white shadow-lg h-10 text-sm">
                    <Rocket className="w-4 h-4 mr-1.5" />
                    {t('pricing.cta') || 'Start Free'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Future Plans Section */}
          <div className="mt-8 sm:mt-10 max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 rounded-lg p-3 sm:p-4 border border-indigo-100 dark:border-indigo-800">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold mb-1">{t('pricing.future.title') || 'Upcoming premium features'}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {t('pricing.future.desc') || 'We are committed to keeping the core platform free. Optional paid tools may be introduced later.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-8">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {t('pricing.questions') || 'Questions about pricing?'}{" "}
              <Link to="/contact" className="text-indigo-600 hover:text-indigo-700 font-semibold underline">
                {t('pricing.contact') || 'Contact our team'}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
