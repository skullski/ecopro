
import { useEffect, useState } from "react";
import * as api from "@/lib/api";
import type { MarketplaceProduct, Vendor } from "@shared/types";
import { Link } from "react-router-dom";
import { Search, Tag, User, Heart, Star, ShoppingCart, MessageCircle, Phone, BadgeCheck, Car, Smartphone, Shirt, Home, Trophy, Gamepad, Building, Briefcase, User as UserIcon, Grid } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";


// Demo banners and category icons
const DEMO_BANNERS = [
  "/demo/banner1.jpg",
  "/demo/banner2.jpg",
  "/demo/banner3.jpg",
];
const CATEGORY_ICONS: Record<string, JSX.Element> = {
  Automobiles: <Car className="w-5 h-5" />,
  Electronics: <Smartphone className="w-5 h-5" />,
  Fashion: <Shirt className="w-5 h-5" />,
  Home: <Home className="w-5 h-5" />,
  Sports: <Trophy className="w-5 h-5" />,
  Toys: <Gamepad className="w-5 h-5" />,
  "Real Estate": <Building className="w-5 h-5" />,
  Services: <Briefcase className="w-5 h-5" />,
  Jobs: <UserIcon className="w-5 h-5" />,
  Others: <Grid className="w-5 h-5" />,
};

export default function Marketplace() {
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const categories = Array.from(new Set(products.map(p => p.category)));
  const featured = products.filter(p => p.featured).slice(0, 8);

  useEffect(() => {
    api.fetchProducts().then(setProducts);
    api.fetchVendors().then(setVendors);
  }, []);

  const filtered = products.filter(p =>
    (!search || p.title.toLowerCase().includes(search.toLowerCase())) &&
    (!category || p.category === category)
  );

  return (
    <section className="w-full min-h-screen bg-[#18191b]">
      {/* Banner carousel */}
      <div className="w-full max-w-screen-2xl mx-auto px-0 md:px-4 pt-4">
        <div className="w-full rounded-xl overflow-hidden mb-6">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide">
            {DEMO_BANNERS.map((src, i) => (
              <img key={i} src={src} alt="Banner" className="h-32 md:h-44 w-full max-w-2xl object-cover rounded-xl shadow-lg" />
            ))}
          </div>
        </div>

        {/* Category icons row */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide mb-6 px-2">
          <button
            className={cn("flex flex-col items-center gap-1 px-3 py-2 rounded-lg font-semibold border border-primary bg-primary text-white hover:bg-primary/80 transition text-xs", !category && "ring-2 ring-primary")}
            onClick={() => setCategory("")}
          >
            <Grid className="w-6 h-6 mb-1" />
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              className={cn("flex flex-col items-center gap-1 px-3 py-2 rounded-lg font-semibold border border-gray-700 bg-[#232325] text-gray-100 hover:bg-primary/10 transition text-xs", category === cat && "ring-2 ring-primary border-primary bg-primary/10 text-primary")}
              onClick={() => setCategory(cat)}
            >
              {CATEGORY_ICONS[cat] || <Grid className="w-6 h-6 mb-1" />}
              {cat}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2 mb-6 px-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full py-2 pl-10 pr-4 rounded-lg bg-[#232325] text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Featured carousel */}
        {featured.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-white mb-2 px-2">Featured</h2>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide px-2">
              {featured.map(product => (
                <div key={product.id} className="min-w-[260px] max-w-xs bg-[#232325] border border-gray-800 rounded-xl shadow-lg flex flex-col overflow-hidden group">
                  <Link to={`/product/${product.id}`} className="block relative">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.title} className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-200" />
                    ) : (
                      <div className="w-full h-36 flex items-center justify-center bg-gray-900 text-gray-700 text-5xl">
                        <span role="img" aria-label="No image">🖼️</span>
                      </div>
                    )}
                  </Link>
                  <div className="flex-1 flex flex-col p-3">
                    <Link to={`/product/${product.id}`} className="font-bold text-base mb-1 hover:underline line-clamp-2 text-white">
                      {product.title}
                    </Link>
                    <div className="mb-1 text-xs text-primary-400 font-medium flex gap-2 items-center">
                      <Tag className="w-4 h-4" /> {product.category}
                    </div>
                    <div className="mb-1 text-lg font-bold text-accent-400">{product.price} <span className="text-base font-normal text-gray-300">DZD</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Product Grid - Ouedkniss style */}
        <div className="w-full">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {filtered.map(product => {
              const vendor = vendors.find(v => v.id === product.vendorId);
              return (
                <div
                  key={product.id}
                  className="relative bg-[#232325] border border-gray-800 rounded-xl shadow card hover:shadow-lg transition flex flex-col overflow-hidden group min-h-[320px]"
                >
                  {/* Image + overlays */}
                  <Link to={`/product/${product.id}`} className="block relative">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.title} className="w-full h-36 md:h-40 object-cover group-hover:scale-105 transition-transform duration-200" />
                    ) : (
                      <div className="w-full h-36 md:h-40 flex items-center justify-center bg-gray-900 text-gray-700 text-5xl">
                        <span role="img" aria-label="No image">🖼️</span>
                      </div>
                    )}
                    {/* Badges/overlays */}
                    {product.featured && (
                      <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded shadow">VIP</div>
                    )}
                    {product.tags && product.tags.length > 0 && (
                      <div className="absolute top-2 right-2 flex gap-1 flex-wrap">
                        {product.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="bg-accent text-white text-[10px] px-2 py-0.5 rounded-full shadow">{tag}</span>
                        ))}
                      </div>
                    )}
                    {/* Action icons */}
                    <div className="absolute bottom-2 right-2 flex gap-1 z-10">
                      <Button size="icon" variant="ghost" className="bg-black/60 text-white hover:bg-primary/80"><Phone className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" className="bg-black/60 text-white hover:bg-primary/80"><MessageCircle className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" className="bg-black/60 text-white hover:bg-primary/80"><Heart className="w-4 h-4" /></Button>
                    </div>
                  </Link>
                  {/* Card content */}
                  <div className="flex-1 flex flex-col p-3 md:p-4">
                    <Link to={`/product/${product.id}`} className="font-bold text-base md:text-lg mb-1 hover:underline line-clamp-2 text-white">
                      {product.title}
                    </Link>
                    <div className="mb-1 text-xs text-primary-400 font-medium flex gap-2 items-center">
                      <Tag className="w-4 h-4" /> {product.category}
                    </div>
                    <div className="mb-1 text-lg font-bold text-accent-400">{product.price} <span className="text-base font-normal text-gray-300">DZD</span></div>
                    <div className="flex items-center gap-2 text-xs text-yellow-400 mb-1">
                      <Star className="w-4 h-4" /> {Math.round((product.views + product.favorites) / 10) % 5 + 1} / 5
                      <span className="text-gray-500">({product.views} vues)</span>
                    </div>
                    <div className="flex items-center gap-2 mt-auto text-xs text-gray-400">
                      {vendor?.avatar ? (
                        <img src={vendor.avatar} alt={vendor.name} className="w-6 h-6 rounded-full object-cover border" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-gray-500 border">
                          <User className="w-3 h-3" />
                        </div>
                      )}
                      <span className="truncate">{vendor?.name || "Unknown Vendor"}</span>
                      {vendor?.verified && <BadgeCheck className="w-4 h-4 text-green-400 ml-1" />}
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="col-span-full text-center text-gray-400 text-lg py-16">No products found.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
