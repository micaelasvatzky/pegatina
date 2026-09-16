"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import type { Sticker } from "@/lib/types";

type Props = {
  sticker: Sticker;
};

/**
 * Bloque de compra de la card (catálogo/landing): stepper + botón Agregar.
 * - Si no hay sesión → modal centrado (createPortal) pidiendo login.
 * - Si el carrito ya tiene stickers de OTRO artista → modal de aviso.
 */
export default function AddToCartCard({ sticker }: Props) {
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

  // Ilustrador no puede comprar
  if (isLoggedIn && usuario?.rol === "ilustrador") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-line bg-card px-4 py-3 text-sm italic text-muted">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
          <path d="M8 12h8"/>
        </svg>
        <span className="text-ink-soft">Modo vendedor — agregar al carrito no aplica aquí</span>
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
      {/* Stepper + Botón Agregar — estilo Stitch */}
      <div className="flex items-center gap-3">
        {/* Stepper */}
        <div className="flex items-center rounded-xl border-2 border-line bg-paper shadow-[2px_2px_0px_var(--color-line)]">
          <button
            onClick={() => setCantidad((c) => Math.max(1, c - 1))}
            aria-label="Disminuir cantidad"
            className="flex h-9 w-9 items-center justify-center rounded-l-xl text-lg font-bold text-ink transition-colors hover:bg-wash"
          >
            −
          </button>
          <span className="w-10 select-none text-center font-bold text-ink tabular-nums">
            {cantidad}
          </span>
          <button
            onClick={() => setCantidad((c) => Math.min(99, c + 1))}
            aria-label="Aumentar cantidad"
            className="flex h-9 w-9 items-center justify-center rounded-r-xl text-lg font-bold text-ink transition-colors hover:bg-wash"
          >
            +
          </button>
        </div>

        {/* Botón Agregar */}
        <button
          onClick={handleAgregar}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-line bg-acento px-4 py-3 text-sm font-bold text-ink shadow-[3px_3px_0px_var(--color-line)] transition-all hover:bg-primario hover:text-white active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_var(--color-line)]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
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