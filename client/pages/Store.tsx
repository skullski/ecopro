import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { FloatingShapes } from "@/components/ui/floating-shapes";
import {
  ShoppingCart,
  Eye,
  Sparkles,
  Tag,
  Search,
  TrendingUp,
  Star,
  Heart,
  Grid3x3,
  List,
  Package,
  Zap,
  Award,
  Percent,
  Store as StoreIcon,
  UserPlus,
  MapPin,
  Verified,
} from "lucide-react";
import { DarkModeInput } from "@/components/ui/dark-mode-input";
import { DarkModeSelect } from "@/components/ui/dark-mode-select";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo, useEffect } from "react";
import type { MarketplaceProduct, Vendor } from "@shared/types";
import * as api from "@/lib/api";

export default function Store() {
  const { t } = useTranslation();
  
  const CATEGORIES = [
    { id: "all", nameKey: "category.all", icon: Grid3x3 },
    { id: "electronics", nameKey: "category.electronics", icon: Zap },
    { id: "fashion", nameKey: "category.fashion", icon: Sparkles },
    { id: "home", nameKey: "category.home", icon: Package },
    { id: "sports", nameKey: "category.sports", icon: Award },
    { id: "beauty", nameKey: "category.beauty", icon: Star },
  ];
  
  const [cart, setCart] = useState<MarketplaceProduct[]>(
    JSON.parse(localStorage.getItem("cart") || "[]")
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    // Load from API instead of localStorage
    async function loadData() {
      try {
        const [allProducts, allVendors] = await Promise.all([
          api.fetchProducts(),
          api.fetchVendors(),
        ]);
        
        // Show products that are exported OR don't have the field (for backward compatibility)
        setProducts(
          allProducts.filter(
            (p: MarketplaceProduct) => 
              p.status === "active" && 
              (p.isExportedToMarketplace === true || p.isExportedToMarketplace === undefined)
          )
        );
        setVendors(allVendors);
      } catch (error) {
        console.error("Failed to load data:", error);
        // Fallback to localStorage if API fails
        const marketplaceProducts = JSON.parse(
          localStorage.getItem("marketplaceProducts") || "[]"
        );
        const localVendors = JSON.parse(localStorage.getItem("vendors") || "[]");
        setProducts(
          marketplaceProducts.filter(
            (p: MarketplaceProduct) => 
              p.status === "active" && 
              (p.isExportedToMarketplace === true || p.isExportedToMarketplace === undefined)
          )
        );
        setVendors(localVendors);
      }
    }
    loadData();
  }, []);

  function getVendor(vendorId: string) {
    return vendors.find((v) => v.id === vendorId);
  }

  function addToCart(p: MarketplaceProduct) {
    const newCart = [...cart, p];
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
  }

  function toggleWishlist(productId: string) {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((p) => {
      const matchesSearch =
        !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
      return matchesSearch && matchesCategory && p.quantity > 0;
    });

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
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
    return filtered;
  }, [products, searchQuery, selectedCategory, sortBy]);

  return (
    <section className="relative min-h-screen bg-background">
      <FloatingShapes variant="section" colors="rainbow" />

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-primary via-accent to-orange-500 text-white relative z-10">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            <span className="text-sm md:text-base font-semibold">
              {t("marketplace.banner")}
            </span>
          </div>
          <Link to="/vendor/signup">
            <Button
              size="sm"
              className="bg-white text-primary hover:bg-white/90 font-bold shadow-lg"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {t("marketplace.startSelling")}
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto py-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 px-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-1">
              {t("marketplace.title")}
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-accent" />
              {t("marketplace.productsFrom", { 
                products: filteredProducts.length.toString(), 
                vendors: vendors.length.toString() 
              })}
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/vendor/signup">
              <Button size="lg" variant="outline" className="border-2 border-primary">
                <UserPlus className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">{t("marketplace.startSelling")}</span>
              </Button>
            </Link>
            <Link to="/checkout">
              <Button
                size="lg"
                className="bg-gradient-to-r from-accent to-orange-500 text-white shadow-lg"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {t("marketplace.cart", { count: cart.length.toString() })}
              </Button>
            </Link>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-6 px-4">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-medium transition-all whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                      : "bg-card hover:bg-accent/10 text-foreground border-2 border-border"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {t(cat.nameKey)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 px-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <DarkModeInput
                type="search"
                placeholder={t("marketplace.search")}
                className="w-full pr-12 pl-4 py-6 rounded-xl border-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <DarkModeSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="featured">{t("marketplace.featured")}</option>
                <option value="newest">{t("marketplace.newest")}</option>
                <option value="price-low">{t("marketplace.priceLow")}</option>
                <option value="price-high">{t("marketplace.priceHigh")}</option>
              </DarkModeSelect>
              <div className="flex gap-1 bg-card border-2 border-border rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-all ${
                    viewMode === "grid" ? "bg-primary text-white" : "text-muted-foreground"
                  }`}
                >
                  <Grid3x3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-all ${
                    viewMode === "list" ? "bg-primary text-white" : "text-muted-foreground"
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        <div className="px-4">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="max-w-2xl mx-auto p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/10 to-orange-500/10 border-2 border-primary/20">
                <StoreIcon className="h-24 w-24 mx-auto mb-6 text-primary" />
                <h2 className="text-3xl font-bold mb-4">
                  {products.length === 0 ? t("marketplace.firstToStart") : t("marketplace.noResults")}
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  {products.length === 0
                    ? t("marketplace.registerFree")
                    : t("marketplace.tryDifferent")}
                </p>
                {products.length === 0 && (
                  <Link to="/vendor/signup">
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-primary to-accent text-white text-lg px-8 py-6 shadow-xl"
                    >
                      <UserPlus className="h-6 w-6 mr-3" />
                      {t("marketplace.registerAsVendor")}
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "flex flex-col gap-4"
              }
            >
              {filteredProducts.map((p) => {
                const vendor = getVendor(p.vendorId);
                return (
                  <div
                    key={p.id}
                    className={`group rounded-xl border-2 border-border bg-card hover:border-primary/50 hover:shadow-xl transition-all ${
                      viewMode === "list" ? "flex gap-4 p-4" : "flex flex-col"
                    }`}
                  >
                    {/* Product Image */}
                    <div
                      className={`relative rounded-lg bg-gradient-to-br from-primary/10 to-orange-500/10 overflow-hidden ${
                        viewMode === "list" ? "w-32 h-32" : "h-48 w-full"
                      }`}
                    >
                      {p.images && p.images.length > 0 ? (
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Tag className="h-16 w-16 text-primary/20" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        {p.featured && (
                          <Badge className="bg-gradient-to-r from-accent to-purple-500 text-white">
                            <Star className="h-3 w-3 mr-1" />
                            {t("marketplace.featured")}
                          </Badge>
                        )}
                      </div>
                      <button
                        onClick={() => toggleWishlist(p.id)}
                        className="absolute top-2 left-2 p-2 rounded-full bg-white/90 dark:bg-gray-900/90"
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            wishlist.includes(p.id)
                              ? "fill-red-500 text-red-500"
                              : "text-gray-600"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Product Info */}
                    <div className={viewMode === "list" ? "flex-1" : "p-4"}>
                      {vendor && (
                        <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                          <StoreIcon className="h-3 w-3" />
                          <span>{vendor.businessName}</span>
                          {vendor.verified && (
                            <Verified className="h-3 w-3 text-blue-500 fill-blue-500" />
                          )}
                        </div>
                      )}
                      <h3 className="font-bold mb-2 line-clamp-2">{p.title}</h3>
                      {vendor?.location && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                          <MapPin className="h-3 w-3" />
                          {vendor.location.city}
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-2xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                          ${p.price}
                        </div>
                        <div className="flex gap-2">
                          <Link to={`/product/${p.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            onClick={() => addToCart(p)}
                            className="bg-gradient-to-r from-primary to-accent text-white"
                            size="sm"
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            {t("marketplace.addToCart")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        {products.length > 0 && (
          <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-primary/10 to-orange-500/10 border-2 border-primary/20">
            <div className="max-w-3xl mx-auto text-center">
              <StoreIcon className="h-16 w-16 mx-auto mb-4 text-primary" />
              <h2 className="text-3xl font-bold mb-3">{t("marketplace.haveProducts")}</h2>
              <p className="text-lg text-muted-foreground mb-6">{t("marketplace.joinThousands")}</p>
              <Link to="/vendor/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  {t("marketplace.registerVendorFree")}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
