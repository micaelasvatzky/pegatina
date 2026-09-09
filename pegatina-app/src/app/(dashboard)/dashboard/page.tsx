import Link from "next/link";
import { getSession, getUsuarioById } from "@/lib/auth";
import {
  getPedidosPorEnviar,
  getStickersByIlustrador,
  getVentasDelMes,
} from "@/lib/data";

// Dinámica: consulta MongoDB en runtime, no en build time.
export const dynamic = "force-dynamic";

/** Iconos SVG para las stats (en lugar de emojis). */
const IconVentas = (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path d="M3 17L9 11L13 15L21 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15 7H21V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconPedidosPendientes = (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path d="M4 5.5H20V19.5H4V5.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 3.5V7.5M16 3.5V7.5M4 10.5H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const IconStickers = (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path d="M12 3L15 6H19V10L22 13L19 16V20H15L12 23L9 20H5V16L2 13L5 10V6H9L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/**
 * Dashboard principal del ilustrador.
 * Server component: trae el usuario logueado y sus stickers reales de Mongo.
 */
export default async function DashboardPage() {
  const sesion = await getSession();
  const usuario = sesion ? await getUsuarioById(sesion.sub) : null;

  const handle = usuario?.usuario ?? null;
  const stickers = handle ? await getStickersByIlustrador(handle) : [];
  const stickersCount = stickers.length;
  const primerNombre = usuario?.nombre?.split(" ")[0] ?? "Ilustrador";

  // Datos REALES de ventas y pedidos pendientes de envío.
  const ventasMes = handle ? await getVentasDelMes(handle) : 0;
  const porEnviar = handle ? await getPedidosPorEnviar(handle) : [];

  const stats = [
    {
      label: "Ventas del mes",
      value: ventasMes.toLocaleString("es-AR", {
        style: "currency",
        currency: "ARS",
      }),
      icon: IconVentas,
      bg: "bg-primario/10 text-primario",
    },
    {
      label: "Pedidos por enviar",
      value: String(porEnviar.length),
      icon: IconPedidosPendientes,
      bg: "bg-acento/20 text-[#c99400]",
    },
    {
      label: "Stickers publicados",
      value: String(stickersCount),
      icon: IconStickers,
      bg: "bg-secundario/15 text-secundario",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink md:text-4xl">
          Hola, {primerNombre}
        </h1>
        <p className="mt-2 text-base text-muted md:text-lg">
          {handle ? (
            <>
              <span className="font-semibold text-primario">{handle}</span>{" "}
              — así va tu tienda
            </>
          ) : (
            "Así va tu tienda"
          )}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-line bg-white p-6 shadow-sm"
          >
            <span
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}
            >
              {stat.icon}
            </span>
            <p className="text-[15px] text-muted">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-ink">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* CTA subir sticker */}
      <div className="mt-8 flex flex-col items-center justify-between gap-6 rounded-2xl bg-primario p-8 text-white sm:flex-row">
        <div className="text-center sm:text-left">
          <p className="text-xl font-bold">¿Tenés un diseño nuevo?</p>
          <p className="mt-1 text-white/80">
            Subilo a tu tienda y empezá a vender hoy mismo.
          </p>
        </div>
        <Link
          href="/dashboard/stickers/nuevo"
          className="shrink-0 rounded-full bg-white px-6 py-3 font-bold text-primario transition-colors hover:bg-crema"
        >
          Subir sticker
        </Link>
      </div>
    </div>
  );
}