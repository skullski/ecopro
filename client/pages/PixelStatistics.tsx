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
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// TikTok icon component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

interface PixelSettings {
  client_id: number;
  facebook_pixel_id: string | null;
  facebook_access_token: string | null;
  tiktok_pixel_id: string | null;
  tiktok_access_token: string | null;
  is_facebook_enabled: boolean;
  is_tiktok_enabled: boolean;
}

interface PixelStats {
  period_days: number;
  daily_stats: Array<{
    stat_date: string;
    pixel_type: string;
    page_views: number;
    view_content: number;
    add_to_cart: number;
    initiate_checkout: number;
    purchases: number;
    total_revenue: number;
  }>;
  facebook: {
    total_page_views: number;
    total_view_content: number;
    total_add_to_cart: number;
    total_initiate_checkout: number;
    total_purchases: number;
    total_revenue: number;
    conversion_rate: string;
    cart_rate: string;
  };
  tiktok: {
    total_page_views: number;
    total_view_content: number;
    total_add_to_cart: number;
    total_initiate_checkout: number;
    total_purchases: number;
    total_revenue: number;
    conversion_rate: string;
    cart_rate: string;
  };
}

interface FunnelData {
  pixel_type: string;
  period_days: number;
  funnel: Array<{
    stage: string;
    count: number;
    rate: number | string;
  }>;
  total_revenue: number;
  avg_order_value: string;
}

interface RecentEvent {
  id: number;
  pixel_type: string;
  event_name: string;
  event_data: any;
  page_url: string;
  product_id: number | null;
  order_id: number | null;
  revenue: number | null;
  currency: string;
  created_at: string;
}

export default function PixelStatistics() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDays, setSelectedDays] = useState('30');
  const [activeTab, setActiveTab] = useState('overview');
  const [settingsForm, setSettingsForm] = useState<Partial<PixelSettings>>({});

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
    mutationFn: async (data: Partial<PixelSettings>) => {
      const res = await fetch('/api/pixels/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
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
      setSettingsForm({
        facebook_pixel_id: settings.facebook_pixel_id || '',
        tiktok_pixel_id: settings.tiktok_pixel_id || '',
        is_facebook_enabled: settings.is_facebook_enabled,
        is_tiktok_enabled: settings.is_tiktok_enabled
      });
    }
  }, [settings]);

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
      'PageView': 'bg-blue-100 text-blue-800',
      'ViewContent': 'bg-purple-100 text-purple-800',
      'AddToCart': 'bg-orange-100 text-orange-800',
      'InitiateCheckout': 'bg-yellow-100 text-yellow-800',
      'Purchase': 'bg-green-100 text-green-800'
    };
    return colors[eventName] || 'bg-gray-100 text-gray-800';
  };

  // Stats cards for a platform
  const StatsCards = ({ platform, data }: { platform: 'facebook' | 'tiktok'; data: any }) => {
    const Icon = platform === 'facebook' ? Facebook : TikTokIcon;
    const color = platform === 'facebook' ? 'blue' : 'pink';
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Page Views</span>
            </div>
            <p className="text-2xl font-bold">{formatNumber(data?.total_page_views)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <MousePointer className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">View Content</span>
            </div>
            <p className="text-2xl font-bold">{formatNumber(data?.total_view_content)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Add to Cart</span>
            </div>
            <p className="text-2xl font-bold">{formatNumber(data?.total_add_to_cart)}</p>
            <p className="text-xs text-gray-500 mt-1">Cart Rate: {data?.cart_rate || 0}%</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Purchases</span>
            </div>
            <p className="text-2xl font-bold">{formatNumber(data?.total_purchases)}</p>
            <p className="text-xs text-gray-500 mt-1">Conv: {data?.conversion_rate || 0}%</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Funnel visualization
  const FunnelChart = ({ data, platform }: { data: FunnelData | undefined; platform: string }) => {
    if (!data) return null;
    
    const maxCount = Math.max(...data.funnel.map(f => f.count));
    const colors = platform === 'facebook' 
      ? ['bg-blue-500', 'bg-blue-400', 'bg-blue-300', 'bg-blue-200', 'bg-green-500']
      : ['bg-pink-500', 'bg-pink-400', 'bg-pink-300', 'bg-pink-200', 'bg-green-500'];
    
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Conversion Funnel
          </CardTitle>
          <CardDescription>
            {platform === 'facebook' ? 'Facebook' : 'TikTok'} Pixel - Last {data.period_days} days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.funnel.map((step, idx) => (
              <div key={step.stage} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{step.stage}</span>
                  <span className="text-gray-600">
                    {formatNumber(step.count)} ({step.rate}%)
                  </span>
                </div>
                <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div 
                    className={`h-full ${colors[idx]} transition-all duration-500`}
                    style={{ width: maxCount > 0 ? `${(step.count / maxCount) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(data.total_revenue)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Order Value</p>
              <p className="text-xl font-bold">{formatCurrency(data.avg_order_value)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-7 w-7" />
            Pixel Statistics
          </h1>
          <p className="text-gray-600 mt-1">
            Track Facebook and TikTok pixel performance for your store
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedDays} onValueChange={setSelectedDays}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="60">Last 60 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={() => refetchStats()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Pixel Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className={settings?.is_facebook_enabled ? 'border-blue-200 bg-blue-50/50' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Facebook className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Facebook Pixel</h3>
                  <p className="text-sm text-gray-600">
                    {settings?.facebook_pixel_id || 'Not configured'}
                  </p>
                </div>
              </div>
              {settings?.is_facebook_enabled ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" /> Active
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="h-3 w-3 mr-1" /> Inactive
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className={settings?.is_tiktok_enabled ? 'border-pink-200 bg-pink-50/50' : ''}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <TikTokIcon className="h-6 w-6 text-pink-600" />
                </div>
                <div>
                  <h3 className="font-semibold">TikTok Pixel</h3>
                  <p className="text-sm text-gray-600">
                    {settings?.tiktok_pixel_id || 'Not configured'}
                  </p>
                </div>
              </div>
              {settings?.is_tiktok_enabled ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" /> Active
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="h-3 w-3 mr-1" /> Inactive
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="facebook">Facebook</TabsTrigger>
          <TabsTrigger value="tiktok">TikTok</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600">Total Page Views</span>
                </div>
                <p className="text-2xl font-bold">
                  {formatNumber((stats?.facebook?.total_page_views || 0) + (stats?.tiktok?.total_page_views || 0))}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-gray-600">Total Add to Cart</span>
                </div>
                <p className="text-2xl font-bold">
                  {formatNumber((stats?.facebook?.total_add_to_cart || 0) + (stats?.tiktok?.total_add_to_cart || 0))}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">Total Purchases</span>
                </div>
                <p className="text-2xl font-bold">
                  {formatNumber((stats?.facebook?.total_purchases || 0) + (stats?.tiktok?.total_purchases || 0))}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">Total Revenue</span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency((Number(stats?.facebook?.total_revenue) || 0) + (Number(stats?.tiktok?.total_revenue) || 0))}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Events
              </CardTitle>
              <CardDescription>
                Latest pixel events from your store
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentEvents?.events && recentEvents.events.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Platform</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Page</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentEvents.events.slice(0, 10).map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          {event.pixel_type === 'facebook' ? (
                            <Facebook className="h-4 w-4 text-blue-600" />
                          ) : (
                            <TikTokIcon className="h-4 w-4 text-pink-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getEventColor(event.event_name)}>
                            {event.event_name}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-sm text-gray-600">
                          {event.page_url?.replace(/^https?:\/\/[^/]+/, '') || '-'}
                        </TableCell>
                        <TableCell>
                          {event.revenue ? formatCurrency(event.revenue) : '-'}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(event.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No events recorded yet</p>
                  <p className="text-sm mt-1">Events will appear here once your pixels start tracking</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Facebook Tab */}
        <TabsContent value="facebook" className="space-y-6">
          {settings?.is_facebook_enabled ? (
            <>
              <StatsCards platform="facebook" data={stats?.facebook} />
              <FunnelChart data={facebookFunnel} platform="facebook" />
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Facebook className="h-16 w-16 mx-auto mb-4 text-blue-200" />
                <h3 className="text-xl font-semibold mb-2">Facebook Pixel Not Configured</h3>
                <p className="text-gray-600 mb-4">
                  Add your Facebook Pixel ID in the Settings tab to start tracking
                </p>
                <Button onClick={() => setActiveTab('settings')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Pixel
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* TikTok Tab */}
        <TabsContent value="tiktok" className="space-y-6">
          {settings?.is_tiktok_enabled ? (
            <>
              <StatsCards platform="tiktok" data={stats?.tiktok} />
              <FunnelChart data={tiktokFunnel} platform="tiktok" />
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <TikTokIcon className="h-16 w-16 mx-auto mb-4 text-pink-200" />
                <h3 className="text-xl font-semibold mb-2">TikTok Pixel Not Configured</h3>
                <p className="text-gray-600 mb-4">
                  Add your TikTok Pixel ID in the Settings tab to start tracking
                </p>
                <Button onClick={() => setActiveTab('settings')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Pixel
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Facebook Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Facebook className="h-5 w-5 text-blue-600" />
                  Facebook Pixel
                </CardTitle>
                <CardDescription>
                  Configure your Facebook Pixel for conversion tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="fb-pixel-id">Pixel ID</Label>
                  <Input
                    id="fb-pixel-id"
                    placeholder="Enter your Facebook Pixel ID"
                    value={settingsForm.facebook_pixel_id || ''}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, facebook_pixel_id: e.target.value }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Find this in your Facebook Events Manager
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="fb-access-token">Access Token (Optional)</Label>
                  <Input
                    id="fb-access-token"
                    type="password"
                    placeholder="For server-side tracking"
                    value={settingsForm.facebook_access_token || ''}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, facebook_access_token: e.target.value }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Required for Conversions API (server-side events)
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <Label htmlFor="fb-enabled">Enable Facebook Pixel</Label>
                  <Switch
                    id="fb-enabled"
                    checked={settingsForm.is_facebook_enabled || false}
                    onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, is_facebook_enabled: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* TikTok Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TikTokIcon className="h-5 w-5 text-pink-600" />
                  TikTok Pixel
                </CardTitle>
                <CardDescription>
                  Configure your TikTok Pixel for conversion tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="tt-pixel-id">Pixel ID</Label>
                  <Input
                    id="tt-pixel-id"
                    placeholder="Enter your TikTok Pixel ID"
                    value={settingsForm.tiktok_pixel_id || ''}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, tiktok_pixel_id: e.target.value }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Find this in your TikTok Ads Manager
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="tt-access-token">Access Token (Optional)</Label>
                  <Input
                    id="tt-access-token"
                    type="password"
                    placeholder="For server-side tracking"
                    value={settingsForm.tiktok_access_token || ''}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, tiktok_access_token: e.target.value }))}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Required for Events API (server-side events)
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <Label htmlFor="tt-enabled">Enable TikTok Pixel</Label>
                  <Switch
                    id="tt-enabled"
                    checked={settingsForm.is_tiktok_enabled || false}
                    onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, is_tiktok_enabled: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={() => updateSettings.mutate(settingsForm)}
              disabled={updateSettings.isPending}
            >
              {updateSettings.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </Button>
          </div>

          {/* How it works */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                How Pixel Tracking Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-gray-600">
              <p>
                Once you configure your pixel IDs and enable tracking, your store will automatically 
                track the following events:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>PageView</strong> - When a customer visits any page</li>
                <li><strong>ViewContent</strong> - When a customer views a product</li>
                <li><strong>AddToCart</strong> - When a customer adds a product to cart</li>
                <li><strong>InitiateCheckout</strong> - When a customer starts checkout</li>
                <li><strong>Purchase</strong> - When an order is completed</li>
              </ul>
              <p>
                All events are tracked both in-browser (standard pixel) and server-side (if access 
                token is provided) for maximum accuracy and iOS 14+ compatibility.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
