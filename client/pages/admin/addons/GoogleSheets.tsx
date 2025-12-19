import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileSpreadsheet, Key, RefreshCw, Download, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function GoogleSheetsIntegration() {
  const [connected, setConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
    }, 2000);
  };

  return (
    <div className="space-y-3 md:space-y-4">
      <div>
        <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Google Sheets
        </h1>
        <p className="text-muted-foreground mt-2">ربط متجرك مع Google Sheets لتصدير البيانات تلقائياً</p>
      </div>

      <Card className="border-2 border-green-500/20 bg-green-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            حول الربط مع Google Sheets
          </CardTitle>
          <CardDescription>ما يمكنك فعله بهذه الميزة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm font-medium mb-1">📊 تصدير الطلبات تلقائياً</p>
            <p className="text-sm text-muted-foreground">جميع الطلبات الجديدة تُضاف تلقائياً إلى Google Sheet</p>
          </div>
          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <p className="text-sm font-medium mb-1">📦 تصدير المنتجات</p>
            <p className="text-sm text-muted-foreground">قائمة المنتجات مع الأسعار والمخزون</p>
          </div>
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm font-medium mb-1">👥 قائمة العملاء</p>
            <p className="text-sm text-muted-foreground">معلومات العملاء ورقم الهاتف والعنوان</p>
          </div>
          <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <p className="text-sm font-medium mb-1">📈 الإحصائيات اليومية</p>
            <p className="text-sm text-muted-foreground">المبيعات، الأرباح، عدد الطلبات</p>
          </div>
        </CardContent>
      </Card>

      <Card className={`border-2 ${connected ? 'border-green-500/40 bg-green-500/5' : 'border-primary/20'}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              إعدادات الربط
            </div>
            {connected && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                متصل
              </div>
            )}
          </CardTitle>
          <CardDescription>قم بربط حساب Google الخاص بك</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-700 dark:text-yellow-600 mb-1">كيفية الحصول على API Credentials</p>
              <ol className="text-muted-foreground space-y-1 list-decimal list-inside">
                <li>انتقل إلى <a href="https://console.cloud.google.com" target="_blank" className="text-primary underline">Google Cloud Console</a></li>
                <li>أنشئ مشروع جديد أو اختر مشروع موجود</li>
                <li>فعّل Google Sheets API</li>
                <li>أنشئ Service Account وقم بتنزيل ملف JSON</li>
                <li>شارك Google Sheet مع البريد الإلكتروني للـ Service Account</li>
              </ol>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">معرف Google Sheet (Spreadsheet ID)</label>
            <Input 
              placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
              defaultValue={connected ? "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms" : ""}
            />
            <p className="text-xs text-muted-foreground mt-1">
              يمكنك إيجاده في رابط Google Sheet: docs.google.com/spreadsheets/d/<span className="text-primary font-mono">SPREADSHEET_ID</span>/edit
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Service Account Email</label>
            <Input 
              type="email"
              placeholder="your-service-account@project-id.iam.gserviceaccount.com"
              defaultValue={connected ? "sheets-sync@ecopro-123.iam.gserviceaccount.com" : ""}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Private Key (JSON)</label>
            <textarea
              className="w-full min-h-[120px] px-3 py-2 border rounded-lg font-mono text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder='{"type": "service_account", "project_id": "...", "private_key": "..."}'
            />
            <p className="text-xs text-muted-foreground mt-1">
              انسخ محتوى ملف JSON الذي قمت بتنزيله من Google Cloud Console
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600"
              onClick={() => setConnected(!connected)}
            >
              {connected ? "تحديث الاتصال" : "ربط مع Google Sheets"}
            </Button>
            <Button variant="outline" className="flex-1">
              اختبار الاتصال
            </Button>
          </div>
        </CardContent>
      </Card>

      {connected && (
        <>
          <Card className="border-2 border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5 text-accent" />
                البيانات المراد تصديرها
              </CardTitle>
              <CardDescription>اختر البيانات التي تريد مزامنتها</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "الطلبات الجديدة", sheet: "Orders", enabled: true },
                { name: "المنتجات", sheet: "Products", enabled: true },
                { name: "العملاء", sheet: "Customers", enabled: false },
                { name: "المخزون", sheet: "Inventory", enabled: true },
                { name: "الإحصائيات اليومية", sheet: "Analytics", enabled: false },
                { name: "الطلبات الملغاة", sheet: "Cancelled", enabled: false },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">ورقة: {item.sheet}</p>
                  </div>
                  <input type="checkbox" className="w-5 h-5" defaultChecked={item.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-purple-500" />
                  المزامنة
                </div>
                <Button 
                  size="sm" 
                  onClick={handleSync}
                  disabled={syncing}
                  className="bg-gradient-to-r from-primary to-accent"
                >
                  {syncing ? (
                    <>
                      <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                      جاري المزامنة...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 ml-2" />
                      مزامنة الآن
                    </>
                  )}
                </Button>
              </CardTitle>
              <CardDescription>خيارات المزامنة التلقائية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">مزامنة تلقائية</p>
                  <p className="text-sm text-muted-foreground">المزامنة عند إضافة طلب جديد</p>
                </div>
                <input type="checkbox" className="w-5 h-5" defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">مزامنة المنتجات</p>
                  <p className="text-sm text-muted-foreground">تحديث قائمة المنتجات يومياً</p>
                </div>
                <input type="checkbox" className="w-5 h-5" defaultChecked />
              </div>

              <div className="p-4 bg-gradient-to-r from-green-500/10 to-green-500/5 rounded-lg border border-green-500/20">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium text-green-700 dark:text-green-600">آخر مزامنة</p>
                  <span className="text-sm text-muted-foreground">منذ 5 دقائق</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">248</p>
                    <p className="text-xs text-muted-foreground">طلبات</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">86</p>
                    <p className="text-xs text-muted-foreground">منتجات</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">142</p>
                    <p className="text-xs text-muted-foreground">عملاء</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500/20">
            <CardHeader>
              <CardTitle>رابط مباشر للـ Google Sheet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input 
                  value="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                  readOnly
                  className="font-mono text-sm"
                />
                <Button variant="outline">
                  فتح
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
