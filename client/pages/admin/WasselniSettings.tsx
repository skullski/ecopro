import { useState, useEffect } from "react";
import { Bot, Save, Loader2, Phone, MessageSquare, Globe, Check, Users, Code2, Truck, CreditCard, MapPin, Package, Navigation } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import CustomerBot from "../CustomerBot";

interface BotSettings {
  enabled: boolean;
  updatesEnabled?: boolean;
  trackingEnabled?: boolean;
  provider: 'whatsapp_cloud' | 'telegram' | 'viber' | 'facebook' | string;
  whatsappPhoneId: string;
  whatsappToken: string;
  telegramBotToken?: string;
  telegramBotUsername?: string;
  telegramDelayMinutes?: number;
  autoExpireHours?: number;
  viberAuthToken?: string;
  viberSenderName?: string;
  facebookPageId?: string;
  facebookAccessToken?: string;
  templateGreeting?: string;
  templateInstantOrder?: string;
  templatePinInstructions?: string;
  templateOrderConfirmation: string;
  templatePayment: string;
  templateShipping: string;
}

export default function AdminWasselniSettings() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeBot, setActiveBot] = useState<'confirmation' | 'updates' | 'tracking' | null>(null);
  const [settings, setSettings] = useState<BotSettings>({
    enabled: true,
    updatesEnabled: false,
    trackingEnabled: false,
    provider: 'telegram',
    whatsappPhoneId: '',
    whatsappToken: '',
    telegramBotToken: '',
    telegramBotUsername: '',
    telegramDelayMinutes: 5,
    autoExpireHours: 24,
    viberAuthToken: '',
    viberSenderName: '',
    facebookPageId: '',
    facebookAccessToken: '',
    templateGreeting: `Thank you for ordering from {storeName}, {customerName}!\n\n✅ Enable notifications on Telegram to receive order confirmation and tracking updates.`,
    templateInstantOrder: `🎉 Thank you, {customerName}!\n\nYour order has been received successfully ✅\n\n━━━━━━━━━━━━━━━━\n📦 Order Details\n━━━━━━━━━━━━━━━━\n🔢 Order ID: #{orderId}\n📱 Product: {productName}\n💰 Price: {totalPrice} DZD\n📍 Quantity: {quantity}\n\n━━━━━━━━━━━━━━━━\n👤 Delivery Information\n━━━━━━━━━━━━━━━━\n📛 Name: {customerName}\n📞 Phone: {customerPhone}\n🏠 Address: {address}\n\n━━━━━━━━━━━━━━━━\n🚚 Order Status: Processing\n━━━━━━━━━━━━━━━━\n\nWe will contact you soon for confirmation 📞\n\n⭐ From {storeName}`,
    templatePinInstructions: `📌 Important tip:\n\nLong press on the previous message and select "Pin" to easily track your order!\n\n🔔 Make sure to:\n• Enable notifications for the bot\n• Don't mute the conversation\n• You will receive order status updates here directly`,
    templateOrderConfirmation: `Hello {customerName}! 🌟\n\nThank you for your order from {companyName}! \n\n📦 Order Details:\n• Product: {productName}\n• Price: {totalPrice} DZD\n• Address: {address}\n\nDo you confirm the order? Reply "Yes" to confirm or "No" to cancel.`,
    templatePayment: `Your order #{orderId} has been confirmed. Please pay {totalPrice} DZD.`,
    templateShipping: `Your order #{orderId} has been shipped. Tracking number: {trackingNumber}.`
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bot/settings', {
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
    setSaving(true);
    try {
      const response = await fetch('/api/bot/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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
          <p className="text-slate-600 dark:text-slate-400">{t('bot.loadingSettings')}</p>
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

        {/* Three Bot Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Bot Confirmation Card */}
          <div 
            className={`relative overflow-hidden rounded-2xl p-4 cursor-pointer transition-all duration-300 ${
              activeBot === 'confirmation' 
                ? 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-xl shadow-emerald-500/25 scale-[1.02]' 
                : settings.enabled
                  ? 'bg-gradient-to-br from-emerald-500/90 to-green-600/90 shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 hover:scale-[1.01]'
                  : 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 shadow-lg hover:shadow-xl border border-slate-300 dark:border-slate-700'
            }`}
            onClick={() => setActiveBot(activeBot === 'confirmation' ? null : 'confirmation')}
          >
            {/* Decorative circles */}
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
            <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/5 rounded-full" />
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2.5 rounded-xl ${settings.enabled || activeBot === 'confirmation' ? 'bg-white/20' : 'bg-slate-300/50 dark:bg-slate-700'}`}>
                  <MessageSquare className={`h-5 w-5 ${settings.enabled || activeBot === 'confirmation' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                </div>
                <div>
                  <p className={`text-sm font-bold ${settings.enabled || activeBot === 'confirmation' ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{t('bot.confirmation')}</p>
                  <p className={`text-xs ${settings.enabled || activeBot === 'confirmation' ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>{t('bot.confirmationDesc')}</p>
                </div>
              </div>
              <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${settings.enabled ? 'bg-white/25 text-white' : 'bg-slate-300 text-slate-600 dark:bg-slate-600 dark:text-slate-300'}`}>
                  {settings.enabled ? `● ${t('bot.active')}` : `○ ${t('bot.off')}`}
                </span>
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={(checked) => {
                    updateSetting('enabled', checked);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Bot Updates Card */}
          <div 
            className={`relative overflow-hidden rounded-2xl p-4 cursor-pointer transition-all duration-300 ${
              activeBot === 'updates' 
                ? 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-xl shadow-violet-500/25 scale-[1.02]' 
                : settings.updatesEnabled
                  ? 'bg-gradient-to-br from-violet-500/90 to-purple-600/90 shadow-lg shadow-violet-500/20 hover:shadow-xl hover:shadow-violet-500/30 hover:scale-[1.01]'
                  : 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 shadow-lg hover:shadow-xl border border-slate-300 dark:border-slate-700'
            }`}
            onClick={() => setActiveBot(activeBot === 'updates' ? null : 'updates')}
          >
            {/* Decorative circles */}
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
            <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/5 rounded-full" />
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2.5 rounded-xl ${settings.updatesEnabled || activeBot === 'updates' ? 'bg-white/20' : 'bg-slate-300/50 dark:bg-slate-700'}`}>
                  <Users className={`h-5 w-5 ${settings.updatesEnabled || activeBot === 'updates' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                </div>
                <div>
                  <p className={`text-sm font-bold ${settings.updatesEnabled || activeBot === 'updates' ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{t('bot.updates')}</p>
                  <p className={`text-xs ${settings.updatesEnabled || activeBot === 'updates' ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>{t('bot.updatesDesc')}</p>
                </div>
              </div>
              <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${settings.updatesEnabled ? 'bg-white/25 text-white' : 'bg-slate-300 text-slate-600 dark:bg-slate-600 dark:text-slate-300'}`}>
                  {settings.updatesEnabled ? `● ${t('bot.active')}` : `○ ${t('bot.off')}`}
                </span>
                <Switch
                  checked={settings.updatesEnabled || false}
                  onCheckedChange={(checked) => {
                    updateSetting('updatesEnabled', checked);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Bot Tracking Card */}
          <div 
            className={`relative overflow-hidden rounded-2xl p-4 cursor-pointer transition-all duration-300 ${
              activeBot === 'tracking' 
                ? 'bg-gradient-to-br from-orange-500 to-amber-600 shadow-xl shadow-orange-500/25 scale-[1.02]' 
                : settings.trackingEnabled
                  ? 'bg-gradient-to-br from-orange-500/90 to-amber-600/90 shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 hover:scale-[1.01]'
                  : 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 shadow-lg hover:shadow-xl border border-slate-300 dark:border-slate-700'
            }`}
            onClick={() => setActiveBot(activeBot === 'tracking' ? null : 'tracking')}
          >
            {/* Decorative circles */}
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full" />
            <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/5 rounded-full" />
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2.5 rounded-xl ${settings.trackingEnabled || activeBot === 'tracking' ? 'bg-white/20' : 'bg-slate-300/50 dark:bg-slate-700'}`}>
                  <MapPin className={`h-5 w-5 ${settings.trackingEnabled || activeBot === 'tracking' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                </div>
                <div>
                  <p className={`text-sm font-bold ${settings.trackingEnabled || activeBot === 'tracking' ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{t('bot.tracking')}</p>
                  <p className={`text-xs ${settings.trackingEnabled || activeBot === 'tracking' ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>{t('bot.trackingDesc')}</p>
                </div>
              </div>
              <div className="flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${settings.trackingEnabled ? 'bg-white/25 text-white' : 'bg-slate-300 text-slate-600 dark:bg-slate-600 dark:text-slate-300'}`}>
                  {settings.trackingEnabled ? `● ${t('bot.active')}` : `○ ${t('bot.off')}`}
                </span>
                <Switch
                  checked={settings.trackingEnabled || false}
                  onCheckedChange={(checked) => {
                    updateSetting('trackingEnabled', checked);
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Bot Templates - Show when confirmation bot is selected */}
        {activeBot === 'confirmation' && (
          <div className="space-y-4 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Provider Selection */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-black/20">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                  <Globe className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                {t('bot.provider')}
              </h3>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { value: 'facebook', label: 'Facebook' },
                  { value: 'telegram', label: 'Telegram' },
                  { value: 'whatsapp_cloud', label: 'WhatsApp' },
                  { value: 'viber', label: 'Viber' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => updateSetting('provider', option.value)}
                    className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      settings.provider === option.value
                        ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md shadow-emerald-500/30'
                        : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
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
                    <Label className="text-sm font-medium text-slate-900 dark:text-white">{t('bot.telegramBotToken')}</Label>
                    <Input
                      value={settings.telegramBotToken || ''}
                      onChange={(e) => updateSetting('telegramBotToken', e.target.value)}
                      placeholder="123456:ABCDEF..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-900 dark:text-white">{t('bot.telegramBotUsername')}</Label>
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
                    <Label className="text-sm font-medium text-slate-900 dark:text-white">{t('bot.whatsappPhoneId')}</Label>
                    <Input
                      value={settings.whatsappPhoneId}
                      onChange={(e) => updateSetting('whatsappPhoneId', e.target.value)}
                      placeholder="e.g. 123456789012345"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-900 dark:text-white">{t('bot.whatsappAccessToken')}</Label>
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
                    <Label className="text-sm font-medium text-slate-900 dark:text-white">{t('bot.viberAuthToken')}</Label>
                    <Input
                      value={settings.viberAuthToken || ''}
                      onChange={(e) => updateSetting('viberAuthToken', e.target.value)}
                      placeholder="viber-auth-token"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-900 dark:text-white">{t('bot.viberSenderName')}</Label>
                    <Input
                      value={settings.viberSenderName || ''}
                      onChange={(e) => updateSetting('viberSenderName', e.target.value)}
                      placeholder="sahla-E"
                    />
                  </div>
                </div>
              )}

              {settings.provider === 'facebook' && (
                <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-900 dark:text-white">{t('bot.facebookPageId')}</Label>
                    <Input
                      value={settings.facebookPageId || ''}
                      onChange={(e) => updateSetting('facebookPageId', e.target.value)}
                      placeholder="e.g. 123456789012345"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-900 dark:text-white">{t('bot.facebookAccessToken')}</Label>
                    <Input
                      type="password"
                      value={settings.facebookAccessToken || ''}
                      onChange={(e) => updateSetting('facebookAccessToken', e.target.value)}
                      placeholder="Paste Facebook access token"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Greeting Template */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-black/20">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-500/20">
                  <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                {t('bot.greetingMessage')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{t('bot.greetingDesc')}</p>
              <Textarea
                value={settings.templateGreeting || ''}
                onChange={(e) => updateSetting('templateGreeting', e.target.value)}
                rows={4}
                className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            {/* Instant Order Notification - NEW */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-700 shadow-lg shadow-emerald-200/50 dark:shadow-black/20">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                  <Package className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                📦 {t('bot.instantOrder')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{t('bot.instantOrderDesc')}</p>
              <Textarea
                value={settings.templateInstantOrder || ''}
                onChange={(e) => updateSetting('templateInstantOrder', e.target.value)}
                rows={12}
                className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono"
              />
            </div>

            {/* Pin Instructions - NEW */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-amber-200 dark:border-amber-700 shadow-lg shadow-amber-200/50 dark:shadow-black/20">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-500/20">
                  <MapPin className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                📌 {t('bot.pinInstructions')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{t('bot.pinInstructionsDesc')}</p>
              <Textarea
                value={settings.templatePinInstructions || ''}
                onChange={(e) => updateSetting('templatePinInstructions', e.target.value)}
                rows={6}
                className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono"
              />
            </div>

            {/* Order Confirmation Template */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-green-200 dark:border-green-700 shadow-lg shadow-green-200/50 dark:shadow-black/20">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-500/20">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                ⏱️ {t('bot.orderConfirmation')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{t('bot.orderConfirmationDesc')}</p>
              
              {/* Delay Setting */}
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <Label className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2 block">
                  ⏰ {t('bot.confirmationDelay')}
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={1}
                    value={settings.telegramDelayMinutes ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        updateSetting('telegramDelayMinutes', undefined);
                      } else {
                        const num = parseInt(val);
                        if (!isNaN(num) && num >= 1) {
                          updateSetting('telegramDelayMinutes', num);
                        }
                      }
                    }}
                    onBlur={(e) => {
                      // Set default on blur if empty
                      if (!settings.telegramDelayMinutes) {
                        updateSetting('telegramDelayMinutes', 5);
                      }
                    }}
                    className="w-24 bg-white dark:bg-slate-800 border-green-300 dark:border-green-700"
                  />
                  <span className="text-xs text-green-700 dark:text-green-400">
                    {t('bot.sendConfirmationAfter').replace('{n}', (settings.telegramDelayMinutes || 5).toString())}
                  </span>
                </div>
              </div>
              
              {/* Auto-Expire Setting */}
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                <Label className="text-sm font-semibold text-red-800 dark:text-red-300 mb-2 block">
                  ⏱️ {t('bot.autoExpire')}
                </Label>
                <p className="text-xs text-red-600 dark:text-red-400 mb-2">
                  {t('bot.autoExpireDesc')}
                </p>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={1}
                    value={settings.autoExpireHours ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === '') {
                        updateSetting('autoExpireHours', undefined);
                      } else {
                        const num = parseInt(val);
                        if (!isNaN(num) && num >= 1) {
                          updateSetting('autoExpireHours', num);
                        }
                      }
                    }}
                    onBlur={() => {
                      if (!settings.autoExpireHours) {
                        updateSetting('autoExpireHours', 24);
                      }
                    }}
                    className="w-24 bg-white dark:bg-slate-800 border-red-300 dark:border-red-700"
                  />
                  <span className="text-xs text-red-700 dark:text-red-400">
                    {t('bot.autoExpireAfter').replace('{n}', (settings.autoExpireHours || 24).toString())}
                  </span>
                </div>
              </div>
              
              <Textarea
                value={settings.templateOrderConfirmation}
                onChange={(e) => updateSetting('templateOrderConfirmation', e.target.value)}
                rows={6}
                className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            {/* Payment Template */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-black/20">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-500/20">
                  <CreditCard className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                {t('bot.paymentConfirmation')}
              </h3>
              <Textarea
                value={settings.templatePayment}
                onChange={(e) => updateSetting('templatePayment', e.target.value)}
                rows={4}
                className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            {/* Shipping Template */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-black/20">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-500/20">
                  <Truck className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                {t('bot.shippingNotification')}
              </h3>
              <Textarea
                value={settings.templateShipping}
                onChange={(e) => updateSetting('templateShipping', e.target.value)}
                rows={4}
                className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            {/* Variables Reference */}
            <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-lg shadow-slate-200/50 dark:shadow-black/20">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
                  <Code2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">{t('bot.availableVariables')}</h4>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {variables.map((v) => (
                  <div key={v.key} className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                    <code className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-md font-mono text-xs font-semibold">
                      {v.key}
                    </code>
                    <span className="text-slate-600 dark:text-slate-400 text-xs">{v.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bot Updates - Show when updates bot is selected */}
        {activeBot === 'updates' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg shadow-violet-200/30 dark:shadow-black/20 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <CustomerBot embedded={true} />
          </div>
        )}

        {/* Bot Tracking - Show when tracking bot is selected */}
        {activeBot === 'tracking' && (
          <div className="space-y-4 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Tracking Overview */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl p-5 border border-orange-200 dark:border-orange-800/50 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-500/20">
                  <Navigation className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{t('bot.realTimeTracking')}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {t('bot.realTimeTrackingDesc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Tracking Status Messages */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-lg">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-500/20">
                  <Package className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                Tracking Status Messages
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Configure messages sent at each delivery stage. Use variables like {'{customerName}'}, {'{orderId}'}, {'{trackingNumber}'}.
              </p>
              
              <div className="space-y-4">
                {/* Order Shipped */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Order Shipped
                  </Label>
                  <Textarea
                    value={(settings as any).templateTrackingShipped || `📦 Hello {customerName}!\n\nYour order #{orderId} has been shipped.\n🚚 Delivery Company: {deliveryCompany}\n📍 Tracking Number: {trackingNumber}\n\nYou can track your order here: {trackingUrl}`}
                    onChange={(e) => updateSetting('templateTrackingShipped' as any, e.target.value)}
                    rows={4}
                    className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>

                {/* Out for Delivery */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Out for Delivery
                  </Label>
                  <Textarea
                    value={(settings as any).templateTrackingOutForDelivery || `🚛 {customerName}, your order is on its way!\n\nYour order #{orderId} is out for delivery.\n📍 Estimated arrival: {estimatedTime}\n📞 The driver will contact you soon.\n\nMake sure you're available to receive the order!`}
                    onChange={(e) => updateSetting('templateTrackingOutForDelivery' as any, e.target.value)}
                    rows={4}
                    className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>

                {/* Delivered */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Delivered
                  </Label>
                  <Textarea
                    value={(settings as any).templateTrackingDelivered || `✅ Successfully Delivered!\n\nHello {customerName},\nYour order #{orderId} has been delivered successfully.\n\n🙏 Thank you for shopping with us!\n⭐ We hope you enjoy your products.\n\nFor inquiries: {supportPhone}`}
                    onChange={(e) => updateSetting('templateTrackingDelivered' as any, e.target.value)}
                    rows={4}
                    className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>

                {/* Delivery Failed */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Delivery Failed
                  </Label>
                  <Textarea
                    value={(settings as any).templateTrackingFailed || `⚠️ Delivery Failed\n\nHello {customerName},\nWe were unable to deliver your order #{orderId}.\n\nReason: {failureReason}\n\n📞 Please contact us to reschedule delivery: {supportPhone}`}
                    onChange={(e) => updateSetting('templateTrackingFailed' as any, e.target.value)}
                    rows={4}
                    className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Company Integration */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-lg">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-500/20">
                  <Truck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                Delivery Company Settings
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Connect with delivery companies to get automatic tracking updates.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-900 dark:text-white">Default Delivery Company</Label>
                  <Input
                    value={(settings as any).defaultDeliveryCompany || ''}
                    onChange={(e) => updateSetting('defaultDeliveryCompany' as any, e.target.value)}
                    placeholder="e.g. Yalidine, ZR Express"
                    className="bg-slate-50 dark:bg-slate-800/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-900 dark:text-white">Tracking URL Template</Label>
                  <Input
                    value={(settings as any).trackingUrlTemplate || ''}
                    onChange={(e) => updateSetting('trackingUrlTemplate' as any, e.target.value)}
                    placeholder="https://track.example.com/{trackingNumber}"
                    className="bg-slate-50 dark:bg-slate-800/50"
                  />
                </div>
              </div>
            </div>

            {/* Tracking Variables */}
            <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-500/20">
                  <Code2 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">Tracking Variables</h4>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { key: '{customerName}', desc: 'Customer name' },
                  { key: '{orderId}', desc: 'Order ID' },
                  { key: '{trackingNumber}', desc: 'Tracking number' },
                  { key: '{deliveryCompany}', desc: 'Delivery company' },
                  { key: '{trackingUrl}', desc: 'Tracking URL' },
                  { key: '{estimatedTime}', desc: 'Estimated delivery' },
                  { key: '{failureReason}', desc: 'Delivery failure reason' },
                  { key: '{supportPhone}', desc: 'Support phone' },
                ].map((v) => (
                  <div key={v.key} className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
                    <code className="bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-md font-mono text-xs font-semibold">
                      {v.key}
                    </code>
                    <span className="text-slate-600 dark:text-slate-400 text-xs">{v.desc}</span>
                  </div>
                ))}
              </div>
            </div>
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
                {t('bot.saving')}
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                {t('bot.saveChanges')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
