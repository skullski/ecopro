import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { DarkModeInput } from "@/components/ui/dark-mode-input";
import { DarkModeSelect } from "@/components/ui/dark-mode-select";
import type { StoreSettings } from "@shared/types";

export default function StoreSettings() {
  const { id } = useParams();
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    const stores = JSON.parse(localStorage.getItem('stores') || '[]');
    const storeSettings = stores.find((s: any) => s.id === id);
    if (storeSettings) {
      setSettings({
        ...storeSettings,
        theme: storeSettings.theme || {
          primaryColor: "#000000",
          secondaryColor: "#ffffff",
          accentColor: "#0066cc",
          backgroundColor: "#ffffff",
          textColor: "#000000",
          fontFamily: "Arial"
        },
        layout: storeSettings.layout || {
          columns: 3,
          showCategories: true,
          showFeatured: true,
          showSearch: true
        },
        features: storeSettings.features || {
          reviews: false,
          wishlist: false,
          compare: false,
          quickView: true
        },
        subscription: storeSettings.subscription || {
          level: "free",
          features: [],
          maxProducts: 10
        }
      });
    }
  }, [id]);

  const saveSettings = () => {
    if (!settings) return;
    
    const stores = JSON.parse(localStorage.getItem('stores') || '[]');
    const updatedStores = stores.map((s: any) => 
      s.id === id ? { ...s, ...settings } : s
    );
    localStorage.setItem('stores', JSON.stringify(updatedStores));
    alert('تم حفظ إعدادات المتجر بنجاح');
  };

  if (!settings) {
    return <div>جاري التحميل...</div>;
  }

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-2xl font-bold mb-6">إعدادات المتجر</h1>
      
      <Tabs defaultValue="theme">
        <TabsList className="mb-6">
          <TabsTrigger value="theme">المظهر</TabsTrigger>
          <TabsTrigger value="layout">التخطيط</TabsTrigger>
          <TabsTrigger value="features">المميزات</TabsTrigger>
          <TabsTrigger value="subscription">الاشتراك</TabsTrigger>
        </TabsList>

        <TabsContent value="theme">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">تخصيص المظهر</h2>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">اللون الرئيسي</label>
                <div className="flex gap-2">
                  <DarkModeInput 
                    type="color" 
                    value={settings.theme.primaryColor}
                    onChange={(e) => setSettings({
                      ...settings,
                      theme: { ...settings.theme, primaryColor: e.target.value }
                    })}
                  />
                  <DarkModeInput 
                    type="text" 
                    value={settings.theme.primaryColor}
                    onChange={(e) => setSettings({
                      ...settings,
                      theme: { ...settings.theme, primaryColor: e.target.value }
                    })}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">لون الخلفية</label>
                <div className="flex gap-2">
                  <DarkModeInput 
                    type="color" 
                    value={settings.theme.backgroundColor}
                    onChange={(e) => setSettings({
                      ...settings,
                      theme: { ...settings.theme, backgroundColor: e.target.value }
                    })}
                  />
                  <DarkModeInput 
                    type="text" 
                    value={settings.theme.backgroundColor}
                    onChange={(e) => setSettings({
                      ...settings,
                      theme: { ...settings.theme, backgroundColor: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="layout">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">تخطيط المتجر</h2>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">عدد الأعمدة</label>
                <DarkModeInput 
                  type="number" 
                  min={1} 
                  max={4} 
                  value={settings.layout.columns}
                  onChange={(e) => setSettings({
                    ...settings,
                    layout: { ...settings.layout, columns: parseInt(e.target.value) }
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">عرض التصنيفات</label>
                <Switch 
                  checked={settings.layout.showCategories}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    layout: { ...settings.layout, showCategories: checked }
                  })}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">مميزات المتجر</h2>
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">تقييمات المنتجات</label>
                <Switch 
                  checked={settings.features.reviews}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    features: { ...settings.features, reviews: checked }
                  })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">قائمة الرغبات</label>
                <Switch 
                  checked={settings.features.wishlist}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    features: { ...settings.features, wishlist: checked }
                  })}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">مستوى الاشتراك</h2>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">نوع الاشتراك</label>
                <DarkModeSelect
                  value={settings.subscription.level}
                  onChange={(e) => setSettings({
                    ...settings,
                    subscription: { 
                      ...settings.subscription, 
                      level: e.target.value as 'free' | 'pro' | 'enterprise',
                      maxProducts: e.target.value === 'free' ? 10 : e.target.value === 'pro' ? 100 : 1000
                    }
                  })}
                >
                  <option value="free">مجاني (10 منتجات)</option>
                  <option value="pro">محترف (100 منتج)</option>
                  <option value="enterprise">مؤسسات (غير محدود)</option>
                </DarkModeSelect>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">
                  الحد الأقصى للمنتجات: {settings.subscription.maxProducts}
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <Button onClick={saveSettings}>
          حفظ التغييرات
        </Button>
      </div>
    </div>
  );
}