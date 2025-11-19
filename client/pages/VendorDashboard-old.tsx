import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DarkModeInput } from "@/components/ui/dark-mode-input";
import { DarkModeSelect } from "@/components/ui/dark-mode-select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FloatingShapes } from "@/components/ui/floating-shapes";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Star,
  Upload,
  Save,
  X,
  BarChart3,
  Settings,
  LogOut,
  Sparkles,
  Globe,
} from "lucide-react";
import type { Vendor, MarketplaceProduct } from "@shared/types";
import * as api from "@/lib/api";

const CATEGORIES = [
  "electronics",
  "fashion",
  "home",
  "sports",
  "beauty",
  "automotive",
  "books",
  "toys",
  "food",
  "other",
];

export default function VendorDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MarketplaceProduct | null>(null);
  const [activeTab, setActiveTab] = useState<"products" | "stats">("products");

  const [productForm, setProductForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "electronics",
    condition: "new" as "new" | "used" | "refurbished",
    quantity: "1",
    tags: "",
  });

  useEffect(() => {
    // Load vendor data
    const vendors = JSON.parse(localStorage.getItem("vendors") || "[]");
    let vendorData = vendors.find((v: Vendor) => v.id === id);
    
    if (!vendorData) {
      navigate("/vendor/signup");
      return;
    }
    
    // Migrate old vendor without new fields
    if (!vendorData.storeSlug) {
      const storeSlug = vendorData.businessName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim() + `-${vendorData.id.split('_')[1]}`;
      
      vendorData = {
        ...vendorData,
        storeSlug,
        isVIP: vendorData.isVIP ?? false,
        subscriptionStatus: vendorData.subscriptionStatus ?? 'free',
      };
      
      // Update in localStorage
      const updatedVendors = vendors.map((v: Vendor) => 
        v.id === vendorData.id ? vendorData : v
      );
      localStorage.setItem("vendors", JSON.stringify(updatedVendors));
    }
    
    setVendor(vendorData);

    // Load vendor's products and migrate old products
    const allProducts = JSON.parse(localStorage.getItem("marketplaceProducts") || "[]");
    
    // Fix old products that don't have isExportedToMarketplace field
    let needsUpdate = false;
    const migratedProducts = allProducts.map((p: MarketplaceProduct) => {
      if (p.isExportedToMarketplace === undefined) {
        needsUpdate = true;
        return { ...p, isExportedToMarketplace: true };
      }
      return p;
    });
    
    if (needsUpdate) {
      localStorage.setItem("marketplaceProducts", JSON.stringify(migratedProducts));
    }
    
    const vendorProducts = migratedProducts.filter((p: MarketplaceProduct) => p.vendorId === id);
    setProducts(vendorProducts);
  }, [id, navigate]);

  function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();

    const newProduct: MarketplaceProduct = {
      id: `prod_${Date.now()}`,
      vendorId: vendor!.id,
      title: productForm.title,
      description: productForm.description,
      price: parseFloat(productForm.price),
      images: [],
      category: productForm.category,
      condition: productForm.condition,
      quantity: parseInt(productForm.quantity),
      featured: false,
      status: "active",
      isExportedToMarketplace: true, // Products visible in main store by default
      views: 0,
      favorites: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: productForm.tags.split(",").map(t => t.trim()).filter(Boolean),
      shippingOptions: {
        freeShipping: false,
        domesticShipping: true,
        internationalShipping: false,
        estimatedDays: 3,
      },
    };

    const allProducts = JSON.parse(localStorage.getItem("marketplaceProducts") || "[]");
    allProducts.push(newProduct);
    localStorage.setItem("marketplaceProducts", JSON.stringify(allProducts));

    setProducts([...products, newProduct]);
    setIsAddingProduct(false);
    resetForm();

    // Update vendor product count
    if (vendor) {
      const updatedVendor = { ...vendor, totalProducts: vendor.totalProducts + 1 };
      updateVendorData(updatedVendor);
    }
  }

  function handleDeleteProduct(productId: string) {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;

    const allProducts = JSON.parse(localStorage.getItem("marketplaceProducts") || "[]");
    const filtered = allProducts.filter((p: MarketplaceProduct) => p.id !== productId);
    localStorage.setItem("marketplaceProducts", JSON.stringify(filtered));

    setProducts(products.filter(p => p.id !== productId));

    if (vendor) {
      const updatedVendor = { ...vendor, totalProducts: vendor.totalProducts - 1 };
      updateVendorData(updatedVendor);
    }
  }

  function updateVendorData(updatedVendor: Vendor) {
    const vendors = JSON.parse(localStorage.getItem("vendors") || "[]");
    const index = vendors.findIndex((v: Vendor) => v.id === updatedVendor.id);
    if (index !== -1) {
      vendors[index] = updatedVendor;
      localStorage.setItem("vendors", JSON.stringify(vendors));
      setVendor(updatedVendor);
    }
  }

  function toggleExportToMarketplace(productId: string) {
    const allProducts = JSON.parse(localStorage.getItem("marketplaceProducts") || "[]");
    const productIndex = allProducts.findIndex((p: MarketplaceProduct) => p.id === productId);
    
    if (productIndex !== -1) {
      allProducts[productIndex].isExportedToMarketplace = !allProducts[productIndex].isExportedToMarketplace;
      localStorage.setItem("marketplaceProducts", JSON.stringify(allProducts));
      
      // Update local state
      setProducts(products.map(p => 
        p.id === productId 
          ? { ...p, isExportedToMarketplace: !p.isExportedToMarketplace }
          : p
      ));
    }
  }

  function resetForm() {
    setProductForm({
      title: "",
      description: "",
      price: "",
      category: "electronics",
      condition: "new",
      quantity: "1",
      tags: "",
    });
  }

  function handleLogout() {
    localStorage.removeItem("currentVendor");
  navigate("/marketplace");
  }

  if (!vendor) {
    return <div className="container mx-auto py-20 text-center">جاري التحميل...</div>;
  }

  const stats = {
    totalViews: products.reduce((sum, p) => sum + p.views, 0),
    totalFavorites: products.reduce((sum, p) => sum + p.favorites, 0),
    activeProducts: products.filter(p => p.status === "active").length,
    totalRevenue: vendor.totalSales * 150, // Average sale value
  };

  return (
    <section className="relative min-h-screen bg-background">
      <FloatingShapes variant="section" colors="primary" />

      <div className="container mx-auto py-8 relative z-10">
        {/* Header */}
        <div className="mb-8 p-6 rounded-2xl bg-card border-2 border-border shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-2">
                لوحة تحكم البائع
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-lg font-semibold">{vendor.businessName}</span>
                {vendor.verified && (
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                    <Sparkles className="h-3 w-3 mr-1" />
                    موثق
                  </Badge>
                )}
                {vendor.isVIP && (
                  <Badge className="bg-gradient-to-r from-primary to-accent text-white">
                    VIP
                  </Badge>
                )}
                <span className="text-sm text-muted-foreground">
                  {products.length} منتج
                </span>
              </div>
              {/* Store Link */}
              <div className="mt-3 flex items-center gap-2">
                <Link 
                  to={`/marketplace/${vendor.storeSlug}`}
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  <Globe className="h-4 w-4" />
                  متجرك: /store/{vendor.storeSlug}
                </Link>
              </div>
            </div>
            <div className="flex gap-3">
              {!vendor.isVIP && (
                <Link to="/vendor/upgrade">
                  <Button className="bg-gradient-to-r from-primary to-accent text-white">
                    <Star className="h-4 w-4 mr-2" />
                    ترقية لـ VIP
                  </Button>
                </Link>
              )}
              <Link to="/marketplace">
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  السوق الكبير
                </Button>
              </Link>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                خروج
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-2 border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <Package className="h-8 w-8 text-blue-500" />
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold">{stats.activeProducts}</div>
            <div className="text-sm text-muted-foreground">منتج نشط</div>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/20">
            <Eye className="h-8 w-8 text-purple-500 mb-2" />
            <div className="text-3xl font-bold">{stats.totalViews}</div>
            <div className="text-sm text-muted-foreground">إجمالي المشاهدات</div>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 border-2 border-orange-500/20">
            <Star className="h-8 w-8 text-orange-500 mb-2" />
            <div className="text-3xl font-bold">{stats.totalFavorites}</div>
            <div className="text-sm text-muted-foreground">مفضلة</div>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-500/20">
            <DollarSign className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-3xl font-bold">${stats.totalRevenue}</div>
            <div className="text-sm text-muted-foreground">إجمالي المبيعات</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b-2 border-border">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === "products"
                ? "text-primary border-b-2 border-primary -mb-0.5"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Package className="h-4 w-4 inline mr-2" />
            منتجاتي
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === "stats"
                ? "text-primary border-b-2 border-primary -mb-0.5"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart3 className="h-4 w-4 inline mr-2" />
            الإحصائيات
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">إدارة المنتجات</h2>
              <Button
                onClick={() => setIsAddingProduct(true)}
                className="bg-gradient-to-r from-primary to-accent text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                إضافة منتج جديد
              </Button>
            </div>

            {/* Add/Edit Product Form */}
            {(isAddingProduct || editingProduct) && (
              <div className="mb-8 p-6 rounded-2xl bg-card border-2 border-primary/20 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">
                    {editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsAddingProduct(false);
                      setEditingProduct(null);
                      resetForm();
                    }}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div>
                    <Label htmlFor="title">اسم المنتج *</Label>
                    <DarkModeInput
                      id="title"
                      required
                      value={productForm.title}
                      onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                      placeholder="مثال: هاتف ذكي Samsung Galaxy S23"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">الوصف</Label>
                    <Textarea
                      id="description"
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      placeholder="أضف وصف تفصيلي للمنتج..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">السعر ($) *</Label>
                      <DarkModeInput
                        id="price"
                        type="number"
                        step="0.01"
                        required
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        placeholder="99.99"
                      />
                    </div>

                    <div>
                      <Label htmlFor="quantity">الكمية *</Label>
                      <DarkModeInput
                        id="quantity"
                        type="number"
                        required
                        value={productForm.quantity}
                        onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                        placeholder="1"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">الفئة *</Label>
                      <DarkModeSelect
                        id="category"
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </DarkModeSelect>
                    </div>

                    <div>
                      <Label htmlFor="condition">الحالة *</Label>
                      <DarkModeSelect
                        id="condition"
                        value={productForm.condition}
                        onChange={(e: any) => setProductForm({ ...productForm, condition: e.target.value })}
                      >
                        <option value="new">جديد</option>
                        <option value="used">مستعمل</option>
                        <option value="refurbished">مجدد</option>
                      </DarkModeSelect>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tags">الوسوم (مفصولة بفاصلة)</Label>
                    <DarkModeInput
                      id="tags"
                      value={productForm.tags}
                      onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })}
                      placeholder="إلكترونيات, هواتف, سامسونج"
                    />
                  </div>

                  <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent text-white">
                    <Save className="h-4 w-4 mr-2" />
                    حفظ المنتج
                  </Button>
                </form>
              </div>
            )}

            {/* Products List */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.length === 0 ? (
                <div className="col-span-full text-center py-20">
                  <Package className="h-24 w-24 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">لا توجد منتجات بعد</h3>
                  <p className="text-muted-foreground mb-6">ابدأ بإضافة منتجك الأول</p>
                  <Button onClick={() => setIsAddingProduct(true)} className="bg-gradient-to-r from-primary to-accent text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    إضافة منتج
                  </Button>
                </div>
              ) : (
                products.map((product) => (
                  <div
                    key={product.id}
                    className="p-4 rounded-xl bg-card border-2 border-border hover:border-primary/50 transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <Badge
                        className={
                          product.status === "active"
                            ? "bg-green-500/10 text-green-500 border-green-500/20"
                            : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                        }
                      >
                        {product.status === "active" ? "نشط" : "غير نشط"}
                      </Badge>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    <div className="h-32 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-3">
                      <Package className="h-12 w-12 text-primary/30" />
                    </div>

                    <h3 className="font-bold mb-2 line-clamp-2">{product.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">${product.price}</span>
                      <span className="text-sm text-muted-foreground">الكمية: {product.quantity}</span>
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {product.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {product.favorites}
                      </span>
                    </div>

                    {/* Export to Marketplace Toggle */}
                    <div className="mt-4 pt-4 border-t border-border">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={product.isExportedToMarketplace}
                          onChange={() => toggleExportToMarketplace(product.id)}
                          className="w-5 h-5 rounded border-2 border-primary text-primary focus:ring-2 focus:ring-primary cursor-pointer"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm group-hover:text-primary transition-colors">
                            {product.isExportedToMarketplace ? "✅ معروض في السوق الكبير" : "📦 خاص بمتجري فقط"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {product.isExportedToMarketplace 
                              ? "الجميع يمكنهم رؤية هذا المنتج"
                              : "فقط زوار متجرك يمكنهم رؤيته"}
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === "stats" && (
          <div className="p-8 rounded-2xl bg-card border-2 border-border">
            <h2 className="text-2xl font-bold mb-6">إحصائيات مفصلة</h2>
            <div className="text-center py-20 text-muted-foreground">
              <BarChart3 className="h-24 w-24 mx-auto mb-4 opacity-30" />
              <p>الإحصائيات التفصيلية قريباً...</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
