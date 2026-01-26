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
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';

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

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      trial: { color: 'bg-blue-100 text-blue-800', icon: <Clock className="w-4 h-4" />, label: t('admin.billing.status.trial') },
      active: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" />, label: t('admin.billing.status.active') },
      expired: { color: 'bg-red-100 text-red-800', icon: <AlertCircle className="w-4 h-4" />, label: t('admin.billing.status.expired') },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: <AlertCircle className="w-4 h-4" />, label: t('admin.billing.status.cancelled') },
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
        {t(`admin.billing.paymentStatus.${status}`)}
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
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('admin.billing.tier')}</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {subscription.tier === 'free' ? t('admin.billing.tierPro') : t('admin.billing.tierPro')} - $8/{t('admin.billing.perMonth')}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {subscription.status === 'trial' ? t('admin.billing.trialEnds') : t('admin.billing.periodEnds')}
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
                      ? t('admin.billing.daysRemaining', { n: daysUntilExpiry })
                      : t('admin.billing.expired')}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('admin.billing.autoRenew')}</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {subscription.auto_renew ? t('admin.billing.enabled') : t('admin.billing.disabled')}
                  </p>
                </div>
              </div>

              {/* Pricing & Features */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('admin.billing.monthlyPrice')}</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">$8</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">{t('admin.billing.billedMonthly')}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('admin.billing.included')}</p>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>{t('admin.billing.unlimitedProducts')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>{t('admin.billing.unlimitedOrders')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>{t('admin.billing.orderManagement')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>{t('admin.billing.whatsappSmsBot')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>{t('admin.billing.automatedNotifications')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>{t('admin.billing.advancedAnalytics')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>{t('admin.billing.productVariants')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>{t('admin.billing.stockManagement')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>{t('admin.billing.deliveryZoneSetup')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>{t('admin.billing.staffManagement')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>{t('admin.billing.storeCustomization')}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>{t('admin.billing.prioritySupport')}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">{t('admin.billing.noSubscription')}</p>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {isSubscriptionExpired ? (
              <>
                <Alert className="flex-1 border-red-200 bg-red-50 dark:bg-red-950/20">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700 dark:text-red-400">
                    {t('admin.billing.expiredSupport')}
                  </AlertDescription>
                </Alert>
                <Link to="/dashboard/chat">
                  <Button className="gap-2 bg-red-600 hover:bg-red-700 w-full sm:w-auto">
                    <MessageCircle className="w-4 h-4" />
                    {t('admin.billing.contactSupport')}
                  </Button>
                </Link>
              </>
            ) : isTrialActive ? (
              <>
                <Alert className="flex-1 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700 dark:text-blue-400">
                    {t('admin.billing.trialDaysLeft', { n: daysUntilExpiry })}
                  </AlertDescription>
                </Alert>
                <Link to="/dashboard/chat">
                  <Button className="gap-2 bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
                    <MessageCircle className="w-4 h-4" />
                    {t('admin.billing.contactSupportToPay')}
                  </Button>
                </Link>
              </>
            ) : subscription?.status === 'active' ? (
              <>
                <Alert className="flex-1 border-green-200 bg-green-50 dark:bg-green-950/20">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700 dark:text-green-400">
                    {t('admin.billing.activeExpires', { date: subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : 'N/A' })}
                  </AlertDescription>
                </Alert>
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
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">{t('admin.billing.date')}</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">{t('admin.billing.amount')}</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">{t('admin.billing.status')}</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">{t('admin.billing.method')}</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">{t('admin.billing.transactionId')}</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-700 dark:text-gray-300">{t('admin.billing.action')}</th>
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
                              {t('admin.billing.details')}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{t('admin.billing.paymentDetails')}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('admin.billing.transactionId')}</p>
                                <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded break-all">
                                  {payment.transaction_id}
                                </p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('admin.billing.amount')}</p>
                                  <p className="font-semibold">{payment.amount} {payment.currency}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('admin.billing.status')}</p>
                                  <p className="font-semibold capitalize">{t(`admin.billing.paymentStatus.${payment.status}`)}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('admin.billing.date')}</p>
                                  <p className="font-semibold">
                                    {new Date(payment.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('admin.billing.method')}</p>
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
                                {t('admin.billing.downloadReceipt')}
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
              <p className="text-gray-600 dark:text-gray-400">{t('admin.billing.noPayments')}</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{t('admin.billing.paymentHistoryHint')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.billing.faqTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <details className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <summary className="font-semibold text-gray-900 dark:text-white">{t('admin.billing.faq1.q')}</summary>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
              {t('admin.billing.faq1.a')}
            </p>
          </details>

          <details className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <summary className="font-semibold text-gray-900 dark:text-white">{t('admin.billing.faq2.q')}</summary>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
              {t('admin.billing.faq2.a')}
            </p>
          </details>

          <details className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <summary className="font-semibold text-gray-900 dark:text-white">{t('admin.billing.faq3.q')}</summary>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
              {t('admin.billing.faq3.a')}
            </p>
          </details>

          <details className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <summary className="font-semibold text-gray-900 dark:text-white">{t('admin.billing.faq4.q')}</summary>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
              {t('admin.billing.faq4.a')}
            </p>
          </details>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBilling;
