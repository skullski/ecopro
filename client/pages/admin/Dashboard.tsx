import { useEffect, useState } from "react";
import { 
  Package, ShoppingCart, DollarSign, TrendingUp, TrendingDown, Users,
  ArrowUpRight, ArrowDownRight, MapPin, Clock, Eye, Sparkles, BarChart3,
  Activity, Target, Zap, Crown, Gift, Flame
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";

interface DashboardStats {
  products: number;
  orders: number;
  revenue: number;
  pendingOrders: number;
  completedOrders: number;
  visitors: number;
}

interface Analytics {
  dailyRevenue: { date: string; orders: number; revenue: number }[];
  customStatuses: { name: string; color: string; icon: string }[];
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
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const [statsRes, analyticsRes] = await Promise.all([
        fetch('/api/dashboard/stats', { headers }),
        fetch('/api/dashboard/analytics', { headers })
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

    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    return `منذ ${diffDays} يوم`;
  };

  const getStatusColor = (status: string) => {
    const customStatus = analytics?.customStatuses?.find(s => s.name === status);
    if (customStatus) return customStatus.color;
    
    const colors: Record<string, string> = {
      'pending': '#eab308',
      'confirmed': '#22c55e',
      'processing': '#3b82f6',
      'shipped': '#8b5cf6',
      'delivered': '#10b981',
      'cancelled': '#ef4444',
      'failed': '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  // Calculate chart data for last 12 days
  const chartData = analytics?.dailyRevenue?.slice(-12) || [];
  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);

  const currentComparison = analytics?.comparisons?.[selectedPeriod];

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '☀️ صباح الخير';
    if (hour < 18) return '🌤️ مساء الخير';
    return '🌙 مساء الخير';
  };

  return (
    <div className="space-y-4 p-1 sm:p-2">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-2.5 sm:p-3 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyem0tNiA2di00aC00djRoNHptMC02di00aC00djRoNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-white/80 text-xs sm:text-sm">{getGreeting()}</p>
            <h1 className="text-lg sm:text-xl font-bold">لوحة التحكم</h1>
            <p className="text-white/70 text-xs sm:text-sm">إليك ملخص أداء متجرك</p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <div className="text-right">
              <p className="text-white/70 text-xs">إجمالي الإيرادات</p>
              <p className="text-lg sm:text-xl font-bold">{stats.revenue.toLocaleString()} دج</p>
            </div>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>
        {/* Animated circles */}
        <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-6 -left-6 w-16 h-16 rounded-full bg-white/10 blur-2xl" />
      </div>

      {/* Period Selector */}
      <div className="flex flex-wrap items-center justify-between gap-1">
        <div className="flex items-center gap-0.5 sm:gap-1 bg-muted/50 p-0.5 rounded-lg">
          {[
            { key: 'today', label: 'اليوم', icon: Zap },
            { key: 'thisWeek', label: 'هذا الأسبوع', icon: Activity },
            { key: 'thisMonth', label: 'هذا الشهر', icon: BarChart3 },
          ].map(period => (
            <button
              key={period.key}
              onClick={() => setSelectedPeriod(period.key as any)}
              className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-all flex items-center gap-1 sm:gap-2 ${
                selectedPeriod === period.key
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                  : 'hover:bg-muted text-muted-foreground'
              }`}
            >
              <period.icon className="w-3 h-3 sm:w-4 sm:h-4" />
              {period.label}
            </button>
          ))}
        </div>
        <div className="text-xs text-muted-foreground">
          آخر تحديث: {new Date().toLocaleTimeString('ar-EG')}
        </div>
      </div>

      {/* Top Stats with Growth - Enhanced */}
      <div className="grid gap-1 grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden p-1.5 border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white group hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="p-0.5 rounded bg-white/20 backdrop-blur">
                <ShoppingCart className="w-3 h-3" />
              </div>
              {currentComparison && (
                <div className={`flex items-center text-xs font-bold px-1 py-0.5 rounded-full ${currentComparison.ordersGrowth >= 0 ? 'bg-green-400/20 text-green-100' : 'bg-red-400/20 text-red-100'}`}>
                  {getGrowthIcon(currentComparison.ordersGrowth)}
                  {Math.abs(currentComparison.ordersGrowth)}%
                </div>
              )}
            </div>
            <p className="text-xl sm:text-2xl font-bold">{loading ? '...' : currentComparison?.orders || stats.orders}</p>
            <p className="text-white/70 text-xs sm:text-sm">الطلبات</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden p-1.5 border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white group hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="p-0.5 rounded bg-white/20 backdrop-blur">
                <DollarSign className="w-3 h-3" />
              </div>
              {currentComparison && (
                <div className={`flex items-center text-xs font-bold px-1 py-0.5 rounded-full ${currentComparison.revenueGrowth >= 0 ? 'bg-green-400/20 text-green-100' : 'bg-red-400/20 text-red-100'}`}>
                  {getGrowthIcon(currentComparison.revenueGrowth)}
                  {Math.abs(currentComparison.revenueGrowth)}%
                </div>
              )}
            </div>
            <p className="text-xl sm:text-2xl font-bold">{loading ? '...' : `${(currentComparison?.revenue || 0).toLocaleString()}`}</p>
            <p className="text-white/70 text-xs sm:text-sm">الإيرادات (دج)</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden p-1.5 border-0 bg-gradient-to-br from-violet-500 to-purple-600 text-white group hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="p-0.5 rounded bg-white/20 backdrop-blur">
                <Eye className="w-3 h-3" />
              </div>
              <div className="text-xs bg-white/20 px-1 py-0.5 rounded-full">مباشر</div>
            </div>
            <p className="text-xl sm:text-2xl font-bold">{loading ? '...' : stats.visitors.toLocaleString()}</p>
            <p className="text-white/70 text-xs sm:text-sm">المشاهدات</p>
          </div>
        </Card>

        <Card className="relative overflow-hidden p-1.5 border-0 bg-gradient-to-br from-orange-500 to-amber-600 text-white group hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="p-0.5 rounded bg-white/20 backdrop-blur">
                <Package className="w-3 h-3" />
              </div>
              <Flame className="w-3 h-3 text-yellow-200" />
            </div>
            <p className="text-xl sm:text-2xl font-bold">{loading ? '...' : stats.products}</p>
            <p className="text-white/70 text-xs sm:text-sm">المنتجات</p>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-3 lg:grid-cols-3">
        {/* Sales Chart - Takes 2 columns */}
        <Card className="lg:col-span-2 p-3 sm:p-4 border-0 shadow-lg dark:bg-slate-900/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm sm:text-base">إيرادات آخر 12 يوم</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground">الإيرادات اليومية</p>
              </div>
            </div>
            <div className="text-left bg-gradient-to-r from-emerald-500/10 to-green-500/10 px-2 sm:px-3 py-1.5 rounded-lg border border-emerald-500/20">
              <p className="text-sm sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {chartData.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()} دج
              </p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">إجمالي الفترة</p>
            </div>
          </div>
          
          <div className="h-32 sm:h-40 flex items-end gap-1 sm:gap-2 px-1">
            {chartData.length > 0 ? chartData.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="relative w-full">
                  <div 
                    className="w-full rounded-t-md bg-gradient-to-t from-blue-600 via-blue-500 to-purple-500 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 transition-all duration-300 cursor-pointer shadow-md shadow-blue-500/20 hover:shadow-purple-500/30"
                    style={{ height: `${Math.max((day.revenue / maxRevenue) * 100, 6)}px` }}
                  />
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-10 shadow-xl">
                    <p className="font-bold">{day.revenue.toLocaleString()} دج</p>
                    <p className="text-white/70">{day.orders} طلب</p>
                  </div>
                </div>
                <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                  {new Date(day.date).getDate()}
                </span>
              </div>
            )) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="w-8 h-8 mx-auto mb-1.5 opacity-20" />
                  <p className="text-sm">لا توجد بيانات</p>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Order Status Breakdown */}
        <Card className="p-3 sm:p-4 border-0 shadow-lg dark:bg-slate-900/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 text-white">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm sm:text-base">توزيع الحالات</h3>
          </div>
          <div className="space-y-2">
            {analytics?.statusBreakdown?.slice(0, 6).map((item, i) => {
              const total = analytics.statusBreakdown.reduce((sum, s) => sum + s.count, 0);
              const percentage = total > 0 ? (item.count / total) * 100 : 0;
              return (
                <div key={i} className="group">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5">
                      <div 
                        className="w-2.5 h-2.5 rounded-full ring-1 ring-offset-1 dark:ring-offset-slate-900"
                        style={{ backgroundColor: getStatusColor(item.status), borderColor: getStatusColor(item.status) }}
                      />
                      <span className="text-xs font-medium">{item.status}</span>
                    </div>
                    <span className="text-xs font-bold">{item.count}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500 group-hover:opacity-80"
                      style={{ width: `${percentage}%`, backgroundColor: getStatusColor(item.status) }}
                    />
                  </div>
                </div>
              );
            }) || (
              <p className="text-xs text-muted-foreground text-center py-6">لا توجد بيانات</p>
            )}
          </div>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid gap-3 lg:grid-cols-3">
        {/* Top Products */}
        <Card className="p-3 sm:p-4 border-0 shadow-lg dark:bg-slate-900/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
              <Crown className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm sm:text-base">أفضل المنتجات</h3>
          </div>
          <div className="space-y-2">
            {analytics?.topProducts?.slice(0, 5).map((product, i) => (
              <div key={product.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/50 transition-colors group">
                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold shadow ${
                  i === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' :
                  i === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-500' :
                  i === 2 ? 'bg-gradient-to-br from-orange-600 to-orange-700' :
                  'bg-gradient-to-br from-slate-600 to-slate-700'
                }`}>
                  {i + 1}
                </div>
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.title}
                    className="w-9 h-9 rounded-md object-cover ring-1 ring-muted"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center">
                    <Package className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">{product.title}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {product.total_orders} طلب • <span className="text-emerald-600 dark:text-emerald-400 font-medium">{product.total_revenue.toLocaleString()} دج</span>
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-xs text-muted-foreground text-center py-6">لا توجد منتجات</p>
            )}
          </div>
        </Card>

        {/* Recent Orders */}
        <Card className="p-3 sm:p-4 border-0 shadow-lg dark:bg-slate-900/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm sm:text-base">آخر الطلبات</h3>
          </div>
          <div className="space-y-1.5">
            {analytics?.recentOrders?.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-muted">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{order.customer_name}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {formatTimeAgo(order.created_at)}
                  </p>
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold">{order.total_price} دج</p>
                  <div 
                    className="text-[10px] px-1.5 py-0.5 rounded-full text-white inline-block shadow-sm"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </div>
                </div>
              </div>
            )) || (
              <p className="text-xs text-muted-foreground text-center py-6">لا توجد طلبات</p>
            )}
          </div>
        </Card>

        {/* Orders by City */}
        <Card className="p-3 sm:p-4 border-0 shadow-lg dark:bg-slate-900/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 text-white">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm sm:text-base">الطلبات حسب المدينة</h3>
          </div>
          <div className="space-y-2">
            {analytics?.cityBreakdown?.slice(0, 6).map((city, i) => {
              const maxCount = analytics.cityBreakdown[0]?.count || 1;
              const percentage = (city.count / maxCount) * 100;
              return (
                <div key={i} className="group">
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="font-medium flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-rose-500" />
                      {city.city}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground">{city.revenue.toLocaleString()} دج</span>
                      <span className="font-bold bg-primary/10 px-1.5 py-0.5 rounded-full text-[10px]">{city.count}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            }) || (
              <p className="text-xs text-muted-foreground text-center py-6">لا توجد بيانات</p>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Stats Row - Enhanced */}
      <div className="grid gap-2 sm:gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="p-2.5 sm:p-3 border-0 shadow-lg dark:bg-slate-900/50 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 dark:from-cyan-500/30 dark:to-blue-500/30">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">متوسط قيمة الطلب</p>
              <p className="text-sm sm:text-lg font-bold">
                {stats.orders > 0 ? Math.round(stats.revenue / stats.orders).toLocaleString() : 0} <span className="text-xs font-normal text-muted-foreground">دج</span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-2.5 sm:p-3 border-0 shadow-lg dark:bg-slate-900/50 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 dark:from-green-500/30 dark:to-emerald-500/30">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">نسبة النجاح</p>
              <p className="text-sm sm:text-lg font-bold">
                {stats.orders > 0 ? Math.round((stats.completedOrders / stats.orders) * 100) : 0}<span className="text-xs font-normal text-muted-foreground">%</span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-2.5 sm:p-3 border-0 shadow-lg dark:bg-slate-900/50 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 dark:from-amber-500/30 dark:to-orange-500/30">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">طلبات معلقة</p>
              <p className="text-sm sm:text-lg font-bold">{stats.pendingOrders}</p>
            </div>
          </div>
        </Card>

        <Card className="p-2.5 sm:p-3 border-0 shadow-lg dark:bg-slate-900/50 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500/20 to-pink-500/20 dark:from-rose-500/30 dark:to-pink-500/30">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">معدل التحويل</p>
              <p className="text-sm sm:text-lg font-bold">
                {stats.visitors > 0 ? ((stats.orders / stats.visitors) * 100).toFixed(1) : 0}<span className="text-xs font-normal text-muted-foreground">%</span>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
