// Pricing Page - Request subscription codes from admin
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  MessageCircle, Loader, Check, Clock, Rocket, Gift, 
  Shield, Crown, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/lib/api';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for trying out',
    price: 'Free',
    priceSub: '30 days trial',
    icon: Gift,
    color: 'from-emerald-500 to-green-600',
    features: [
      'Basic storefront',
      'Up to 10 products',
      '1 staff member',
      'Basic analytics',
    ],
  },
  {
    id: 'pro',
    name: 'Professional',
    description: 'For growing businesses',
    price: '2,500 DZD',
    priceSub: 'or $10/month',
    icon: Rocket,
    color: 'from-indigo-600 to-cyan-600',
    popular: true,
    features: [
      'Unlimited products',
      'Custom store design',
      '12 professional templates',
      'Analytics dashboard',
      'WhatsApp, Telegram bots',
      'Staff management',
      'Order management',
      'No commissions',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large operations',
    price: 'Custom',
    priceSub: 'Contact us',
    icon: Crown,
    color: 'from-amber-500 to-orange-600',
    features: [
      'Everything in Pro',
      'Priority support',
      'Custom integrations',
      'Dedicated account manager',
      'API access',
      'White-label options',
    ],
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
  }, []);

  const handleRequestCode = async (planId: string) => {
    // If not logged in, redirect to signup
    if (!isLoggedIn) {
      navigate('/signup');
      return;
    }

    setLoading(planId);
    setError(null);

    try {
      const response = await apiFetch<any>('/api/chat/create-admin-chat', {
        method: 'POST',
        body: JSON.stringify({ tier: planId })
      });

      if (response.chat) {
        navigate('/chat', { state: { chatId: response.chat.id, adminChat: true } });
      } else {
        setError('Failed to create chat. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to request code');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center">
      <section className="relative py-8 sm:py-12 w-full overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4ODg4ODgiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAgNGgtMnYyaDJ2LTJ6bS0yIDJoLTJ2Mmgydi0yek0zMiAzOGgtMnYyaDJ2LTJ6bS0yLTJoLTJ2Mmgydi0yek0yOCAzNGgtMnYyaDJ2LTJ6bS02IDB2LTJoLTJ2Mmgyem0tMiAydi0ySDR2Mmgyem0tMiAydi0ySDR2MmgyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
        </div>

        <div className="container relative z-10 mx-auto px-4 sm:px-6 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border shadow-sm mb-3 sm:mb-4">
              <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              <span className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-400">30 days free trial</span>
            </div>
            
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600">
                Simple & Transparent Pricing
              </span>
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              No hidden fees. No commissions. Keep 100% of your profits.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="max-w-lg mx-auto mb-5 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm sm:text-base text-center">
              {error}
            </div>
          )}

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6 sm:mb-8">
            {PLANS.map((plan) => {
              const Icon = plan.icon;
              const isLoading = loading === plan.id;
              
              return (
                <div
                  key={plan.id}
                  className={`relative bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border overflow-hidden transition-all hover:shadow-xl ${
                    plan.popular 
                      ? 'border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-200 dark:ring-indigo-800' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0 h-1 sm:h-1.5 bg-gradient-to-r from-indigo-600 via-cyan-600 to-purple-600"></div>
                  )}
                  
                  {plan.popular && (
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                      <div className="bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 rounded-full shadow flex items-center gap-1">
                        <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        Popular
                      </div>
                    </div>
                  )}

                  <div className="p-4 sm:p-5">
                    {/* Plan Header */}
                    <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate">{plan.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-gray-100 dark:border-gray-700">
                      <div className={`text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r ${plan.color}`}>
                        {plan.price}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {plan.priceSub}
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-5">
                      {plan.features.slice(0, 5).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 sm:gap-2.5">
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                        </li>
                      ))}
                      {plan.features.length > 5 && (
                        <li className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 pl-6 sm:pl-7">
                          +{plan.features.length - 5} more...
                        </li>
                      )}
                    </ul>

                    {/* CTA Button */}
                    <Button
                      onClick={() => handleRequestCode(plan.id)}
                      disabled={isLoading}
                      size="default"
                      className={`w-full h-10 sm:h-11 text-sm sm:text-base font-semibold ${
                        plan.popular
                          ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white'
                          : `bg-gradient-to-r ${plan.color} text-white hover:opacity-90`
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <Loader className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : isLoggedIn ? (
                        <>
                          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          Request Code
                        </>
                      ) : (
                        <>
                          <Rocket className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          Get Started
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* No Commission Banner */}
          <div className="max-w-3xl mx-auto mb-5 sm:mb-6">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 sm:p-4 border border-green-200 dark:border-green-800 text-center">
              <p className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-400 flex items-center justify-center gap-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                No commissions on sales - Keep 100% of your profits
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-5 sm:mb-6">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4 sm:mb-5 text-center">How It Works</h2>
            
            <div className="grid grid-cols-3 gap-3 sm:gap-6">
              <div className="text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mx-auto mb-2 sm:mb-3 text-indigo-600 dark:text-indigo-400 text-sm sm:text-base font-bold">
                  1
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-1">Choose Plan</h3>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                  Select the best fit
                </p>
              </div>

              <div className="text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mx-auto mb-2 sm:mb-3 text-indigo-600 dark:text-indigo-400 text-sm sm:text-base font-bold">
                  2
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-1">Chat with Us</h3>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                  Discuss & pay
                </p>
              </div>

              <div className="text-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mx-auto mb-2 sm:mb-3 text-indigo-600 dark:text-indigo-400 text-sm sm:text-base font-bold">
                  3
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white mb-1">Get Code</h3>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                  Start instantly
                </p>
              </div>
            </div>
          </div>

          {/* Quick Support Info */}
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Fast response • Codes valid 1 hour • Secure payment</span>
            </div>
          </div>

          {/* Not logged in? Show signup prompt */}
          {!isLoggedIn && (
            <div className="text-center mt-5 sm:mt-6">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold underline">
                  Log in
                </Link>
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
