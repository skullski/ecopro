import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DarkModeInput } from "@/components/ui/dark-mode-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  ArrowRight,
  Users,
  Heart,
} from "lucide-react";
import type { Vendor, MarketplaceProduct } from "@shared/types";
import * as api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
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
    
    setVendor(vendorData);

    // Load vendor's products
    const allProducts = JSON.parse(localStorage.getItem("marketplaceProducts") || "[]");
    const vendorProducts = allProducts.filter((p: MarketplaceProduct) => p.vendorId === id);
    setProducts(vendorProducts);
  }, [id, navigate]);

  function handleAddProduct() {
    if (!vendor?.isVIP) {
      toast({ title: 'Upgrade required', description: 'Management tools are available for VIP accounts. Start a 7-day free trial or upgrade to manage your store.' });
      navigate('/vendor/upgrade');
      return;
    }
    const newProduct: MarketplaceProduct = {
      id: `prod_${Date.now()}`,
      vendorId: vendor!.id,
      title: productForm.title,
      description: productForm.description,
      price: parseFloat(productForm.price),
      images: ["https://via.placeholder.com/400x300?text=" + encodeURIComponent(productForm.title)],
      category: productForm.category,
      condition: productForm.condition,
      quantity: parseInt(productForm.quantity),
      status: "active",
      createdAt: Date.now(),
      views: 0,
      favorites: 0,
      tags: productForm.tags.split(",").map(t => t.trim()).filter(Boolean),
      isExportedToMarketplace: true,
      featured: false,
      updatedAt: Date.now(),
    };

    const allProducts = JSON.parse(localStorage.getItem("marketplaceProducts") || "[]");
    allProducts.push(newProduct);
    localStorage.setItem("marketplaceProducts", JSON.stringify(allProducts));
    setProducts([...products, newProduct]);
    setIsAddingProduct(false);
    resetForm();
  }

  // Claim a public product by ownerKey (used when vendor wants to claim an anonymous product)
  async function claimPublicProduct(productId: string, ownerKey: string) {
    if (!vendor?.isVIP) {
      toast({ title: 'Upgrade required', description: 'Claiming products requires a VIP subscription.' });
      return;
    }
    try {
      await api.claimProduct(productId, ownerKey);
      // Refresh products locally
      const allProducts = JSON.parse(localStorage.getItem('marketplaceProducts') || '[]');
      const claimed = allProducts.map((p: any) => p.id === productId ? { ...p, vendorId: id } : p);
      localStorage.setItem('marketplaceProducts', JSON.stringify(claimed));
      setProducts(claimed.filter((p: any) => p.vendorId === id));
    } catch (err) {
      alert('Failed to claim product: ' + ((err as any).message || 'Unknown'));
    }
  }

  async function claimByEmail() {
    if (!vendor?.isVIP) {
      toast({ title: 'Upgrade required', description: 'Claiming by email requires a VIP subscription.' });
      return;
    }
    try {
      const res = await api.claimProductsByEmail();
      if (res.products?.length) {
        alert(`Claimed ${res.products.length} products`);
      } else {
        alert('No products claimed for your email');
      }
      // Refresh vendor products
      const allProducts = JSON.parse(localStorage.getItem('marketplaceProducts') || '[]');
      const vendorProducts = allProducts.filter((p: any) => p.vendorId === id);
      setProducts(vendorProducts);
    } catch (err) {
      alert('Failed to claim by email');
    }
  }

  function handleEditProduct() {
    if (!vendor?.isVIP) {
      toast({ title: 'Upgrade required', description: 'Editing products requires a VIP subscription.' });
      navigate('/vendor/upgrade');
      return;
    }
    if (!editingProduct) return;

    const updatedProduct = {
      ...editingProduct,
      title: productForm.title,
      description: productForm.description,
      price: parseFloat(productForm.price),
      category: productForm.category,
      condition: productForm.condition,
      quantity: parseInt(productForm.quantity),
      tags: productForm.tags.split(",").map(t => t.trim()).filter(Boolean),
    };

    const allProducts = JSON.parse(localStorage.getItem("marketplaceProducts") || "[]");
    const updated = allProducts.map((p: MarketplaceProduct) =>
      p.id === updatedProduct.id ? updatedProduct : p
    );
    localStorage.setItem("marketplaceProducts", JSON.stringify(updated));
    setProducts(products.map(p => (p.id === updatedProduct.id ? updatedProduct : p)));
    setEditingProduct(null);
    resetForm();
  }

  function handleDeleteProduct(productId: string) {
    if (!vendor?.isVIP) {
      toast({ title: 'Upgrade required', description: 'Deleting products requires a VIP subscription.' });
      return;
    }
    if (!confirm("Are you sure you want to delete this product?")) return;

    const allProducts = JSON.parse(localStorage.getItem("marketplaceProducts") || "[]");
    const filtered = allProducts.filter((p: MarketplaceProduct) => p.id !== productId);
    localStorage.setItem("marketplaceProducts", JSON.stringify(filtered));
    setProducts(products.filter(p => p.id !== productId));
  }

  function toggleExportToMarketplace(productId: string) {
    const allProducts = JSON.parse(localStorage.getItem("marketplaceProducts") || "[]");
    const updated = allProducts.map((p: MarketplaceProduct) =>
      p.id === productId ? { ...p, isExportedToMarketplace: !p.isExportedToMarketplace } : p
    );
    localStorage.setItem("marketplaceProducts", JSON.stringify(updated));
    setProducts(products.map(p =>
      p.id === productId ? { ...p, isExportedToMarketplace: !p.isExportedToMarketplace } : p
    ));
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
    navigate("/store");
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = {
    totalViews: products.reduce((sum, p) => sum + p.views, 0),
    totalFavorites: products.reduce((sum, p) => sum + p.favorites, 0),
    activeProducts: products.filter(p => p.status === "active").length,
    totalRevenue: vendor.totalSales * 150,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-600 flex items-center justify-center text-white font-bold text-xl">
                {vendor.businessName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold">{vendor.businessName}</h1>
                <div className="flex items-center gap-2">
                  {vendor.verified && (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {vendor.isVIP && (
                    <Badge className="bg-gradient-to-r from-indigo-600 to-cyan-600 text-white">
                      VIP
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!vendor.isVIP && (
                <Link to="/vendor/upgrade">
                  <Button className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white">
                    <Star className="h-4 w-4 mr-2" />
                    Upgrade to VIP
                  </Button>
                </Link>
              )}
              <Link to={`/store/${vendor.storeSlug}`}>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Store
                </Button>
              </Link>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
              <Button onClick={claimByEmail} variant="outline">Claim items by email</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-xs text-green-600 dark:text-green-400">+12%</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
            <p className="text-3xl font-black mt-1">{stats.totalViews.toLocaleString()}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
                <Package className="w-6 h-6" />
              </div>
              <span className="text-xs text-green-600 dark:text-green-400">Active</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Products</p>
            <p className="text-3xl font-black mt-1">{stats.activeProducts}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                <Heart className="w-6 h-6" />
              </div>
              <span className="text-xs text-green-600 dark:text-green-400">+8%</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Favorites</p>
            <p className="text-3xl font-black mt-1">{stats.totalFavorites}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white">
                <DollarSign className="w-6 h-6" />
              </div>
              <span className="text-xs text-green-600 dark:text-green-400">+15%</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
            <p className="text-3xl font-black mt-1">${stats.totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-6 px-6">
              <button
                onClick={() => setActiveTab("products")}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === "products"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <Package className="w-5 h-5 inline-block mr-2" />
                Products ({products.length})
              </button>
              <button
                onClick={() => setActiveTab("stats")}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === "stats"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <BarChart3 className="w-5 h-5 inline-block mr-2" />
                Analytics
              </button>
            </div>
          </div>

          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Your Products</h2>
                <Button
                  onClick={() => setIsAddingProduct(true)}
                  className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Product
                </Button>
              </div>

              {/* Product List */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="group relative bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
                  >
                    <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 overflow-hidden">
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="font-bold mb-2 truncate">{product.title}</h3>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-black text-indigo-600">${product.price}</span>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Eye className="w-4 h-4" /> {product.views}
                        <Heart className="w-4 h-4" /> {product.favorites}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setEditingProduct(product);
                          setProductForm({
                            title: product.title,
                            description: product.description || "",
                            price: product.price.toString(),
                            category: product.category,
                            condition: product.condition,
                            quantity: product.quantity.toString(),
                            tags: product.tags?.join(", ") || "",
                          });
                        }}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleExportToMarketplace(product.id)}
                        className={product.isExportedToMarketplace ? "border-green-500 text-green-600" : ""}
                      >
                        <Globe className="w-4 h-4 mr-1" />
                        {product.isExportedToMarketplace ? "Public" : "Private"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {products.length === 0 && (
                <div className="text-center py-20">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">No products yet</p>
                  <Button onClick={() => setIsAddingProduct(true)}>Add Your First Product</Button>
                </div>
              )}
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === "stats" && (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Analytics Dashboard</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <h3 className="font-bold mb-4">Performance Overview</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Product Views</span>
                        <span className="font-bold">{stats.totalViews}</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: "75%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Favorites</span>
                        <span className="font-bold">{stats.totalFavorites}</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: "60%" }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                  <h3 className="font-bold mb-4">Sales Summary</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Sales</span>
                      <span className="font-bold">{vendor.totalSales}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Revenue</span>
                      <span className="font-bold">${stats.totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Rating</span>
                      <span className="font-bold flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {vendor.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {(isAddingProduct || editingProduct) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAddingProduct(false);
                  setEditingProduct(null);
                  resetForm();
                }}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <Label>Product Title</Label>
                <DarkModeInput
                  value={productForm.title}
                  onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                  placeholder="Enter product title"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Describe your product"
                  rows={4}
                  className="bg-background"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price ($)</Label>
                  <DarkModeInput
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label>Quantity</Label>
                  <DarkModeInput
                    type="number"
                    value={productForm.quantity}
                    onChange={(e) => setProductForm({ ...productForm, quantity: e.target.value })}
                    placeholder="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Condition</Label>
                  <select
                    value={productForm.condition}
                    onChange={(e) => setProductForm({ ...productForm, condition: e.target.value as any })}
                    className="w-full px-3 py-2 bg-background border border-input rounded-lg"
                  >
                    <option value="new">New</option>
                    <option value="used">Used</option>
                    <option value="refurbished">Refurbished</option>
                  </select>
                </div>
              </div>

              <div>
                <Label>Tags (comma separated)</Label>
                <DarkModeInput
                  value={productForm.tags}
                  onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })}
                  placeholder="electronics, gadgets, tech"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={editingProduct ? handleEditProduct : handleAddProduct}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white"
                  disabled={!productForm.title || !productForm.price}
                >
                  <Save className="w-5 h-5 mr-2" />
                  {editingProduct ? "Update Product" : "Add Product"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingProduct(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
