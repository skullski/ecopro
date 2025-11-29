import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/state/CartContext";

export default function Cart() {
  const nav = useNavigate();
  const cart = useCart();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Your cart</h1>
      {cart.items.length === 0 && <div className="text-gray-500">Your cart is empty.</div>}
      <div className="space-y-3">
        {cart.items.map((i) => (
          <div key={i.productId} className="flex items-center gap-4 p-3 border rounded">
            {i.imageUrl && <img src={i.imageUrl} alt={i.title} className="w-20 h-20 object-cover rounded" />}
            <div className="flex-1">
              <div className="font-medium">{i.title}</div>
              <div className="text-sm text-gray-600">${(i.price / 100).toFixed(2)} each</div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm">Qty</span>
                <input
                  type="number"
                  min={1}
                  className="input input-bordered w-24"
                  value={i.qty}
                  onChange={(e) => cart.setQty(i.productId, Number(e.target.value))}
                />
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">
                ${(i.price * i.qty / 100).toFixed(2)}
              </div>
              <div className="mt-2 flex gap-2">
                <button className="btn btn-outline btn-sm" onClick={() => nav(`/checkout/${i.productId}`)}>
                  Checkout
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => cart.remove(i.productId)}>
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {cart.items.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-xl font-semibold">Total: ${(cart.totalCents / 100).toFixed(2)}</div>
          <div className="flex gap-2">
            <button className="btn btn-outline" onClick={() => cart.clear()}>Clear cart</button>
            <button className="btn btn-primary" onClick={() => nav(`/checkout/${cart.items[0].productId}`)}>
              Proceed to checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
