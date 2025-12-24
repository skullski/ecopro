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
  updatesEnabled?: boolean;
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
  const [activeBot, setActiveBot] = useState<'confirmation' | 'updates' | null>(null);
  const currentUser = getCurrentUser();
  const isPaymentLocked = !!currentUser?.is_locked && currentUser?.lock_type === 'payment';
  const [subscriptionLocked, setSubscriptionLocked] = useState(false);
  const [settings, setSettings] = useState<BotSettings>({
    enabled: true,
    updatesEnabled: false,
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

        {/* Two Bot Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Bot Confirmation Card */}
          <div 
            className={`bg-white dark:bg-slate-800/50 backdrop-blur rounded-xl md:rounded-2xl p-4 border-2 shadow-sm cursor-pointer transition-all ${
              activeBot === 'confirmation' 
                ? 'border-blue-500 dark:border-blue-400' 
                : 'border-slate-200/50 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
            onClick={() => setActiveBot(activeBot === 'confirmation' ? null : 'confirmation')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 md:p-3 rounded-lg md:rounded-xl ${settings.enabled ? 'bg-green-50 dark:bg-green-500/10' : 'bg-slate-50 dark:bg-slate-700/50'}`}>
                  <MessageSquare className={`h-5 md:h-6 w-5 md:w-6 ${settings.enabled ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`} />
                </div>
                <div>
                  <p className="text-sm md:text-base font-semibold text-slate-900 dark:text-white">Bot Confirmation</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Order confirmations & shipping</p>
                </div>
              </div>
              <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${settings.enabled ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                  {settings.enabled ? 'Active' : 'Inactive'}
                </span>
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
              </div>
            </div>
          </div>

          {/* Bot Updates Card */}
          <div 
            className={`bg-white dark:bg-slate-800/50 backdrop-blur rounded-xl md:rounded-2xl p-4 border-2 shadow-sm cursor-pointer transition-all ${
              activeBot === 'updates' 
                ? 'border-blue-500 dark:border-blue-400' 
                : 'border-slate-200/50 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
            onClick={() => setActiveBot(activeBot === 'updates' ? null : 'updates')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 md:p-3 rounded-lg md:rounded-xl ${settings.updatesEnabled ? 'bg-purple-50 dark:bg-purple-500/10' : 'bg-slate-50 dark:bg-slate-700/50'}`}>
                  <Users className={`h-5 md:h-6 w-5 md:w-6 ${settings.updatesEnabled ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`} />
                </div>
                <div>
                  <p className="text-sm md:text-base font-semibold text-slate-900 dark:text-white">Bot Updates</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Send campaigns & updates</p>
                </div>
              </div>
              <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${settings.updatesEnabled ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                  {settings.updatesEnabled ? 'Active' : 'Inactive'}
                </span>
                <Switch
                  checked={settings.updatesEnabled || false}
                  onCheckedChange={(checked) => {
                    if (checked && (subscriptionLocked || isPaymentLocked)) {
                      toast({
                        title: 'Subscription ended',
                        description: 'You must renew/unlock your account to enable the bot.',
                        variant: 'destructive'
                      });
                      return;
                    }
                    updateSetting('updatesEnabled', checked);
                  }}
                  disabled={subscriptionLocked || isPaymentLocked}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Bot Templates - Show when confirmation bot is selected */}
        {activeBot === 'confirmation' && (
          <div className="space-y-4 mb-6">
            {/* Provider Selection */}
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Provider
              </h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { value: 'telegram', label: 'Telegram' },
                  { value: 'whatsapp_cloud', label: 'WhatsApp' },
                  { value: 'viber', label: 'Viber' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => updateSetting('provider', option.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      settings.provider === option.value
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              
              {/* Provider-specific settings */}
              {settings.provider === 'telegram' && (
                <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-900 dark:text-white">Telegram Bot Token</Label>
                    <Input
                      value={settings.telegramBotToken || ''}
                      onChange={(e) => updateSetting('telegramBotToken', e.target.value)}
                      placeholder="123456:ABCDEF..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-900 dark:text-white">Telegram Bot Username</Label>
                    <Input
                      value={settings.telegramBotUsername || ''}
                      onChange={(e) => updateSetting('telegramBotUsername', e.target.value)}
                      placeholder="@YourBotUsername"
                    />
                  </div>
                </div>
              )}

              {settings.provider === 'whatsapp_cloud' && (
                <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-900 dark:text-white">WhatsApp Phone ID</Label>
                    <Input
                      value={settings.whatsappPhoneId}
                      onChange={(e) => updateSetting('whatsappPhoneId', e.target.value)}
                      placeholder="e.g. 123456789012345"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-900 dark:text-white">WhatsApp Access Token</Label>
                    <Input
                      type="password"
                      value={settings.whatsappToken}
                      onChange={(e) => updateSetting('whatsappToken', e.target.value)}
                      placeholder="Paste access token"
                    />
                  </div>
                </div>
              )}

              {settings.provider === 'viber' && (
                <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-900 dark:text-white">Viber Auth Token</Label>
                    <Input
                      value={settings.viberAuthToken || ''}
                      onChange={(e) => updateSetting('viberAuthToken', e.target.value)}
                      placeholder="viber-auth-token"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-900 dark:text-white">Viber Sender Name</Label>
                    <Input
                      value={settings.viberSenderName || ''}
                      onChange={(e) => updateSetting('viberSenderName', e.target.value)}
                      placeholder="EcoPro"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Greeting Template */}
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Greeting Message</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Sent when customer clicks Telegram button and presses Start</p>
              <Textarea
                value={settings.templateGreeting || ''}
                onChange={(e) => updateSetting('templateGreeting', e.target.value)}
                rows={4}
                className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            {/* Order Confirmation Template */}
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Order Confirmation</h3>
              <Textarea
                value={settings.templateOrderConfirmation}
                onChange={(e) => updateSetting('templateOrderConfirmation', e.target.value)}
                rows={6}
                className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            {/* Payment Template */}
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Payment Confirmation</h3>
              <Textarea
                value={settings.templatePayment}
                onChange={(e) => updateSetting('templatePayment', e.target.value)}
                rows={4}
                className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            {/* Shipping Template */}
            <div className="bg-white dark:bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Shipping Notification</h3>
              <Textarea
                value={settings.templateShipping}
                onChange={(e) => updateSetting('templateShipping', e.target.value)}
                rows={4}
                className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            {/* Variables Reference */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <Code2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Available Variables</h4>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {variables.map((v) => (
                  <div key={v.key} className="flex items-center gap-2">
                    <code className="bg-white dark:bg-slate-700 px-2 py-1 rounded font-mono text-slate-900 dark:text-white">
                      {v.key}
                    </code>
                    <span className="text-slate-500">{v.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bot Updates - Show when updates bot is selected */}
        {activeBot === 'updates' && (
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur rounded-lg md:rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm mb-6">
            <CustomerBot embedded={true} />
          </div>
        )}

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
