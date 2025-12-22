import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Package, ShoppingCart, DollarSign, Plus, ArrowRight,
  Clock, CheckCircle, AlertCircle, Users, Star, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sellers, setSellers] = useState<any[]>([]);

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
        setLoading(false);
      }

      const ordersRes = await fetch('/api/client/orders', { headers });
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setRecentOrders(ordersData.slice(0, 5));
      }

      // Remove marketplace seller list from client dashboard
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setLoading(false);
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

      {/* Recent Orders & Quick Actions */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {/* Recent Orders */}
        <Card className="md:col-span-2 lg:col-span-1 xl:col-span-2 bg-panel dark:bg-gray-900 dark:border-gray-700">
          <div className="p-4 border-b border-subtle dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">{t("dashboard.recentOrders")}</h3>
                <p className="text-xs text-muted-soft mt-0.5">{t("dashboard.recentPurchases")}</p>
              </div>
              <Link to="/dashboard/orders">
                <Button variant="ghost" size="sm">
                  {t("dashboard.viewAll")}
                  <ArrowRight className="w-4 h-4 mr-2" />
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="p-4">
            {loading ? (
              <div className="text-center py-6 text-muted-soft">
                <div className="animate-pulse space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-6">
                <ShoppingCart className="w-12 h-12 text-gray-300 dark:text-gray-500 mx-auto mb-2" />
                <p className="text-muted-soft mb-4">{t("dashboard.noOrders")}</p>
                <Link to="/dashboard/preview">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Manage Your Store
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-xl border hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all cursor-pointer group focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2"
                    tabIndex={0}
                    role="button"
                    aria-label={`Order ${order.id}, ${order.items?.length || 0} items, total $${order.total_price || 0}, status ${order.status}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
                        #{order.id?.toString().slice(-3)}
                      </div>
                      <div>
                        <div className="font-bold">{t("orders.orderNumber")} {order.id}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                          <Package className="w-3 h-3" />
                          {order.product_title || 'Product'}
                          <Clock className="w-3 h-3 ml-2" />
                          {new Date(order.created_at || Date.now()).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {order.status === 'completed' ? (
                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                          <CheckCircle className="w-4 h-4" />
                          {t("dashboard.completed")}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400 text-sm font-medium bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-full">
                          <AlertCircle className="w-4 h-4" />
                          {t("dashboard.pending")}
                        </span>
                      )}
                      <div className="text-xl font-black">${order.total_price || 0}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="dark:bg-gray-900 dark:border-gray-700">
          <div className="p-6 border-b border-subtle">
            <h3 className="text-lg font-bold">{t("dashboard.quickActions")}</h3>
            <p className="text-sm text-muted-soft mt-1">{t("dashboard.quickAccess")}</p>
          </div>
          <div className="p-6 space-y-3">
            <Link to="/dashboard/preview" className="block">
              <div 
                className="p-4 rounded-xl bg-blue-500/80 hover:bg-blue-600/80 text-white transition-all cursor-pointer group"
                tabIndex={0}
                role="button"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold">Private Store</div>
                    <div className="text-xs opacity-90">Add products to your store</div>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/dashboard/orders" className="block">
              <div 
                className="p-4 rounded-xl bg-green-500/80 hover:bg-green-600/80 text-white transition-all cursor-pointer group"
                tabIndex={0}
                role="button"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold">{t("dashboard.manageOrders")}</div>
                    <div className="text-xs opacity-90">{t("dashboard.viewOrders")}</div>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/dashboard/analytics" className="block">
              <div 
                className="p-4 rounded-xl bg-purple-500/80 hover:bg-purple-600/80 text-white transition-all cursor-pointer group"
                tabIndex={0}
                role="button"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold">{t("analytics.title")}</div>
                    <div className="text-xs opacity-90">{t("dashboard.viewStats")}</div>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/dashboard/settings" className="block">
              <div 
                className="p-4 rounded-xl bg-orange-500/80 hover:bg-orange-600/80 text-white transition-all cursor-pointer group"
                tabIndex={0}
                role="button"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Star className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold">{t("settings.title")}</div>
                    <div className="text-xs opacity-90">{t("dashboard.storeSettings")}</div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </Card>
      </div>

      {/* Marketplace seller list removed for client dashboard */}
    </div>
  );
}
