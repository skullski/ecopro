import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import * as apiHelpers from "@/lib/api";
import { Sun, Moon, Globe, User, Grid, Car, Smartphone, Shirt, Home, Trophy, Gamepad, Tag, Heart, Star, ShoppingCart, MessageCircle, Phone, BadgeCheck, Share2, Building, User as UserIcon } from "lucide-react";
import FilterBar from "./FilterBar";
import * as api from "@/lib/api";
import type { MarketplaceProduct, Vendor } from "@shared/types";

const banners = [
  "/demo/banner1.jpg",
  "/demo/banner2.jpg",
  "/demo/banner3.jpg",
];
const categories = [
  { name: "Cars", icon: <Car className="w-8 h-8" /> },
  { name: "Electronics", icon: <Smartphone className="w-8 h-8" /> },
  { name: "Fashion", icon: <Shirt className="w-8 h-8" /> },
  { name: "Home", icon: <Home className="w-8 h-8" /> },
  { name: "Sports", icon: <Trophy className="w-8 h-8" /> },
  { name: "Accessories", icon: <Gamepad className="w-8 h-8" /> },
  { name: "Real Estate", icon: <Building className="w-8 h-8" /> },
  { name: "Jobs", icon: <UserIcon className="w-8 h-8" /> },
  { name: "Others", icon: <Grid className="w-8 h-8" /> },
];

export default function HomeMarketplace() {
  const { theme } = useTheme();
  // Add Product modal state and all stateful logic must be inside the component
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    location: "",
    image: null as File | null,
    published: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [vendors, setVendors] = useState<Record<string, Vendor>>({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const items = await fetch('/api/items').then(r => r.json());
        setProducts(items);
        // Optionally fetch vendors for display
        const vendorList = await api.fetchVendors();
        const vendorMap: Record<string, Vendor> = {};
        vendorList.forEach(v => { vendorMap[v.id] = v; });
        setVendors(vendorMap);
      } catch (e) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    let imageUrl = "";
    if (form.image) {
      try {
        const uploadRes = await apiHelpers.uploadImage(form.image);
        imageUrl = uploadRes.url;
      } catch {
        imageUrl = "";
      }
    }
    const product = {
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
      location: form.location,
      images: imageUrl ? [imageUrl] : [],
      published: true, // Always publish to marketplace
      visibilitySource: "marketplace"
    };
    // Use public/anonymous product creation for marketplace
    await apiHelpers.createPublicProduct(product);
    setShowAdd(false);
    setForm({ title: "", description: "", price: "", category: "", location: "", image: null, published: true });
    setSubmitting(false);
    // Refresh products
    setLoading(true);
    const items = await fetch('/api/items').then(r => r.json());
    setProducts(items);
    setLoading(false);
  }

  // Filter products by selected filters
  // Only show products explicitly marked as published
  const filteredProducts = products.filter(product => {
    if (!product.published) return false;
    if (filters.categories && filters.categories.length > 0 && !filters.categories.includes(product.category)) return false;
    if (filters.price && (product.price < filters.price[0] || product.price > filters.price[1])) return false;
    return true;
  });

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div
      className={
        `w-full min-h-screen transition-colors duration-300 flex flex-col items-center ` +
        (theme === "dark"
          ? "bg-gradient-to-br from-[#0f1021] via-[#181a2a] to-[#1a1a2e] text-white"
          : "bg-gradient-to-br from-white via-blue-50 to-purple-100 text-gray-900")
      }
    >
      {/* Horizontal Category Carousel */}
      <div className="w-full max-w-screen-xl px-0 mt-6 flex flex-col items-center">
        <div className="w-full overflow-x-auto scrollbar-hide">
          <div className="flex flex-nowrap gap-4 py-2 px-2">
            {categories.map((cat) => (
              <div
                key={cat.name}
                className="flex flex-col items-center justify-center min-w-[100px] bg-white/20 dark:bg-[#232325]/60 rounded-2xl shadow-lg border border-white/10 p-3 hover:bg-accent/10 transition-all cursor-pointer"
              >
                {cat.icon}
                <span className="mt-2 text-xs font-semibold text-center whitespace-nowrap text-accent-200">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Banner Section */}
      <div className="w-full max-w-screen-xl px-0 mt-4 flex justify-center animate-fade-in">
        <img
          src={banners[0]}
          alt="Marketplace Banner"
          className="rounded-2xl w-full max-h-40 object-cover shadow-xl border border-white/10"
        />
      </div>

      {/* Add Product Button and Filters Bar */}
      <div className="w-full max-w-screen-xl px-0 mt-8 flex items-center justify-between animate-fade-in">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-blue-400 to-pink-500 bg-clip-text text-transparent drop-shadow-neon">Marketplace</h2>
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:from-indigo-700 hover:to-cyan-700" onClick={() => setShowAdd(true)}>
              + Add Product
            </Button>
          </DialogTrigger>
          {/* DialogContent and form remain here (not shown for brevity) */}
        </Dialog>
        {/* Product Grid */}
        </div>
        <div className="w-full max-w-screen-xl px-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 xl:gap-8">
            {loading ? (
              <div className="text-center w-full col-span-full animate-pulse">Loading...</div>
            ) : paginatedProducts.map(product => (
              <div
                key={product.id}
                className="relative group rounded-2xl p-0.5 bg-gradient-to-br from-[#232325]/80 via-[#232325]/90 to-[#1a1a2e]/90 shadow-xl hover:shadow-neon transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 hover:border-accent/80 border border-white/10 backdrop-blur-xl min-h-[260px]"
              >
                <div className="relative bg-white/10 dark:bg-[#181a2a]/80 rounded-2xl overflow-hidden flex flex-col h-full backdrop-blur-2xl border border-white/10">
                  <div className="relative w-full h-32 sm:h-36 md:h-40 overflow-hidden">
                    <img
                      src={product.images?.[0] || "/demo/product1.jpg"}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:rotate-1 group-hover:brightness-110"
                    />
                    <div className="absolute top-2 right-2 flex gap-2 z-10">
                      <Button size="icon" variant="ghost" className="backdrop-blur bg-white/20 dark:bg-[#232325]/40 shadow hover:scale-110 hover:bg-accent/30 hover:text-accent transition-transform"><Heart className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" className="backdrop-blur bg-white/20 dark:bg-[#232325]/40 shadow hover:scale-110 hover:bg-accent/30 hover:text-accent transition-transform"><Share2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col p-2 md:p-3 xl:p-4">
                    <div className="font-bold text-base md:text-lg mb-1 line-clamp-2 text-white drop-shadow-neon">{product.title}</div>
                    <div className="mb-1 text-lg md:text-xl font-bold text-accent-400 drop-shadow-neon">{product.price} DZD</div>
                    <div className="mb-1 text-xs font-medium flex gap-2 items-center text-accent-200">
                      <Tag className="w-4 h-4" /> {product.category}
                    </div>
                    <div className={"flex items-center gap-2 text-xs mb-1 text-blue-300"}>
                      <User className="w-4 h-4" /> {vendors[product.vendorId]?.name || 'Vendor'}
                    </div>
                    <div className="flex items-center gap-2 mt-auto">
                      <Button size="icon" variant="ghost" tabIndex={-1} className="hover:bg-accent/20 hover:text-accent"><Phone className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" tabIndex={-1} className="hover:bg-accent/20 hover:text-accent"><MessageCircle className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  <Link
                    to={`/product/${product.id}`}
                    className="absolute inset-0 z-10"
                    style={{ textDecoration: "none" }}
                  >
                    <span className="sr-only">View product</span>
                  </Link>
                  <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-accent/30 group-hover:border-accent/80 transition-all duration-300" />
                </div>
              </div>
            ))}
          </div>

        {/* Pagination Controls with animation */}
        <div className="flex justify-center mt-8 animate-fade-in">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-4 py-2 border rounded-lg bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 text-white font-bold shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-accent-200 font-bold">Page {currentPage}</span>
          <button
            disabled={currentPage * itemsPerPage >= filteredProducts.length}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-4 py-2 border rounded-lg bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 text-white font-bold shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
