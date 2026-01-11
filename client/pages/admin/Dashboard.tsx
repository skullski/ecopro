import { useEffect, useState } from "react";
import { 
  Package, ShoppingCart, DollarSign, TrendingUp, TrendingDown, Users,
  ArrowUpRight, ArrowDownRight, MapPin, Clock, Eye, Sparkles, BarChart3,
  Activity, Target, Zap, Crown, Gift, Flame
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";
import OnboardingGuide from "@/components/OnboardingGuide";

interface DashboardStats {
  products: number;
  orders: number;
  revenue: number;
  pendingOrders: number;
  completedOrders: number;
  visitors: number;
}

interface Analytics {
  dailyRevenue: { date: string; orders: number; revenue: number; total_value: number }[];
  customStatuses: { key?: string; name: string; color: string; icon: string }[];
  comparisons: {
    today: { orders: number; revenue: number; ordersGrowth: number; revenueGrowth: number };
    thisWeek: { orders: number; revenue: number; ordersGrowth: number; revenueGrowth: number };
    thisMonth: { orders: number; revenue: number; ordersGrowth: number; revenueGrowth: number };
  };
  topProducts: { id: number; title: string; price: number; image_url: string; total_orders: number; total_quantity: number; total_revenue: number }[];
  recentOrders: { id: number; customer_name: string; customer_phone: string; total_price: number; status: string; created_at: string; product_title: string }[];
  statusBreakdown: { status: string; count: number; revenue: number }[];
  cityBreakdown: { city: string; count: number; revenue: number }[];
}

export default function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats>({ 
    products: 0, 
    orders: 0, 
    revenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    visitors: 0
  });
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'thisWeek' | 'thisMonth'>('thisWeek');

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/analytics')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setAnalytics(analyticsData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setLoading(false);
    }
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <ArrowUpRight className="w-3 h-3" />;
    if (growth < 0) return <ArrowDownRight className="w-3 h-3" />;
    return null;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-500';
    if (growth < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const getStatusColor = (status: string) => {
    // First check custom statuses from analytics (uses key)
    const customStatus = analytics?.customStatuses?.find(s => s.key === status || s.name === status);
    if (customStatus) return customStatus.color;
    
    // Fallback colors for all statuses
    const colors: Record<string, string> = {
      'pending': '#eab308',
      'confirmed': '#22c55e',
      'completed': '#10b981',
      'processing': '#3b82f6',
      'shipped': '#8b5cf6',
      'delivered': '#10b981',
      'cancelled': '#ef4444',
      'failed': '#ef4444',
      'at_delivery': '#8b5cf6',
      'no_answer_1': '#f97316',
      'no_answer_2': '#f97316',
      'no_answer_3': '#f97316',
      'waiting_callback': '#3b82f6',
      'postponed': '#6366f1',
      'line_closed': '#6b7280',
      'fake': '#dc2626',
      'duplicate': '#9ca3af',
      'returned': '#f97316',
      'refunded': '#22c55e',
    };
    return colors[status] || '#6b7280';
  };

  // Get translated status name
  const getStatusName = (status: string) => {
    const translated = t(`orders.status.${status}`);
    if (translated && translated !== `orders.status.${status}`) return translated;
    // Fallback: format the key nicely
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Calculate chart data based on selected period
  const getChartData = () => {
    if (!analytics?.dailyRevenue) return [];
    const data = analytics.dailyRevenue;
    
    if (selectedPeriod === 'today') {
      // Show last 24 hours / today only
      return data.slice(-1);
    } else if (selectedPeriod === 'thisWeek') {
      // Show last 7 days
      return data.slice(-7);
    } else {
      // thisMonth - show last 30 days
      return data.slice(-30);
    }
  };
  
  const chartData = getChartData();
  const maxOrders = Math.max(...chartData.map(d => d.orders), 1);
  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);
  const totalOrders = chartData.reduce((sum, d) => sum + d.orders, 0);
  const totalRevenue = chartData.reduce((sum, d) => sum + d.revenue, 0);

  const currentComparison = analytics?.comparisons?.[selectedPeriod];

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.goodMorning');
    if (hour < 18) return t('dashboard.goodAfternoon');
    return t('dashboard.goodEvening');
  };

  return (
    <div className="space-y-2 p-2 sm:p-3">
      {/* Onboarding Guide for New Users */}
      <OnboardingGuide 
        hasProducts={stats.products > 0}
        hasStoreSettings={true}
        hasOrders={stats.orders > 0}
      />

      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-2 sm:p-3 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyem0tNiA2di00aC00djRoNHptMC02di00aC00djRoNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-base sm:text-lg font-bold">{t('dashboard.title')}</h1>
            <p className="text-white/70 text-xs sm:text-sm">{t('dashboard.subtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-white/70 text-xs">{t('dashboard.totalRevenue')}</p>
              <p className="text-base sm:text-lg font-bold">{Math.round(stats.revenue)} DZD</p>
            </div>
            <div className="flex gap-1.5 text-xs">
              <span className="bg-white/20 px-2 py-0.5 rounded">{stats.orders} orders</span>
              <span className="bg-white/20 px-2 py-0.5 rounded">{stats.products} products</span>
            </div>
          </div>
        </div>
      </div>

      {/* Period Selector - Compact inline */}
      <div className="flex items-center gap-1 bg-muted/50 p-0.5 rounded-md w-fit">
        {[
          { key: 'today', label: t('dashboard.today') },
          { key: 'thisWeek', label: t('dashboard.thisWeek') },
          { key: 'thisMonth', label: t('dashboard.thisMonth') },
        ].map(period => (
          <button
            key={period.key}
            onClick={() => setSelectedPeriod(period.key as any)}
            className={`px-3 py-1.5 rounded text-xs sm:text-sm font-medium transition-all ${
              selectedPeriod === period.key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'hover:bg-muted text-muted-foreground'
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* Charts Row - Orders & Revenue - Compact */}
      <div className="grid gap-2 lg:grid-cols-2">
        {/* Orders Chart */}
        <Card className="p-2 sm:p-3 shadow-lg bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div className="p-1.5 rounded-md bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                <Package className="w-3 h-3" />
              </div>
              <h3 className="font-bold text-sm">{t('dashboard.orders') || 'Orders'}</h3>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{totalOrders}</p>
            </div>
          </div>
          
          <div className="h-20 sm:h-24 flex items-end gap-0.5 sm:gap-1">
            {chartData.length > 0 ? chartData.map((day, i) => {
              const heightPercent = maxOrders > 0 ? (day.orders / maxOrders) * 100 : 0;
              const barHeight = Math.max(heightPercent, 5);
              return (
              <div key={i} className="flex-1 flex flex-col items-center group h-full min-w-0">
                <div className="relative w-full flex-1 flex items-end">
                  <div 
                    className="w-full rounded-t-sm bg-gradient-to-t from-blue-600 to-cyan-400 hover:from-blue-500 hover:to-cyan-300 transition-all cursor-pointer"
                    style={{ height: `${barHeight}%` }}
                  />
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {day.orders}
                  </div>
                </div>
                {chartData.length <= 7 && (
                  <span className="text-xs text-muted-foreground mt-0.5">{new Date(day.date).getDate()}</span>
                )}
              </div>
            );}) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                {t('dashboard.noDataAvailable')}
              </div>
            )}
          </div>
        </Card>

        {/* Revenue Chart */}
        <Card className="p-2 sm:p-3 shadow-lg bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div className="p-1.5 rounded-md bg-gradient-to-br from-emerald-500 to-green-500 text-white">
                <DollarSign className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm">{t('dashboard.revenue') || 'Revenue'}</h3>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{Math.round(totalRevenue)} DZD</p>
            </div>
          </div>
          
          <div className="h-20 sm:h-24 flex items-end gap-0.5 sm:gap-1">
            {chartData.length > 0 ? chartData.map((day, i) => {
              const heightPercent = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
              const barHeight = Math.max(heightPercent, 5);
              return (
              <div key={i} className="flex-1 flex flex-col items-center group h-full min-w-0">
                <div className="relative w-full flex-1 flex items-end">
                  <div 
                    className="w-full rounded-t-sm bg-gradient-to-t from-emerald-600 to-green-400 hover:from-emerald-500 hover:to-green-300 transition-all cursor-pointer"
                    style={{ height: `${barHeight}%` }}
                  />
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {Math.round(day.revenue)}
                  </div>
                </div>
                {chartData.length <= 7 && (
                  <span className="text-xs text-muted-foreground mt-0.5">{new Date(day.date).getDate()}</span>
                )}
              </div>
            );}) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                {t('dashboard.noDataAvailable')}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Status + Top Products + Recent Orders - All in one row */}
      <div className="grid gap-2 grid-cols-1 md:grid-cols-3">
        {/* Order Status Breakdown */}
        <Card className="p-2 shadow-lg bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="p-1 rounded-md bg-gradient-to-br from-amber-500 to-orange-500 text-white">
              <Target className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-bold text-sm">{t('dashboard.statusDistribution')}</h3>
          </div>
          <div className="space-y-1.5">
            {analytics?.statusBreakdown?.slice(0, 5).map((item, i) => {
              const total = analytics.statusBreakdown.reduce((sum, s) => sum + s.count, 0);
              const percentage = total > 0 ? (item.count / total) * 100 : 0;
              return (
                <div key={i} className="flex items-center gap-1.5">
                  <div 
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getStatusColor(item.status) }}
                  />
                  <span className="text-xs flex-1 truncate">{getStatusName(item.status)}</span>
                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: getStatusColor(item.status) }} />
                  </div>
                  <span className="text-xs font-bold w-6 text-right">{item.count}</span>
                </div>
              );
            }) || (
              <p className="text-xs text-muted-foreground text-center py-1">{t('dashboard.noDataAvailable')}</p>
            )}
          </div>
        </Card>

        {/* Top Products */}
        <Card className="p-3 shadow-lg bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-md bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
              <Crown className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm">{t('dashboard.topProducts')}</h3>
          </div>
          <div className="space-y-2">
            {analytics?.topProducts?.slice(0, 4).map((product, i) => (
              <div key={product.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/50">
                <span className={`w-5 h-5 rounded text-xs flex items-center justify-center font-bold text-white ${
                  i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-orange-600' : 'bg-slate-600'
                }`}>{i + 1}</span>
                {product.image_url ? (
                  <img src={product.image_url} alt="" className="w-8 h-8 rounded object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                    <Package className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{product.title}</p>
                  <p className="text-xs text-muted-foreground">{product.total_orders} • {Math.round(product.total_revenue)} DZD</p>
                </div>
              </div>
            )) || (
              <p className="text-xs text-muted-foreground text-center py-2">{t('dashboard.noProducts')}</p>
            )}
          </div>
        </Card>

        {/* Recent Orders */}
        <Card className="p-3 shadow-lg bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-md bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm">{t('dashboard.recentOrders')}</h3>
          </div>
          <div className="space-y-2">
            {analytics?.recentOrders?.slice(0, 4).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-1.5 rounded hover:bg-muted/50">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{order.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{formatTimeAgo(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold">{Math.round(order.total_price)} DZD</p>
                  <span className="text-xs px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: getStatusColor(order.status) }}>
                    {order.status}
                  </span>
                </div>
              </div>
            )) || (
              <p className="text-xs text-muted-foreground text-center py-2">{t('dashboard.noOrders')}</p>
            )}
          </div>
        </Card>
      </div>

      {/* Orders by City */}
      <Card className="p-3 shadow-lg bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-md bg-gradient-to-br from-pink-500 to-rose-500 text-white">
            <MapPin className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm">{t('dashboard.ordersByCity')}</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {analytics?.cityBreakdown?.slice(0, 6).map((city, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/30 hover:bg-muted/50">
              <span className="text-xs truncate flex-1">{city.city || 'Not specified'}</span>
              <span className="text-xs font-bold ml-2">{city.count}</span>
            </div>
          )) || (
            <p className="col-span-full text-xs text-muted-foreground text-center py-2">{t('dashboard.noDataAvailable')}</p>
          )}
        </div>
      </Card>
    </div>
  );
}
