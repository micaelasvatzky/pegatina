"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import type { Sticker } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";

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

/**
 * Carrito con dos reglas de diseño:
 *
 * 1) PERFECTENCIA: persiste en localStorage mientras dura la sesión.
 * 2) IMPLEMENTA EL CONCEPTO: el carrito le pertenece a UNA identidad.
 *    Cuando el usuario cambia (login/logout), el carrito arranca vacío.
 *    Los invitados no pueden agregar (lo bloquea AddToCart*), así que
 *    en la práctica el carrito solo tiene sentido logueado.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const { usuario, loading: authLoading } = useAuth();
  const usuarioId = usuario?.id ?? null;

  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Identidad a la que le pertenece el carrito actual.
  const ownerRef = useRef<string | null>("__pendiente__");
  // Evita limpiar el carrito cuando la sesión es la misma tras un refresh.
  const initializedRef = useRef(false);

  // Hidratar el carrito UNA vez, cuando auth terminó de cargar la sesión.
  // Así el carrito guardado se conserva al refrescar con la MISMA sesión.
  useEffect(() => {
    if (authLoading || initializedRef.current) return;
    initializedRef.current = true;
    ownerRef.current = usuarioId;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  // Si la identidad cambió después (login/logout) → carrito nuevo, vacío.
  useEffect(() => {
    if (!hydrated) return;
    if (ownerRef.current === usuarioId) return;
    ownerRef.current = usuarioId;
    setItems([]);
    setIsOpen(false);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, [usuarioId, hydrated]);

  // Persistir cuando cambia (solo después de hidratar).
  useEffect(() => {
    if (hydrated) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch {
        /* ignore */
      }
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