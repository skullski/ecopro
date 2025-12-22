import { useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Gift, MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubscriptionGuardProps {
  children: ReactNode;
}

/**
 * SubscriptionGuard - Wraps dashboard content and shows lock overlay when subscription is expired
 * 
 * When expired:
 * - Shows blurred white overlay over dashboard content
 * - User can see what's behind but cannot interact
 * - Lock icon and message displayed
 * - Only header and /codes route remain accessible
 */
export default function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    hasAccess: boolean;
    status: string;
    loading: boolean;
  }>({
    hasAccess: true,
    status: 'active',
    loading: true
  });

  useEffect(() => {
    checkSubscription();
  }, [location.pathname]);

  const checkSubscription = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setSubscriptionStatus({ hasAccess: true, status: 'unknown', loading: false });
        return;
      }

      const res = await fetch('/api/billing/check-access', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setSubscriptionStatus({
          hasAccess: data.hasAccess,
          status: data.status,
          loading: false
        });
      } else {
        setSubscriptionStatus({ hasAccess: true, status: 'unknown', loading: false });
      }
    } catch (err) {
      console.error('Error checking subscription:', err);
      setSubscriptionStatus({ hasAccess: true, status: 'unknown', loading: false });
    }
  };

  // Allow access to codes page even if expired
  const isCodesPage = location.pathname === '/codes' || location.pathname === '/dashboard/codes';
  const isRenewPage = location.pathname === '/renew-subscription';
  const isChatPage = location.pathname === '/chat' || location.pathname.includes('/chat');

  // Don't show lock on allowed pages
  if (isCodesPage || isRenewPage || isChatPage) {
    return <>{children}</>;
  }

  // Show loading state
  if (subscriptionStatus.loading) {
    return <>{children}</>;
  }

  // If has access, show normal content
  if (subscriptionStatus.hasAccess) {
    return <>{children}</>;
  }

  // Show locked overlay for expired subscriptions
  return (
    <div className="relative">
      {/* Original content (blurred) */}
      <div className="filter blur-sm brightness-75 pointer-events-none select-none">
        {children}
      </div>

      {/* Lock Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/20 backdrop-blur-[2px]" style={{ top: '64px' }}>
        <div className="max-w-md w-full mx-4">
          {/* Lock Card */}
          <div className="bg-slate-900/95 backdrop-blur-md rounded-3xl border border-slate-700/50 shadow-2xl overflow-hidden">
            {/* Lock Icon Header */}
            <div className="bg-gradient-to-r from-amber-500/30 to-orange-500/30 p-8 text-center border-b border-amber-500/30">
              <div className="w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-amber-500/50">
                <Lock className="w-12 h-12 text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-amber-300">Subscription Expired</h2>
              <p className="text-amber-200/80 mt-2">Your subscription has ended</p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-slate-300 text-center">
                To continue using your dashboard, please enter a voucher code to reactivate your subscription.
              </p>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/codes')}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white h-12 text-lg font-semibold"
                >
                  <Gift className="w-5 h-5 mr-2" />
                  Enter Voucher Code
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

                <Button
                  onClick={() => navigate('/chat')}
                  variant="outline"
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-800 h-11"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Contact Support for a Code
                </Button>
              </div>

              {/* Info */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <p className="text-sm text-slate-400 text-center">
                  Need a code? Contact our support team via chat and request a subscription renewal code.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
