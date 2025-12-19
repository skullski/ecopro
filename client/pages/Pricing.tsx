import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";

export default function Pricing() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4ODg4ODgiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAgNGgtMnYyaDJ2LTJ6bS0yIDJoLTJ2Mmgydi0yek0zMiAzOGgtMnYyaDJ2LTJ6bS0yLTJoLTJ2Mmgydi0yek0yOCAzNGgtMnYyaDJ2LTJ6bS02IDB2LTJoLTJ2Mmgyem0tMiAydi0ySDR2Mmgyem0tMiAydi0ySDR2MmgyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
        </div>

        <div className="container relative z-10 mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border shadow-lg mb-6">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium">{t('pricing.badge') || '100% Free Forever'}</span>
            </div>
            
            <h1 className="text-xl md:text-2xl md:text-2xl md:text-xl md:text-2xl lg:text-xl md:text-2xl md:text-2xl md:text-xl md:text-2xl xl:text-6xl font-black mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600">
                {t('pricing.title') || 'Simple Pricing'}
              </span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('pricing.subtitle') || 'No hidden fees. No subscriptions. No premium barriers.'}
            </p>
          </div>

          {/* Pricing Card */}
          <div className="max-w-4xl mx-auto">
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border-2 border-indigo-100 dark:border-indigo-900 overflow-hidden">
              {/* Gradient Accent */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-600 via-cyan-600 to-purple-600"></div>
              
              <div className="p-3 md:p-4">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl md:text-xl md:text-2xl font-bold mb-1">{t('pricing.plan.free') || 'Free Plan'}</h2>
                    <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">{t('pricing.plan.desc') || 'Everything you need to succeed'}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xl md:text-2xl md:text-2xl md:text-xl md:text-2xl lg:text-xl md:text-2xl md:text-2xl md:text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600">
                      {t('pricing.plan.price') || '$0'}
                    </div>
                    <p className="text-sm text-gray-500">{t('pricing.plan.forever') || 'Forever'}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4 md:mb-6">
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
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link to="/signup">
                  <Button size="lg" className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white shadow-xl h-14 text-lg">
                    <Rocket className="w-5 h-5 mr-2" />
                    {t('pricing.cta') || 'Start Free'}
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Future Plans Section */}
          <div className="mt-16 max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-indigo-50 to-cyan-50 dark:from-indigo-900/20 dark:to-cyan-900/20 rounded-lg p-4 md:p-6 border border-indigo-100 dark:border-indigo-800">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{t('pricing.future.title') || 'Upcoming premium features'}</h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {t('pricing.future.desc') || 'We are committed to keeping the core platform free. Optional paid tools may be introduced later.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <p className="text-gray-600 dark:text-gray-400">
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
