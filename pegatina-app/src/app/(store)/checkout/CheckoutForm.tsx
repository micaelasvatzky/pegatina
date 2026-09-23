"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

/**
 * Checkout: datos de envío + confirmación de compra.
 *
 * Con Mercado Pago activo (`mpActivo`) el POST /api/pedidos devuelve un
 * `checkout_url` (Checkout Pro) y acá redirigimos al comprador a MP. El pago
 * se confirma por webhook; el pedido nace "pending" igual.
 *
 * Sin MP activo: pago por transferencia (fallback) — el flujo clásico.
 */
export default function CheckoutForm({ mpActivo = false }: { mpActivo?: boolean }) {
  const router = useRouter();
  const { items, total, count, empty } = useCart();
  const { usuario } = useAuth();

  const [nombre, setNombre] = useState(usuario?.nombre ?? "");
  const [calle, setCalle] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [provincia, setProvincia] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [notas, setNotas] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Carrito vacío (o quedó vacío tras la compra) → estado tranqui.
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center md:px-6">
        <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-line bg-card px-8 py-16 nb-shadow">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-lilac/60 text-muted">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path d="M3 7H21V21H3V7Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 10V5.5C8 3.5 10 2 12 2C14 2 16 3.5 16 5.5V10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
          <p className="text-lg text-muted">Tu carrito está vacío.</p>
          <Link
            href="/catalogo"
            className="rounded-full border-2 border-line bg-primario px-8 py-3 font-bold text-white nb-lift hover:bg-ink"
          >
            Explorar stickers
          </Link>
        </div>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            sticker_id: i.sticker.id,
            cantidad: i.cantidad,
          })),
          envio: { nombre, calle, ciudad, provincia, codigo_postal: codigoPostal, notas },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No pudimos procesar tu compra.");
        return;
      }
      empty();
      if (mpActivo && data.checkout_url) {
        // Checkout Pro: el pago se hace en la página de Mercado Pago.
        window.location.assign(data.checkout_url);
        return;
      }
      router.replace(`/pedidos/${data.id}?comprado=1`);
    } catch {
      setError("Hubo un error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-full border border-line bg-white px-5 py-3 text-ink focus:border-primario focus:outline-none";

  return (
    <form
      onSubmit={submit}
      className="flex flex-col gap-8 lg:flex-row lg:items-start"
    >
      {/* Datos de envío */}
      <div className="flex-1 rounded-2xl border-2 border-line bg-card p-6 nb-shadow-md md:p-8">
        <h2 className="mb-5 text-lg font-bold text-ink">Datos de envío</h2>
        {error && (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-ink">
              Nombre y apellido
            </label>
            <input
              required
              className={inputClass}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-ink">
              Calle y altura
            </label>
            <input
              required
              className={inputClass}
              placeholder="Av. Corrientes 1234, piso 5"
              value={calle}
              onChange={(e) => setCalle(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">
              Ciudad
            </label>
            <input
              required
              className={inputClass}
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">
              Código postal
            </label>
            <input
              required
              className={inputClass}
              value={codigoPostal}
              onChange={(e) => setCodigoPostal(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-ink">
              Provincia
            </label>
            <select
              required
              className={inputClass}
              value={provincia}
              onChange={(e) => setProvincia(e.target.value)}
            >
              <option value="">Elegí tu provincia...</option>
              {[
                "Buenos Aires", "Ciudad de Buenos Aires", "Catamarca",
                "Chaco", "Chubut", "Córdoba", "Corrientes", "Entre Ríos",
                "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza",
                "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan",
                "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero",
                "Tierra del Fuego", "Tucumán",
              ].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-ink">
              Notas para el artista <span className="font-normal text-muted">(opcional)</span>
            </label>
            <textarea
              className="w-full resize-none rounded-2xl border border-line px-5 py-3 text-ink focus:border-primario focus:outline-none bg-white"
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Saludos, dedicatoria, instrucciones para el envío..."
            />
          </div>
        </div>
      </div>

      {/* Resumen + pago */}
      <div className="w-full rounded-2xl border-2 border-line bg-card p-6 nb-shadow-md md:p-8 lg:w-96 lg:shrink-0">
        <h2 className="mb-5 text-lg font-bold text-ink">Tu compra</h2>
        <ul className="flex flex-col gap-3">
          {items.map(({ sticker, cantidad }) => (
            <li key={sticker.id} className="flex items-center justify-between text-sm">
              <span className="text-ink">
                {cantidad} × {sticker.nombre}
              </span>
              <span className="font-semibold text-ink">
                ${(sticker.precio * cantidad).toLocaleString("es-AR")}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
          <span className="text-ink">Total ({count} ítems)</span>
          <span className="text-xl font-bold text-ink">
            ${total.toLocaleString("es-AR")} ARS
          </span>
        </div>

        {/* Pago: Mercado Pago (Checkout Pro) o transferencia (fallback) */}
        {mpActivo ? (
          <div className="mt-5 rounded-2xl bg-secundario/10 p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-secundario">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M12 2L14 9H21L15.5 13.5L17.5 21L12 16.5L6.5 21L8.5 13.5L3 9H10L12 2Z" fill="currentColor" />
              </svg>
              Pagás con Mercado Pago
            </p>
            <p className="mt-1 text-xs text-muted">
              Al confirmar te redirigimos a la página segura de Mercado Pago
              para pagar con dinero en cuenta, tarjeta o efectivo. Tu pedido
              arranca apenas se acredite el pago.
            </p>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl bg-primario/10 p-4">
            <p className="text-sm font-bold text-primario">Pago por transferencia</p>
            <p className="mt-1 text-xs text-muted">
              Cuando confirmes, el artista te va a pasar sus datos para transferirle
              el total. Tu pedido queda &quot;Pendiente&quot; hasta que lo confirme.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 w-full rounded-full border-2 border-line bg-primario py-4 font-bold text-white transition-colors hover:bg-ink disabled:opacity-50 nb-shadow-sm nb-lift"
        >
          {loading
            ? "Procesando..."
            : mpActivo
              ? "Ir a pagar"
              : "Confirmar compra"}
        </button>
        <Link
          href="/carrito"
          className="mt-3 block text-center text-sm text-muted underline hover:text-primario"
        >
          Volver al carrito
        </Link>
      </div>
    </form>
  );
}