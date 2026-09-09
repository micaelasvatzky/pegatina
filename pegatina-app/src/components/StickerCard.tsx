import Link from "next/link";
import type { Sticker } from "@/lib/types";
import AddToCartCard from "@/components/AddToCartCard";

/**
 * Tarjeta de producto reutilizable.
 * Fondo neutro unificado + emoji placeholder.
 * Imagen/Nombre → producto. Ilustrador → perfil del artista.
 * Incluye botón de agregar al carrito con selector de cantidad.
 *
 * Con `readOnly` (vista pública del artista) NO hay links ni carrito:
 * solo se muestra la ficha, nada es clickeable.
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
      className={`relative flex aspect-[4/3] w-full items-center justify-center bg-crema ${
        readOnly ? "" : "transition-transform duration-300 group-hover:scale-110"
      }`}
    >
      {sticker.foto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={sticker.foto}
          alt={sticker.nombre}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <span className="text-6xl">🎨</span>
      )}
    </div>
  );

  const nombre = (
    <span
      className={`truncate text-base font-semibold ${
        readOnly ? "text-ink" : "text-ink hover:text-primario"
      }`}
    >
      {sticker.nombre}
    </span>
  );

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Zona imagen → producto */}
      {readOnly ? (
        <div className="w-full">{imagen}</div>
      ) : (
        <Link href={`/producto/${sticker.id}`} className="relative block w-full">
          {imagen}
        </Link>
      )}

      {/* Info compacta */}
      <div className="flex flex-col gap-1 px-4 py-3">
        {readOnly ? nombre : <Link href={`/producto/${sticker.id}`}>{nombre}</Link>}

        <p className="truncate text-sm text-muted">
          por{" "}
          {readOnly ? (
            <span className="font-semibold text-primario">
              {sticker.ilustrador}
            </span>
          ) : (
            <Link
              href={artistaUrl}
              className="font-semibold text-primario underline decoration-primario/40 underline-offset-2 transition-colors hover:text-ink hover:decoration-ink"
              title={`Ver el perfil de ${sticker.ilustrador}`}
            >
              {sticker.ilustrador}
              <span className="ml-0.5 inline-block text-xs opacity-60">↗</span>
            </Link>
          )}
        </p>
        <p className="text-sm font-bold text-primario">
          ${sticker.precio.toLocaleString("es-AR")} ARS
        </p>

        {/* En la tienda pública del ilustrador, no mostramos el carrito */}
        {!readOnly && <AddToCartCard sticker={sticker} />}
      </div>
    </div>
  );
}