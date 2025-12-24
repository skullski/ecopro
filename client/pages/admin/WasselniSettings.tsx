import { useState, useEffect } from "react";
import { Bot, Save, Loader2, Phone, MessageSquare, Globe, Check, Users, Code2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import CustomerBot from "../CustomerBot";
import { getCurrentUser } from "@/lib/auth";

interface BotSettings {
  enabled: boolean;
  provider: 'whatsapp_cloud' | 'telegram' | 'viber' | string;
  whatsappPhoneId: string;
  whatsappToken: string;
  telegramBotToken?: string;
  telegramBotUsername?: string;
  viberAuthToken?: string;
  viberSenderName?: string;
  templateGreeting?: string;
  templateOrderConfirmation: string;
  templatePayment: string;
  templateShipping: string;
}

export default function AdminWasselniSettings() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'confirmation_bot' | 'updates_bot' | 'whatsapp' | 'general'>('confirmation_bot');
  const currentUser = getCurrentUser();
  const isPaymentLocked = !!currentUser?.is_locked && currentUser?.lock_type === 'payment';
  const [subscriptionLocked, setSubscriptionLocked] = useState(false);
  const [settings, setSettings] = useState<BotSettings>({
    enabled: true,
    provider: 'telegram',
    whatsappPhoneId: '',
    whatsappToken: '',
    telegramBotToken: '',
    telegramBotUsername: '',
    viberAuthToken: '',
    viberSenderName: '',
    templateGreeting: `شكراً لطلبك من {storeName} يا {customerName}!\n\n✅ فعّل الإشعارات في Telegram باش توصلك رسالة التأكيد وتتبع الطلب.`,
    templateOrderConfirmation: `السلام عليكم {customerName}! 🌟\n\nشكراً لك على طلبك من {companyName}! \n\n📦 تفاصيل الطلب:\n• المنتج: {productName}\n• السعر: {totalPrice} دج\n• العنوان: {address}\n\nهل تؤكد الطلب؟ رد ب "نعم" للتأكيد أو "لا" للإلغاء.`,
    templatePayment: `تم تأكيد طلبك #{orderId}. يرجى الدفع بـ {totalPrice} دج.`,
    templateShipping: `تم شحن طلبك #{orderId}. رقم التتبع: {trackingNumber}.`
  });

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    void checkSubscriptionLock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkSubscriptionLock = async () => {
    try {
      if (isPaymentLocked) {
        setSubscriptionLocked(true);
        return;
      }
      const token = localStorage.getItem('authToken');
      if (!token) return;
      const res = await fetch('/api/billing/check-access', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      setSubscriptionLocked(!data.hasAccess);
    } catch {
      // ignore
    }
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/bot/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to load bot settings:', error);
      toast({
        title: "Error",
        description: "Failed to load bot settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Prevent enabling bot while subscription is ended/payment-locked
    if ((subscriptionLocked || isPaymentLocked) && settings.enabled) {
      toast({
        title: 'Subscription ended',
        description: 'You must renew/unlock your account to enable the bot.',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/bot/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Bot settings saved successfully"
        });
      } else {
        const errJson = await response.json().catch(() => null);
        throw new Error(errJson?.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save bot settings:', error);
      toast({
        title: "Error",
        description: "Failed to save bot settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof BotSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  const variables = [
    { key: '{customerName}', desc: 'Customer name' },
    { key: '{orderId}', desc: 'Order ID' },
    { key: '{productName}', desc: 'Product name' },
    { key: '{totalPrice}', desc: 'Total price' },
    { key: '{address}', desc: 'Delivery address' },
    { key: '{companyName}', desc: 'Your company name' },
    { key: '{supportPhone}', desc: 'Support phone number' },
    { key: '{storeUrl}', desc: 'Store URL' },
    { key: '{trackingNumber}', desc: 'Shipping tracking number' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-black dark:via-slate-900 dark:to-black p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <h1 className="text-2xl md:text-xl md:text-2xl lg:text-lg md:text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">
                {t('wasselni.settings')}
              </h1>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                {t('wasselni.desc')}
              </p>
            </div>
          </div>
        </div>

        {/* Bot Status Card */}
        <div className="bg-white dark:bg-slate-800/50 backdrop-blur rounded-xl md:rounded-2xl p-4 border border-slate-200/50 dark:border-slate-700/50 shadow-sm mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 md:p-3 rounded-lg md:rounded-xl ${settings.enabled ? 'bg-green-50 dark:bg-green-500/10' : 'bg-slate-50 dark:bg-slate-700/50'}`}>
                <Bot className={`h-5 md:h-6 w-5 md:w-6 ${settings.enabled ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`} />
              </div>
              <div>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 font-medium">Bot Status</p>
                <p className={`text-base md:text-lg font-bold ${settings.enabled ? 'text-green-600 dark:text-green-400' : 'text-slate-500'}`}>
                  {settings.enabled ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <span className="text-sm text-slate-600 dark:text-slate-400">{settings.enabled ? 'On' : 'Off'}</span>
              <Switch
                checked={settings.enabled}
                onCheckedChange={(checked) => {
                  if (checked && (subscriptionLocked || isPaymentLocked)) {
                    toast({
                      title: 'Subscription ended',
                      description: 'You must renew/unlock your account to enable the bot.',
                      variant: 'destructive'
                    });
                    return;
                  }
                  updateSetting('enabled', checked);
                }}
                disabled={subscriptionLocked || isPaymentLocked}
              />
            </label>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'confirmation_bot' as const, label: 'Bot Confirmation', icon: MessageSquare },
            { id: 'updates_bot' as const, label: 'Bot Updates', icon: Users },
            { id: 'whatsapp' as const, label: 'WhatsApp', icon: Phone },
            { id: 'general' as const, label: 'General', icon: Globe }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg md:rounded-xl font-medium text-xs md:text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="space-y-3 md:space-y-4">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-3 md:space-y-4">
              <div className="bg-white dark:bg-slate-800/50 backdrop-blur rounded-lg md:rounded-xl p-3 md:p-4 lg:p-3 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10">
                    <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">General Configuration</h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Configure basic bot settings and branding</p>
                  </div>
                </div>

                <div className="space-y-3 md:space-y-4">
                  <div className="space-y-3">
                    <Label className="text-sm sm:text-base font-medium text-slate-900 dark:text-white">Provider</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { value: 'whatsapp_cloud', label: 'WhatsApp', desc: 'WhatsApp via Twilio' },
                        { value: 'telegram', label: 'Telegram', desc: 'Telegram Bot API (requires chat id mapping)' },
                        { value: 'viber', label: 'Viber', desc: 'Viber REST API (requires user id mapping)' }
                      ].map(option => (
                        <button
                          key={option.value}
                          onClick={() => updateSetting('provider', option.value)}
                          className={`p-4 rounded-2xl border-2 transition-all text-left ${
                            settings.provider === option.value
                              ? 'border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-500/10'
                              : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300 dark:hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">{option.label}</p>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{option.desc}</p>
                            </div>
                            {settings.provider === option.value && (
                              <Check className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="whatsappPhoneId" className="text-sm sm:text-base font-medium text-slate-900 dark:text-white">WhatsApp Phone ID</Label>
                    <Input
                      id="whatsappPhoneId"
                      value={settings.whatsappPhoneId}
                      onChange={(e) => updateSetting('whatsappPhoneId', e.target.value)}
                      placeholder="e.g. 123456789012345"
                      className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="whatsappToken" className="text-sm sm:text-base font-medium text-slate-900 dark:text-white">WhatsApp Access Token</Label>
                    <Input
                      id="whatsappToken"
                      type="password"
                      value={settings.whatsappToken}
                      onChange={(e) => updateSetting('whatsappToken', e.target.value)}
                      placeholder="Paste access token"
                      className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bot Updates Tab (was Customer Bot) */}
          {activeTab === 'updates_bot' && (
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur rounded-lg md:rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
              <CustomerBot embedded={true} />
            </div>
          )}

          {/* WhatsApp Tab */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-3 md:space-y-4">
              <div className="bg-white dark:bg-slate-800/50 backdrop-blur rounded-2xl md:rounded-2xl p-4 md:p-4 lg:p-3 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-green-50 dark:bg-green-500/10">
                    <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">WhatsApp Message Template</h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Customize the WhatsApp message sent to customers</p>
                  </div>
                </div>

                <div className="space-y-3 md:space-y-4">
                  <div className="space-y-3">
                    <Label htmlFor="whatsappTemplate" className="text-sm sm:text-base font-medium text-slate-900 dark:text-white">Message Template</Label>
                    <Textarea
                      id="whatsappTemplate"
                      value={settings.templateOrderConfirmation}
                      onChange={(e) => updateSetting('templateOrderConfirmation', e.target.value)}
                      rows={10}
                      className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-mono text-sm"
                    />
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-3">
                      <Code2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Available Variables</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      {variables.map((v) => (
                        <div key={v.key} className="flex items-start gap-2">
                          <code className="bg-white dark:bg-slate-700 px-2 py-1 rounded text-xs font-mono text-slate-900 dark:text-white whitespace-nowrap flex-shrink-0">
                            {v.key}
                          </code>
                          <span className="text-slate-600 dark:text-slate-400 text-xs">{v.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-50/50 dark:from-green-500/10 dark:to-green-500/5 rounded-2xl p-4 border border-green-200 dark:border-green-500/20">
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                      Preview
                    </h4>
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-mono border border-green-200 dark:border-green-500/20">
                      {settings.templateOrderConfirmation
                        .replace('{customerName}', 'أحمد')
                        .replace('{companyName}', 'Your Store')
                        .replace('{productName}', 'iPhone 15 Pro')
                        .replace('{totalPrice}', '150,000')
                        .replace('{address}', 'الجزائر، حسين داي')
                        .replace('{supportPhone}', '+213 555 123 456')
                        .replace('{orderId}', '12345')
                        .replace('{storeUrl}', 'https://yourstore.com')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Telegram Tab (uses WhatsApp tab for creds section; keep minimal) */}
          {activeTab === 'whatsapp' && settings.provider === 'telegram' && (
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur rounded-lg md:rounded-xl p-3 md:p-4 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
              <div className="space-y-2">
                <Label className="text-sm sm:text-base font-medium text-slate-900 dark:text-white">Telegram Bot Token</Label>
                <Input
                  value={settings.telegramBotToken || ''}
                  onChange={(e) => updateSetting('telegramBotToken', e.target.value)}
                  placeholder="123456:ABCDEF..."
                />
                <Label className="text-sm sm:text-base font-medium text-slate-900 dark:text-white mt-3 block">Telegram Bot Username</Label>
                <Input
                  value={settings.telegramBotUsername || ''}
                  onChange={(e) => updateSetting('telegramBotUsername', e.target.value)}
                  placeholder="@YourBotUsername"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Customers must click the Telegram button and press Start once, so we can capture the Telegram chat and send confirmation/tracking messages.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'whatsapp' && settings.provider === 'viber' && (
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur rounded-lg md:rounded-xl p-3 md:p-4 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium text-slate-900 dark:text-white">Viber Auth Token</Label>
                  <Input
                    value={settings.viberAuthToken || ''}
                    onChange={(e) => updateSetting('viberAuthToken', e.target.value)}
                    placeholder="viber-auth-token"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium text-slate-900 dark:text-white">Viber Sender Name</Label>
                  <Input
                    value={settings.viberSenderName || ''}
                    onChange={(e) => updateSetting('viberSenderName', e.target.value)}
                    placeholder="EcoPro"
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Viber requires a mapped `receiver` id per customer.
                </p>
              </div>
            </div>
          )}

          {/* Bot Confirmation Tab (was Templates) */}
          {activeTab === 'confirmation_bot' && (
            <div className="space-y-3 md:space-y-4">
              <div className="bg-white dark:bg-slate-800/50 backdrop-blur rounded-2xl md:rounded-2xl p-4 md:p-4 lg:p-3 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10">
                    <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">Greeting Message</h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Sent when customer clicks Telegram button and presses Start</p>
                  </div>
                </div>

                <div className="space-y-3 md:space-y-4">
                  <div className="space-y-3">
                    <Label htmlFor="greetingTemplate" className="text-sm sm:text-base font-medium text-slate-900 dark:text-white">Message Template</Label>
                    <Textarea
                      id="greetingTemplate"
                      value={settings.templateGreeting || ''}
                      onChange={(e) => updateSetting('templateGreeting', e.target.value)}
                      rows={5}
                      className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-mono text-sm"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Variables: {'{storeName}'} {'{customerName}'} {'{orderId}'}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-50/50 dark:from-blue-500/10 dark:to-blue-500/5 rounded-2xl p-4 border border-blue-200 dark:border-blue-500/20">
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      Preview
                    </h4>
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-mono border border-blue-200 dark:border-blue-500/20">
                      {(settings.templateGreeting || '')
                        .replace('{customerName}', 'أحمد')
                        .replace('{storeName}', 'Your Store')
                        .replace('{orderId}', '12345')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800/50 backdrop-blur rounded-2xl md:rounded-2xl p-4 md:p-4 lg:p-3 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-500/10">
                    <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">Payment Confirmation</h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Customize the payment confirmation message</p>
                  </div>
                </div>

                <div className="space-y-3 md:space-y-4">
                  <div className="space-y-3">
                    <Label htmlFor="paymentTemplate" className="text-sm sm:text-base font-medium text-slate-900 dark:text-white">Message Template</Label>
                    <Textarea
                      id="paymentTemplate"
                      value={settings.templatePayment}
                      onChange={(e) => updateSetting('templatePayment', e.target.value)}
                      rows={6}
                      className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-mono text-sm"
                    />
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-50/50 dark:from-purple-500/10 dark:to-purple-500/5 rounded-2xl p-4 border border-purple-200 dark:border-purple-500/20">
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      Preview
                    </h4>
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-mono border border-purple-200 dark:border-purple-500/20">
                      {settings.templatePayment
                        .replace('{customerName}', 'أحمد')
                        .replace('{companyName}', 'Your Store')
                        .replace('{productName}', 'iPhone 15 Pro')
                        .replace('{totalPrice}', '150,000')
                        .replace('{address}', 'الجزائر، حسين داي')
                        .replace('{supportPhone}', '+213 555 123 456')
                        .replace('{orderId}', '12345')
                        .replace('{storeUrl}', 'https://yourstore.com')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800/50 backdrop-blur rounded-2xl md:rounded-2xl p-4 md:p-4 lg:p-3 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-500/10">
                    <Phone className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">Shipping Notification</h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Customize the shipping notification message</p>
                  </div>
                </div>

                <div className="space-y-3 md:space-y-4">
                  <div className="space-y-3">
                    <Label htmlFor="shippingTemplate" className="text-sm sm:text-base font-medium text-slate-900 dark:text-white">Message Template</Label>
                    <Textarea
                      id="shippingTemplate"
                      value={settings.templateShipping}
                      onChange={(e) => updateSetting('templateShipping', e.target.value)}
                      rows={6}
                      className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-mono text-sm"
                    />
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-50/50 dark:from-orange-500/10 dark:to-orange-500/5 rounded-2xl p-4 border border-orange-200 dark:border-orange-500/20">
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      Preview
                    </h4>
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-4 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-mono border border-orange-200 dark:border-orange-500/20">
                      {settings.templateShipping
                        .replace('{customerName}', 'أحمد')
                        .replace('{companyName}', 'Your Store')
                        .replace('{productName}', 'iPhone 15 Pro')
                        .replace('{totalPrice}', '150,000')
                        .replace('{address}', 'الجزائر، حسين داي')
                        .replace('{supportPhone}', '+213 555 123 456')
                        .replace('{orderId}', '12345')
                        .replace('{storeUrl}', 'https://yourstore.com')
                        .replace('{trackingNumber}', 'DZ-TRACK-987654')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="fixed bottom-6 right-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
