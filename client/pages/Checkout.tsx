import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AddressForm, AddressFormValue } from "@/components/AddressForm";
import { apiFetch } from "@/lib/api";
import { z } from "zod";

type Product = { id: string; title: string; price: number; imageUrl?: string };

export default function Checkout() {
  const { productId, storeSlug, productSlug } = useParams();
  const nav = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [addr, setAddr] = useState<AddressFormValue>({
    line1: "",
    city: "",
    postalCode: "",
    country: "",
  } as AddressFormValue);
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Determine source: private store product via slug, else marketplace by id
    const load = async () => {
      try {
        if (storeSlug && productSlug) {
          const res = await fetch(`/api/store/${storeSlug}/${productSlug}`);
          if (res.ok) {
            const p = await res.json();
            setProduct({ id: String(p.id), title: p.title, price: Number(p.price), imageUrl: p.images?.[0] });
          }
        } else if (productId) {
          const p = await apiFetch<Product>(`/api/products/${productId}`);
          setProduct(p);
        }
      } catch {}
    };
    load();
    apiFetch<any>("/api/me").then((me) => {
      const def = me.addresses?.find((a: any) => a.id === me.defaultAddressId) || me.addresses?.[0];
      if (def) setAddr({ line1: def.line1, line2: def.line2, city: def.city, state: def.state, postalCode: def.postalCode, country: def.country, phone: def.phone });
    });
  }, [productId, storeSlug, productSlug]);

  async function placeOrder() {
    if (!productId || !product) return;
    setSubmitting(true);
    try {
      const schema = z.object({
        name: z.string().min(2, "Name is required"),
        phone: z.string().regex(/^\+\d{6,15}$/,{ message: "Enter WhatsApp phone in E.164 format" }).optional(),
        email: z.string().email().optional(),
        address: z.string().min(5, "Address is required"),
      });
      const addressStr = [addr.line1, addr.line2, addr.city, addr.state, addr.postalCode, addr.country].filter(Boolean).join(', ');
      schema.parse({ name: addr?.name || '', phone: addr?.phone, email: addr?.email, address: addressStr });

      const payload = {
        product_id: Number(productId),
        client_id: null,
        quantity: 1,
        total_price: Number(product.price ?? 0),
        customer_name: addr?.name || '',
        customer_email: addr?.email || '',
        customer_phone: addr?.phone || '',
        customer_address: addressStr,
        store_slug: undefined,
      };
      const endpoint = storeSlug ? `/api/storefront/${storeSlug}/orders` : '/api/orders/create';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setOrderId(String(data?.order?.id || ''));
    } catch (e: any) {
      console.error('Order create failed', e);
    } finally {
      setSubmitting(false);
    }
  }

  if (!product) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <div className="flex items-center gap-4">
        <img src={product.imageUrl} alt={product.title} className="w-24 h-24 object-cover rounded" />
        <div>
          <div className="font-medium">{product.title}</div>
          <div className="text-lg font-bold">${(product.price / 100).toFixed(2)}</div>
        </div>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-2">Shipping address</h2>
        <AddressForm value={addr} onChange={setAddr} />
      </div>
      <div className="flex gap-3">
        <button className="btn btn-outline" onClick={() => nav(-1)}>Back</button>
        <button className="btn btn-primary" disabled={submitting} onClick={placeOrder}>
          {submitting ? "Placing..." : "Place order"}
        </button>
      </div>
      {orderId && (
        <div className="alert alert-success">
          Order created: {orderId}. The seller received your shipping info.
        </div>
      )}
    </div>
  );
}
