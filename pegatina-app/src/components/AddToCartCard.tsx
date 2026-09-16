"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import type { Sticker } from "@/lib/types";

type Props = {
  sticker: Sticker;
  /** Color del botón "Agregar" (variedad visual de las cards Stitch). */
  accent?: "primario" | "cobalt" | "acento";
};

const ACCENT_STYLES: Record<NonNullable<Props["accent"]>, string> = {
  primario: "bg-primario text-white hover:bg-acento hover:text-ink",
  cobalt: "bg-cobalt text-white hover:bg-cobalt-dark",
  acento: "bg-acento text-ink hover:bg-primario hover:text-white",
};

/**
 * Bloque de compra de la card (catálogo/landing): stepper chico + botón
 * "Agregar" — estilo compacto de los refs Stitch.
 * - Sin sesión → modal centrado (createPortal) pidiendo login.
 * - Si el carrito ya tiene stickers de OTRO artista → modal de aviso.
 */
export default function AddToCartCard({
  sticker,
  accent = "primario",
}: Props) {
  const { add, openCart } = useCart();
  const { isLoggedIn, usuario } = useAuth();
  const router = useRouter();
  const [cantidad, setCantidad] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [otroArtista, setOtroArtista] = useState<string | null>(null);
  const loginRef = useRef<HTMLDivElement>(null);
  const artistaRef = useRef<HTMLDivElement>(null);

  // Cerrar modales al hacer click fuera
  useEffect(() => {
    if (!showLoginModal && !otroArtista) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (showLoginModal && loginRef.current && !loginRef.current.contains(target)) {
        setShowLoginModal(false);
      }
      if (otroArtista && artistaRef.current && !artistaRef.current.contains(target)) {
        setOtroArtista(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showLoginModal, otroArtista]);

  // El ilustrador solo vende: su cuenta no puede comprar stickers.
  if (isLoggedIn && usuario?.rol === "ilustrador") {
    return (
      <div className="flex items-center gap-1.5 rounded-lg border border-line/40 bg-paper px-2.5 py-1.5 text-[11px] font-semibold italic text-muted">
        <span className="icon text-sm" aria-hidden>
          info
        </span>
        Modo vendedor — no compra por acá
      </div>
    );
  }

  function handleAgregar() {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    if (usuario?.rol === "ilustrador") return;
    const res = add(sticker, cantidad);
    if (!res.ok) {
      setOtroArtista(res.otroArtista ?? "");
      return;
    }
    // add() ya abre el drawer
  }

  return (
    <>
      {/* Stepper + Botón Agregar — compacto estilo Stitch */}
      <div className="flex items-center gap-1.5">
        {/* Stepper chico */}
        <div className="flex items-center rounded-lg border border-line/30 bg-paper px-0.5 py-0.5">
          <button
            onClick={() => setCantidad((c) => Math.max(1, c - 1))}
            aria-label="Disminuir cantidad"
            className="flex h-7 w-7 items-center justify-center rounded-md text-base font-bold text-ink transition-colors hover:text-cobalt"
          >
            −
          </button>
          <span className="w-7 select-none text-center text-sm font-bold text-ink tabular-nums">
            {cantidad}
          </span>
          <button
            onClick={() => setCantidad((c) => Math.min(99, c + 1))}
            aria-label="Aumentar cantidad"
            className="flex h-7 w-7 items-center justify-center rounded-md text-base font-bold text-ink transition-colors hover:text-cobalt"
          >
            +
          </button>
        </div>

        {/* Botón Agregar */}
        <button
          onClick={handleAgregar}
          className={`flex items-center gap-1 rounded-lg border-2 border-line px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide shadow-[1.5px_1.5px_0px_var(--color-line)] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${
            ACCENT_STYLES[accent]
          }`}
        >
          <span className="icon text-sm" aria-hidden>
            add_shopping_cart
          </span>
          Agregar
        </button>
      </div>

      {/* Modal de login — CENTRADO en pantalla (portal, no se recorta en la card) */}
      {showLoginModal &&
        createPortal(
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-ink/50 p-4">
            <div
              ref={loginRef}
              className="w-full max-w-sm rounded-2xl border-2 border-line bg-crema p-8 shadow-[6px_6px_0px_var(--color-line)]"
            >
              <h3 className="font-display text-2xl font-black text-ink">
                Iniciá sesión para agregar al carrito
              </h3>
              <p className="mb-6 mt-2 text-sm text-ink-soft">
                Necesitás tener una cuenta para comprar stickers.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 rounded-xl border-2 border-line bg-card py-3 font-bold text-ink transition-colors hover:bg-wash"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    router.push(
                      `/login?redirect=${encodeURIComponent(
                        window.location.pathname
                      )}`
                    );
                  }}
                  className="flex-1 rounded-xl border-2 border-line bg-primario py-3 font-bold text-white shadow-[2px_2px_0px_var(--color-line)] transition-colors hover:bg-ink"
                >
                  Iniciar sesión
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Modal "solo stickers de un artista" — CENTRADO en pantalla */}
      {otroArtista !== null &&
        createPortal(
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-ink/50 p-4">
            <div
              ref={artistaRef}
              className="w-full max-w-md rounded-2xl border-2 border-line bg-crema p-8 shadow-[6px_6px_0px_var(--color-line)]"
            >
              <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-line bg-acento text-2xl">
                🛒
              </span>
              <h3 className="font-display text-2xl font-black leading-tight text-ink">
                Tu carrito solo puede tener stickers de un artista
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                Ya tenés stickers de <strong>{otroArtista}</strong> en el
                carrito. Andá a la feria de ese artista y terminá esa compra, o
                vaciá el carrito para empezar con{" "}
                <strong>{sticker.ilustrador}</strong>.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <button
                  onClick={() => setOtroArtista(null)}
                  className="w-full rounded-xl border-2 border-line bg-acento py-3 font-bold text-ink shadow-[2px_2px_0px_var(--color-line)] transition-all hover:bg-primario hover:text-white"
                >
                  Entendido
                </button>
                <button
                  onClick={() => {
                    setOtroArtista(null);
                    openCart();
                  }}
                  className="w-full py-2 text-sm font-bold text-muted underline-offset-2 hover:underline"
                >
                  Ver mi carrito
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}