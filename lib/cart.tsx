'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Product } from '@/lib/supabase';

export type LensCustomization = {
  lensName: string;
  lensPrice: number;
  rightSphere: string;
  rightCylinder: string;
  rightAxis: string;
  leftSphere: string;
  leftCylinder: string;
  leftAxis: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
  lens?: LensCustomization;
};

type CartContextType = {
  items: CartItem[];
  addItem: (product: Product, qty?: number, lens?: LensCustomization) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clear: () => void;
  total: number;
  count: number;
};

const CartContext = createContext<CartContextType | null>(null);

const itemKey = (i: CartItem) => i.product.id + (i.lens ? `_${i.lens.lensName}_${i.lens.rightSphere}_${i.lens.leftSphere}` : '');

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart');
      if (saved) setItems(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, qty = 1, lens?: LensCustomization) => {
    setItems((prev) => {
      const key = itemKey({ product, quantity: qty, lens });
      const existing = prev.find((i) => itemKey(i) === key);
      if (existing) {
        return prev.map((i) =>
          itemKey(i) === key ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, { product, quantity: qty, lens }];
    });
  };

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((i) => itemKey(i) !== key));
  };

  const updateQty = (key: string, qty: number) => {
    if (qty <= 0) { removeItem(key); return; }
    setItems((prev) => prev.map((i) => (itemKey(i) === key ? { ...i, quantity: qty } : i)));
  };

  const clear = () => setItems([]);

  const total = items.reduce((s, i) => {
    const base = (i.product.discount_price ?? i.product.price) * i.quantity;
    const lens = i.lens ? i.lens.lensPrice * i.quantity : 0;
    return s + base + lens;
  }, 0);
  const count = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clear, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export { itemKey };
