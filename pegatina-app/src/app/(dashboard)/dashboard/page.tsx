import Link from "next/link";
import { getSession, getUsuarioById } from "@/lib/auth";
import { getStickersByIlustrador } from "@/lib/data";

/**
 * Dashboard principal del ilustrador.
 * Server component: trae el usuario logueado y sus stickers reales de Mongo.
 * (Ventas y pedidos llegan cuando conectemos esas queries.)
 */
export default async function DashboardPage() {
  const sesion = await getSession();
  const usuario = sesion ? await getUsuarioById(sesion.sub) : null;

  const handle = usuario?.usuario ?? null;
  const stickers = handle ? await getStickersByIlustrador(handle) : [];
  const stickersCount = stickers.length;
  const primerNombre = usuario?.nombre?.split(" ")[0] ?? "Ilustrador";

  const stats = [
    {
      label: "Ventas del mes",
      value: "$0 ARS",
      emoji: "💰",
      bg: "bg-primario/10",
    },
    {
      label: "Pedidos por enviar",
      value: "0",
      emoji: "📦",
      bg: "bg-acento/20",
    },
    {
      label: "Stickers publicados",
      value: String(stickersCount),
      emoji: "🎨",
      bg: "bg-secundario/15",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-ink">
          Hola, {primerNombre} 👋
        </h1>
        <p className="mt-2 text-lg text-muted">
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
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-line bg-white p-6 shadow-sm"
          >
            <span
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${stat.bg}`}
            >
              {stat.emoji}
            </span>
            <p className="text-[15px] text-muted">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-ink">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* CTA subir sticker */}
      <div className="mt-8 flex items-center justify-between gap-6 rounded-2xl bg-primario p-8 text-white">
        <div>
          <p className="text-xl font-bold">¿Tenés un diseño nuevo?</p>
          <p className="mt-1 text-white/80">
            Subilo a tu tienda y empezá a vender hoy mismo.
          </p>
        </div>
        <Link
          href="/dashboard/stickers/nuevo"
          className="shrink-0 rounded-full bg-white px-6 py-3 font-bold text-primario transition-colors hover:bg-crema"
        >
          Subir sticker →
        </Link>
      </div>
    </div>
  );
}