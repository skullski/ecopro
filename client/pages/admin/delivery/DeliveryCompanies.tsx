import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Truck, Key, CheckCircle2, X } from "lucide-react";
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
  credentials?: Record<string, string>;
}

export default function DeliveryCompanies() {
  const [selectedCompany, setSelectedCompany] = useState<DeliveryCompany | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
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

  const handleCardClick = (company: DeliveryCompany) => {
    setSelectedCompany(company);
    setCredentials(company.credentials || {});
    setShowConfigDialog(true);
  };

  const handleSaveCredentials = () => {
    if (!selectedCompany) return;
    
    setCompanies(companies.map(company => 
      company.id === selectedCompany.id 
        ? { ...company, enabled: true, credentials } 
        : company
    ));
    setShowConfigDialog(false);
    setCredentials({});
  };

  const handleDisable = (companyId: string) => {
    setCompanies(companies.map(company => 
      company.id === companyId 
        ? { ...company, enabled: false, credentials: {} } 
        : company
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          شركات التوصيل
        </h1>
        <p className="text-muted-foreground mt-2">اختر شركة التوصيل وقم بإعداد الربط</p>
      </div>

      {/* Grid of delivery company cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {companies.map((company) => (
          <Card
            key={company.id}
            className={`relative cursor-pointer transition-all hover:shadow-lg border-2 ${
              company.enabled 
                ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
                : 'border-border hover:border-primary'
            }`}
            onClick={() => handleCardClick(company)}
          >
            {company.enabled && (
              <div className="absolute top-2 right-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
            )}
            <CardContent className="pt-6 pb-4">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-3xl">
                  {company.logo}
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-base">{company.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {company.description}
                  </p>
                </div>
                {company.enabled && (
                  <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                    ✓ مفعل
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Configuration Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="text-2xl">{selectedCompany?.logo}</span>
              {selectedCompany?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedCompany?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedCompany?.apiFields.map((field) => (
              <div key={field.field} className="space-y-2">
                <Label htmlFor={field.field}>{field.label}</Label>
                <Input
                  id={field.field}
                  placeholder={field.placeholder}
                  value={credentials[field.field] || ''}
                  onChange={(e) => setCredentials({ ...credentials, [field.field]: e.target.value })}
                />
              </div>
            ))}
            
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex gap-2">
                <Key className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  احصل على API credentials من لوحة تحكم شركة التوصيل
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            {selectedCompany?.enabled && (
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedCompany) {
                    handleDisable(selectedCompany.id);
                    setShowConfigDialog(false);
                  }
                }}
              >
                <X className="w-4 h-4 mr-2" />
                تعطيل
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveCredentials}>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              حفظ وتفعيل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}