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
        {/* Settings Tab - Dynamic Pixel List */}
        <TabsContent value="settings" className="space-y-4 md:space-y-6">
          <div className="space-y-4">
            {settingsForm.map((pixel, idx) => (
              <Card key={pixel.pixel_type + idx}>
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                    {pixel.pixel_type === 'facebook' ? <Facebook className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" /> : pixel.pixel_type === 'tiktok' ? <TikTokIcon className="h-4 w-4 md:h-5 md:w-5 text-pink-600 dark:text-pink-400" /> : <BarChart3 className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />}
                    {pixel.pixel_type.charAt(0).toUpperCase() + pixel.pixel_type.slice(1)} Pixel
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm">
                    Configure your {pixel.pixel_type} Pixel for conversion tracking
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-4 md:p-6 pt-0 md:pt-0">
                  <div>
                    <Label htmlFor={`pixel-id-${idx}`} className="text-sm">Pixel ID</Label>
                    <Input
                      id={`pixel-id-${idx}`}
                      placeholder={`Enter your ${pixel.pixel_type} Pixel ID`}
                      value={pixel.pixel_id}
                      onChange={(e) => setSettingsForm(prev => prev.map((p, i) => i === idx ? { ...p, pixel_id: e.target.value } : p))}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Find this in your {pixel.pixel_type === 'facebook' ? 'Facebook Events Manager' : pixel.pixel_type === 'tiktok' ? 'TikTok Ads Manager' : 'Pixel Provider'}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor={`access-token-${idx}`} className="text-sm">Access Token (Optional)</Label>
                    <Input
                      id={`access-token-${idx}`}
                      type="password"
                      placeholder="For server-side tracking"
                      value={pixel.access_token || ''}
                      onChange={(e) => setSettingsForm(prev => prev.map((p, i) => i === idx ? { ...p, access_token: e.target.value } : p))}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Required for server-side events
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <Label htmlFor={`enabled-${idx}`} className="text-sm">Enable {pixel.pixel_type.charAt(0).toUpperCase() + pixel.pixel_type.slice(1)} Pixel</Label>
                    <Switch
                      id={`enabled-${idx}`}
                      checked={pixel.enabled}
                      onCheckedChange={(checked) => setSettingsForm(prev => prev.map((p, i) => i === idx ? { ...p, enabled: checked } : p))}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSettingsForm(prev => [...prev, { pixel_type: 'custom', pixel_id: '', enabled: false }])}>Add Pixel</Button>
              {settingsForm.length > 2 && (
                <Button variant="destructive" onClick={() => setSettingsForm(prev => prev.slice(0, -1))}>Remove Last</Button>
              )}
            </div>
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
  const [settingsForm, setSettingsForm] = useState<PixelConfig[]>([]);

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
    mutationFn: async (pixels: PixelConfig[]) => {
      const res = await fetch('/api/pixels/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pixels })
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
    if (settings?.pixels) {
      setSettingsForm(settings.pixels);
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
              <span className="text-xs text-muted-foreground">Page Views</span>
            </div>
            <p className="text-lg md:text-xl font-bold">{formatNumber(data?.total_page_views)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-2.5 md:p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <MousePointer className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">View Content</span>
            </div>
            <p className="text-lg md:text-xl font-bold">{formatNumber(data?.total_view_content)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-2.5 md:p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <ShoppingCart className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Add to Cart</span>
            </div>
            <p className="text-lg md:text-xl font-bold">{formatNumber(data?.total_add_to_cart)}</p>
            <p className="text-xs text-muted-foreground">Rate: {data?.cart_rate || 0}%</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-2.5 md:p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Purchases</span>
            </div>
            <p className="text-lg md:text-xl font-bold">{formatNumber(data?.total_purchases)}</p>
            <p className="text-xs text-muted-foreground">Conv: {data?.conversion_rate || 0}%</p>
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
            <div className="font-semibold text-foreground">Important</div>
            <div>
              The “Facebook” and “TikTok” sections here are <b>pixel platform buckets</b> (which pixel is enabled/used),
              not a guarantee that the visitor came from an ad.
              Pixels fire on any visit (direct link, WhatsApp, inside the store, etc).
            </div>
            <div className="mt-2">
              “Page Views” are event counts. Refreshing can increase them; we de-duplicate rapid duplicates server-side,
              but this is still not the same as “unique visitors”.
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
            Conversion Funnel
          </CardTitle>
          <CardDescription className="text-xs">
            {platform === 'facebook' ? 'Facebook' : 'TikTok'} Pixel - Last {data.period_days} days
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
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <p className="text-base md:text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(data.total_revenue)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Order Value</p>
              <p className="text-base md:text-lg font-bold">{formatCurrency(data.avg_order_value)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-2 md:p-4 space-y-3 md:space-y-4 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-3">
        <div>
          <h1 className="text-lg md:text-xl lg:text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />
            Pixel Statistics
          </h1>
          <p className="text-muted-foreground text-xs md:text-sm mt-0.5">
            Track pixel events and conversions
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedDays} onValueChange={setSelectedDays}>
            <SelectTrigger className="w-32 h-8 text-xs">
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
                  <h3 className="font-semibold text-xs md:text-sm">Facebook Pixel</h3>
                  <p className="text-xs text-muted-foreground truncate max-w-[120px] md:max-w-none">
                    {settings?.facebook_pixel_id || 'Not configured'}
                  </p>
                </div>
              </div>
              {settings?.is_facebook_enabled ? (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" /> Active
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  <XCircle className="h-3 w-3 mr-1" /> Inactive
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
                  <h3 className="font-semibold text-xs md:text-sm">TikTok Pixel</h3>
                  <p className="text-xs text-muted-foreground truncate max-w-[120px] md:max-w-none">
                    {settings?.tiktok_pixel_id || 'Not configured'}
                  </p>
                </div>
              </div>
              {settings?.is_tiktok_enabled ? (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" /> Active
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  <XCircle className="h-3 w-3 mr-1" /> Inactive
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
          <TabsTrigger value="overview" className="text-xs py-1.5">Overview</TabsTrigger>
          {settingsForm.map((pixel, idx) => (
            <TabsTrigger key={pixel.pixel_type + idx} value={pixel.pixel_type} className="text-xs py-1.5">
              {pixel.pixel_type.charAt(0).toUpperCase() + pixel.pixel_type.slice(1)}
            </TabsTrigger>
          ))}
          <TabsTrigger value="settings" className="text-xs py-1.5">Settings</TabsTrigger>
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
                  <span className="text-xs text-muted-foreground">Total Page Views</span>
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
                  <span className="text-xs text-muted-foreground">Total Add to Cart</span>
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
                  <span className="text-xs text-muted-foreground">Total Purchases</span>
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
                  <span className="text-xs text-muted-foreground">Total Revenue</span>
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
                Recent Events
              </CardTitle>
              <CardDescription className="text-xs">
                Latest pixel events from your store
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              {recentEvents?.events && recentEvents.events.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Platform</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Page</TableHead>
                      <TableHead className="text-xs">Revenue</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Time</TableHead>
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
                  <p>No events recorded yet</p>
                  <p className="text-sm mt-1">Events will appear here once your pixels start tracking</p>
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
                  <h3 className="text-lg md:text-xl font-semibold mb-2">{pixel.pixel_type.charAt(0).toUpperCase() + pixel.pixel_type.slice(1)} Pixel Not Configured</h3>
                  <p className="text-muted-foreground text-sm md:text-base mb-4">
                    Add your {pixel.pixel_type} Pixel ID in the Settings tab to start tracking
                  </p>
                  <Button onClick={() => setActiveTab('settings')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Pixel
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
                  Facebook Pixel
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Configure your Facebook Pixel for conversion tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-4 md:p-6 pt-0 md:pt-0">
                <div>
                  <Label htmlFor="fb-pixel-id" className="text-sm">Pixel ID</Label>
                  <Input
                    id="fb-pixel-id"
                    placeholder="Enter your Facebook Pixel ID"
                    value={settingsForm.facebook_pixel_id || ''}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, facebook_pixel_id: e.target.value }))}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Find this in your Facebook Events Manager
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="fb-access-token" className="text-sm">Access Token (Optional)</Label>
                  <Input
                    id="fb-access-token"
                    type="password"
                    placeholder="For server-side tracking"
                    value={settingsForm.facebook_access_token || ''}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, facebook_access_token: e.target.value }))}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Required for Conversions API (server-side events)
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <Label htmlFor="fb-enabled" className="text-sm">Enable Facebook Pixel</Label>
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
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <TikTokIcon className="h-4 w-4 md:h-5 md:w-5 text-pink-600 dark:text-pink-400" />
                  TikTok Pixel
                </CardTitle>
                <CardDescription className="text-xs md:text-sm">
                  Configure your TikTok Pixel for conversion tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-4 md:p-6 pt-0 md:pt-0">
                <div>
                  <Label htmlFor="tt-pixel-id" className="text-sm">Pixel ID</Label>
                  <Input
                    id="tt-pixel-id"
                    placeholder="Enter your TikTok Pixel ID"
                    value={settingsForm.tiktok_pixel_id || ''}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, tiktok_pixel_id: e.target.value }))}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Find this in your TikTok Ads Manager
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="tt-access-token" className="text-sm">Access Token (Optional)</Label>
                  <Input
                    id="tt-access-token"
                    type="password"
                    placeholder="For server-side tracking"
                    value={settingsForm.tiktok_access_token || ''}
                    onChange={(e) => setSettingsForm(prev => ({ ...prev, tiktok_access_token: e.target.value }))}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Required for Events API (server-side events)
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <Label htmlFor="tt-enabled" className="text-sm">Enable TikTok Pixel</Label>
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
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <AlertCircle className="h-4 w-4 md:h-5 md:w-5" />
                How Pixel Tracking Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs md:text-sm text-muted-foreground p-4 md:p-6 pt-0 md:pt-0">
              <p>
                Once you configure your pixel IDs and enable tracking, your store will automatically 
                track the following events:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-foreground">PageView</strong> - When a customer visits any page</li>
                <li><strong className="text-foreground">ViewContent</strong> - When a customer views a product</li>
                <li><strong className="text-foreground">AddToCart</strong> - When a customer adds a product to cart</li>
                <li><strong className="text-foreground">InitiateCheckout</strong> - When a customer starts checkout</li>
                <li><strong className="text-foreground">Purchase</strong> - When an order is completed</li>
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
