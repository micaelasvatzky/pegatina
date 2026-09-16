"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import type { Sticker } from "@/lib/types";
import AuthModal from "@/components/AuthModal";

/**
 * Bloque de compra del detalle: selector de cantidad + "Agregar al carrito".
 * - Sin sesión → AuthModal (centrado en pantalla).
 * - Si el carrito ya tiene stickers de OTRO artista → modal de aviso centrado.
 */
export default function AddToCartButton({ sticker }: { sticker: Sticker }) {
  const { isLoggedIn, usuario } = useAuth();
  const { add } = useCart();
  const [cantidad, setCantidad] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [otroArtista, setOtroArtista] = useState<string | null>(null);
  const artistaRef = useRef<HTMLDivElement>(null);

  const restar = () => setCantidad((c) => Math.max(1, c - 1));
  const sumar = () => setCantidad((c) => Math.min(99, c + 1));

  // Cerrar modal de artista al hacer click fuera
  useEffect(() => {
    if (!otroArtista) return;
    function handleClick(e: MouseEvent) {
      if (artistaRef.current && !artistaRef.current.contains(e.target as Node)) {
        setOtroArtista(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [otroArtista]);

  // El ilustrador solo vende: su cuenta no puede comprar stickers.
  if (isLoggedIn && usuario?.rol === "ilustrador") {
    return (
      <div className="flex items-center gap-2 rounded-xl border-2 border-line bg-card px-5 py-4 text-sm font-semibold text-ink-soft shadow-[2px_2px_0px_var(--color-line)]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secundario">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
        Tu cuenta es de ilustrador — solo vendés stickers
      </div>
    );
  }

  const handleClick = () => {
    if (isLoggedIn) {
      const res = add(sticker, cantidad);
      if (!res.ok) {
        setOtroArtista(res.otroArtista ?? "");
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <div className="flex items-stretch gap-3">
        {/* Selector de cantidad — estilo Stitch: cuadrado con borde + shadow */}
        <div className="flex items-center rounded-xl border-2 border-line bg-paper shadow-[2px_2px_0px_var(--color-line)]">
          <button
            aria-label="Restar"
            onClick={restar}
            disabled={cantidad <= 1}
            className="flex h-11 w-11 items-center justify-center rounded-l-xl text-lg font-bold text-ink transition-colors hover:bg-wash disabled:opacity-30"
          >
            −
          </button>
          <span className="w-10 select-none text-center text-lg font-bold text-ink tabular-nums">
            {cantidad}
          </span>
          <button
            aria-label="Sumar"
            onClick={sumar}
            disabled={cantidad >= 99}
            className="flex h-11 w-11 items-center justify-center rounded-r-xl text-lg font-bold text-ink transition-colors hover:bg-wash disabled:opacity-30"
          >
            +
          </button>
        </div>

        {/* Botón Agregar al carrito — naranja (fiel al ref del detalle) */}
        <button
          onClick={handleClick}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-line bg-primario px-6 py-3 font-bold text-white shadow-[3px_3px_0px_var(--color-line)] transition-all hover:bg-ink active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_var(--color-line)]"
        >
          <span className="icon text-lg" aria-hidden>
            add_shopping_cart
          </span>
          Agregar al carrito
        </button>
      </div>

      {showModal && (
        <AuthModal sticker={sticker} onClose={() => setShowModal(false)} />
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
              <button
                onClick={() => setOtroArtista(null)}
                className="mt-6 w-full rounded-xl border-2 border-line bg-acento py-3 font-bold text-ink shadow-[2px_2px_0px_var(--color-line)] transition-all hover:bg-primario hover:text-white"
              >
                Entendido
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
