
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  // Add Product modal state
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    image: null as File | null,
    published: false,
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    let imageUrl = "";
    if (form.image) {
      try {
        // Optionally implement image upload logic here
        imageUrl = ""; // Placeholder for now
      } catch {
        imageUrl = "";
      }
    }
    // You may want to get storeId from seller or context
    const storeId = seller?.storeId || seller?.id || "";
    const product = {
      storeId,
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
      images: imageUrl ? [imageUrl] : [],
      published: false, // Private by default
    };
    await fetch('/api/store-products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    setShowAdd(false);
    setForm({ title: "", description: "", price: "", category: "", image: null, published: false });
    setSubmitting(false);
    // Refresh seller dashboard data
    window.location.reload();
  }
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>({});
  const [charts, setCharts] = useState<any>({});
  const [seller, setSeller] = useState<any>(null);

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      try {
        // Fetch seller info (simulate or fetch from /api/vendors/me if available)
        // For now, just set a dummy seller with id as storeId
        const vendorRes = await fetch('/api/auth/me', { credentials: 'include' });
        const vendor = await vendorRes.json();
        setSeller(vendor);
        // Fetch products for this vendor
        const productsRes = await fetch('/api/store-products/mine', { credentials: 'include' });
        const products = await productsRes.json();
        setSeller(s => ({ ...s, products }));
        // Optionally set metrics/charts to empty or dummy
        setMetrics({});
        setCharts({});
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
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-pink-500 bg-clip-text text-transparent drop-shadow-neon">{t("Your Products")}</h1>
              <Dialog open={showAdd} onOpenChange={setShowAdd}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-bold px-4 py-2 rounded-xl shadow-lg hover:from-indigo-700 hover:to-cyan-700" onClick={() => setShowAdd(true)}>
                    + Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <h3 className="text-xl font-bold mb-2">Add Product</h3>
                  </DialogHeader>
                  <form onSubmit={handleAddProduct} className="space-y-4">
                    <Input required placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                    <Textarea required placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                    <Input required type="number" min="0" step="0.01" placeholder="Price" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
                    <Input required placeholder="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
                    <Input type="file" accept="image/*" onChange={e => setForm(f => ({ ...f, image: e.target.files?.[0] || null }))} />
                    <DialogFooter>
                      <Button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-bold">
                        {submitting ? "Adding..." : "+ Add Product"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
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

