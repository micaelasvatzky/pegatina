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
import { createPortal } from "react-dom";
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
  /**
   * Agrega un sticker al carrito. Regla: el carrito solo puede contener
   * stickers de UN MISMO artista (el envío lo hace el ilustrador).
   * Devuelve { ok: true } si se agregó, o
   * { ok: false, otroArtista: string } si el carrito ya tiene stickers
   * de otro artista.
   */
  add: (
    sticker: Sticker,
    cantidad?: number
  ) => { ok: boolean; otroArtista?: string };
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
  const [notice, setNotice] = useState<{ ownerId: string | null } | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

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
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hidratación ÚNICA desde localStorage (sistema externo) después de que auth resuelve; el server no puede leer localStorage, así que no hay otra fuente de verdad
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
    // El carrito pertenece a UN artista: no mezclar mesones.
    if (items.length > 0 && items[0].sticker.ilustrador !== sticker.ilustrador) {
      return { ok: false, otroArtista: items[0].sticker.ilustrador };
    }
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
    setNotice({ ownerId: usuarioId });
    return { ok: true };
  }, [items, usuarioId]);

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
      {notice && notice.ownerId === usuarioId && createPortal(
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[130] flex justify-center px-4">
          <div role="status" aria-live="polite" className="pointer-events-auto flex max-w-sm items-center gap-3 rounded-2xl border-2 border-line bg-mint px-5 py-4 font-bold text-ink nb-shadow-md">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Agregado al carrito
            <button type="button" onClick={() => setNotice(null)} aria-label="Cerrar aviso" className="ml-2 flex h-8 w-8 items-center justify-center rounded-full hover:bg-ink/10 focus-visible:outline-2 focus-visible:outline-ink">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="m6 6 12 12M6 18 18 6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>,
        document.body
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}
