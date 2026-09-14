import Link from "next/link";
import { getSession, getUsuarioById } from "@/lib/auth";
import EliminarStickerButton from "@/components/EliminarStickerButton";
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
          className="rounded-full border-2 border-line bg-primario px-6 py-3 font-semibold text-white transition-colors hover:bg-ink nb-shadow-sm nb-lift"
        >
          + Subir sticker
        </Link>
      </div>

      {stickers.length === 0 ? (
        /* Estado vacío */
        <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-line bg-card px-8 py-16 text-center nb-shadow">
          <span className="text-6xl">🎨</span>
          <p className="text-xl font-bold text-ink">Todavía no tenés stickers</p>
          <p className="max-w-sm text-muted">
            Subí tu primer diseño y empezá a vender en tu tienda.
          </p>
          <Link
            href="/dashboard/stickers/nuevo"
            className="mt-2 rounded-full border-2 border-line bg-primario px-6 py-3 font-semibold text-white transition-colors hover:bg-ink nb-shadow-sm nb-lift"
          >
            Subir sticker
          </Link>
        </div>
      ) : (
        /* Grid de stickers */
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {stickers.map((sticker) => {
            const vendidos = ventas.get(sticker.id) ?? 0;
            return (
              <div
                key={sticker.id}
                className="flex flex-col overflow-hidden rounded-2xl border-2 border-line bg-card nb-shadow nb-lift"
              >
                {/* Imagen (sin link: el ilustrador no navega el store) */}
                <div className="relative flex aspect-square w-full items-center justify-center bg-crema">
                  {sticker.foto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={sticker.foto}
                      alt={sticker.nombre}
                      className="absolute inset-0 h-full w-full object-contain p-2"
                    />
                  ) : (
                    <span className="text-6xl">🎨</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-col gap-2 px-4 py-3">
                  <p className="truncate text-base font-semibold text-ink">
                    {sticker.nombre}
                  </p>

                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-primario">
                      ${sticker.precio.toLocaleString("es-AR")} ARS
                    </p>
                    <span className="nb-stamp rounded-full border-2 border-line bg-wash/60 px-3 py-1 text-xs text-ink">
                      {vendidos} vendidos
                    </span>
                  </div>

                  <Link
                    href={`/dashboard/stickers/${sticker.id}`}
                    className="rounded-full border-2 border-line bg-card py-2 text-center text-sm font-semibold text-ink transition-colors hover:bg-lilac/40 nb-lift"
                  >
                    Editar
                  </Link>

                  <EliminarStickerButton
                    stickerId={sticker.id}
                    stickerNombre={sticker.nombre}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}