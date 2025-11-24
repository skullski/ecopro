
import React, { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n";


function VendorDashboard() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    image: null as File | null,
  });
  const [submitting, setSubmitting] = useState(false);
  async function handleAddProduct(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    let imageUrl = "";
    // Optionally implement image upload logic here
    // For now, skip image upload
    const storeId = user?.storeId || user?.id || "";
    const product = {
      storeId,
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
      images: imageUrl ? [imageUrl] : [],
      published: false,
    };
    await fetch('/api/store-products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    setShowAdd(false);
    setForm({ title: "", description: "", price: "", category: "", image: null });
    setSubmitting(false);
    // Refresh product list
    const productsRes = await fetch('/api/store-products/mine', { credentials: 'include' });
    const items = await productsRes.json();
    setProducts(items.filter((p: any) => !p.published));
  }

  useEffect(() => {
    async function fetchUserAndProducts() {
      setLoading(true);
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok) throw new Error('Not authenticated');
        const user = await res.json();
        setUser(user);
        if (user.role === 'vendor' || user.role === 'seller') {
          // Always fetch products for sellers
          const productsRes = await fetch('/api/store-products/mine', { credentials: 'include' });
          if (!productsRes.ok) throw new Error('Failed to fetch products');
          const items = await productsRes.json();
          setProducts(Array.isArray(items) ? items.filter((p: any) => !p.published) : []);
        } else {
          setProducts([]);
        }
      } catch (e) {
        setUser(null);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchUserAndProducts();
  }, []);

  async function handleDelete(productId: string) {
    setDeleting(productId);
    await fetch(`/api/items/${productId}`, { method: 'DELETE' });
    setProducts(products => products.filter(p => p.id !== productId));
    setDeleting(null);
  }

  async function handleExport(productId: string) {
    await fetch(`/api/items/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: true })
    });
    setProducts(products => products.filter(p => p.id !== productId));
  }




  // Render logic moved inside the VendorDashboard component
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f1021] via-[#181a2a] to-[#1a1a2e]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-accent-200">{t("Loading your dashboard...")}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f1021] via-[#181a2a] to-[#1a1a2e]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-accent-200">{t("Loading your dashboard...")}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f1021] via-[#181a2a] to-[#1a1a2e]">
        <div className="text-center">
          <p className="text-accent-200 text-lg font-bold">{t("No seller information found. Please log in again.")}</p>
          <a href="/seller-signup" className="text-accent underline">{t("Create Seller Account")}</a>
        </div>
      </div>
    );
  }

  // Only allow product management for vendor/seller roles
  if (user.role !== 'vendor' && user.role !== 'seller') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f1021] via-[#181a2a] to-[#1a1a2e]">
        <div className="text-center">
          <p className="text-accent-200 text-lg font-bold">{t("You do not have access to the store management page.")}</p>
          <a href="/" className="text-accent underline">{t("Go Home")}</a>
        </div>
      </div>
    );
  }

  // Main product management UI for vendor/seller
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-[#0f1021] via-[#181a2a] to-[#1a1a2e] text-white p-8">
      <h1 className="text-3xl font-extrabold mb-8 bg-gradient-to-r from-purple-400 via-blue-400 to-pink-500 bg-clip-text text-transparent drop-shadow-neon">{t("Your Store Items")}</h1>
      <div className="w-full max-w-5xl flex justify-end mb-6">
        <button
          className="px-6 py-2 rounded-lg bg-accent-500 text-white font-bold shadow-lg hover:bg-accent-600 transition"
          onClick={() => setShowAdd(v => !v)}
        >
          {showAdd ? t("Cancel") : t("+ Add Product")}
        </button>
      </div>
      {showAdd && (
        <form onSubmit={handleAddProduct} className="w-full max-w-2xl bg-white/10 rounded-2xl p-6 mb-8 flex flex-col gap-4 shadow-lg border border-accent/20">
          <input required className="px-4 py-2 rounded bg-black/20 text-white" placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          <textarea required className="px-4 py-2 rounded bg-black/20 text-white" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          <input required type="number" min="0" step="0.01" className="px-4 py-2 rounded bg-black/20 text-white" placeholder="Price" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} />
          <input required className="px-4 py-2 rounded bg-black/20 text-white" placeholder="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
          {/* Image upload can be added here if needed */}
          <button type="submit" disabled={submitting} className="px-6 py-2 rounded-lg bg-green-600 text-white font-bold shadow hover:bg-green-700 transition">
            {submitting ? t("Adding...") : t("Add Product")}
          </button>
        </form>
      )}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.length > 0 ? (
          products.map(product => (
            <div key={product.id} className="bg-white/10 rounded-2xl p-6 shadow-lg border border-accent/20 flex flex-col gap-2">
              <div className="flex items-center gap-3 mb-2">
                <img src={product.images?.[0] || "/demo/product1.jpg"} alt={product.title} className="w-16 h-16 object-cover rounded-xl border border-accent/20" />
                <div className="flex-1">
                  <div className="font-bold text-lg line-clamp-1">{product.title}</div>
                  <div className="text-accent-200 text-xs">{product.category}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button
                  className="px-4 py-2 rounded-lg bg-red-500/20 text-red-500 font-semibold hover:bg-red-500/40"
                  disabled={deleting === product.id}
                  onClick={() => handleDelete(product.id)}
                >
                  {deleting === product.id ? t("Deleting...") : t("Delete")}
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-green-500/20 text-green-500 font-semibold hover:bg-green-500/40"
                  onClick={() => handleExport(product.id)}
                >
                  {t("Export to Marketplace")}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-accent-200 text-lg font-bold py-12">
            {t("No items in your store. Add items to see them here.")}
          </div>
        )}
      </div>
    </div>
  );
}

export default VendorDashboard;

