"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

/**
 * Panel lateral de carrito desplegable.
 * Muestra items, cantidades, total y botón para ir a /carrito.
 */
export default function CartDrawer() {
  const { items, total, count, isOpen, closeCart, setCantidad, remove } =
    useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm"
        onClick={closeCart}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-50 flex h-full w-[400px] max-w-full flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-xl font-bold text-ink">
            Tu carrito ({count})
          </h2>
          <button
            aria-label="Cerrar carrito"
            onClick={closeCart}
            className="text-muted transition-colors hover:text-ink"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <span className="text-5xl">🛒</span>
              <p className="text-muted">Tu carrito está vacío.</p>
              <Link
                href="/catalogo"
                onClick={closeCart}
                className="mt-2 rounded-full bg-primario px-6 py-2.5 font-bold text-white hover:bg-ink"
              >
                Explorar stickers
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {items.map(({ sticker, cantidad }) => (
                <div key={sticker.id} className="flex gap-4">
                  {/* Thumb */}
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-crema">
                    <span className="text-3xl">🎨</span>
                  </div>

                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-ink">{sticker.nombre}</p>
                      <button
                        aria-label="Quitar"
                        onClick={() => remove(sticker.id)}
                        className="text-muted hover:text-primario"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-sm text-muted">{sticker.ilustrador}</p>

                    <div className="mt-2 flex items-center justify-between">
                      {/* Cantidad */}
                      <div className="flex items-center gap-3 rounded-full border border-line px-3 py-1">
                        <button
                          aria-label="Restar"
                          onClick={() => setCantidad(sticker.id, cantidad - 1)}
                          className="text-ink"
                        >
                          −
                        </button>
                        <span className="min-w-[1rem] text-center font-bold">
                          {cantidad}
                        </span>
                        <button
                          aria-label="Sumar"
                          onClick={() => setCantidad(sticker.id, cantidad + 1)}
                          className="text-ink"
                        >
                          +
                        </button>
                      </div>
                      <p className="font-bold text-primario">
                        ${(sticker.precio * cantidad).toLocaleString("es-AR")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-line px-6 py-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-lg text-ink">Total</span>
              <span className="text-2xl font-bold text-ink">
                ${total.toLocaleString("es-AR")} ARS
              </span>
            </div>
            <Link
              href="/carrito"
              onClick={closeCart}
              className="block w-full rounded-full bg-primario py-4 text-center font-bold text-white transition-colors hover:bg-ink"
            >
              Ir a pagar
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
