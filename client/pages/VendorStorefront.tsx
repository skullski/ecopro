import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FloatingShapes } from "@/components/ui/floating-shapes";
import {
  ShoppingCart,
  Eye,
  Tag,
  Search,
  Star,
  Heart,
  Grid3x3,
  List,
  Package,
  MapPin,
  Phone,
  Mail,
  Globe,
  Verified,
  Store as StoreIcon,
  TrendingUp,
  Award,
  Facebook,
  Instagram,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";
import { DarkModeInput } from "@/components/ui/dark-mode-input";
import { DarkModeSelect } from "@/components/ui/dark-mode-select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { MarketplaceProduct, Vendor } from "@shared/types";

const CATEGORIES = [
  { id: "all", name: "الكل" },
  { id: "electronics", name: "إلكترونيات" },
  { id: "fashion", name: "أزياء" },
  { id: "home", name: "منزل" },
  { id: "sports", name: "رياضة" },
  { id: "beauty", name: "تجميل" },
];

export default function VendorStorefront() {
  const { vendorSlug } = useParams();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [cart, setCart] = useState<MarketplaceProduct[]>(
    JSON.parse(localStorage.getItem("cart") || "[]")
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    // Load vendor by slug
    const vendors = JSON.parse(localStorage.getItem("vendors") || "[]");
    const vendorData = vendors.find((v: Vendor) => v.storeSlug === vendorSlug);
    
    if (!vendorData) {
      return;
    }
    
    setVendor(vendorData);

    // Load ALL vendor products (both exported and private)
    const allProducts = JSON.parse(localStorage.getItem("marketplaceProducts") || "[]");
    const vendorProducts = allProducts.filter(
      (p: MarketplaceProduct) => p.vendorId === vendorData.id && p.status === "active"
    );
    setProducts(vendorProducts);
  }, [vendorSlug]);

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

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchQuery || p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    return matchesSearch && matchesCategory && p.quantity > 0;
  });

  if (!vendor) {
    return (
      <div className="container mx-auto py-20 text-center">
        <Package className="h-24 w-24 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">المتجر غير موجود</h2>
  <Link to="/marketplace">
          <Button>العودة للمتجر الرئيسي</Button>
        </Link>
      </div>
    );
  }

  return (
    <section className="relative min-h-screen bg-background">
      <FloatingShapes variant="section" colors="primary" />

      {/* Vendor Header */}
      <div className="relative z-10">
        {/* Cover Image */}
        <div
          className="h-48 md:h-64 bg-gradient-to-r from-primary via-accent to-orange-500"
          style={
            vendor.coverImage
              ? { backgroundImage: `url(${vendor.coverImage})`, backgroundSize: "cover" }
              : {}
          }
        />

        {/* Vendor Info */}
        <div className="container mx-auto px-4">
          <div className="bg-card border-2 border-border rounded-2xl shadow-xl -mt-16 relative z-10 p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              {/* Logo */}
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src={vendor.logo} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-3xl font-bold">
                  {vendor.businessName[0]}
                </AvatarFallback>
              </Avatar>

              {/* Details */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold">{vendor.businessName}</h1>
                  {vendor.verified && (
                    <Verified className="h-6 w-6 text-blue-500 fill-blue-500" />
                  )}
                  {vendor.isVIP && (
                    <Badge className="bg-gradient-to-r from-primary to-accent text-white">
                      <Award className="h-3 w-3 mr-1" />
                      VIP
                    </Badge>
                  )}
                </div>

                <p className="text-muted-foreground mb-4">{vendor.description}</p>

                <div className="flex flex-wrap gap-4 text-sm">
                  {vendor.location && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {vendor.location.city}, {vendor.location.country}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    {vendor.rating} ({vendor.totalSales} مبيعات)
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Package className="h-4 w-4" />
                    {products.length} منتج
                  </div>
                </div>

                {/* Social Links */}
                {vendor.socialLinks && (
                  <div className="flex gap-2 mt-4">
                    {vendor.socialLinks.facebook && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={vendor.socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                          <Facebook className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {vendor.socialLinks.instagram && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={vendor.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                          <Instagram className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {vendor.socialLinks.whatsapp && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={`https://wa.me/${vendor.socialLinks.whatsapp}`} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Link to="/marketplace">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="h-4 w-4 ml-2" />
                    السوق الكبير
                  </Button>
                </Link>
                <Link to="/checkout">
                  <Button className="bg-gradient-to-r from-accent to-orange-500 text-white w-full">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    السلة ({cart.length})
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Categories */}
        <div className="mb-6">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? "bg-gradient-to-r from-primary to-accent text-white"
                    : "bg-card hover:bg-accent/10 border-2 border-border"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
              <DarkModeInput
                type="search"
                placeholder="ابحث في المتجر..."
                className="w-full pr-12 pl-4 py-5 rounded-xl border-2"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <DarkModeSelect value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="featured">مميز</option>
                <option value="newest">الأحدث</option>
                <option value="price-low">السعر: الأقل</option>
                <option value="price-high">السعر: الأعلى</option>
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

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <Package className="h-24 w-24 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">لا توجد منتجات</h2>
            <p className="text-muted-foreground">جرب تعديل البحث أو الفئة</p>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "flex flex-col gap-4"
            }
          >
            {filteredProducts.map((p) => (
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
                    <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Tag className="h-16 w-16 text-primary/20" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    {p.featured && (
                      <Badge className="bg-gradient-to-r from-accent to-purple-500 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        مميز
                      </Badge>
                    )}
                    {!p.isExportedToMarketplace && (
                      <Badge className="bg-blue-500/90 text-white mt-1">
                        حصري للمتجر
                      </Badge>
                    )}
                  </div>
                  <button
                    onClick={() => toggleWishlist(p.id)}
                    className="absolute top-2 left-2 p-2 rounded-full bg-white/90 dark:bg-gray-900/90"
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        wishlist.includes(p.id) ? "fill-red-500 text-red-500" : "text-gray-600"
                      }`}
                    />
                  </button>
                </div>

                {/* Product Info */}
                <div className={viewMode === "list" ? "flex-1" : "p-4"}>
                  <h3 className="font-bold mb-2 line-clamp-2">{p.title}</h3>
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
                        أضف
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
