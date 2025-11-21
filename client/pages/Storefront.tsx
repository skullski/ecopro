import { useParams, Link } from "react-router-dom";
import type { StoreSettings, Product } from "@shared/types";
import { useState, useEffect, useMemo } from "react";
import * as api from "@/lib/api";
import { DarkModeInput } from "@/components/ui/dark-mode-input";
import { DarkModeSelect } from "@/components/ui/dark-mode-select";
import { FloatingShapes } from "@/components/ui/floating-shapes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Store as StoreIcon, 
  ShoppingCart, 
  Settings, 
  Sparkles,
  Star,
  Heart,
  Filter,
  Grid3x3,
  List,
  TrendingUp,
  Package,
  ChevronDown,
  Eye,
  Zap,
  Award,
  Percent,
  MapPin,
  Phone,
  Mail
} from "lucide-react";

export default function Storefront() {
  const { id } = useParams();
  const [store, setStore] = useState<StoreSettings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [cart, setCart] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    async function loadStoreAndProducts() {
      // Fetch store info from backend
      try {
        const storeData = await api.fetchStoreById(id);
        setStore(storeData);
      } catch (err) {
        setStore(null);
      }
      // Fetch only this seller's products (private store)
      try {
        const storeProducts = await api.fetchProductsByStore(id);
        setProducts(storeProducts);
      } catch (err) {
        setProducts([]);
      }
    }
    loadStoreAndProducts();
    setCart([]); // No localStorage cart
  }, [id]);

  // Get unique categories from products
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return ["all", ...Array.from(cats)];
  }, [products]);

  // Filtering and sorting
  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => {
      const matchesSearch = !searchQuery || 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
      return matchesSearch && matchesCategory && p.inStock;
    });

    // Sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        filtered.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case "featured":
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return filtered;
  }, [products, searchQuery, selectedCategory, sortBy]);

  function addToCart(product: Product) {
    const newCart = [...cart, product];
    setCart(newCart);
    localStorage.setItem(`cart_${id}`, JSON.stringify(newCart));
  }

  function toggleWishlist(productId: string) {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  }

  if (!store) {
    return (
      <section className="container mx-auto py-20">
        <div className="mx-auto max-w-md text-center">
          <StoreIcon className="h-24 w-24 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">المتجر غير موجود</h2>
          <p className="text-muted-foreground">تأكد من رابط المتجر أو تواصل مع الدعم.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen bg-background">
      <FloatingShapes variant="section" colors="primary" />
      
      {/* Promotional Banner */}
      <div className="bg-gradient-to-r from-primary via-accent to-orange-500 text-white py-2.5 px-4 text-center text-sm font-medium relative z-10">
        <Percent className="inline h-4 w-4 mr-2" />
        عروض حصرية - شحن مجاني على جميع المنتجات
      </div>

      <div className="container mx-auto py-6 relative z-10">
        {/* Store Header - Professional Layout */}
        <div className="mb-8 p-6 md:p-8 rounded-2xl bg-card border-2 border-border shadow-xl">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="flex items-start gap-4 flex-1">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg flex-shrink-0">
                <StoreIcon className="h-10 w-10 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-2">
                  {store.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-4 w-4 text-accent" />
                    {store.owner}
                  </span>
                  <span className="flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    {products.length} منتج
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    4.8 (256 تقييم)
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                    <Award className="h-3 w-3 mr-1" />
                    متجر موثوق
                  </Badge>
                  <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
                    شحن سريع
                  </Badge>
                  {/* No premium logic: platform is 100% free */}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:shadow-xl transition-all w-full md:w-auto"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                السلة ({cart.length})
              </Button>
              {/* No dashboard/settings for buyers; platform is 100% free */}
            </div>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="mb-6 px-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            {store.layout?.showSearch && (
              <div className="flex-1 relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <DarkModeInput
                  type="search"
                  placeholder="ابحث في منتجات المتجر..."
                  className="w-full pr-12 pl-4 py-6 rounded-xl border-2 border-border focus:border-primary/50 shadow-sm text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}

            {/* Sort and View Controls */}
            <div className="flex gap-3">
              <DarkModeSelect value={sortBy} onChange={(e) => setSortBy((e.target as HTMLSelectElement).value)}>
                <option value="featured">مميز</option>
                <option value="price-low">السعر: الأقل</option>
                <option value="price-high">السعر: الأعلى</option>
                <option value="newest">الأحدث</option>
              </DarkModeSelect>

              {/* View Toggle */}
              <div className="flex gap-1 bg-card border-2 border-border rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-all ${
                    viewMode === "grid" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Grid3x3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-all ${
                    viewMode === "list" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        {store.layout?.showCategories && categories.length > 1 && (
          <div className="mb-6 px-4">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2.5 rounded-full font-medium transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg scale-105"
                      : "bg-card hover:bg-accent/10 text-foreground border-2 border-border"
                  }`}
                >
                  {cat === "all" ? "الكل" : cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4 px-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            {filteredProducts.length} منتج متاح
          </p>
        </div>

        {/* Products Grid */}
        <div className="px-4">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <Package className="h-24 w-24 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {products.length === 0 ? "لا توجد منتجات في هذا المتجر بعد" : "لا توجد نتائج"}
              </h3>
              <p className="text-muted-foreground">
                {products.length === 0 
                  ? "يعمل صاحب المتجر على إضافة منتجات جديدة قريباً"
                  : "جرب تعديل البحث أو الفلاتر"
                }
              </p>
            </div>
          ) : (
            <div className={viewMode === "grid" 
              ? `grid gap-4 sm:grid-cols-2 lg:grid-cols-${store.layout?.columns || 3} xl:grid-cols-${Math.min((store.layout?.columns || 3) + 1, 5)}`
              : "flex flex-col gap-4"
            }>
              {filteredProducts.map((product, idx) => (
                <div 
                  key={product.id} 
                  className={`group rounded-xl border-2 border-border bg-card hover:border-accent/50 hover:shadow-xl transition-all duration-300 ${
                    viewMode === "list" ? "flex gap-4 p-4" : "flex flex-col"
                  }`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Product Image */}
                  <div className={`relative rounded-lg bg-gradient-to-br from-accent/10 via-primary/10 to-purple-500/10 overflow-hidden ${
                    viewMode === "list" ? "w-32 h-32 flex-shrink-0" : "h-48 w-full"
                  }`}>
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Package className="h-16 w-16 text-primary/20 group-hover:scale-110 transition-transform" />
                      </div>
                    )}
                    
                    {/* Featured Badge */}
                    {product.featured && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-gradient-to-r from-accent to-purple-500 text-white border-0 shadow-lg">
                          <Star className="h-3 w-3 mr-1" /> مميز
                        </Badge>
                      </div>
                    )}

                    {/* Wishlist */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        toggleWishlist(product.id);
                      }}
                      className="absolute top-2 left-2 p-2 rounded-full bg-white/90 dark:bg-gray-900/90 hover:scale-110 transition-transform shadow-lg"
                    >
                      <Heart 
                        className={`h-4 w-4 ${
                          wishlist.includes(product.id) ? "fill-red-500 text-red-500" : "text-gray-600"
                        }`} 
                      />
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className={`${viewMode === "list" ? "flex-1" : "p-4"}`}>
                    <h3 className="font-bold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {product.title}
                    </h3>
                    
                    {product.description && viewMode === "list" && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    {/* Price and Actions */}
                    <div className="flex items-center justify-between gap-2 mt-auto">
                      <div className="text-2xl font-extrabold bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent">
                        ${product.price}
                      </div>
                      <div className="flex items-center gap-2">
                        <Link to={`/product/${product.id}`}>
                          <Button variant="outline" size="sm" className="hover:bg-primary/10">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          onClick={() => addToCart(product)}
                          className="bg-gradient-to-r from-accent to-purple-500 hover:from-accent/90 hover:to-purple-600 text-white shadow-md"
                          size="sm"
                        >
                          <ShoppingCart className="h-4 w-4 mr-1" />
                          {viewMode === "list" ? "إضافة للسلة" : "أضف"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Load More */}
        {filteredProducts.length > 0 && filteredProducts.length >= 20 && (
          <div className="mt-12 text-center">
            <Button variant="outline" size="lg" className="min-w-[200px]">
              عرض المزيد
              <ChevronDown className="h-4 w-4 mr-2" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}