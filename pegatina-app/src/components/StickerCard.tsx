import Link from "next/link";
import type { Sticker } from "@/lib/types";
import AddToCartCard from "@/components/AddToCartCard";

/**
 * Tarjeta de producto — estilo Stitch:
 * - Material (chip, sin categoría)
 * - Foto (object-contain, fondo neutro)
 * - Nombre, autor (link al perfil con ↗) y material
 * - Precio + "ARS" y bloque stepper/Agregar
 *
 * Con `readOnly` (perfil público del artista) NO hay links ni carrito:
 * solo la ficha, nada es clickeable.
 */
export default function StickerCard({
  sticker,
  readOnly = false,
}: {
  sticker: Sticker;
  readOnly?: boolean;
}) {
  const handleSinAt = sticker.ilustrador.startsWith("@")
    ? sticker.ilustrador.slice(1)
    : sticker.ilustrador;
  const artistaUrl = `/artista/${encodeURIComponent(handleSinAt)}`;

  const imagen = (
    <div
      className={`relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-paper ${
        readOnly ? "" : "transition-transform duration-300 group-hover:scale-[1.03]"
      }`}
    >
      {sticker.foto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={sticker.foto}
          alt={sticker.nombre}
          className="absolute inset-0 h-full w-full object-contain p-3"
        />
      ) : (
        <span className="text-6xl">🎨</span>
      )}
    </div>
  );

  const nombre = (
    <h3
      className={`font-display truncate text-lg font-bold ${
        readOnly ? "text-ink" : "text-ink transition-colors hover:text-primario"
      }`}
    >
      {sticker.nombre}
    </h3>
  );

  return (
    <div className="group nb-lift nb-shadow relative flex flex-col gap-3 overflow-hidden rounded-2xl border-2 border-line bg-card p-3">
      {/* Washi tape decorativa */}
      <span
        aria-hidden
        className="nb-washi pointer-events-none absolute -top-1.5 left-1/2 z-10 h-5 w-16 -translate-x-1/2 -rotate-3"
      />

      {/* Zona imagen → producto */}
      {readOnly ? (
        <div className="w-full">{imagen}</div>
      ) : (
        <Link href={`/producto/${sticker.id}`} className="relative block w-full">
          {imagen}
        </Link>
      )}

      <div className="flex flex-col gap-2">
        {/* Material */}
        <div className="flex items-center justify-between gap-2">
          {sticker.material && (
            <span className="inline-flex items-center gap-1 rounded-full border border-line bg-paper px-2.5 py-1 text-[11px] font-bold text-ink">
              {sticker.material}
            </span>
          )}
        </div>

        {/* Nombre → producto */}
        {readOnly ? nombre : <Link href={`/producto/${sticker.id}`}>{nombre}</Link>}

        {/* Autor → perfil del artista */}
        <p className="truncate text-sm text-muted">
          por{" "}
          {readOnly ? (
            <span className="font-semibold text-ink">{sticker.ilustrador}</span>
          ) : (
            <Link
              href={artistaUrl}
              className="font-semibold text-secundario underline decoration-secundario/30 underline-offset-2 transition-colors hover:text-ink hover:decoration-ink"
              title={`Ver el perfil de ${sticker.ilustrador}`}
            >
              {sticker.ilustrador}
              <span
                aria-hidden
                className="ml-0.5 inline-block text-xs opacity-60"
              >
                ↗
              </span>
            </Link>
          )}
        </p>

        <div className="mt-1 flex items-end justify-between gap-3">
          <p className="font-display text-lg font-black text-ink leading-none">
            <span className="text-sm align-top">$</span>
            {sticker.precio.toLocaleString("es-AR")}
            <span className="ml-1 text-xs font-bold text-muted">ARS</span>
          </p>
        </div>

        {/* En la tienda pública del ilustrador NO hay carrito */}
        {!readOnly && (
          <div className="mt-1">
            <AddToCartCard sticker={sticker} />
          </div>
        )}
      </div>
    </div>
  );
}