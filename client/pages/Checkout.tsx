import React, { useEffect, useState, ReactNode } from "react";
import { StoreHeader } from '@/components/StoreHeader';
import { useNavigate, useParams } from "react-router-dom";
import { AddressForm, AddressFormValue } from "@/components/AddressForm";
import { apiFetch } from "@/lib/api";
import { z } from "zod";

type Product = {
  description: ReactNode; id: string; title: string; price: number; imageUrl?: string 
};



export default function Checkout() {
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { productId, storeSlug, productSlug } = useParams();
  const nav = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [settings, setSettings] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [addr, setAddr] = useState<AddressFormValue>({
    name: "",
    email: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
  } as AddressFormValue);
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Load store settings for header branding
    if (storeSlug) {
      fetch(`/api/storefront/${storeSlug}/settings`).then(async (res) => {
        if (res.ok) setSettings(await res.json());
      });
    }
    // Determine source: private store product via slug, else marketplace by id
    const load = async () => {
      try {
        if (storeSlug && productSlug) {
          const res = await fetch(`/api/store/${storeSlug}/${productSlug}`);
          if (res.ok) {
            const p = await res.json();
            setProduct({ id: String(p.id), title: p.title, price: Number(p.price), imageUrl: p.images?.[0], description: p.description ?? "" });
          }
        } else if (productId) {
          const p = await apiFetch<Product>(`/api/products/${productId}`);
          setProduct(p);
        }
      } catch {}
    };
    load();
  }, [productId, storeSlug, productSlug]);

  async function placeOrder() {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      if (!addr.name || !addr.line1 || !addr.city || !addr.postalCode || !addr.country) {
        setErrorMsg("Please fill in all required fields");
        setSubmitting(false);
        return;
      }
      const addressStr = [addr.line1, addr.line2, addr.city, addr.state, addr.postalCode, addr.country].filter(Boolean).join(', ');

      const payload = {
        product_id: Number(product?.id) || Number(productId),
        client_id: null,
        quantity: 1,
        total_price: Number(product?.price ?? 0),
        customer_name: addr.name || '',
        customer_email: addr.email || '',
        customer_phone: addr?.phone || '',
        customer_address: addressStr,
        store_slug: storeSlug || undefined,
      };
      const endpoint = storeSlug ? `/api/storefront/${storeSlug}/orders` : '/api/orders/create';
      // Log payload and endpoint for debugging
      console.log('Placing order:', { endpoint, payload });
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      let responseText = await res.text();
      let responseJson = null;
      try {
        responseJson = JSON.parse(responseText);
      } catch {
        responseJson = null;
      }
      if (!res.ok) {
        const errorDetail = responseJson?.error || responseJson?.message || responseText;
        setErrorMsg(`❌ Order failed: ${errorDetail}`);
        console.error('Order failed:', { status: res.status, response: responseJson, text: responseText });
        return;
      }
      const orderId = String(responseJson?.order?.id || responseJson?.id || '');
      setOrderId(orderId);
      console.log('✅ Order created successfully:', { orderId, response: responseJson });
    } catch (e: any) {
      const errorMsg = e?.message || String(e) || "Unknown error";
      setErrorMsg(`❌ Network error: ${errorMsg}`);
      console.error('Order create failed:', { error: e, stack: e?.stack });
    } finally {
      setSubmitting(false);
    }
  }


  // Only render the content below the header (header is now in StoreLayout)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-10 px-2" style={{ background: 'radial-gradient(circle at top, #0f172a 0, #020617 45%, #000 100%)' }}>
      {!product ? (
        <div className="flex items-center justify-center w-full h-full">
          <div className="p-6 text-center">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-t-green-400 border-gray-700 rounded-full mb-4"></div>
            <div className="text-lg text-white font-semibold">Loading product details...</div>
            <div className="text-gray-400 mt-2">Please wait, then place your order.</div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Left: Order Summary */}
          <div className="flex flex-col gap-6">
            <div className="bg-[#13162a] rounded-2xl shadow-lg border border-[#23264a] p-6">
              <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>
              <div className="flex items-center gap-4">
                <img src={product.imageUrl} alt={product.title} className="w-20 h-20 object-cover rounded-xl border border-[#23264a]" />
                <div>
                  <div className="font-semibold text-white text-lg mb-1">{product.title}</div>
                  <div className="text-cyan-400 text-3xl font-extrabold">${(product.price / 100).toFixed(2)}</div>
                  <div className="text-gray-400 text-sm mt-1">{product.description}</div>
                </div>
              </div>
            </div>
            <div className="bg-[#13162a] rounded-2xl shadow-lg border border-[#23264a] p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Order Details</h3>
              <div className="flex flex-col gap-2 text-base">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span className="font-medium text-white">${(product.price / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Shipping</span>
                  <span className="font-medium text-green-400">Free</span>
                </div>
                <div className="border-t border-[#23264a] my-2"></div>
                <div className="flex justify-between text-lg">
                  <span className="font-bold text-white">Total</span>
                  <span className="font-extrabold text-cyan-400">${(product.price / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>
            <div className="bg-[#13162a] rounded-2xl shadow-lg border border-[#23264a] p-5">
              <div className="flex gap-3 items-start">
                <svg className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm">
                  <div className="font-semibold text-white mb-1">Buyer Protection</div>
                  <p className="text-gray-400">Your order is protected. The seller will receive your shipping information to fulfill your order.</p>
                </div>
              </div>
            </div>
          </div>
          {/* Right: Shipping Form */}
          <div className="bg-[#13162a] rounded-2xl shadow-lg border border-[#23264a] p-8 flex flex-col justify-center">
            <h2 className="text-xl font-bold text-white mb-4">Shipping Information</h2>
            <form className="flex flex-col gap-4" onSubmit={e => { e.preventDefault(); console.log('Form submitted, placing order...'); placeOrder(); }}>
              {/* Restore previous input field styles for clarity */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input type="text" className="w-full rounded-lg bg-[#181b2a] border border-[#23264a] px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all" value={addr.name || ''} onChange={e => setAddr({ ...addr, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input type="email" className="w-full rounded-lg bg-[#181b2a] border border-[#23264a] px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all" value={addr.email || ''} onChange={e => setAddr({ ...addr, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Address Line 1 <span className="text-red-500">*</span></label>
                <input type="text" className="w-full rounded-lg bg-[#181b2a] border border-[#23264a] px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all" value={addr.line1 || ''} onChange={e => setAddr({ ...addr, line1: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Address Line 2</label>
                <input type="text" className="w-full rounded-lg bg-[#181b2a] border border-[#23264a] px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all" value={addr.line2 || ''} onChange={e => setAddr({ ...addr, line2: e.target.value })} placeholder="Apartment, suite, etc. (optional)" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">City <span className="text-red-500">*</span></label>
                  <input type="text" className="w-full rounded-lg bg-[#181b2a] border border-[#23264a] px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all" value={addr.city || ''} onChange={e => setAddr({ ...addr, city: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">State/Region</label>
                  <input type="text" className="w-full rounded-lg bg-[#181b2a] border border-[#23264a] px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all" value={addr.state || ''} onChange={e => setAddr({ ...addr, state: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Postal Code <span className="text-red-500">*</span></label>
                  <input type="text" className="w-full rounded-lg bg-[#181b2a] border border-[#23264a] px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all" value={addr.postalCode || ''} onChange={e => setAddr({ ...addr, postalCode: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Country <span className="text-red-500">*</span></label>
                  <input type="text" className="w-full rounded-lg bg-[#181b2a] border border-[#23264a] px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all" value={addr.country || ''} onChange={e => setAddr({ ...addr, country: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
                <input type="tel" className="w-full rounded-lg bg-[#181b2a] border border-[#23264a] px-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all" value={addr.phone || ''} onChange={e => setAddr({ ...addr, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
              </div>
              <button type="submit" className="w-full py-3 mt-2 rounded-lg bg-gradient-to-r from-green-400 to-green-500 text-white font-bold text-lg shadow-lg hover:from-green-500 hover:to-green-600 focus:ring-2 focus:ring-green-400 focus:outline-none transition-all disabled:opacity-60" disabled={submitting || !product}>
                {submitting ? "Placing..." : "Place Order"}
              </button>
              {errorMsg && (
                <div className="mt-4 bg-red-900/20 border border-red-700 text-red-300 text-center px-4 py-3 rounded-lg font-semibold shadow">
                  {errorMsg}
                </div>
              )}
              <p className="text-xs text-center text-gray-500 mt-2">By placing this order, you agree to our terms of service and privacy policy</p>
              {orderId && (
                <div className="mt-4 bg-green-900/20 border border-green-700 text-green-300 text-center px-4 py-3 rounded-lg font-semibold shadow">
                  Order created: {orderId}. The seller received your shipping info.
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
