
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useTranslation } from "@/lib/i18n";
import { BarChart3, PieChart, Package, ShoppingCart, DollarSign, TrendingUp, Users, Star, LogOut, Settings, Globe, Plus, Edit, Trash2, Eye, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

// Chart.js for visualizations
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const SIDEBAR_LINKS = [
  { label: "Dashboard", icon: <BarChart3 className="w-5 h-5" />, key: "dashboard" },
  { label: "Orders", icon: <ShoppingCart className="w-5 h-5" />, key: "orders" },
  { label: "Products", icon: <Package className="w-5 h-5" />, key: "products" },
  { label: "Categories", icon: <Globe className="w-5 h-5" />, key: "categories" },
  { label: "Delivery", icon: <Settings className="w-5 h-5" />, key: "delivery" },
  { label: "Reviews", icon: <Star className="w-5 h-5" />, key: "reviews" },
  { label: "Promo Codes", icon: <DollarSign className="w-5 h-5" />, key: "promos" },
  { label: "Domains", icon: <Globe className="w-5 h-5" />, key: "domains" },
  { label: "Analytics", icon: <TrendingUp className="w-5 h-5" />, key: "analytics" },
];

export default function VendorDashboard() {
  const { theme, toggle } = useTheme();
  const { t, locale, setLocale } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>({});
  const [charts, setCharts] = useState<any>({});
  const [seller, setSeller] = useState<any>(null);

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      try {
        // Fetch all dashboard data from backend
        const res = await fetch("/api/seller/dashboard", { credentials: "include" });
        const data = await res.json();
        setSeller(data.seller);
        setMetrics(data.metrics);
        setCharts(data.charts);
      } catch (e) {
        setSeller(null);
        setMetrics({});
        setCharts({});
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  function handleLogout() {
    localStorage.removeItem("user");
    navigate("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f1021] via-[#181a2a] to-[#1a1a2e]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-accent-200">{t("Loading your dashboard...")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen flex", theme === "dark" ? "bg-gradient-to-br from-[#0f1021] via-[#181a2a] to-[#1a1a2e] text-white" : "bg-gradient-to-br from-white via-blue-50 to-purple-100 text-gray-900")}> 
      {/* Sidebar */}
      <aside className="w-20 md:w-64 flex-shrink-0 bg-gradient-to-br from-[#232325]/80 via-[#232325]/90 to-[#1a1a2e]/90 border-r border-accent/20 flex flex-col items-center py-8 gap-6 shadow-2xl">
        <div className="mb-8 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-accent to-purple-600 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg mb-2">
            {seller?.businessName?.charAt(0).toUpperCase() || "S"}
          </div>
          <div className="text-lg font-bold text-accent-200 text-center">{seller?.businessName}</div>
        </div>
        <nav className="flex flex-col gap-2 w-full">
          {SIDEBAR_LINKS.map(link => (
            <button
              key={link.key}
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all hover:bg-accent/10 hover:text-accent-200",
                activeTab === link.key ? "bg-accent/20 text-accent-200" : "text-accent-100"
              )}
              onClick={() => setActiveTab(link.key)}
            >
              {link.icon}
              <span className="hidden md:inline-block">{t(link.label)}</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2 w-full px-6">
          <button onClick={toggle} className="w-full py-2 rounded-lg bg-accent/10 text-accent-200 font-semibold mb-2">{theme === "dark" ? t("Light Mode") : t("Dark Mode")}</button>
          <select value={locale} onChange={e => setLocale(e.target.value as any)} className="w-full py-2 rounded-lg bg-accent/10 text-accent-200 font-semibold">
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
          <button onClick={handleLogout} className="w-full py-2 rounded-lg bg-red-500/20 text-red-500 font-semibold mt-2 flex items-center justify-center gap-2"><LogOut className="w-5 h-5" />{t("Logout")}</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 flex flex-col gap-8 animate-fade-in">
        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <section>
            <h1 className="text-3xl font-extrabold mb-6 bg-gradient-to-r from-purple-400 via-blue-400 to-pink-500 bg-clip-text text-transparent drop-shadow-neon">{t("Seller Dashboard")}</h1>
            {/* Live Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="bg-white/10 rounded-2xl p-6 flex flex-col items-center shadow-lg border border-accent/20">
                <span className="text-xs text-accent-200 mb-1">{t("Total Orders")}</span>
                <span className="text-3xl font-black text-accent-100">{metrics.totalOrders}</span>
                <span className="text-xs text-green-400 mt-1">{metrics.ordersGrowth}% {t("growth")}</span>
              </div>
              <div className="bg-white/10 rounded-2xl p-6 flex flex-col items-center shadow-lg border border-accent/20">
                <span className="text-xs text-accent-200 mb-1">{t("Revenue")}</span>
                <span className="text-3xl font-black text-accent-100">{metrics.revenue} DZD</span>
                <span className="text-xs text-green-400 mt-1">{metrics.revenueGrowth}% {t("growth")}</span>
              </div>
              <div className="bg-white/10 rounded-2xl p-6 flex flex-col items-center shadow-lg border border-accent/20">
                <span className="text-xs text-accent-200 mb-1">{t("Visitors")}</span>
                <span className="text-3xl font-black text-accent-100">{metrics.visitors}</span>
                <span className="text-xs text-green-400 mt-1">{metrics.visitorsGrowth}% {t("growth")}</span>
              </div>
              <div className="bg-white/10 rounded-2xl p-6 flex flex-col items-center shadow-lg border border-accent/20">
                <span className="text-xs text-accent-200 mb-1">{t("Active Products")}</span>
                <span className="text-3xl font-black text-accent-100">{metrics.activeProducts}</span>
                <span className="text-xs text-green-400 mt-1">{metrics.productsGrowth}% {t("growth")}</span>
              </div>
              <div className="bg-white/10 rounded-2xl p-6 flex flex-col items-center shadow-lg border border-accent/20">
                <span className="text-xs text-accent-200 mb-1">{t("Growth")}</span>
                <span className="text-3xl font-black text-accent-100">{metrics.growthPercent}%</span>
                <span className="text-xs text-green-400 mt-1">{t("overall")}</span>
              </div>
            </div>
            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/10 rounded-2xl p-6 shadow-lg border border-accent/20">
                <h2 className="text-lg font-bold mb-4 text-accent-200">{t("Sales & Profits")}</h2>
                <Line data={charts.salesLine} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </div>
              <div className="bg-white/10 rounded-2xl p-6 shadow-lg border border-accent/20">
                <h2 className="text-lg font-bold mb-4 text-accent-200">{t("Order Status")}</h2>
                <Pie data={charts.orderStatusPie} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
              </div>
            </div>
          </section>
        )}
        {/* Products Tab */}
        {activeTab === "products" && (
          <section>
            <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-blue-400 to-pink-500 bg-clip-text text-transparent drop-shadow-neon">{t("Your Products")}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(seller?.products || []).map((product: any) => (
                <div key={product.id} className="bg-white/10 rounded-2xl p-6 shadow-lg border border-accent/20 flex flex-col gap-2">
                  <div className="flex items-center gap-3 mb-2">
                    <img src={product.images?.[0] || "/demo/product1.jpg"} alt={product.title} className="w-16 h-16 object-cover rounded-xl border border-accent/20" />
                    <div className="flex-1">
                      <div className="font-bold text-lg line-clamp-1">{product.title}</div>
                      <div className="text-accent-200 text-xs">{product.category}</div>
                    </div>
                    <span className={cn("px-3 py-1 rounded-full text-xs font-bold", product.published ? "bg-green-500/20 text-green-500" : "bg-gray-500/20 text-gray-500")}>{product.published ? t("Public") : t("Private")}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      size="sm"
                      variant={product.published ? "outline" : "default"}
                      className={product.published ? "border-green-500 text-green-600" : ""}
                      onClick={async () => {
                        await fetch(`/api/items/${product.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ published: !product.published })
                        });
                        // Refresh seller dashboard data
                        window.location.reload();
                      }}
                    >
                      {product.published ? t("Unpublish") : t("Export to Marketplace")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

