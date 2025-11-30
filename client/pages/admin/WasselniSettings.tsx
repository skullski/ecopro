import { useState, useEffect } from "react";
import { Bot, Save, Loader2, Phone, MessageSquare, Clock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";

interface BotSettings {
  enabled: boolean;
  language: string;
  whatsappDelay: number;
  smsDelay: number;
  companyName: string;
  supportPhone: string;
  storeUrl: string;
  whatsappTemplate: string;
  smsTemplate: string;
}

export default function AdminWasselniSettings() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<BotSettings>({
    enabled: false,
    language: 'ar',
    whatsappDelay: 5,
    smsDelay: 30,
    companyName: '',
    supportPhone: '',
    storeUrl: '',
    whatsappTemplate: `السلام عليكم {customerName}! 🌟

شكراً لك على طلبك من {companyName}! 

📦 تفاصيل الطلب:
• المنتج: {productName}
• السعر: {totalPrice} دج
• العنوان: {address}

هل تؤكد الطلب؟ رد ب "نعم" للتأكيد أو "لا" للإلغاء.

للمساعدة: {supportPhone}`,
    smsTemplate: `مرحبا {customerName}! طلبك #{orderId} من {companyName} بـ {totalPrice} دج. رد "نعم" للتأكيد. {supportPhone}`
  });

  useEffect(() => {
    loadSettings();
  }, []);

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
        throw new Error('Failed to save settings');
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
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
    { key: '{storeUrl}', desc: 'Store URL' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t('wasselni.settings')}</h1>
            <p className="text-sm text-muted-foreground">{t('wasselni.desc')}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {t('save')}
            </>
          )}
        </Button>
      </div>

      {/* Enable/Disable Switch */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            {t('wasselni.status')}
          </CardTitle>
          <CardDescription>
            Enable or disable the automated order confirmation bot
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Bot Status</p>
              <p className="text-sm text-muted-foreground">
                {settings.enabled ? t('wasselni.active') : t('wasselni.inactive')}
              </p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) => updateSetting('enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">
            <Globe className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="whatsapp">
            <Phone className="h-4 w-4 mr-2" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="sms">
            <MessageSquare className="h-4 w-4 mr-2" />
            SMS
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Configuration</CardTitle>
              <CardDescription>
                Configure basic bot settings and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select 
                    value={settings.language} 
                    onValueChange={(value) => updateSetting('language', value)}
                  >
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية (Arabic)</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">Français (French)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={settings.companyName}
                    onChange={(e) => updateSetting('companyName', e.target.value)}
                    placeholder="Your company name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supportPhone">Support Phone</Label>
                  <Input
                    id="supportPhone"
                    value={settings.supportPhone}
                    onChange={(e) => updateSetting('supportPhone', e.target.value)}
                    placeholder="+213 555 123 456"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeUrl">Store URL</Label>
                  <Input
                    id="storeUrl"
                    value={settings.storeUrl}
                    onChange={(e) => updateSetting('storeUrl', e.target.value)}
                    placeholder="https://yourstore.com"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="whatsappDelay" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    WhatsApp Delay (minutes)
                  </Label>
                  <Input
                    id="whatsappDelay"
                    type="number"
                    min="0"
                    max="60"
                    value={settings.whatsappDelay}
                    onChange={(e) => updateSetting('whatsappDelay', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Time to wait before sending WhatsApp message after order
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smsDelay" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    SMS Delay (minutes)
                  </Label>
                  <Input
                    id="smsDelay"
                    type="number"
                    min="0"
                    max="120"
                    value={settings.smsDelay}
                    onChange={(e) => updateSetting('smsDelay', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Time to wait before sending SMS if no WhatsApp response
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WhatsApp Template */}
        <TabsContent value="whatsapp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Message Template</CardTitle>
              <CardDescription>
                Customize the WhatsApp message sent to customers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whatsappTemplate">Message Template</Label>
                <Textarea
                  id="whatsappTemplate"
                  value={settings.whatsappTemplate}
                  onChange={(e) => updateSetting('whatsappTemplate', e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>

              <div className="rounded-lg border bg-muted/50 p-4">
                <h4 className="font-semibold mb-2 text-sm">Available Variables:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {variables.map((v) => (
                    <div key={v.key} className="flex items-start gap-2">
                      <code className="bg-background px-2 py-0.5 rounded text-xs font-mono">
                        {v.key}
                      </code>
                      <span className="text-muted-foreground text-xs">{v.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border bg-muted/10 p-4">
                <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Preview
                </h4>
                <div className="bg-background rounded-lg p-3 whitespace-pre-wrap text-sm border">
                  {settings.whatsappTemplate
                    .replace('{customerName}', 'أحمد')
                    .replace('{companyName}', settings.companyName || 'Your Store')
                    .replace('{productName}', 'iPhone 15 Pro')
                    .replace('{totalPrice}', '150,000')
                    .replace('{address}', 'الجزائر، حسين داي')
                    .replace('{supportPhone}', settings.supportPhone || '+213 555 123 456')
                    .replace('{orderId}', '12345')
                    .replace('{storeUrl}', settings.storeUrl || 'https://yourstore.com')}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMS Template */}
        <TabsContent value="sms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SMS Message Template</CardTitle>
              <CardDescription>
                Customize the SMS message sent to customers (max 160 characters)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="smsTemplate">Message Template</Label>
                  <span className={`text-xs ${settings.smsTemplate.length > 160 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {settings.smsTemplate.length} / 160 characters
                  </span>
                </div>
                <Textarea
                  id="smsTemplate"
                  value={settings.smsTemplate}
                  onChange={(e) => updateSetting('smsTemplate', e.target.value)}
                  rows={4}
                  className="font-mono text-sm"
                  maxLength={160}
                />
                {settings.smsTemplate.length > 160 && (
                  <p className="text-xs text-destructive">
                    SMS messages should be 160 characters or less for best delivery
                  </p>
                )}
              </div>

              <div className="rounded-lg border bg-muted/50 p-4">
                <h4 className="font-semibold mb-2 text-sm">Available Variables:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {variables.map((v) => (
                    <div key={v.key} className="flex items-start gap-2">
                      <code className="bg-background px-2 py-0.5 rounded text-xs font-mono">
                        {v.key}
                      </code>
                      <span className="text-muted-foreground text-xs">{v.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border bg-muted/10 p-4">
                <h4 className="font-semibold mb-2 text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Preview
                </h4>
                <div className="bg-background rounded-lg p-3 text-sm border">
                  {settings.smsTemplate
                    .replace('{customerName}', 'أحمد')
                    .replace('{companyName}', settings.companyName || 'Your Store')
                    .replace('{productName}', 'iPhone 15 Pro')
                    .replace('{totalPrice}', '150,000')
                    .replace('{address}', 'الجزائر، حسين داي')
                    .replace('{supportPhone}', settings.supportPhone || '+213 555 123 456')
                    .replace('{orderId}', '12345')
                    .replace('{storeUrl}', settings.storeUrl || 'https://yourstore.com')}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
