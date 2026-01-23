import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Facebook, 
  TrendingUp, 
  ShoppingCart, 
  CreditCard, 
  Eye, 
  MousePointer,
  BarChart3,
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  Activity,
  DollarSign,
  Users,
  Target,
  Plus,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from '@/lib/i18n';
// Local type defs for pixel statistics
type PixelType = 'facebook' | 'tiktok' | string;

interface PixelConfig {
  pixel_type?: string;
  facebook_pixel_id?: string | null;
  tiktok_pixel_id?: string | null;
  is_facebook_enabled?: boolean;
  is_tiktok_enabled?: boolean;
  enabled?: boolean;
}

interface PixelSettings {
  pixels?: PixelConfig[];
  is_facebook_enabled?: boolean;
  is_tiktok_enabled?: boolean;
  facebook_pixel_id?: string | null;
  tiktok_pixel_id?: string | null;
}

interface FunnelStep { stage: string; count: number; rate: number }
interface FunnelData { funnel: FunnelStep[]; total_revenue?: number; avg_order_value?: number; period_days?: number }

interface PixelStats { summary?: Record<string, any>; facebook?: Record<string, any>; tiktok?: Record<string, any> }

interface RecentEvent { id: string | number; pixel_type: string; event_name: string; page_url?: string; revenue?: number; created_at: string }
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import TikTokIcon from '@/components/icons/TikTokIcon';

// Multi-pixel item type
interface PixelItem {
  id: string;
  type: 'facebook' | 'tiktok';
  pixel_id: string;
  access_token?: string;
  enabled: boolean;
  name?: string;
}

export default function PixelStatistics() {
  const { t, locale } = useTranslation();
  const isRTL = locale === 'ar';
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDays, setSelectedDays] = useState('30');
  const [activeTab, setActiveTab] = useState('overview');
  const [settingsForm, setSettingsForm] = useState<PixelConfig[]>([]);
  const [settingsObj, setSettingsObj] = useState<PixelSettings>({});
  
  // Multi-pixel state
  const [pixels, setPixels] = useState<PixelItem[]>([]);
  const [newPixel, setNewPixel] = useState<Partial<PixelItem>>({
    type: 'facebook',
    pixel_id: '',
    access_token: '',
    enabled: true,
    name: ''
  });

  // Fetch pixel settings
  const { data: settings, isLoading: settingsLoading } = useQuery<PixelSettings>({
    queryKey: ['pixel-settings'],
    queryFn: async () => {
      const res = await fetch('/api/pixels/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      return res.json();
    }
  });

  // Fetch pixel stats
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<PixelStats>({
    queryKey: ['pixel-stats', selectedDays],
    queryFn: async () => {
      const res = await fetch(`/api/pixels/stats?days=${selectedDays}`);
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    }
  });

  // Fetch funnel data
  const { data: facebookFunnel } = useQuery<FunnelData>({
    queryKey: ['pixel-funnel', 'facebook', selectedDays],
    queryFn: async () => {
      const res = await fetch(`/api/pixels/funnel?pixel_type=facebook&days=${selectedDays}`);
      if (!res.ok) throw new Error('Failed to fetch funnel');
      return res.json();
    }
  });

  const { data: tiktokFunnel } = useQuery<FunnelData>({
    queryKey: ['pixel-funnel', 'tiktok', selectedDays],
    queryFn: async () => {
      const res = await fetch(`/api/pixels/funnel?pixel_type=tiktok&days=${selectedDays}`);
      if (!res.ok) throw new Error('Failed to fetch funnel');
      return res.json();
    }
  });

  // Fetch recent events
  const { data: recentEvents } = useQuery<{ events: RecentEvent[]; count: number }>({
    queryKey: ['pixel-events'],
    queryFn: async () => {
      const res = await fetch('/api/pixels/events?limit=50');
      if (!res.ok) throw new Error('Failed to fetch events');
      return res.json();
    }
  });

  // Update settings mutation
  const updateSettings = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/pixels/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to update settings');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pixel-settings'] });
      toast({ title: 'Settings saved', description: 'Your pixel settings have been updated.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to save settings.', variant: 'destructive' });
    }
  });

  // Initialize form when settings load
  useEffect(() => {
    if (settings) {
      if (settings.pixels) setSettingsForm(settings.pixels);
      setSettingsObj(settings);
      
      // Initialize multi-pixel list from settings
      const loadedPixels: PixelItem[] = [];
      if (settings.facebook_pixel_id) {
        loadedPixels.push({
          id: 'fb-main',
          type: 'facebook',
          pixel_id: settings.facebook_pixel_id,
          access_token: (settings as any).facebook_access_token || '',
          enabled: settings.is_facebook_enabled || false,
          name: t('pixels.mainFacebookPixel')
        });
      }
      if (settings.tiktok_pixel_id) {
        loadedPixels.push({
          id: 'tt-main',
          type: 'tiktok',
          pixel_id: settings.tiktok_pixel_id,
          access_token: (settings as any).tiktok_access_token || '',
          enabled: settings.is_tiktok_enabled || false,
          name: t('pixels.mainTiktokPixel')
        });
      }
      // Load additional pixels if stored
      if ((settings as any).additional_pixels) {
        loadedPixels.push(...(settings as any).additional_pixels);
      }
      setPixels(loadedPixels);
    }
  }, [settings]);

  // Add new pixel
  const handleAddPixel = () => {
    if (!newPixel.pixel_id?.trim()) {
      toast({ title: t('common.error'), description: t('pixels.enterPixelId'), variant: 'destructive' });
      return;
    }
    
    const pixel: PixelItem = {
      id: `${newPixel.type}-${Date.now()}`,
      type: newPixel.type || 'facebook',
      pixel_id: newPixel.pixel_id.trim(),
      access_token: newPixel.access_token?.trim() || '',
      enabled: true,
      name: newPixel.name?.trim() || `${newPixel.type === 'facebook' ? 'Facebook' : 'TikTok'} Pixel ${pixels.filter(p => p.type === newPixel.type).length + 1}`
    };
    
    setPixels(prev => [...prev, pixel]);
    setNewPixel({ type: 'facebook', pixel_id: '', access_token: '', enabled: true, name: '' });
    toast({ title: t('common.success'), description: t('pixels.pixelAdded') });
  };

  // Remove pixel
  const handleRemovePixel = (id: string) => {
    setPixels(prev => prev.filter(p => p.id !== id));
    toast({ title: t('common.success'), description: t('pixels.pixelRemoved') });
  };

  // Toggle pixel enabled
  const handleTogglePixel = (id: string, enabled: boolean) => {
    setPixels(prev => prev.map(p => p.id === id ? { ...p, enabled } : p));
  };

  const formatNumber = (num: number | string | undefined) => {
    if (num === undefined || num === null) return '0';
    return Number(num).toLocaleString();
  };

  const formatCurrency = (amount: number | string | undefined) => {
    if (amount === undefined || amount === null) return '0 DZD';
    return `${Number(amount).toLocaleString()} DZD`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventColor = (eventName: string) => {
    const colors: Record<string, string> = {
      'PageView': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      'ViewContent': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
      'AddToCart': 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
      'InitiateCheckout': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
      'Purchase': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
    };
    return colors[eventName] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };

  // Stats cards for a platform
  const StatsCards = ({ platform, data }: { platform: PixelType; data: any }) => {
    let Icon: any = BarChart3;
    if (platform === 'facebook') Icon = Facebook;
    else if (platform === 'tiktok') Icon = TikTokIcon;
    // else keep BarChart3 for custom/unknown
    
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
        <Card>
          <CardContent className="p-2.5 md:p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Eye className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{t('pixels.pageViews')}</span>
            </div>
            <p className="text-lg md:text-xl font-bold">{formatNumber(data?.total_page_views)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-2.5 md:p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <MousePointer className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{t('pixels.viewContent')}</span>
            </div>
            <p className="text-lg md:text-xl font-bold">{formatNumber(data?.total_view_content)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-2.5 md:p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <ShoppingCart className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{t('pixels.addToCart')}</span>
            </div>
            <p className="text-lg md:text-xl font-bold">{formatNumber(data?.total_add_to_cart)}</p>
            <p className="text-xs text-muted-foreground">{t('pixels.cartRate')}: {data?.cart_rate || 0}%</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-2.5 md:p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{t('pixels.purchases')}</span>
            </div>
            <p className="text-lg md:text-xl font-bold">{formatNumber(data?.total_purchases)}</p>
            <p className="text-xs text-muted-foreground">{t('pixels.conversionRate')}: {data?.conversion_rate || 0}%</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  const PlatformExplanation = () => (
    <Card className="border-dashed">
      <CardContent className="p-3 md:p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 text-muted-foreground" />
          <div className="text-sm text-muted-foreground leading-relaxed">
            <div className="font-semibold text-foreground">{t('pixels.important')}</div>
            <div>
              {t('pixels.platformExplanation')}
            </div>
            <div className="mt-2">
              {t('pixels.pageViewNote')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Funnel visualization
  const FunnelChart = ({ data, platform }: { data: FunnelData | undefined; platform: string }) => {
    if (!data) return null;
    
    const maxCount = Math.max(...data.funnel.map(f => f.count));
    const colors = platform === 'facebook' 
      ? ['bg-blue-500', 'bg-blue-400', 'bg-blue-300', 'bg-blue-200', 'bg-green-500']
      : ['bg-pink-500', 'bg-pink-400', 'bg-pink-300', 'bg-pink-200', 'bg-green-500'];
    
    return (
      <Card>
        <CardHeader className="p-3 md:p-4">
          <CardTitle className="flex items-center gap-2 text-sm md:text-base">
            <Target className="h-4 w-4" />
            {t('pixels.conversionFunnel')}
          </CardTitle>
          <CardDescription className="text-xs">
            {platform === 'facebook' ? t('pixels.facebookPixel') : t('pixels.tiktokPixel')} - {t('pixels.last')} {data.period_days} {t('pixels.days')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 md:p-4 pt-0">
          <div className="space-y-2">
            {data.funnel.map((step, idx) => (
              <div key={step.stage} className="space-y-0.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">{step.stage}</span>
                  <span className="text-muted-foreground">
                    {formatNumber(step.count)} ({step.rate}%)
                  </span>
                </div>
                <div className="h-5 md:h-6 bg-muted rounded-md overflow-hidden">
                  <div 
                    className={`h-full ${colors[idx]} transition-all duration-500`}
                    style={{ width: maxCount > 0 ? `${(step.count / maxCount) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">{t('pixels.totalRevenue')}</p>
              <p className="text-base md:text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(data.total_revenue)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('pixels.avgOrderValue')}</p>
              <p className="text-base md:text-lg font-bold">{formatCurrency(data.avg_order_value)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-2 md:p-4 space-y-3 md:space-y-4 max-w-6xl" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-3">
        <div>
          <h1 className="text-lg md:text-xl lg:text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />
            {t('pixels.title')}
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm mt-0.5">
            {t('pixels.description')}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedDays} onValueChange={setSelectedDays}>
            <SelectTrigger className="w-32 h-8 text-xs">
              <SelectValue placeholder={t('pixels.period')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">{t('pixels.last7Days')}</SelectItem>
              <SelectItem value="14">{t('pixels.last14Days')}</SelectItem>
              <SelectItem value="30">{t('pixels.last30Days')}</SelectItem>
              <SelectItem value="60">{t('pixels.last60Days')}</SelectItem>
              <SelectItem value="90">{t('pixels.last90Days')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => refetchStats()}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Pixel Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className={settings?.is_facebook_enabled ? 'border-blue-500/30 bg-blue-500/10 dark:bg-blue-900/20' : ''}>
          <CardContent className="p-2.5 md:p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <Facebook className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-xs md:text-sm">{t('pixels.facebookPixel')}</h3>
                  <p className="text-xs text-muted-foreground truncate max-w-[120px] md:max-w-none">
                    {pixels.filter(p => p.type === 'facebook').length > 0 
                      ? `${pixels.filter(p => p.type === 'facebook').length} ${t('pixels.pixelsConfigured')}`
                      : t('pixels.notConfigured')}
                  </p>
                </div>
              </div>
              {pixels.filter(p => p.type === 'facebook' && p.enabled).length > 0 ? (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" /> {t('pixels.active')}
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  <XCircle className="h-3 w-3 mr-1" /> {t('pixels.inactive')}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className={settings?.is_tiktok_enabled ? 'border-pink-500/30 bg-pink-500/10 dark:bg-pink-900/20' : ''}>
          <CardContent className="p-2.5 md:p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-pink-100 dark:bg-pink-900/50 rounded-lg">
                  <TikTokIcon className="h-4 w-4 md:h-5 md:w-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-xs md:text-sm">{t('pixels.tiktokPixel')}</h3>
                  <p className="text-xs text-muted-foreground truncate max-w-[120px] md:max-w-none">
                    {pixels.filter(p => p.type === 'tiktok').length > 0 
                      ? `${pixels.filter(p => p.type === 'tiktok').length} ${t('pixels.pixelsConfigured')}`
                      : t('pixels.notConfigured')}
                  </p>
                </div>
              </div>
              {pixels.filter(p => p.type === 'tiktok' && p.enabled).length > 0 ? (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" /> {t('pixels.active')}
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  <XCircle className="h-3 w-3 mr-1" /> {t('pixels.inactive')}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
          <TabsTrigger value="overview" className="text-xs py-1.5">{t('pixels.overviewTab')}</TabsTrigger>
          <TabsTrigger value="facebook" className="text-xs py-1.5">{t('pixels.facebookTab')}</TabsTrigger>
          <TabsTrigger value="tiktok" className="text-xs py-1.5">{t('pixels.tiktokTab')}</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs py-1.5">{t('pixels.settingsTab')}</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-3 md:space-y-4">
          <PlatformExplanation />
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
            <Card>
              <CardContent className="p-2.5 md:p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Eye className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-xs text-muted-foreground">{t('pixels.totalPageViews')}</span>
                </div>
                <p className="text-lg md:text-xl font-bold">
                  {formatNumber((stats?.facebook?.total_page_views || 0) + (stats?.tiktok?.total_page_views || 0))}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-2.5 md:p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <ShoppingCart className="h-3.5 w-3.5 text-orange-500" />
                  <span className="text-xs text-muted-foreground">{t('pixels.totalAddToCart')}</span>
                </div>
                <p className="text-lg md:text-xl font-bold">
                  {formatNumber((stats?.facebook?.total_add_to_cart || 0) + (stats?.tiktok?.total_add_to_cart || 0))}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-2.5 md:p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <CreditCard className="h-3.5 w-3.5 text-green-500" />
                  <span className="text-xs text-muted-foreground">{t('pixels.totalPurchases')}</span>
                </div>
                <p className="text-lg md:text-xl font-bold">
                  {formatNumber((stats?.facebook?.total_purchases || 0) + (stats?.tiktok?.total_purchases || 0))}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-2.5 md:p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <DollarSign className="h-3.5 w-3.5 text-green-500" />
                  <span className="text-xs text-muted-foreground">{t('pixels.totalRevenue')}</span>
                </div>
                <p className="text-lg md:text-xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency((Number(stats?.facebook?.total_revenue) || 0) + (Number(stats?.tiktok?.total_revenue) || 0))}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Events */}
          <Card>
            <CardHeader className="p-3 md:p-4">
              <CardTitle className="flex items-center gap-2 text-sm md:text-base">
                <Activity className="h-4 w-4" />
                {t('pixels.recentEvents')}
              </CardTitle>
              <CardDescription className="text-xs">
                {t('pixels.latestEvents')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              {recentEvents?.events && recentEvents.events.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('pixels.platform')}</TableHead>
                      <TableHead>{t('pixels.event')}</TableHead>
                      <TableHead>{t('pixels.page')}</TableHead>
                      <TableHead className="text-xs">{t('pixels.revenue')}</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">{t('pixels.time')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentEvents.events.slice(0, 10).map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="p-2 md:p-4">
                          {event.pixel_type === 'facebook' ? (
                            <Facebook className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <TikTokIcon className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                          )}
                        </TableCell>
                        <TableCell className="p-2 md:p-4">
                          <Badge className={getEventColor(event.event_name) + " text-xs"}>
                            {event.event_name}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[100px] md:max-w-[200px] truncate text-xs md:text-sm text-muted-foreground p-2 md:p-4">
                          {event.page_url?.replace(/^https?:\/\/[^/]+/, '') || '-'}
                        </TableCell>
                        <TableCell className="p-2 md:p-4 text-xs md:text-sm">
                          {event.revenue ? formatCurrency(event.revenue) : '-'}
                        </TableCell>
                        <TableCell className="text-xs md:text-sm text-muted-foreground hidden md:table-cell">
                          {formatDate(event.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>{t('pixels.noEvents')}</p>
                  <p className="text-sm mt-1">{t('pixels.eventsWillAppear')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dynamic Pixel Tabs */}
        {settingsForm.map((pixel, idx) => (
          <TabsContent key={pixel.pixel_type + idx} value={pixel.pixel_type} className="space-y-4 md:space-y-6">
            {pixel.enabled ? (
              <>
                <StatsCards platform={pixel.pixel_type} data={stats?.summary?.[pixel.pixel_type]} />
                {/* FunnelChart can be extended for each pixel type if API supports */}
              </>
            ) : (
              <Card>
                <CardContent className="p-6 md:p-8 text-center">
                  <BarChart3 className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg md:text-xl font-semibold mb-2">
                    {pixel.pixel_type === 'facebook' ? t('pixels.facebookPixel') : t('pixels.tiktokPixel')} - {t('pixels.pixelNotConfigured')}
                  </h3>
                  <p className="text-muted-foreground text-sm md:text-base mb-4">
                    {t('pixels.addPixelIdToStart')}
                  </p>
                  <Button onClick={() => setActiveTab('settings')}>
                    <Settings className="h-4 w-4 mr-2" />
                    {t('pixels.configurePixel')}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Facebook Settings */}
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Facebook className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
                  {t('pixels.facebookPixel')}
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  {t('pixels.facebookSettingsDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-4 md:p-6 pt-0 md:pt-0">
                <div>
                  <Label htmlFor="fb-pixel-id" className="text-sm">{t('pixels.pixelId')}</Label>
                  <Input
                    id="fb-pixel-id"
                    placeholder={t('pixels.enterPixelId')}
                    value={settingsObj.facebook_pixel_id || ''}
                    onChange={(e) => setSettingsObj(prev => ({ ...prev, facebook_pixel_id: e.target.value }))}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('pixels.findInFacebookManager')}
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="fb-access-token" className="text-sm">{t('pixels.accessToken')}</Label>
                  <Input
                    id="fb-access-token"
                    type="password"
                    placeholder={t('pixels.forServerSideTracking')}
                    value={(settingsObj as any).facebook_access_token || ''}
                    onChange={(e) => setSettingsObj(prev => ({ ...prev, facebook_access_token: e.target.value }))}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('pixels.requiredForConversionsApi')}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <Label htmlFor="fb-enabled" className="text-sm">{t('pixels.enableFacebookPixel')}</Label>
                  <Switch
                    id="fb-enabled"
                    checked={settingsObj.is_facebook_enabled || false}
                    onCheckedChange={(checked) => setSettingsObj(prev => ({ ...prev, is_facebook_enabled: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* TikTok Settings */}
            <Card>
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <TikTokIcon className="h-4 w-4 md:h-5 md:w-5 text-pink-600 dark:text-pink-400" />
                  {t('pixels.tiktokPixel')}
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  {t('pixels.tiktokSettingsDesc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-4 md:p-6 pt-0 md:pt-0">
                <div>
                  <Label htmlFor="tt-pixel-id" className="text-sm">{t('pixels.pixelId')}</Label>
                  <Input
                    id="tt-pixel-id"
                    placeholder={t('pixels.enterPixelId')}
                    value={settingsObj.tiktok_pixel_id || ''}
                    onChange={(e) => setSettingsObj(prev => ({ ...prev, tiktok_pixel_id: e.target.value }))}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('pixels.findInTiktokManager')}
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="tt-access-token" className="text-sm">{t('pixels.accessToken')}</Label>
                  <Input
                    id="tt-access-token"
                    type="password"
                    placeholder={t('pixels.forServerSideTracking')}
                    value={(settingsObj as any).tiktok_access_token || ''}
                    onChange={(e) => setSettingsObj(prev => ({ ...prev, tiktok_access_token: e.target.value }))}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('pixels.requiredForEventsApi')}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <Label htmlFor="tt-enabled" className="text-sm">{t('pixels.enableTiktokPixel')}</Label>
                  <Switch
                    id="tt-enabled"
                    checked={settingsObj.is_tiktok_enabled || false}
                    onCheckedChange={(checked) => setSettingsObj(prev => ({ ...prev, is_tiktok_enabled: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Multi-Pixel Management Section */}
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Plus className="h-4 w-4 md:h-5 md:w-5" />
                {t('pixels.addNewPixel')}
              </CardTitle>
              <CardDescription className="text-xs md:text-sm">
                {t('pixels.addFirstPixel')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="flex flex-col md:flex-row gap-3">
                <Select
                  value={newPixel.type}
                  onValueChange={(value: 'facebook' | 'tiktok') => setNewPixel(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="w-full md:w-[160px]">
                    <SelectValue placeholder={t('pixels.selectPixelType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facebook">
                      <div className="flex items-center gap-2">
                        <Facebook className="h-4 w-4 text-blue-600" />
                        Facebook
                      </div>
                    </SelectItem>
                    <SelectItem value="tiktok">
                      <div className="flex items-center gap-2">
                        <TikTokIcon className="h-4 w-4 text-pink-600" />
                        TikTok
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                <Input
                  placeholder={t('pixels.pixelNamePlaceholder')}
                  value={newPixel.name || ''}
                  onChange={(e) => setNewPixel(prev => ({ ...prev, name: e.target.value }))}
                  className="flex-1"
                />
                
                <Input
                  placeholder={t('pixels.enterPixelId')}
                  value={newPixel.pixel_id || ''}
                  onChange={(e) => setNewPixel(prev => ({ ...prev, pixel_id: e.target.value }))}
                  className="flex-1"
                />
                
                <Input
                  type="password"
                  placeholder={t('pixels.accessToken')}
                  value={newPixel.access_token || ''}
                  onChange={(e) => setNewPixel(prev => ({ ...prev, access_token: e.target.value }))}
                  className="flex-1"
                />
                
                <Button onClick={handleAddPixel} className="shrink-0">
                  <Plus className="h-4 w-4 mr-1" />
                  {t('pixels.add')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Your Pixels List */}
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />
                {t('pixels.yourPixels')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              {pixels.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>{t('pixels.noPixelsYet')}</p>
                  <p className="text-sm mt-1">{t('pixels.addFirstPixel')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pixels.map((pixel) => (
                    <div
                      key={pixel.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        pixel.enabled 
                          ? pixel.type === 'facebook' 
                            ? 'border-blue-500/30 bg-blue-500/10' 
                            : 'border-pink-500/30 bg-pink-500/10'
                          : 'border-muted bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          pixel.type === 'facebook' 
                            ? 'bg-blue-100 dark:bg-blue-900/50' 
                            : 'bg-pink-100 dark:bg-pink-900/50'
                        }`}>
                          {pixel.type === 'facebook' ? (
                            <Facebook className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <TikTokIcon className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{pixel.name || pixel.pixel_id}</p>
                          <p className="text-xs text-muted-foreground">{pixel.pixel_id}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Badge className={pixel.enabled 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' 
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }>
                          {pixel.enabled ? t('pixels.active') : t('pixels.inactive')}
                        </Badge>
                        <Switch
                          checked={pixel.enabled}
                          onCheckedChange={(checked) => handleTogglePixel(pixel.id, checked)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemovePixel(pixel.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              onClick={() => updateSettings.mutate({ 
                ...settingsObj, 
                pixels: settingsForm,
                additional_pixels: pixels.filter(p => !p.id.endsWith('-main'))
              })}
              disabled={updateSettings.isPending}
            >
              {updateSettings.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {t('pixels.saving')}
                </>
              ) : (
                t('pixels.saveSettings')
              )}
            </Button>
          </div>

          {/* How it works */}
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <AlertCircle className="h-4 w-4 md:h-5 md:w-5" />
                {t('pixels.howItWorks')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs md:text-sm text-muted-foreground p-4 md:p-6 pt-0 md:pt-0">
              <p>
                {t('pixels.howItWorksDesc')}
              </p>
              <ul className={`list-disc space-y-1 ${isRTL ? 'pr-5' : 'pl-5'}`}>
                <li><strong className="text-foreground">PageView</strong> - {t('pixels.pageViewEvent')}</li>
                <li><strong className="text-foreground">ViewContent</strong> - {t('pixels.viewContentEvent')}</li>
                <li><strong className="text-foreground">AddToCart</strong> - {t('pixels.addToCartEvent')}</li>
                <li><strong className="text-foreground">InitiateCheckout</strong> - {t('pixels.initiateCheckoutEvent')}</li>
                <li><strong className="text-foreground">Purchase</strong> - {t('pixels.purchaseEvent')}</li>
              </ul>
              <p>
                {t('pixels.trackingNote')}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
