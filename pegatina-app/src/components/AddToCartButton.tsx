"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import type { Sticker } from "@/lib/types";
import AuthModal from "@/components/AuthModal";

/**
 * Bloque de compra del detalle: selector de cantidad + "Agregar al carrito".
 * Si no está logueado, muestra AuthModal. Si sí, agrega la cantidad elegida.
 */
export default function AddToCartButton({ sticker }: { sticker: Sticker }) {
  const { isLoggedIn } = useAuth();
  const { add } = useCart();
  const [cantidad, setCantidad] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const restar = () => setCantidad((c) => Math.max(1, c - 1));
  const sumar = () => setCantidad((c) => Math.min(99, c + 1));

  const handleClick = () => {
    if (isLoggedIn) {
      add(sticker, cantidad);
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <div className="flex gap-4">
        {/* Selector de cantidad */}
        <div className="flex items-center gap-4 rounded-full border border-line bg-white px-4">
          <button
            aria-label="Restar"
            onClick={restar}
            disabled={cantidad <= 1}
            className="py-3 text-xl font-bold text-ink transition-colors hover:text-primario disabled:opacity-30"
          >
            −
          </button>
          <span className="w-6 text-center text-lg font-bold text-ink">
            {cantidad}
          </span>
          <button
            aria-label="Sumar"
            onClick={sumar}
            disabled={cantidad >= 99}
            className="py-3 text-xl font-bold text-ink transition-colors hover:text-primario disabled:opacity-30"
          >
            +
          </button>
        </div>

        <button
          onClick={handleClick}
          className="flex-1 rounded-full bg-primario px-6 py-4 font-bold text-white transition-colors hover:bg-ink"
        >
          Agregar al carrito
        </button>
      </div>

      {showModal && (
        <AuthModal sticker={sticker} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
