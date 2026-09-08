import Link from "next/link";
import { getSession, getUsuarioById } from "@/lib/auth";
import {
  getStickersByIlustrador,
  getVentasPorStickerId,
} from "@/lib/data";

/**
 * Mis Stickers — stickers REALES del ilustrador logueado.
 * Cada card muestra precio + unidades vendidas + link a editar.
 */
export default async function MisStickersPage() {
  const sesion = await getSession();
  const usuario = sesion ? await getUsuarioById(sesion.sub) : null;
  const handle = usuario?.usuario;

  const stickers = handle ? await getStickersByIlustrador(handle) : [];
  const ventas = await getVentasPorStickerId();

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-ink">Mis stickers</h1>
          <p className="mt-1 text-muted">
            {handle ? handle : "Tu tienda"} · {stickers.length}{" "}
            {stickers.length === 1 ? "sticker" : "stickers"} publicados
          </p>
        </div>
        <Link
          href="/dashboard/stickers/nuevo"
          className="rounded-full bg-primario px-6 py-3 font-semibold text-white transition-colors hover:bg-ink"
        >
          + Subir sticker
        </Link>
      </div>

      {stickers.length === 0 ? (
        /* Estado vacío */
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-line bg-white px-8 py-16 text-center">
          <span className="text-6xl">🎨</span>
          <p className="text-xl font-bold text-ink">Todavía no tenés stickers</p>
          <p className="max-w-sm text-muted">
            Subí tu primer diseño y empezá a vender en tu tienda.
          </p>
          <Link
            href="/dashboard/stickers/nuevo"
            className="mt-2 rounded-full bg-primario px-6 py-3 font-semibold text-white transition-colors hover:bg-ink"
          >
            Subir sticker
          </Link>
        </div>
      ) : (
        /* Grid de stickers */
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
          {stickers.map((sticker) => {
            const vendidos = ventas.get(sticker.id) ?? 0;
            return (
              <div
                key={sticker.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Imagen → producto */}
                <Link
                  href={`/producto/${sticker.id}`}
                  className="relative flex aspect-[4/3] w-full items-center justify-center bg-crema"
                >
                  <span className="text-6xl transition-transform duration-300 hover:scale-110">
                    🎨
                  </span>
                </Link>

                {/* Info */}
                <div className="flex flex-col gap-2 px-5 py-4">
                  <Link
                    href={`/producto/${sticker.id}`}
                    className="truncate text-lg font-semibold text-ink hover:text-primario"
                  >
                    {sticker.nombre}
                  </Link>

                  <div className="flex items-center justify-between">
                    <p className="font-bold text-primario">
                      ${sticker.precio.toLocaleString("es-AR")} ARS
                    </p>
                    <span className="rounded-full bg-secundario/15 px-3 py-1 text-xs font-semibold text-ink">
                      {vendidos} vendidos
                    </span>
                  </div>

                  <Link
                    href={`/dashboard/stickers/${sticker.id}`}
                    className="mt-2 rounded-full border border-primario/30 py-2.5 text-center font-semibold text-primario transition-colors hover:bg-primario hover:text-white"
                  >
                    Editar
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}