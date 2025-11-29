import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AddressForm, AddressFormValue } from "@/components/AddressForm";
import { apiFetch } from "@/lib/api";

type Product = { id: string; title: string; price: number; imageUrl?: string };

export default function Checkout() {
  const { productId } = useParams();
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
    if (!productId) return;
    apiFetch<Product>(`/api/products/${productId}`).then(setProduct);
    apiFetch<any>("/api/me").then((me) => {
      const def = me.addresses?.find((a: any) => a.id === me.defaultAddressId) || me.addresses?.[0];
      if (def) setAddr({ line1: def.line1, line2: def.line2, city: def.city, state: def.state, postalCode: def.postalCode, country: def.country, phone: def.phone });
    });
  }, [productId]);

  async function placeOrder() {
    if (!productId) return;
    setSubmitting(true);
    try {
      const order = await apiFetch<{ id: string }>(`/api/orders`, {
        method: "POST",
        body: JSON.stringify({ productId, shippingAddress: addr }),
      });
      setOrderId(order.id);
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
