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
            <p className="text-sm font-medium mb-1">📊 Export Orders Automatically</p>
            <p className="text-sm text-muted-foreground">All new orders are automatically added to Google Sheet</p>
          </div>
          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <p className="text-sm font-medium mb-1">📦 Export Products</p>
            <p className="text-sm text-muted-foreground">Product list with prices and stock</p>
          </div>
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm font-medium mb-1">👥 Customer List</p>
            <p className="text-sm text-muted-foreground">Customer info, phone and address</p>
          </div>
          <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <p className="text-sm font-medium mb-1">📈 Daily Statistics</p>
            <p className="text-sm text-muted-foreground">Sales, profits, order count</p>
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
              <p className="font-medium text-yellow-700 dark:text-yellow-600 mb-1">How to get API Credentials</p>
              <ol className="text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Go to <a href="https://console.cloud.google.com" target="_blank" className="text-primary underline">Google Cloud Console</a></li>
                <li>Create a new project or select an existing one</li>
                <li>Enable Google Sheets API</li>
                <li>Create a Service Account and download the JSON file</li>
                <li>Share Google Sheet with the Service Account email</li>
              </ol>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Google Sheet ID (Spreadsheet ID)</label>
            <Input 
              placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
              defaultValue={connected ? "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms" : ""}
            />
            <p className="text-xs text-muted-foreground mt-1">
              You can find it in the Google Sheet URL: docs.google.com/spreadsheets/d/<span className="text-primary font-mono">SPREADSHEET_ID</span>/edit
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
              Copy the contents of the JSON file you downloaded from Google Cloud Console
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
                  Sync
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
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 ml-2" />
                      Sync Now
                    </>
                  )}
                </Button>
              </CardTitle>
              <CardDescription>Auto-sync options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Auto Sync</p>
                  <p className="text-sm text-muted-foreground">Sync when a new order is added</p>
                </div>
                <input type="checkbox" className="w-5 h-5" defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Product Sync</p>
                  <p className="text-sm text-muted-foreground">Update product list daily</p>
                </div>
                <input type="checkbox" className="w-5 h-5" defaultChecked />
              </div>

              <div className="p-4 bg-gradient-to-r from-green-500/10 to-green-500/5 rounded-lg border border-green-500/20">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium text-green-700 dark:text-green-600">Last Sync</p>
                  <span className="text-sm text-muted-foreground">5 minutes ago</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">248</p>
                    <p className="text-xs text-muted-foreground">Orders</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">86</p>
                    <p className="text-xs text-muted-foreground">products</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">142</p>
                    <p className="text-xs text-muted-foreground">customers</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500/20">
            <CardHeader>
              <CardTitle>Direct Link to Google Sheet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input 
                  value="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                  readOnly
                  className="font-mono text-sm"
                />
                <Button variant="outline">
                  Open
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
