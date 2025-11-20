import { useEffect, useState } from "react";
import * as api from "@/lib/api";
import type { MarketplaceProduct, Vendor } from "@shared/types";
import { Link } from "react-router-dom";
import { Search, Tag, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Marketplace() {
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    api.fetchProducts().then(setProducts);
    api.fetchVendors().then(setVendors);
  }, []);

  const filtered = products.filter(p =>
    (!search || p.title.toLowerCase().includes(search.toLowerCase())) &&
    (!category || p.category === category)
  );

  return (
    <section className="container mx-auto py-10">
      <h1 className="text-4xl font-extrabold mb-8 text-center tracking-tight">Marketplace</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-center">
        <div className="relative w-full md:w-1/3">
          <input
            className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white shadow-sm"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5 pointer-events-none" />
        </div>
        <div className="relative w-full md:w-1/4">
          <select
            className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white shadow-sm appearance-none"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {[...new Set(products.map(p => p.category))].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <Tag className="absolute left-3 top-2.5 text-gray-400 w-5 h-5 pointer-events-none" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(product => {
          const vendor = vendors.find(v => v.id === product.vendorId);
          return (
            <div
              key={product.id}
              className="bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 flex flex-col overflow-hidden group"
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
              </Link>
              <div className="flex-1 flex flex-col p-5">
                <Link to={`/product/${product.id}`} className="font-semibold text-lg mb-1 hover:underline line-clamp-2">
                  {product.title}
                </Link>
                <div className="mb-2 text-sm text-primary-600 font-medium">{product.category}</div>
                <div className="mb-2 text-xl font-bold text-gray-900">{product.price} <span className="text-base font-normal">DZD</span></div>
                <div className="flex items-center gap-2 mt-auto text-sm text-gray-500">
                  {vendor?.avatar ? (
                    <img src={vendor.avatar} alt={vendor.name} className="w-7 h-7 rounded-full object-cover border" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 border">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <span className="truncate">{vendor?.name || "Unknown Vendor"}</span>
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
      </div>
    </section>
  );
}
