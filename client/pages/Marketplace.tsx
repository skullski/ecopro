import { useEffect, useState } from "react";
import * as api from "@/lib/api";
import type { MarketplaceProduct, Vendor } from "@shared/types";
import { Link } from "react-router-dom";

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
    <section className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Marketplace</h1>
      <div className="flex gap-4 mb-6">
        <input
          className="border rounded px-3 py-2"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="border rounded px-3 py-2"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {[...new Set(products.map(p => p.category))].map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map(product => (
          <div key={product.id} className="border rounded-lg p-4 shadow hover:shadow-lg transition">
            <Link to={`/product/${product.id}`} className="block font-bold text-lg mb-2 hover:underline">
              {product.title}
            </Link>
            <div className="mb-2 text-gray-600">{product.category}</div>
            <div className="mb-2">{product.price} DZD</div>
            <div className="mb-2 text-sm text-gray-500">
              Vendor: {vendors.find(v => v.id === product.vendorId)?.name || "Unknown"}
            </div>
            {product.images?.[0] && (
              <img src={product.images[0]} alt={product.title} className="w-full h-40 object-cover rounded" />
            )}
          </div>
        ))}
        {filtered.length === 0 && <div className="col-span-full text-center text-gray-500">No products found.</div>}
      </div>
    </section>
  );
}
