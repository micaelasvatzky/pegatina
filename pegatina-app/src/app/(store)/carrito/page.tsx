"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

/**
 * Página de carrito — a la que se llega desde el panel lateral ("Ir a pagar").
 * Resume items, cantidades y lleva al checkout.
 */
export default function CarritoPage() {
  const { items, total, count, setCantidad, remove } = useCart();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <h1 className="mb-8 text-3xl font-bold text-ink md:text-4xl">Tu carrito</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-line bg-white py-16 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-crema text-muted">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path d="M3 7H21V21H3V7Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 10V5.5C8 3.5 10 2 12 2C14 2 16 3.5 16 5.5V10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
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
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-white p-5 md:flex-nowrap md:gap-5"
              >
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-crema md:h-24 md:w-24">
                  <span className="text-4xl">🎨</span>
                </div>

                <div className="flex min-w-[8rem] flex-1 flex-col">
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
                <div className="w-auto text-right md:w-28">
                  <p className="font-bold text-ink">
                    ${(sticker.precio * cantidad).toLocaleString("es-AR")}
                  </p>
                </div>

                {/* Quitar */}
                <button
                  aria-label="Quitar"
                  onClick={() => remove(sticker.id)}
                  className="ml-auto text-muted hover:text-primario md:ml-0"
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
              {/* Sin sesión, el proxy manda al login con ?redirect=/checkout */}
              <Link
                href="/checkout"
                className="w-full rounded-full bg-primario py-4 text-center font-bold text-white transition-colors hover:bg-ink"
              >
                Finalizar compra
              </Link>
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
