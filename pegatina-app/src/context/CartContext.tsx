"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Sticker } from "@/lib/types";

export interface CartItem {
  sticker: Sticker;
  cantidad: number;
}

interface CartContextValue {
  items: CartItem[];
  total: number;
  count: number;
  isOpen: boolean;
  add: (sticker: Sticker, cantidad?: number) => void;
  remove: (id: string) => void;
  setCantidad: (id: string, cantidad: number) => void;
  empty: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "pegatina-carrito";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Cargar desde localStorage una vez (solo en el cliente)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // Persistir cuando cambia
  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, hydrated]);

  const add = useCallback((sticker: Sticker, cantidad = 1) => {
    setItems((prev) => {
      const exist = prev.find((i) => i.sticker.id === sticker.id);
      if (exist) {
        return prev.map((i) =>
          i.sticker.id === sticker.id
            ? { ...i, cantidad: i.cantidad + cantidad }
            : i
        );
      }
      return [...prev, { sticker, cantidad }];
    });
    setIsOpen(true);
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.sticker.id !== id));
  }, []);

  const setCantidad = useCallback((id: string, cantidad: number) => {
    setItems((prev) =>
      cantidad <= 0
        ? prev.filter((i) => i.sticker.id !== id)
        : prev.map((i) => (i.sticker.id === id ? { ...i, cantidad } : i))
    );
  }, []);

  const empty = useCallback(() => setItems([]), []);

  const total = items.reduce(
    (sum, i) => sum + i.sticker.precio * i.cantidad,
    0
  );
  const count = items.reduce((sum, i) => sum + i.cantidad, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        total,
        count,
        isOpen,
        add,
        remove,
        setCantidad,
        empty,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}
