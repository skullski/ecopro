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
      id: "zr-express",
      name: "ZR Express",
      logo: "/delivery-logos/ZR-Express-1.webp",
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
      logo: "/delivery-logos/prologis-logo-png_seeklogo-311359.webp",
      description: "شريكك الموثوق للتوصيل السريع",
      apiFields: [
        { label: "API Token", placeholder: "أدخل API Token", field: "apiToken" },
        { label: "Store ID", placeholder: "أدخل Store ID", field: "storeId" },
      ],
      enabled: false,
    },
    {
      id: "ecf-express",
      name: "ECF Express",
      logo: "/delivery-logos/ecf-logo-png_seeklogo-45349.webp",
      description: "توصيل فعال وسريع في الجزائر",
      apiFields: [
        { label: "API Token", placeholder: "أدخل API Token", field: "apiToken" },
        { label: "Merchant ID", placeholder: "أدخل Merchant ID", field: "merchantId" },
      ],
      enabled: false,
    },
    {
      id: "baridiMob",
      name: "BaridiMob",
      logo: "/delivery-logos/baridimob-logo-png_seeklogo-445029.webp",
      description: "خدمة بريد الجزائر للدفع والتوصيل",
      apiFields: [
        { label: "Merchant ID", placeholder: "أدخل Merchant ID", field: "merchantId" },
        { label: "Terminal ID", placeholder: "أدخل Terminal ID", field: "terminalId" },
        { label: "API Key", placeholder: "أدخل API Key", field: "apiKey" },
      ],
      enabled: false,
    },
    {
      id: "algerie-poste",
      name: "Algérie Poste",
      logo: "/delivery-logos/poste-algerie-logo-png_seeklogo-272140.webp",
      description: "بريد الجزائر - خدمة التوصيل الوطنية",
      apiFields: [
        { label: "Code Client", placeholder: "أدخل Code Client", field: "clientCode" },
        { label: "Clé API", placeholder: "أدخل Clé API", field: "apiKey" },
      ],
      enabled: false,
    },
    {
      id: "yalidine",
      name: "Yalidine",
      logo: "/delivery-logos/da7c3e116870469.60dcd939c8198.webp",
      description: "خدمة توصيل سريعة تغطي كل الوطن",
      apiFields: [
        { label: "API Token", placeholder: "أدخل API Token الخاص بك", field: "apiToken" },
        { label: "API ID", placeholder: "أدخل API ID", field: "apiId" },
      ],
      enabled: false,
    },
    {
      id: "mars-express",
      name: "Mars Express",
      logo: "/delivery-logos/mars-first-frontier-slogan-print-260nw-1787784659.jpg",
      description: "توصيل سريع متخصص في الجزائر العاصمة والضواحي",
      apiFields: [
        { label: "API Token", placeholder: "أدخل API Token", field: "apiToken" },
        { label: "Business ID", placeholder: "أدخل Business ID", field: "businessId" },
      ],
      enabled: false,
    },
    {
      id: "tiba",
      name: "Tiba",
      logo: "/delivery-logos/random.webp",
      description: "خدمات الشحن واللوجستيات مع المستودعات",
      apiFields: [
        { label: "Account Number", placeholder: "أدخل رقم الحساب", field: "accountNumber" },
        { label: "API Key", placeholder: "أدخل API Key", field: "apiKey" },
      ],
      enabled: false,
    },
    {
      id: "zrara-express",
      name: "Zrara Express",
      logo: "/delivery-logos/ZARA_Present.jpg",
      description: "خدمة توصيل إقليمية متخصصة في الولايات الشمالية",
      apiFields: [
        { label: "API Token", placeholder: "أدخل API Token", field: "apiToken" },
        { label: "Region Code", placeholder: "أدخل رمز المنطقة", field: "regionCode" },
      ],
      enabled: false,
    },
    {
      id: "speed-dz",
      name: "Speed DZ",
      logo: "/delivery-logos/dz-logo-letter-speed-meter-racing-style-initial-monogram-design-black-background-speedometer-238210696.webp",
      description: "توصيل سريع متخصص في التوصيل داخل المدن",
      apiFields: [
        { label: "API Token", placeholder: "أدخل API Token", field: "apiToken" },
        { label: "Merchant ID", placeholder: "أدخل Merchant ID", field: "merchantId" },
      ],
      enabled: false,
    },
    {
      id: "khadamaty",
      name: "Khadamaty Delivery",
      logo: "/delivery-logos/service_apres_vente_khadamaty_ar.webp",
      description: "خدمة توصيل محلية للطرود الصغيرة والطعام",
      apiFields: [
        { label: "Business Key", placeholder: "أدخل مفتاح النشاط", field: "businessKey" },
        { label: "Contact Number", placeholder: "أدخل رقم الاتصال", field: "contactNumber" },
      ],
      enabled: false,
    },
    {
      id: "eddelivery-dz",
      name: "Eddelivery DZ",
      logo: "/delivery-logos/fast-delivery-logo-template-free-vector.webp",
      description: "منصة لوجستية متكاملة مع تتبع في الوقت الفعلي",
      apiFields: [
        { label: "API Key", placeholder: "أدخل API Key", field: "apiKey" },
        { label: "Seller ID", placeholder: "أدخل معرّف البائع", field: "sellerId" },
      ],
      enabled: false,
    },
    {
      id: "poste-express",
      name: "Poste Express",
      logo: "/delivery-logos/poste-algerie-logo-png_seeklogo-272140.webp",
      description: "خدمة بريد الجزائر للشحنات السريعة",
      apiFields: [
        { label: "Account Code", placeholder: "أدخل رمز الحساب", field: "accountCode" },
        { label: "API Token", placeholder: "أدخل API Token", field: "apiToken" },
      ],
      enabled: false,
    },
    {
      id: "rapidex",
      name: "Rapidex",
      logo: "/delivery-logos/fast-delivery-logo-template-free-vector.webp",
      description: "خدمة الشحن السريع بين المدن والنقل الداخلي",
      apiFields: [
        { label: "API Token", placeholder: "أدخل API Token", field: "apiToken" },
        { label: "Company Code", placeholder: "أدخل رمز الشركة", field: "companyCode" },
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
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
            <Truck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              شركات التوصيل
            </h1>
            <p className="text-sm text-muted-foreground mt-1">اختر شركة التوصيل وقم بإعداد الربط لتمكين خدمات التوصيل</p>
          </div>
        </div>
      </div>

      {/* Grid of delivery company cards - More compact and professional */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {companies.map((company) => (
          <Card
            key={company.id}
            className={`relative cursor-pointer transition-all duration-300 border-2 hover:shadow-xl overflow-hidden group ${
              company.enabled 
                ? 'border-emerald-500/50 bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 dark:from-emerald-950/30 dark:to-emerald-900/20' 
                : 'border-border/50 bg-card hover:border-primary/60 hover:bg-primary/5 dark:hover:bg-primary/10'
            }`}
            onClick={() => handleCardClick(company)}
          >
            {company.enabled && (
              <div className="absolute top-1 right-1 z-10">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 drop-shadow-md" />
              </div>
            )}
            <CardContent className="p-3 h-full flex flex-col items-center justify-center text-center space-y-2">
              {/* Logo Container */}
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 flex items-center justify-center text-lg overflow-hidden border border-border/60 group-hover:border-primary/40 group-hover:shadow-md transition-all duration-300">
                {company.logo.startsWith('http') || company.logo.startsWith('data:') || company.logo.startsWith('/') ? (
                  <img 
                    src={company.logo} 
                    alt={company.name}
                    className="w-full h-full object-contain p-1.5"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = 'none';
                      if (target.nextElementSibling) {
                        (target.nextElementSibling as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                ) : (
                  <span className="text-lg">{company.logo}</span>
                )}
                {(company.logo.startsWith('http') || company.logo.startsWith('data:') || company.logo.startsWith('/')) && (
                  <div className="hidden w-full h-full items-center justify-center bg-gradient-to-br from-primary/15 to-accent/15 text-lg">
                    📦
                  </div>
                )}
              </div>
              {/* Company Name */}
              <h3 className="font-semibold text-xs leading-tight line-clamp-2 text-foreground">
                {company.name}
              </h3>
              {/* Status Indicator */}
              {company.enabled && (
                <div className="text-xs text-emerald-700 dark:text-emerald-300 font-medium px-2 py-0.5 bg-emerald-100/60 dark:bg-emerald-900/40 rounded-full">
                  مفعل ✓
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Configuration Dialog - Professional Styling */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-md border-border/50 shadow-xl">
          <DialogHeader className="space-y-3 pb-4 border-b border-border/50">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-xl flex-shrink-0 border border-primary/20">
                {selectedCompany?.logo.startsWith('http') || selectedCompany?.logo.startsWith('data:') || selectedCompany?.logo.startsWith('/') ? (
                  <img 
                    src={selectedCompany?.logo} 
                    alt={selectedCompany?.name}
                    className="w-full h-full object-contain p-1.5 rounded-lg"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.src = '';
                      target.nextElementSibling ? ((target.nextElementSibling as HTMLElement).style.display = 'flex') : null;
                    }}
                  />
                ) : (
                  <span>{selectedCompany?.logo}</span>
                )}
              </div>
              <div className="flex-1">
                <DialogTitle className="text-lg font-bold">
                  {selectedCompany?.name}
                </DialogTitle>
                <DialogDescription className="text-xs mt-1">
                  {selectedCompany?.description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedCompany?.apiFields.map((field) => (
              <div key={field.field} className="space-y-2">
                <Label htmlFor={field.field} className="text-sm font-medium">
                  {field.label}
                </Label>
                <Input
                  id={field.field}
                  placeholder={field.placeholder}
                  value={credentials[field.field] || ''}
                  onChange={(e) => setCredentials({ ...credentials, [field.field]: e.target.value })}
                  className="border-border/60 focus:border-primary/50 focus:ring-primary/20"
                />
              </div>
            ))}
            
            {/* Information Box */}
            <div className="bg-gradient-to-br from-blue-50/80 to-cyan-50/50 dark:from-blue-950/30 dark:to-cyan-950/20 border border-blue-200/50 dark:border-blue-800/50 rounded-lg p-3 space-y-2">
              <div className="flex gap-2.5">
                <Key className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                  احصل على بيانات الوصول (API credentials) من لوحة تحكم شركة التوصيل الخاصة بك
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 border-t border-border/50 pt-4">
            {selectedCompany?.enabled && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (selectedCompany) {
                    handleDisable(selectedCompany.id);
                    setShowConfigDialog(false);
                  }
                }}
                className="hover:bg-destructive/90"
              >
                <X className="w-4 h-4 mr-1.5" />
                تعطيل
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowConfigDialog(false)}
              className="border-border/60 hover:bg-muted/50"
            >
              إلغاء
            </Button>
            <Button 
              size="sm"
              onClick={handleSaveCredentials}
              className="bg-gradient-to-r from-primary to-accent hover:shadow-lg"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              حفظ وتفعيل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}