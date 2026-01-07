import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { getAlgeriaWilayas, AlgeriaWilaya, formatWilayaLabel } from "@/lib/algeriaGeo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Loader2, Save, Truck, MapPin, Search, Check, X, 
  DollarSign, Clock, RefreshCw, Upload, Download 
} from "lucide-react";

interface DeliveryPrice {
  id?: number;
  wilaya_id: number;
  wilaya_name?: string;
  delivery_company_id: number | null;
  home_delivery_price: number;
  desk_delivery_price: number | null;
  is_active: boolean;
  estimated_days: number;
  notes: string | null;
}

// Algeria wilayas with their codes
const WILAYAS = getAlgeriaWilayas();

export default function DeliveryPricing() {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [prices, setPrices] = useState<Record<number, DeliveryPrice>>({});
  const [defaultPrice, setDefaultPrice] = useState(500);
  const [defaultDeskPrice, setDefaultDeskPrice] = useState<number | null>(400);
  const [defaultDays, setDefaultDays] = useState(3);

  // Initialize prices with defaults for all wilayas
  useEffect(() => {
    loadPrices();
  }, []);

  const loadPrices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/delivery-prices');
      if (res.ok) {
        const data = await res.json();
        const pricesMap: Record<number, DeliveryPrice> = {};
        
        // Initialize all wilayas with defaults
        WILAYAS.forEach(w => {
          pricesMap[w.id] = {
            wilaya_id: w.id,
            wilaya_name: w.name,
            delivery_company_id: null,
            home_delivery_price: defaultPrice,
            desk_delivery_price: defaultDeskPrice,
            is_active: true,
            estimated_days: defaultDays,
            notes: null
          };
        });
        
        // Override with saved prices
        data.prices?.forEach((p: DeliveryPrice) => {
          pricesMap[p.wilaya_id] = { ...pricesMap[p.wilaya_id], ...p };
        });
        
        setPrices(pricesMap);
      }
    } catch (error) {
      console.error('Failed to load delivery prices:', error);
      toast({
        title: t('error') || "Error",
        description: t('delivery.loadError') || "Failed to load delivery prices",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePrice = (wilayaId: number, field: keyof DeliveryPrice, value: any) => {
    setPrices(prev => ({
      ...prev,
      [wilayaId]: { ...prev[wilayaId], [field]: value }
    }));
  };

  const applyDefaultToAll = () => {
    const updated: Record<number, DeliveryPrice> = {};
    WILAYAS.forEach(w => {
      updated[w.id] = {
        ...prices[w.id],
        home_delivery_price: defaultPrice,
        desk_delivery_price: defaultDeskPrice,
        estimated_days: defaultDays
      };
    });
    setPrices(updated);
    toast({
      title: t('success') || "Success",
      description: t('delivery.defaultApplied') || "Default prices applied to all wilayas"
    });
  };

  const saveAllPrices = async () => {
    setSaving(true);
    try {
      const pricesToSave = Object.values(prices).map(p => ({
        wilaya_id: p.wilaya_id,
        home_delivery_price: p.home_delivery_price,
        desk_delivery_price: p.desk_delivery_price,
        is_active: p.is_active,
        estimated_days: p.estimated_days,
        notes: p.notes
      }));

      const res = await fetch('/api/delivery-prices/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prices: pricesToSave })
      });

      if (res.ok) {
        toast({
          title: t('success') || "Success",
          description: t('delivery.pricesSaved') || "Delivery prices saved successfully"
        });
        loadPrices(); // Reload to get IDs
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Failed to save delivery prices:', error);
      toast({
        title: t('error') || "Error",
        description: t('delivery.saveError') || "Failed to save delivery prices",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Filter wilayas by search
  const filteredWilayas = useMemo(() => {
    if (!searchQuery.trim()) return WILAYAS;
    const q = searchQuery.toLowerCase();
    return WILAYAS.filter(w => 
      w.name.toLowerCase().includes(q) || 
      w.code.toString().includes(q) ||
      w.arabic_name?.includes(searchQuery)
    );
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">{t('loading') || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50 dark:from-black dark:via-slate-900 dark:to-black p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <Truck className="h-7 w-7 text-emerald-500" />
                {t('delivery.pricingTitle') || 'Delivery Pricing'}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t('delivery.pricingDesc') || 'Set delivery prices for each wilaya. Customers will see these prices at checkout.'}
              </p>
            </div>
            <Button
              onClick={saveAllPrices}
              disabled={saving}
              className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {t('save') || 'Save All'}
            </Button>
          </div>
        </div>

        {/* Default Price Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-lg mb-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-500" />
            {t('delivery.defaultSettings') || 'Default Settings'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('delivery.homePrice') || 'Home Delivery (DZD)'}</Label>
              <Input
                type="number"
                min={0}
                value={defaultPrice}
                onChange={(e) => setDefaultPrice(Number(e.target.value) || 0)}
                className="bg-slate-50 dark:bg-slate-700"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('delivery.deskPrice') || 'Stop-Desk (DZD)'}</Label>
              <Input
                type="number"
                min={0}
                value={defaultDeskPrice ?? ''}
                onChange={(e) => setDefaultDeskPrice(e.target.value ? Number(e.target.value) : null)}
                placeholder="Optional"
                className="bg-slate-50 dark:bg-slate-700"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t('delivery.estimatedDays') || 'Estimated Days'}</Label>
              <Input
                type="number"
                min={1}
                max={30}
                value={defaultDays}
                onChange={(e) => setDefaultDays(Number(e.target.value) || 3)}
                className="bg-slate-50 dark:bg-slate-700"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={applyDefaultToAll}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('delivery.applyToAll') || 'Apply to All'}
              </Button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder={t('delivery.searchWilaya') || "Search wilaya..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-slate-800"
            />
          </div>
        </div>

        {/* Prices Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 p-3 bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
            <div className="col-span-1">#</div>
            <div className="col-span-3">{t('delivery.wilaya') || 'Wilaya'}</div>
            <div className="col-span-2 text-center">{t('delivery.homePrice') || 'Home (DZD)'}</div>
            <div className="col-span-2 text-center">{t('delivery.deskPrice') || 'Desk (DZD)'}</div>
            <div className="col-span-2 text-center">{t('delivery.days') || 'Days'}</div>
            <div className="col-span-2 text-center">{t('delivery.active') || 'Active'}</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-slate-200 dark:divide-slate-700 max-h-[60vh] overflow-y-auto">
            {filteredWilayas.map((wilaya) => {
              const price = prices[wilaya.id] || {
                wilaya_id: wilaya.id,
                home_delivery_price: defaultPrice,
                desk_delivery_price: defaultDeskPrice,
                is_active: true,
                estimated_days: defaultDays
              };
              
              return (
                <div 
                  key={wilaya.id} 
                  className={`grid grid-cols-12 gap-2 p-3 items-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                    !price.is_active ? 'opacity-50 bg-slate-100/50 dark:bg-slate-800/50' : ''
                  }`}
                >
                  <div className="col-span-1 text-sm font-mono text-slate-500">
                    {String(wilaya.code).padStart(2, '0')}
                  </div>
                  <div className="col-span-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">{wilaya.name}</div>
                        {wilaya.arabic_name && (
                          <div className="text-xs text-slate-500 dark:text-slate-400">{wilaya.arabic_name}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min={0}
                      value={price.home_delivery_price}
                      onChange={(e) => updatePrice(wilaya.id, 'home_delivery_price', Number(e.target.value) || 0)}
                      className="h-8 text-sm text-center bg-slate-50 dark:bg-slate-700"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min={0}
                      value={price.desk_delivery_price ?? ''}
                      onChange={(e) => updatePrice(wilaya.id, 'desk_delivery_price', e.target.value ? Number(e.target.value) : null)}
                      placeholder="-"
                      className="h-8 text-sm text-center bg-slate-50 dark:bg-slate-700"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min={1}
                      max={30}
                      value={price.estimated_days}
                      onChange={(e) => updatePrice(wilaya.id, 'estimated_days', Number(e.target.value) || 3)}
                      className="h-8 text-sm text-center bg-slate-50 dark:bg-slate-700"
                    />
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <Switch
                      checked={price.is_active}
                      onCheckedChange={(checked) => updatePrice(wilaya.id, 'is_active', checked)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <div>
            {t('delivery.activeWilayas') || 'Active wilayas'}: {' '}
            <span className="font-semibold text-emerald-600">
              {Object.values(prices).filter(p => p.is_active).length}
            </span> / {WILAYAS.length}
          </div>
          <Button
            onClick={saveAllPrices}
            disabled={saving}
            size="lg"
            className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {t('delivery.saveAllPrices') || 'Save All Prices'}
          </Button>
        </div>
      </div>
    </div>
  );
}
