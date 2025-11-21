import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Globe, User, Grid, Car, Smartphone, Shirt, Home, Trophy, Gamepad, Tag, Heart, Star, ShoppingCart, MessageCircle, Phone, BadgeCheck, Share2 } from "lucide-react";
import FilterBar from "./FilterBar";
import * as api from "@/lib/api";
import type { MarketplaceProduct, Vendor } from "@shared/types";

const banners = [
  "/demo/banner1.jpg",
  "/demo/banner2.jpg",
  "/demo/banner3.jpg",
];
const categories = [
  { name: "Cars", icon: <Car className="w-6 h-6" /> },
  { name: "Electronics", icon: <Smartphone className="w-6 h-6" /> },
  { name: "Fashion", icon: <Shirt className="w-6 h-6" /> },
  { name: "Home", icon: <Home className="w-6 h-6" /> },
  { name: "Sports", icon: <Trophy className="w-6 h-6" /> },
  { name: "Accessories", icon: <Gamepad className="w-6 h-6" /> },
];

export default function HomeMarketplace() {
  const { theme } = useTheme();
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

  // Filter products by selected filters
  const filteredProducts = products.filter(product => {
    if (filters.categories && filters.categories.length > 0 && !filters.categories.includes(product.category)) return false;
    if (filters.price && (product.price < filters.price[0] || product.price > filters.price[1])) return false;
    return true;
  });

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className={
      `w-full min-h-screen transition-colors duration-300 flex flex-col items-center ` +
      (theme === "dark"
        ? "bg-gradient-to-br from-[#18191b] via-[#232325] to-[#1a1a2e] text-white"
        : "bg-gradient-to-br from-white via-blue-50 to-purple-100 text-gray-900")
    }>
      {/* Search Bar & Filters */}
      <div className="w-full max-w-6xl px-2 mt-8">
        <FilterBar onFilter={setFilters} />
      </div>
      {/* Banners */}
      <div className="flex gap-4 overflow-x-auto px-4 pb-6 scrollbar-hide w-full max-w-6xl">
        {banners.map((src, i) => (
          <img key={i} src={src} alt="Banner" className="h-36 md:h-48 w-full max-w-2xl object-cover rounded-2xl shadow-2xl opacity-90" />
        ))}
      </div>
      {/* Product Grid */}
      <div className="w-full max-w-6xl px-2">
        <h2 className="text-2xl font-extrabold mb-4 tracking-tight bg-gradient-to-r from-primary via-accent to-purple-600 bg-clip-text text-transparent">Marketplace</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
          {loading ? (
            <div className="text-center w-full col-span-full">Loading...</div>
          ) : paginatedProducts.map(product => (
            // Enhanced product card design with hover effects and animations
            <div
              key={product.id}
              className="relative group rounded-3xl p-0.5 bg-gradient-to-br from-white/60 via-primary/10 to-accent/10 dark:from-[#232325]/60 dark:via-[#232325]/80 dark:to-[#1a1a2e]/80 shadow-2xl hover:shadow-primary/30 transition-all duration-300 transform hover:scale-105 hover:rotate-1"
              style={{ minHeight: 340 }}
            >
              <div className="relative bg-white/80 dark:bg-[#232325]/80 rounded-3xl overflow-hidden flex flex-col h-full backdrop-blur-xl">
                <div className="relative w-full h-48 overflow-hidden">
                  <img
                    src={product.images?.[0] || "/demo/product1.jpg"}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:rotate-1"
                  />
                  <div className="absolute top-2 right-2 flex gap-2 z-10">
                    <Button size="icon" variant="ghost" className="backdrop-blur bg-white/60 dark:bg-[#232325]/60 shadow hover:scale-110 transition-transform"><Heart className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" className="backdrop-blur bg-white/60 dark:bg-[#232325]/60 shadow hover:scale-110 transition-transform"><Share2 className="w-4 h-4" /></Button>
                  </div>
                </div>
                <div className="flex-1 flex flex-col p-4">
                  <div className="font-bold text-lg mb-1 line-clamp-2">{product.title}</div>
                  <div className="mb-1 text-xl font-bold text-accent-400">{product.price} DZD</div>
                  <div className="mb-1 text-xs text-primary-400 font-medium flex gap-2 items-center">
                    <Tag className="w-4 h-4" /> {product.category}
                  </div>
                  <div className={"flex items-center gap-2 text-xs mb-1 " + (theme === "dark" ? "text-gray-400" : "text-gray-500")}>
                    <User className="w-4 h-4" /> {vendors[product.vendorId]?.name || 'Vendor'}
                  </div>
                  <div className="flex items-center gap-2 mt-auto">
                    <Button size="icon" variant="ghost" tabIndex={-1}><Phone className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" tabIndex={-1}><MessageCircle className="w-4 h-4" /></Button>
                  </div>
                </div>
                <Link
                  to={`/product/${product.id}`}
                  className="absolute inset-0 z-10"
                  style={{ textDecoration: "none" }}
                >
                  <span className="sr-only">View product</span>
                </Link>
                <div className="pointer-events-none absolute inset-0 rounded-3xl border-2 border-white/30 dark:border-gray-800/60 group-hover:border-primary/60 transition-all duration-300" />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center mt-8">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-4 py-2 border rounded-lg bg-primary text-white disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">Page {currentPage}</span>
          <button
            disabled={currentPage * itemsPerPage >= filteredProducts.length}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-4 py-2 border rounded-lg bg-primary text-white disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
