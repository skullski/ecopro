import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Package, ShoppingCart, DollarSign, TrendingUp, Eye, 
  Plus, ArrowRight, Sparkles, Clock, CheckCircle, 
  AlertCircle, Users, Star, BarChart3, ArrowUpRight,
  Calendar, MapPin, CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTranslation } from "@/lib/i18n";

export default function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({ 
    products: 0, 
    orders: 0, 
    revenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    visitors: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const products = JSON.parse(localStorage.getItem("products") || "[]");
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const revenue = orders.reduce((s:any,o:any)=>s + (o.total || 0), 0);
    const pendingOrders = orders.filter((o:any) => o.status === 'pending').length;
    const completedOrders = orders.filter((o:any) => o.status === 'completed').length;
    
    setStats({ 
      products: products.length, 
      orders: orders.length, 
      revenue,
      pendingOrders,
      completedOrders,
      visitors: Math.floor(Math.random() * 1000) + 500
    });
    
    setRecentOrders(orders.slice(-5).reverse());
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Stats Bar */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-lg">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3" />
                12%
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t("dashboard.totalOrders")}</div>
            <div className="text-3xl font-black">{stats.orders}</div>
            <div className="text-xs text-gray-500 mt-2">{t("dashboard.compared")}</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full blur-3xl"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white shadow-lg">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3" />
                23%
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t("dashboard.revenue")}</div>
            <div className="text-3xl font-black">${stats.revenue.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-2">{t("dashboard.compared")}</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3" />
                8%
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t("dashboard.visitors")}</div>
            <div className="text-3xl font-black">{stats.visitors.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-2">{t("dashboard.compared")}</div>
          </div>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full blur-3xl"></div>
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white shadow-lg">
                <Package className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-full">
                <Clock className="w-3 h-3" />
                {stats.pendingOrders}
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t("dashboard.products")}</div>
            <div className="text-3xl font-black">{stats.products}</div>
            <div className="text-xs text-gray-500 mt-2">{t("dashboard.activeProducts")}</div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sales Chart */}
        <Card className="lg:col-span-2">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">{t("dashboard.salesOverview")}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t("dashboard.recentPurchases")}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">{t("dashboard.month")}</Button>
                <Button variant="outline" size="sm">{t("dashboard.year")}</Button>
              </div>
            </div>
          </div>
          <div className="p-6">
            {/* Chart Placeholder with gradient bars */}
            <div className="h-64 flex items-end justify-between gap-2">
              {[65, 85, 45, 78, 92, 58, 75, 88, 52, 95, 70, 82].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full rounded-t-lg bg-gradient-to-t from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 transition-all cursor-pointer"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-gray-500">{i + 1}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">{t("dashboard.sales")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-400"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">{t("dashboard.profits")}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <div className="p-6 border-b">
            <h3 className="text-lg font-bold">{t("dashboard.orderStatus")}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t("dashboard.orderDistribution")}</p>
          </div>
          <div className="p-6">
            {/* Donut Chart Placeholder */}
            <div className="relative w-48 h-48 mx-auto mb-6">
              <svg className="w-full h-full" viewBox="0 0 100 100">
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
                  <div className="text-xs text-gray-500">{t("dashboard.total")}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-400"></div>
                  <span className="text-sm font-medium">{t("dashboard.completedOrders")}</span>
                </div>
                <span className="text-sm font-bold">{stats.completedOrders}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-yellow-400"></div>
                  <span className="text-sm font-medium">{t("dashboard.pendingOrders")}</span>
                </div>
                <span className="text-sm font-bold">{stats.pendingOrders}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 to-rose-400"></div>
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
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">{t("dashboard.recentOrders")}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t("dashboard.recentPurchases")}</p>
              </div>
              <Link to="/admin/orders">
                <Button variant="ghost" size="sm">
                  {t("dashboard.viewAll")}
                  <ArrowRight className="w-4 h-4 mr-2" />
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            {recentOrders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">{t("dashboard.noOrders")}</p>
                <Link to="/admin/products/add">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    {t("dashboard.addFirstProduct")}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 rounded-xl border hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
                        #{order.id?.slice(-3)}
                      </div>
                      <div>
                        <div className="font-bold">{t("orders.orderNumber")} {order.id}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                          <Package className="w-3 h-3" />
                          {order.items?.length || 0} {t("dashboard.items")}
                          <Clock className="w-3 h-3 mr-2" />
                          {new Date(order.createdAt || Date.now()).toLocaleDateString('ar-DZ')}
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
                      <div className="text-xl font-black">${order.total || 0}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <div className="p-6 border-b">
            <h3 className="text-lg font-bold">{t("dashboard.quickActions")}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t("dashboard.quickAccess")}</p>
          </div>
          <div className="p-6 space-y-3">
            <Link to="/admin/products/add" className="block">
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white transition-all cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold">{t("product.add")}</div>
                    <div className="text-xs opacity-90">{t("dashboard.newProduct")}</div>
                  </div>
                </div>
              </div>
            </Link>

            <Link to="/admin/orders" className="block">
              <div className="p-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white transition-all cursor-pointer group">
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

            <Link to="/admin/analytics" className="block">
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all cursor-pointer group">
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

            <Link to="/admin/settings" className="block">
              <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white transition-all cursor-pointer group">
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
    </div>
  );
}
