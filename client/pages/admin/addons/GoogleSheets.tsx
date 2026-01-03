import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileSpreadsheet, Key, RefreshCw, Download, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "@/lib/i18n";

export default function GoogleSheetsIntegration() {
  const { t } = useTranslation();
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
          {t('admin.addons.sheets.title')}
        </h1>
        <p className="text-muted-foreground mt-2">{t('admin.addons.sheets.subtitle')}</p>
      </div>

      <Card className="border-2 border-green-500/20 bg-green-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-green-600" />
            {t('admin.addons.sheets.about')}
          </CardTitle>
          <CardDescription>{t('admin.addons.sheets.whatYouCanDo')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm font-medium mb-1">📊 {t('admin.addons.sheets.exportOrders')}</p>
            <p className="text-sm text-muted-foreground">{t('admin.addons.sheets.exportOrdersDesc')}</p>
          </div>
          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <p className="text-sm font-medium mb-1">📦 {t('admin.addons.sheets.exportProducts')}</p>
            <p className="text-sm text-muted-foreground">{t('admin.addons.sheets.exportProductsDesc')}</p>
          </div>
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm font-medium mb-1">👥 {t('admin.addons.sheets.customerList')}</p>
            <p className="text-sm text-muted-foreground">{t('admin.addons.sheets.customerListDesc')}</p>
          </div>
          <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <p className="text-sm font-medium mb-1">📈 {t('admin.addons.sheets.dailyStats')}</p>
            <p className="text-sm text-muted-foreground">{t('admin.addons.sheets.dailyStatsDesc')}</p>
          </div>
        </CardContent>
      </Card>

      <Card className={`border-2 ${connected ? 'border-green-500/40 bg-green-500/5' : 'border-primary/20'}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              {t('admin.addons.sheets.connectionSettings')}
            </div>
            {connected && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                {t('admin.addons.sheets.connected')}
              </div>
            )}
          </CardTitle>
          <CardDescription>{t('admin.addons.sheets.connectAccount')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-700 dark:text-yellow-600 mb-1">{t('admin.addons.sheets.howToGetCredentials')}</p>
              <ol className="text-muted-foreground space-y-1 list-decimal list-inside">
                <li>{t('admin.addons.sheets.step1')}</li>
                <li>{t('admin.addons.sheets.step2')}</li>
                <li>{t('admin.addons.sheets.step3')}</li>
                <li>{t('admin.addons.sheets.step4')}</li>
                <li>{t('admin.addons.sheets.step5')}</li>
              </ol>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">{t('admin.addons.sheets.spreadsheetId')}</label>
            <Input 
              placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
              defaultValue={connected ? "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms" : ""}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t('admin.addons.sheets.spreadsheetIdHelp')}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">{t('admin.addons.sheets.serviceAccountEmail')}</label>
            <Input 
              type="email"
              placeholder="your-service-account@project-id.iam.gserviceaccount.com"
              defaultValue={connected ? "sheets-sync@ecopro-123.iam.gserviceaccount.com" : ""}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">{t('admin.addons.sheets.privateKey')}</label>
            <textarea
              className="w-full min-h-[120px] px-3 py-2 border rounded-lg font-mono text-xs bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder='{"type": "service_account", "project_id": "...", "private_key": "..."}'
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t('admin.addons.sheets.privateKeyHelp')}
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600"
              onClick={() => setConnected(!connected)}
            >
              {connected ? t('admin.addons.sheets.updateConnection') : t('admin.addons.sheets.connect')}
            </Button>
            <Button variant="outline" className="flex-1">
              {t('admin.addons.sheets.testConnection')}
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
                {t('admin.addons.sheets.dataToExport')}
              </CardTitle>
              <CardDescription>{t('admin.addons.sheets.sync')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "New Orders", sheet: "Orders", enabled: true },
                { name: "Products", sheet: "Products", enabled: true },
                { name: "Customers", sheet: "Customers", enabled: false },
                { name: "Inventory", sheet: "Inventory", enabled: true },
                { name: "Daily Statistics", sheet: "Analytics", enabled: false },
                { name: "Cancelled Orders", sheet: "Cancelled", enabled: false },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Sheet: {item.sheet}</p>
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
                  {t('admin.addons.sheets.sync')}
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
                      {t('admin.addons.sheets.syncing')}
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 ml-2" />
                      {t('admin.addons.sheets.syncNow')}
                    </>
                  )}
                </Button>
              </CardTitle>
              <CardDescription>{t('admin.addons.sheets.autoSyncOptions')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">{t('admin.addons.sheets.autoSync')}</p>
                  <p className="text-sm text-muted-foreground">{t('admin.addons.sheets.autoSyncDesc')}</p>
                </div>
                <input type="checkbox" className="w-5 h-5" defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">{t('admin.addons.sheets.productSync')}</p>
                  <p className="text-sm text-muted-foreground">{t('admin.addons.sheets.productSyncDesc')}</p>
                </div>
                <input type="checkbox" className="w-5 h-5" defaultChecked />
              </div>

              <div className="p-4 bg-gradient-to-r from-green-500/10 to-green-500/5 rounded-lg border border-green-500/20">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium text-green-700 dark:text-green-600">{t('admin.addons.sheets.lastSync')}</p>
                  <span className="text-sm text-muted-foreground">{t('admin.addons.sheets.fiveMinutesAgo')}</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">248</p>
                    <p className="text-xs text-muted-foreground">{t('admin.addons.sheets.orders')}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">86</p>
                    <p className="text-xs text-muted-foreground">{t('admin.addons.sheets.products')}</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">142</p>
                    <p className="text-xs text-muted-foreground">{t('admin.addons.sheets.customers')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500/20">
            <CardHeader>
              <CardTitle>{t('admin.addons.sheets.directLink')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input 
                  value="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                  readOnly
                  className="font-mono text-sm"
                />
                <Button variant="outline">
                  {t('admin.addons.sheets.open')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
