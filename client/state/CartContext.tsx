import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  productId: string;
  title: string;
  price: number; // cents
  imageUrl?: string;
  qty: number;
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  totalCents: number;
};

const CartCtx = createContext<CartState | undefined>(undefined);
const LS_KEY = "cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  const api: CartState = useMemo(() => {
    return {
      items,
      add: (item, qty = 1) =>
        setItems((prev) => {
          const i = prev.findIndex((p) => p.productId === item.productId);
          if (i >= 0) {
            const next = [...prev];
            next[i] = { ...next[i], qty: next[i].qty + qty };
            return next;
          }
          return [...prev, { ...item, qty }];
        }),
      remove: (productId) => setItems((prev) => prev.filter((p) => p.productId !== productId)),
      setQty: (productId, qty) =>
        setItems((prev) => prev.map((p) => (p.productId === productId ? { ...p, qty: Math.max(1, qty) } : p))),
      clear: () => setItems([]),
      totalCents: items.reduce((sum, i) => sum + i.price * i.qty, 0),
    };
  }, [items]);

  return <CartCtx.Provider value={api}>{children}</CartCtx.Provider>;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
