import { useEffect, useState } from "react";
import * as api from "@/lib/api";
import type { MarketplaceProduct, Vendor } from "@shared/types";
import { Link } from "react-router-dom";
import { Search, Tag, User, Heart, Star, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
    <section className="container mx-auto py-6 px-2 md:px-6">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-primary/90 to-accent/80 rounded-3xl p-8 md:p-16 mb-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-lg">
        <div className="flex-1">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-glow">Discover Everything</h1>
          <p className="text-lg md:text-2xl text-white/90 mb-6 max-w-xl">Shop millions of products from thousands of vendors. Best prices, fast delivery, and trusted sellers—just like AliExpress and Ouedkniss!</p>
          <div className="relative w-full max-w-md">
            <input
              className="w-full border border-white/30 rounded-lg px-4 py-3 pl-12 focus:outline-none focus:ring-2 focus:ring-accent bg-white/90 text-gray-900 shadow"
              placeholder="Search for anything..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Search className="absolute left-4 top-3 text-primary w-6 h-6 pointer-events-none" />
          </div>
        </div>
        <div className="hidden md:block flex-1 text-center">
          <img src="/public/admin/graffiti-wallpaper.jpg" alt="Marketplace banner" className="rounded-2xl shadow-xl w-full max-w-md mx-auto object-cover" />
        </div>
      </div>

      {/* Category Navigation */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide mb-10 py-2 px-1">
        <button
          className={cn("px-5 py-2 rounded-full font-semibold border border-primary bg-primary text-white hover:bg-primary/80 transition", !category && "ring-2 ring-primary")}
          onClick={() => setCategory("")}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            className={cn("px-5 py-2 rounded-full font-semibold border border-gray-300 bg-white hover:bg-primary/10 transition", category === cat && "ring-2 ring-primary border-primary bg-primary/10")}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Featured Products */}
      {featured.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-primary">Featured Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featured.map(product => {
              const vendor = vendors.find(v => v.id === product.vendorId);
              return (
                <div key={product.id} className="bg-white border border-gray-200 rounded-xl shadow card hover:shadow-lg transition flex flex-col overflow-hidden group relative">
                  <Link to={`/product/${product.id}`} className="block relative">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.title} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-200" />
                    ) : (
                      <div className="w-full h-40 flex items-center justify-center bg-gray-100 text-gray-400 text-5xl">
                        <span role="img" aria-label="No image">🖼️</span>
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded shadow">Featured</div>
                  </Link>
                  <div className="flex-1 flex flex-col p-4">
                    <Link to={`/product/${product.id}`} className="font-semibold text-base mb-1 hover:underline line-clamp-2">
                      {product.title}
                    </Link>
                    <div className="mb-1 text-xs text-primary-600 font-medium">{product.category}</div>
                    <div className="mb-1 text-lg font-bold text-gray-900">{product.price} <span className="text-base font-normal">DZD</span></div>
                    <div className="flex items-center gap-2 mt-auto text-xs text-gray-500">
                      {vendor?.avatar ? (
                        <img src={vendor.avatar} alt={vendor.name} className="w-6 h-6 rounded-full object-cover border" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 border">
                          <User className="w-3 h-3" />
                        </div>
                      )}
                      <span className="truncate">{vendor?.name || "Unknown Vendor"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Product Grid */}
      <h2 className="text-2xl font-bold mb-4">All Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
        {filtered.map(product => {
          const vendor = vendors.find(v => v.id === product.vendorId);
          return (
            <div
              key={product.id}
              className="bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 flex flex-col overflow-hidden group relative"
            >
              <Link to={`/product/${product.id}`} className="block relative">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center bg-gray-100 text-gray-400 text-6xl">
                    <span role="img" aria-label="No image">🖼️</span>
                  </div>
                )}
                {product.featured && (
                  <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded shadow">Featured</div>
                )}
                {product.tags && product.tags.length > 0 && (
                  <div className="absolute top-2 right-2 flex gap-1 flex-wrap">
                    {product.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="bg-accent text-white text-[10px] px-2 py-0.5 rounded-full shadow">{tag}</span>
                    ))}
                  </div>
                )}
              </Link>
              <div className="flex-1 flex flex-col p-5">
                <Link to={`/product/${product.id}`} className="font-semibold text-lg mb-1 hover:underline line-clamp-2">
                  {product.title}
                </Link>
                <div className="mb-1 text-xs text-primary-600 font-medium flex gap-2 items-center">
                  <Tag className="w-4 h-4" /> {product.category}
                </div>
                <div className="mb-1 text-xl font-bold text-gray-900">{product.price} <span className="text-base font-normal">DZD</span></div>
                <div className="flex items-center gap-2 text-xs text-yellow-500 mb-2">
                  <Star className="w-4 h-4" /> {Math.round((product.views + product.favorites) / 10) % 5 + 1} / 5
                  <span className="text-gray-400">({product.views} views)</span>
                </div>
                <div className="flex items-center gap-2 mt-auto text-sm text-gray-500">
                  {vendor?.avatar ? (
                    <img src={vendor.avatar} alt={vendor.name} className="w-7 h-7 rounded-full object-cover border" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 border">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <span className="truncate">{vendor?.name || "Unknown Vendor"}</span>
                  {vendor?.verified && <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">Verified</span>}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="secondary" className="flex-1"><ShoppingCart className="w-4 h-4 mr-1" /> Add to Cart</Button>
                  <Button size="sm" variant="ghost"><Heart className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-gray-400 text-lg py-16">No products found.</div>
        )}
      </div>
    </section>
  );
}
