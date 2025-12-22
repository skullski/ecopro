// Codes Store - Request subscription codes from admin

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Loader, CheckCircle, Clock, Ticket } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { CodeRedemption } from '@/components/chat/CodeRedemption';

const TIERS = [
  {
    id: 'bronze',
    name: 'Bronze',
    description: 'Free trial access',
    features: [
      'Basic storefront features',
      'Up to 10 products',
      '1 staff member',
      'Basic analytics'
    ],
    color: 'from-amber-500 to-orange-600',
    icon: '🥉',
    price: 'Free for 30 days'
  },
  {
    id: 'silver',
    name: 'Silver',
    description: 'For growing businesses',
    features: [
      'Advanced storefront features',
      'Up to 100 products',
      '5 staff members',
      'Advanced analytics',
      'Priority support'
    ],
    color: 'from-slate-400 to-slate-600',
    icon: '🥈',
    price: '$5/month'
  },
  {
    id: 'gold',
    name: 'Gold',
    description: 'For established businesses',
    features: [
      'All Silver features',
      'Unlimited products',
      'Unlimited staff',
      'Custom integrations',
      'Dedicated support',
      'API access'
    ],
    color: 'from-yellow-400 to-yellow-600',
    icon: '🥇',
    price: '$15/month'
  }
];

export default function CodesStorePage() {
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRedemption, setShowRedemption] = useState(false);
  const [redemptionSuccess, setRedemptionSuccess] = useState(false);
  const [subscriptionExpired, setSubscriptionExpired] = useState(false);

  // Check subscription status on mount
  React.useEffect(() => {
    const checkSubscription = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        const res = await fetch('/api/billing/check-access', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          if (!data.hasAccess) {
            setSubscriptionExpired(true);
            setShowRedemption(true); // Auto-show redemption form
          }
        }
      } catch (err) {
        console.error('Error checking subscription:', err);
      }
    };
    checkSubscription();
  }, []);

  const handleRequestCode = async (tierId: string) => {
    setLoading(true);
    setError(null);

    try {
      // Create or get chat with admin
      const response = await apiFetch<any>('/api/chat/create-admin-chat', {
        method: 'POST',
        body: JSON.stringify({
          tier: tierId
        })
      });

      if (response.chat) {
        // Navigate to chat with admin
        navigate('/chat', { state: { chatId: response.chat.id, adminChat: true } });
      } else {
        setError('Failed to create chat. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to request code');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header - Different message if subscription expired */}
        {subscriptionExpired ? (
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/20 mb-6">
              <Ticket className="w-10 h-10 text-amber-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-amber-300 mb-4">
              Subscription Expired
            </h1>
            <p className="text-xl text-slate-300 mb-2">
              Enter your voucher code below to reactivate your account
            </p>
            <p className="text-slate-400">
              Don't have a code? Contact support via chat to request one
            </p>
          </div>
        ) : (
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl text-slate-300 mb-2">
              Get exclusive codes and unlock powerful features for your store
            </p>
            <p className="text-slate-400">
              Chat with our admin to request your code and discuss upgrade options
            </p>
          </div>
        )}

        {/* Code Redemption Section */}
        <div className="max-w-xl mx-auto mb-12">
          {redemptionSuccess ? (
            <div className="p-6 bg-green-500/10 border border-green-500/50 rounded-2xl text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Code Redeemed Successfully!</h3>
              <p className="text-green-300 mb-4">Your subscription has been activated.</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Go to Dashboard →
              </button>
            </div>
          ) : showRedemption ? (
            <div className="p-6 bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-blue-400" />
                  {subscriptionExpired ? 'Reactivate Your Account' : 'Redeem Your Code'}
                </h3>
                {!subscriptionExpired && (
                  <button
                    onClick={() => setShowRedemption(false)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>
              <CodeRedemption 
                showInline={true}
                onSuccess={() => {
                  setRedemptionSuccess(true);
                  setShowRedemption(false);
                }}
                onError={(err) => setError(err)}
              />
            </div>
          ) : (
            <button
              onClick={() => setShowRedemption(true)}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-bold text-lg hover:shadow-lg transition-all flex items-center justify-center gap-3"
            >
              <Ticket className="w-6 h-6" />
              Have a Code? Redeem Here
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`relative rounded-2xl overflow-hidden transition-all transform hover:scale-105 ${
                selectedTier === tier.id ? 'ring-2 ring-blue-500 shadow-xl' : 'shadow-lg hover:shadow-xl'
              }`}
            >
              {/* Card Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${tier.color} opacity-10`}></div>

              <div className="relative p-8 bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl h-full flex flex-col">
                {/* Tier Icon & Name */}
                <div className="mb-6">
                  <div className="text-5xl mb-3">{tier.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-1">{tier.name}</h3>
                  <p className="text-slate-400 text-sm">{tier.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6 pb-6 border-b border-slate-700/50">
                  <p className={`text-3xl font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                    {tier.price}
                  </p>
                </div>

                {/* Features */}
                <ul className="mb-8 flex-1 space-y-3">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Request Button */}
                <button
                  onClick={() => handleRequestCode(tier.id)}
                  disabled={loading}
                  className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                    loading
                      ? 'bg-slate-600 text-slate-300 cursor-wait'
                      : `bg-gradient-to-r ${tier.color} text-white hover:shadow-lg active:scale-95`
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-5 h-5" />
                      Request Code
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* How It Works */}
        <div className="max-w-4xl mx-auto bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4 text-blue-400 text-xl font-bold">
                1
              </div>
              <h3 className="font-semibold text-white mb-2">Select Your Plan</h3>
              <p className="text-slate-400 text-sm">
                Choose the tier that fits your business needs
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4 text-blue-400 text-xl font-bold">
                2
              </div>
              <h3 className="font-semibold text-white mb-2">Chat with Admin</h3>
              <p className="text-slate-400 text-sm">
                Start a conversation to discuss your upgrade and payment options
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4 text-blue-400 text-xl font-bold">
                3
              </div>
              <h3 className="font-semibold text-white mb-2">Get Your Code</h3>
              <p className="text-slate-400 text-sm">
                Receive your code and start using your new tier immediately
              </p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="max-w-4xl mx-auto mt-12 p-6 bg-slate-800/50 backdrop-blur-md border border-slate-700/50 rounded-lg">
          <div className="flex gap-4">
            <Clock className="w-6 h-6 text-blue-400 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-white mb-1">Quick Support</h4>
              <p className="text-slate-400">
                Our admin team typically responds within 1 hour. Codes are valid for 1 hour from generation. 
                Send payment proof to confirm your subscription upgrade.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
