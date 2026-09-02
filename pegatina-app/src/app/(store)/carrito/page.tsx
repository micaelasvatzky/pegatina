"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

/**
 * Página de carrito — a la que se llega desde el panel lateral ("Ir a pagar").
 * Resume items, cantidades y muestra botón de checkout.
 */
export default function CarritoPage() {
  const { items, total, count, setCantidad, remove, openCart } = useCart();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-8 text-4xl font-bold text-ink">Tu carrito</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-line bg-white py-16 text-center">
          <span className="text-6xl">🛒</span>
          <p className="text-lg text-muted">Tu carrito está vacío.</p>
          <Link
            href="/catalogo"
            className="mt-2 rounded-full bg-primario px-8 py-3 font-bold text-white hover:bg-ink"
          >
            Explorar stickers
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Items */}
          <div className="flex flex-col gap-4">
            {items.map(({ sticker, cantidad }) => (
              <div
                key={sticker.id}
                className="flex items-center gap-5 rounded-2xl border border-line bg-white p-5"
              >
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl bg-crema">
                  <span className="text-4xl">🎨</span>
                </div>

                <div className="flex flex-1 flex-col">
                  <p className="font-semibold text-ink">{sticker.nombre}</p>
                  <p className="text-sm text-muted">{sticker.ilustrador}</p>
                  <p className="mt-1 text-sm font-bold text-primario">
                    ${sticker.precio.toLocaleString("es-AR")} ARS
                  </p>
                </div>

                {/* Cantidad */}
                <div className="flex items-center gap-3 rounded-full border border-line px-4 py-2">
                  <button
                    aria-label="Restar"
                    onClick={() => setCantidad(sticker.id, cantidad - 1)}
                    className="font-bold text-ink"
                  >
                    −
                  </button>
                  <span className="min-w-[1.25rem] text-center font-bold">
                    {cantidad}
                  </span>
                  <button
                    aria-label="Sumar"
                    onClick={() => setCantidad(sticker.id, cantidad + 1)}
                    className="font-bold text-ink"
                  >
                    +
                  </button>
                </div>

                {/* Subtotal */}
                <div className="w-28 text-right">
                  <p className="font-bold text-ink">
                    ${(sticker.precio * cantidad).toLocaleString("es-AR")}
                  </p>
                </div>

                {/* Quitar */}
                <button
                  aria-label="Quitar"
                  onClick={() => remove(sticker.id)}
                  className="text-muted hover:text-primario"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Resumen */}
          <div className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-6">
            <div className="flex items-center justify-between">
              <span className="text-lg text-ink">
                Total ({count} ítems)
              </span>
              <span className="text-2xl font-bold text-ink">
                ${total.toLocaleString("es-AR")} ARS
              </span>
            </div>
            <button
              onClick={openCart}
              className="w-full rounded-full bg-primario py-4 font-bold text-white transition-colors hover:bg-ink"
            >
              Continuar a la compra
            </button>
            <Link
              href="/catalogo"
              className="text-center text-sm text-muted underline hover:text-primario"
            >
              Seguir explorando
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
