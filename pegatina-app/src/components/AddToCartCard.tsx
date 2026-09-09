"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import type { Sticker } from "@/lib/types";
import AuthModal from "@/components/AuthModal";

/**
 * Botón de agregar al carrito para las CARDS.
 * Incluye un pequeño selector de cantidad y el botón (+ modal de login
 * si no está logueado).
 */
export default function AddToCartCard({ sticker }: { sticker: Sticker }) {
  const { isLoggedIn, usuario } = useAuth();
  const { add } = useCart();
  const [cantidad, setCantidad] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const restar = () => setCantidad((c) => Math.max(1, c - 1));
  const sumar = () => setCantidad((c) => Math.min(99, c + 1));

  // El ilustrador solo vende: su cuenta no puede comprar stickers.
  if (isLoggedIn && usuario?.rol === "ilustrador") {
    return (
      <p className="mt-3 rounded-full border border-line bg-crema px-3 py-2 text-center text-xs font-semibold text-muted">
        Modo vendedor: no podés comprar
      </p>
    );
  }

  const handleClick = () => {
    if (isLoggedIn) {
      add(sticker, cantidad);
      setCantidad(1);
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <div className="mt-3 flex items-center gap-2">
        {/* Selector de cantidad */}
        <div className="flex items-center gap-2 rounded-full border border-line bg-white px-2">
          <button
            aria-label="Restar"
            onClick={restar}
            disabled={cantidad <= 1}
            className="px-1 text-base font-bold text-ink transition-colors hover:text-primario disabled:opacity-30"
          >
            −
          </button>
          <span className="w-4 text-center text-sm font-bold text-ink">
            {cantidad}
          </span>
          <button
            aria-label="Sumar"
            onClick={sumar}
            disabled={cantidad >= 99}
            className="px-1 text-base font-bold text-ink transition-colors hover:text-primario disabled:opacity-30"
          >
            +
          </button>
        </div>

        <button
          onClick={handleClick}
          className="flex-1 rounded-full bg-primario px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-ink"
        >
          Agregar
        </button>
      </div>

      {showModal && (
        <AuthModal sticker={sticker} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
