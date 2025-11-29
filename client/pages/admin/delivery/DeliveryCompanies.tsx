import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Truck, Key, Globe, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface DeliveryCompany {
  id: string;
  name: string;
  logo: string;
  description: string;
  apiFields: {
    label: string;
    placeholder: string;
    field: string;
  }[];
  enabled: boolean;
}

export default function DeliveryCompanies() {
  const [companies, setCompanies] = useState<DeliveryCompany[]>([
    {
      id: "yalidine",
      name: "Yalidine",
      logo: "🚚",
      description: "خدمة توصيل سريعة تغطي كل الوطن",
      apiFields: [
        { label: "API Token", placeholder: "أدخل API Token الخاص بك", field: "apiToken" },
        { label: "API ID", placeholder: "أدخل API ID", field: "apiId" },
      ],
      enabled: false,
    },
    {
      id: "zr-express",
      name: "ZR Express",
      logo: "⚡",
      description: "توصيل سريع وموثوق في جميع الولايات",
      apiFields: [
        { label: "API Key", placeholder: "أدخل API Key", field: "apiKey" },
        { label: "Client ID", placeholder: "أدخل Client ID", field: "clientId" },
      ],
      enabled: false,
    },
    {
      id: "procolis",
      name: "Procolis",
      logo: "📦",
      description: "شريكك الموثوق للتوصيل السريع",
      apiFields: [
        { label: "API Token", placeholder: "أدخل API Token", field: "apiToken" },
        { label: "Store ID", placeholder: "أدخل Store ID", field: "storeId" },
      ],
      enabled: false,
    },
    {
      id: "maystro-delivery",
      name: "Maystro Delivery",
      logo: "🎯",
      description: "حلول توصيل احترافية للتجار",
      apiFields: [
        { label: "API Key", placeholder: "أدخل API Key", field: "apiKey" },
        { label: "Secret Key", placeholder: "أدخل Secret Key", field: "secretKey" },
      ],
      enabled: false,
    },
    {
      id: "ecf-express",
      name: "ECF Express",
      logo: "🚀",
      description: "توصيل فعال وسريع في الجزائر",
      apiFields: [
        { label: "API Token", placeholder: "أدخل API Token", field: "apiToken" },
        { label: "Merchant ID", placeholder: "أدخل Merchant ID", field: "merchantId" },
      ],
      enabled: false,
    },
    {
      id: "sonic-delivery",
      name: "Sonic Delivery",
      logo: "💨",
      description: "توصيل بسرعة الصوت",
      apiFields: [
        { label: "API Key", placeholder: "أدخل API Key", field: "apiKey" },
        { label: "Account ID", placeholder: "أدخل Account ID", field: "accountId" },
      ],
      enabled: false,
    },
    {
      id: "speedaf",
      name: "Speedaf",
      logo: "🏃",
      description: "خدمة توصيل دولية وسريعة",
      apiFields: [
        { label: "API Key", placeholder: "أدخل API Key", field: "apiKey" },
        { label: "Customer Code", placeholder: "أدخل Customer Code", field: "customerCode" },
      ],
      enabled: false,
    },
    {
      id: "express-dz",
      name: "Express DZ",
      logo: "🇩🇿",
      description: "شركة توصيل جزائرية 100%",
      apiFields: [
        { label: "API Token", placeholder: "أدخل API Token", field: "apiToken" },
        { label: "Partner ID", placeholder: "أدخل Partner ID", field: "partnerId" },
      ],
      enabled: false,
    },
    {
      id: "baridiMob",
      name: "BaridiMob",
      logo: "💳",
      description: "خدمة بريد الجزائر للدفع والتوصيل",
      apiFields: [
        { label: "Merchant ID", placeholder: "أدخل Merchant ID", field: "merchantId" },
        { label: "Terminal ID", placeholder: "أدخل Terminal ID", field: "terminalId" },
        { label: "API Key", placeholder: "أدخل API Key", field: "apiKey" },
      ],
      enabled: false,
    },
    {
      id: "coliship",
      name: "Coliship",
      logo: "📮",
      description: "منصة مقارنة وإدارة شركات التوصيل",
      apiFields: [
        { label: "API Token", placeholder: "أدخل API Token", field: "apiToken" },
        { label: "User ID", placeholder: "أدخل User ID", field: "userId" },
      ],
      enabled: false,
    },
    {
      id: "fast-dz",
      name: "Fast DZ",
      logo: "⚡",
      description: "توصيل سريع في الجزائر",
      apiFields: [
        { label: "API Key", placeholder: "أدخل API Key", field: "apiKey" },
        { label: "Store Code", placeholder: "أدخل Store Code", field: "storeCode" },
      ],
      enabled: false,
    },
    {
      id: "algerie-poste",
      name: "Algérie Poste",
      logo: "📯",
      description: "بريد الجزائر - خدمة التوصيل الوطنية",
      apiFields: [
        { label: "Code Client", placeholder: "أدخل Code Client", field: "clientCode" },
        { label: "Clé API", placeholder: "أدخل Clé API", field: "apiKey" },
      ],
      enabled: false,
    },
    {
      id: "goldex",
      name: "Goldex",
      logo: "🥇",
      description: "خدمة توصيل سريعة وآمنة",
      apiFields: [
        { label: "API Token", placeholder: "أدخل API Token", field: "apiToken" },
        { label: "Client ID", placeholder: "أدخل Client ID", field: "clientId" },
      ],
      enabled: false,
    },
    {
      id: "rapid-express",
      name: "Rapid Express",
      logo: "🚄",
      description: "توصيل سريع في 48 ولاية",
      apiFields: [
        { label: "API Key", placeholder: "أدخل API Key", field: "apiKey" },
        { label: "Merchant Code", placeholder: "أدخل Merchant Code", field: "merchantCode" },
      ],
      enabled: false,
    },
    {
      id: "mypost",
      name: "MyPost",
      logo: "📨",
      description: "حلول توصيل ذكية ومرنة",
      apiFields: [
        { label: "API Key", placeholder: "أدخل API Key", field: "apiKey" },
        { label: "Account ID", placeholder: "أدخل Account ID", field: "accountId" },
      ],
      enabled: false,
    },
    {
      id: "eurl-express",
      name: "EURL Express",
      logo: "🏢",
      description: "شركة توصيل جزائرية معتمدة",
      apiFields: [
        { label: "API Token", placeholder: "أدخل API Token", field: "apiToken" },
        { label: "Partner Code", placeholder: "أدخل Partner Code", field: "partnerCode" },
      ],
      enabled: false,
    },
    {
      id: "flash-delivery",
      name: "Flash Delivery",
      logo: "⚡",
      description: "توصيل فوري في نفس اليوم",
      apiFields: [
        { label: "API Key", placeholder: "أدخل API Key", field: "apiKey" },
        { label: "Store ID", placeholder: "أدخل Store ID", field: "storeId" },
      ],
      enabled: false,
    },
    {
      id: "custom",
      name: "شركة توصيل مخصصة",
      logo: "🔧",
      description: "أضف شركة التوصيل الخاصة بك",
      apiFields: [
        { label: "اسم الشركة", placeholder: "أدخل اسم الشركة", field: "companyName" },
        { label: "رقم الهاتف", placeholder: "أدخل رقم الهاتف", field: "phone" },
        { label: "البريد الإلكتروني", placeholder: "أدخل البريد الإلكتروني", field: "email" },
        { label: "API Endpoint", placeholder: "https://api.company.com", field: "apiEndpoint" },
        { label: "API Key", placeholder: "أدخل API Key", field: "apiKey" },
      ],
      enabled: false,
    },
  ]);

  const toggleCompany = (id: string) => {
    setCompanies(companies.map(company => 
      company.id === id ? { ...company, enabled: !company.enabled } : company
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          شركات التوصيل
        </h1>
        <p className="text-muted-foreground mt-2">قم بربط متجرك مع شركات التوصيل المختلفة</p>
      </div>

      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            نصائح الربط
          </CardTitle>
          <CardDescription>معلومات مهمة قبل البدء</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm">
              <strong>💡 نصيحة:</strong> تأكد من حصولك على API credentials من لوحة تحكم شركة التوصيل أولاً
            </p>
          </div>
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm">
              <strong>✅ الفائدة:</strong> بعد الربط، سيتم إنشاء طلبات التوصيل تلقائياً عند استلام الطلبات
            </p>
          </div>
          <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <p className="text-sm">
              <strong>⚠️ تحذير:</strong> احتفظ بمفاتيح API الخاصة بك آمنة ولا تشاركها مع أحد
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {companies.map((company) => (
          <Card key={company.id} className={`border-2 transition-all ${company.enabled ? 'border-green-500/40 bg-green-500/5' : 'border-primary/20'}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{company.logo}</div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {company.name}
                      {company.enabled && (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                    </CardTitle>
                    <CardDescription>{company.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant={company.enabled ? "outline" : "default"}
                    onClick={() => toggleCompany(company.id)}
                    className={company.enabled ? "border-green-500 text-green-600" : "bg-gradient-to-r from-primary to-accent"}
                  >
                    {company.enabled ? "مفعل" : "تفعيل"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {company.enabled && (
              <CardContent className="space-y-4 border-t pt-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Key className="w-4 h-4" />
                  <span>إعدادات الربط مع {company.name}</span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {company.apiFields.map((field, idx) => (
                    <div key={idx}>
                      <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                        <Key className="w-3 h-3" />
                        {field.label}
                      </label>
                      <Input
                        type="password"
                        placeholder={field.placeholder}
                        className="font-mono text-sm"
                      />
                    </div>
                  ))}
                </div>

                {company.id !== "custom" && (
                  <div className="pt-4">
                    <Button
                      variant="outline"
                      className="w-full border-primary/30 hover:border-primary/50"
                      onClick={() => window.open(`https://${company.id}.com`, '_blank')}
                    >
                      <Globe className="w-4 h-4 ml-2" />
                      زيارة موقع {company.name} للحصول على API Keys
                    </Button>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button className="flex-1 bg-gradient-to-r from-green-500 to-green-600">
                    حفظ الإعدادات
                  </Button>
                  <Button variant="outline" className="flex-1">
                    اختبار الاتصال
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <Card className="border-2 border-accent/20">
        <CardHeader>
          <CardTitle>إحصائيات التوصيل</CardTitle>
          <CardDescription>ملخص أداء شركات التوصيل</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg border border-blue-500/20">
              <p className="text-sm text-muted-foreground mb-1">إجمالي الطلبات</p>
              <p className="text-2xl font-bold text-blue-600">1,234</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg border border-green-500/20">
              <p className="text-sm text-muted-foreground mb-1">تم التوصيل</p>
              <p className="text-2xl font-bold text-green-600">1,089</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-lg border border-orange-500/20">
              <p className="text-sm text-muted-foreground mb-1">معدل النجاح</p>
              <p className="text-2xl font-bold text-orange-600">88.2%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
