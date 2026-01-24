import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/lib/i18n';
import {
  CreditCard,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Download,
  RefreshCw,
  Zap,
  Tag,
  Percent,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

interface Subscription {
  id: number;
  status: 'trial' | 'active' | 'expired' | 'cancelled';
  tier: string;
  trial_started_at: string;
  trial_ends_at: string;
  current_period_start: string;
  current_period_end: string;
  auto_renew: boolean;
  created_at: string;
}

interface Payment {
  id: number;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  transaction_id: string;
  payment_method: string;
  paid_at: string;
  created_at: string;
  error_message?: string;
  subscription_status: string;
}

const AdminBilling = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [checkoutInfo, setCheckoutInfo] = useState<{
    amount: number;
    originalAmount: number;
    discountPercent: number;
    discountAmount: number;
    voucherCode: string | null;
    checkoutUrl: string;
  } | null>(null);

  // Fetch subscription
  const { data: subscription, isLoading: subLoading, refetch: refetchSub } = useQuery({
    queryKey: ['billing-subscription'],
    queryFn: async () => {
      const res = await fetch('/api/billing/subscription');
      if (!res.ok) throw new Error('Failed to fetch subscription');
      return res.json() as Promise<Subscription>;
    },
  });

  // Fetch payment history
  const { data: paymentData, isLoading: payLoading, refetch: refetchPayments } = useQuery({
    queryKey: ['billing-payments'],
    queryFn: async () => {
      const res = await fetch('/api/billing/payments');
      if (!res.ok) throw new Error('Failed to fetch payments');
      return res.json();
    },
  });

  const payments = paymentData?.payments || [];

  // Handle checkout
  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true);
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Checkout failed');
      }

      const data = await res.json();
      
      if (!data.checkoutUrl) {
        throw new Error('No checkout URL received');
      }

      // If there's a discount, show confirmation dialog
      if (data.discountPercent > 0) {
        setCheckoutInfo({
          amount: data.amount,
          originalAmount: data.originalAmount,
          discountPercent: data.discountPercent,
          discountAmount: data.discountAmount,
          voucherCode: data.voucherCode,
          checkoutUrl: data.checkoutUrl,
        });
        setShowCheckoutDialog(true);
        setIsCheckingOut(false);
      } else {
        // No discount, redirect directly
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout Failed',
        description: (error as any).message,
        variant: 'destructive',
      });
      setIsCheckingOut(false);
    }
  };

  const proceedToPayment = () => {
    if (checkoutInfo?.checkoutUrl) {
      window.location.href = checkoutInfo.checkoutUrl;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      trial: { color: 'bg-blue-100 text-blue-800', icon: <Clock className="w-4 h-4" />, label: 'Free Trial' },
      active: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" />, label: 'Active' },
      expired: { color: 'bg-red-100 text-red-800', icon: <AlertCircle className="w-4 h-4" />, label: 'Expired' },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: <AlertCircle className="w-4 h-4" />, label: 'Cancelled' },
    };

    const config = statusConfig[status] || statusConfig.trial;

    return (
      <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[status] || statusConfig.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const isSubscriptionExpired = subscription?.status === 'expired';
  const isTrialActive = subscription?.status === 'trial' && new Date(subscription.trial_ends_at) > new Date();

  const daysUntilExpiry = subscription
    ? Math.ceil(
        (new Date(subscription.status === 'trial' ? subscription.trial_ends_at : subscription.current_period_end).getTime() -
          new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('admin.billing.title')}</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">{t('admin.billing.subtitle')}</p>
      </div>

      {/* Alert for expired subscription */}
      {isSubscriptionExpired && (
        <Alert className="bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-700 dark:text-red-300">
            {t('admin.billing.expiredAlert')}
          </AlertDescription>
        </Alert>
      )}

      {/* Subscription Status Card */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                {t('admin.billing.currentSubscription')}
              </CardTitle>
              <CardDescription>{t('admin.billing.subscriptionDesc')}</CardDescription>
            </div>
            {subscription && getStatusBadge(subscription.status)}
          </div>
        </CardHeader>
        <CardContent>
          {subLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : subscription ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Subscription Details */}
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tier</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {subscription.tier === 'free' ? 'Pro' : 'Pro'} - $8/month
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {subscription.status === 'trial' ? 'Trial Ends' : 'Period Ends'}
                  </p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(
                      subscription.status === 'trial'
                        ? subscription.trial_ends_at
                        : subscription.current_period_end
                    ).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {daysUntilExpiry > 0
                      ? `${daysUntilExpiry} days remaining`
                      : 'Expired'}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Auto-Renew</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {subscription.auto_renew ? '✓ Enabled' : '✗ Disabled'}
                  </p>
                </div>
              </div>

              {/* Pricing & Features */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Monthly Price</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">$8</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Billed monthly • Cancel anytime</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Included:</p>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Unlimited products</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Unlimited orders</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Order management & tracking</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>WhatsApp & SMS bot</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Automated notifications</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Advanced analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Product variants (size/color)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Stock management</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Delivery zone setup</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Staff management</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Store customization</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Priority support</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No subscription found</p>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            {isSubscriptionExpired ? (
              <Button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="gap-2 bg-red-600 hover:bg-red-700"
              >
                <CreditCard className="w-4 h-4" />
                {isCheckingOut ? 'Processing...' : 'Renew Subscription'}
              </Button>
            ) : isTrialActive ? (
              <>
                <Button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <CreditCard className="w-4 h-4" />
                  {isCheckingOut ? 'Processing...' : 'Start Paid Plan'}
                </Button>
                <p className="text-sm text-gray-600 dark:text-gray-400 self-center">
                  {daysUntilExpiry} days of free trial remaining
                </p>
              </>
            ) : subscription?.status === 'active' ? (
              <>
                <Button variant="outline" disabled>
                  ✓ Active Subscription
                </Button>
                <Button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  variant="outline"
                  className="gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  {isCheckingOut ? 'Processing...' : 'Renew Next Month'}
                </Button>
              </>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {t('admin.billing.paymentHistory')}
          </CardTitle>
          <CardDescription>{t('admin.billing.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          {payLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Date</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Method</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Transaction ID</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment: Payment) => (
                    <tr key={payment.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-2 text-gray-900 dark:text-gray-100">
                        {new Date(payment.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-2 font-semibold text-gray-900 dark:text-gray-100">
                        {Math.round(payment.amount)} {payment.currency}
                      </td>
                      <td className="py-3 px-2">{getPaymentStatusBadge(payment.status)}</td>
                      <td className="py-3 px-2 text-gray-600 dark:text-gray-400">
                        {payment.payment_method === 'redotpay' ? 'RedotPay' : payment.payment_method}
                      </td>
                      <td className="py-3 px-2 text-gray-600 dark:text-gray-400 font-mono text-xs">
                        {payment.transaction_id?.slice(0, 12)}...
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-1">
                              <Download className="w-4 h-4" />
                              Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Payment Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Transaction ID</p>
                                <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded break-all">
                                  {payment.transaction_id}
                                </p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Amount</p>
                                  <p className="font-semibold">{payment.amount} {payment.currency}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
                                  <p className="font-semibold capitalize">{payment.status}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Date</p>
                                  <p className="font-semibold">
                                    {new Date(payment.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Method</p>
                                  <p className="font-semibold">{payment.payment_method}</p>
                                </div>
                              </div>
                              {payment.error_message && (
                                <Alert variant="destructive">
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertDescription>{payment.error_message}</AlertDescription>
                                </Alert>
                              )}
                              <Button className="w-full gap-2">
                                <Download className="w-4 h-4" />
                                Download Receipt
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">No payments yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Your payment history will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Questions?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <details className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <summary className="font-semibold text-gray-900 dark:text-white">What happens when my subscription expires?</summary>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
              Your store access will be temporarily disabled. You can renew anytime to regain access. Your products and orders are safely stored.
            </p>
          </details>

          <details className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <summary className="font-semibold text-gray-900 dark:text-white">Can I cancel my subscription?</summary>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
              Yes, you can cancel anytime. You won't be charged after the current billing period ends.
            </p>
          </details>

          <details className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <summary className="font-semibold text-gray-900 dark:text-white">Is there a refund policy?</summary>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
              Refunds are handled on a case-by-case basis. Please contact our support team for refund requests.
            </p>
          </details>
        </CardContent>
      </Card>

      {/* Checkout Discount Dialog */}
      <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-green-600" />
              Discount Applied!
            </DialogTitle>
            <DialogDescription>
              You have a special discount on your first payment
            </DialogDescription>
          </DialogHeader>
          
          {checkoutInfo && (
            <div className="space-y-4 py-4">
              {/* Voucher Code Badge */}
              <div className="flex items-center justify-center">
                <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-4 py-2 rounded-full flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  <span className="font-semibold">{checkoutInfo.discountPercent}% OFF</span>
                  <span className="text-sm">with code <strong>{checkoutInfo.voucherCode}</strong></span>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Original Price</span>
                  <span className="line-through text-gray-400">${checkoutInfo.originalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount ({checkoutInfo.discountPercent}%)</span>
                  <span>-${checkoutInfo.discountAmount.toFixed(2)}</span>
                </div>
                <hr className="border-gray-200 dark:border-gray-700" />
                <div className="flex justify-between font-semibold text-lg">
                  <span>You Pay</span>
                  <span className="text-green-600">${checkoutInfo.amount.toFixed(2)}</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center">
                This discount applies to your first payment only
              </p>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowCheckoutDialog(false)}>
              Cancel
            </Button>
            <Button onClick={proceedToPayment} className="gap-2 bg-green-600 hover:bg-green-700">
              <CreditCard className="w-4 h-4" />
              Proceed to Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBilling;
