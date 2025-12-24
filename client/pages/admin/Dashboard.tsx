import { useEffect, useState } from "react";
import { 
  Package, ShoppingCart, DollarSign, BarChart3, TrendingUp
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";
import { GradientCard } from "@/components/ui/GradientCard";

interface DashboardStats {
  products: number;
  orders: number;
  revenue: number;
  pendingOrders: number;
  completedOrders: number;
  visitors: number;
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

  useEffect(() => {
    loadDashboardData();
    // Refresh stats every 5 seconds for real-time updates
    const interval = setInterval(() => {
      loadDashboardData();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const statsRes = await fetch('/api/dashboard/stats', { headers });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  return (
    <div className="space-y-3 dark:bg-black">
      {/* Top Stats Bar */}
      <div className="grid gap-2 grid-cols-4">
        <GradientCard
          title={t("dashboard.totalOrders")}
          value={loading ? "..." : stats.orders}
          icon={<ShoppingCart className="w-6 h-6 text-blue-600" />}
          from="from-blue-500/20"
          to="to-cyan-500/5"
          border="border-blue-500/30"
          iconBg="bg-blue-500/20"
          valueClassName="text-blue-600 dark:text-blue-400"
        />
        <GradientCard
          title={t("dashboard.revenue")}
          value={loading ? "..." : `$${stats.revenue.toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6 text-emerald-600" />}
          from="from-emerald-500/20"
          to="to-emerald-500/5"
          border="border-emerald-500/30"
          iconBg="bg-emerald-500/20"
          valueClassName="text-emerald-600 dark:text-emerald-400"
        />
        <GradientCard
          title={t("dashboard.visitors")}
          value={loading ? "..." : stats.visitors.toLocaleString()}
          icon={<Users className="w-6 h-6 text-purple-600" />}
          from="from-purple-500/20"
          to="to-pink-500/5"
          border="border-purple-500/30"
          iconBg="bg-purple-500/20"
          valueClassName="text-purple-600 dark:text-purple-400"
        />
        <GradientCard
          title={t("dashboard.products")}
          value={loading ? "..." : stats.products}
          icon={<Package className="w-6 h-6 text-orange-600" />}
          from="from-orange-500/20"
          to="to-red-500/5"
          border="border-orange-500/30"
          iconBg="bg-orange-500/20"
          valueClassName="text-orange-600 dark:text-orange-400"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {/* Sales Chart */}
        <Card className="md:col-span-2 lg:col-span-1 xl:col-span-2 bg-panel dark:bg-gray-900 dark:border-gray-700">
          <div className="p-4 border-b border-subtle dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Store Sales Overview</h3>
                <p className="text-sm text-muted-soft mt-1">Recent purchases from your store</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">{t("dashboard.month")}</Button>
                <Button variant="outline" size="sm">{t("dashboard.year")}</Button>
              </div>
            </div>
          </div>
          <div className="p-4">
            {/* Chart Placeholder with softer bars */}
            <div 
              className="h-40 flex items-end justify-between gap-1"
              role="img"
              aria-label="Bar chart showing monthly sales trends with values ranging from 45% to 95%"
            >
              {[65, 85, 45, 78, 92, 58, 75, 88, 52, 95, 70, 82].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full rounded-t-lg bg-blue-400/70 hover:bg-blue-500/70 transition-all cursor-pointer focus:outline-none"
                    style={{ height: `${height}%` }}
                    tabIndex={0}
                    role="graphics-symbol"
                    aria-label={`Month ${i + 1}: ${height}% of maximum sales`}
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400">{i + 1}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-3 mt-3">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-400/70"></div>
                <span className="text-xs text-muted-soft">Sales</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-400/70"></div>
                <span className="text-xs text-muted-soft">Profits</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Order Status Distribution */}
        <Card className="bg-panel dark:bg-gray-900 dark:border-gray-700">
          <div className="p-4 border-b border-subtle dark:border-gray-800">
            <h3 className="text-base font-bold">{t("dashboard.orderStatus")}</h3>
            <p className="text-xs text-muted-soft mt-0.5">{t("dashboard.orderDistribution")}</p>
          </div>
          <div className="p-4">
            {/* Donut Chart Placeholder */}
            <div className="relative w-36 h-36 mx-auto mb-4">
              <svg 
                className="w-full h-full" 
                viewBox="0 0 100 100"
                role="img"
                aria-label={`Order status distribution: ${stats.completedOrders} completed, ${stats.pendingOrders} pending, ${stats.orders - stats.completedOrders - stats.pendingOrders} cancelled out of ${stats.orders} total orders`}
              >
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="url(#gradient1)"
                  strokeWidth="20"
                  strokeDasharray="75 100"
                  transform="rotate(-90 50 50)"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="url(#gradient2)"
                  strokeWidth="20"
                  strokeDasharray="15 100"
                  strokeDashoffset="-75"
                  transform="rotate(-90 50 50)"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="url(#gradient3)"
                  strokeWidth="20"
                  strokeDasharray="10 100"
                  strokeDashoffset="-90"
                  transform="rotate(-90 50 50)"
                />
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                  <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                  <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#f87171" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-black">{stats.orders}</div>
                  <div className="text-xs text-muted-soft">{t("dashboard.total")}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-card dark:bg-gray-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-400/70"></div>
                  <span className="text-sm font-medium">{t("dashboard.completedOrders")}</span>
                </div>
                <span className="text-sm font-bold">{stats.completedOrders}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-card dark:bg-gray-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-400/70"></div>
                  <span className="text-sm font-medium">{t("dashboard.pendingOrders")}</span>
                </div>
                <span className="text-sm font-bold">{stats.pendingOrders}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-card dark:bg-gray-800/80">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400/70"></div>
                  <span className="text-sm font-medium">{t("dashboard.cancelledOrders")}</span>
                </div>
                <span className="text-sm font-bold">
                  {stats.orders - stats.completedOrders - stats.pendingOrders}
                </span>
              </div>
            </div>
          </div>
        </Card>

      </div>

      {/* Quick Stats - Horizontal Layout */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="bg-panel dark:bg-gray-900 dark:border-gray-700">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-500/20">
                <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-soft">{t("dashboard.avgOrderValue") || "Avg Order Value"}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  ${stats.orders > 0 ? (stats.revenue / stats.orders).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-panel dark:bg-gray-900 dark:border-gray-700">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-500/20">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-soft">{t("dashboard.successRate") || "Success Rate"}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.orders > 0 ? Math.round((stats.completedOrders / stats.orders) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-panel dark:bg-gray-900 dark:border-gray-700">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-500/20">
                <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-soft">{t("dashboard.conversionRate") || "Conversion Rate"}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.visitors > 0 ? Math.round((stats.orders / stats.visitors) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
