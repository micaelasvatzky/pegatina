import Link from "next/link";
import type { Sticker } from "@/lib/types";
import AddToCartCard from "@/components/AddToCartCard";

/**
 * Tarjeta de producto reutilizable.
 * Fondo neutro unificado + emoji placeholder.
 * Imagen/Nombre → producto. Ilustrador → perfil del artista.
 * Incluye botón de agregar al carrito con selector de cantidad.
 */
export default function StickerCard({ sticker }: { sticker: Sticker }) {
  const handleSinAt =
    sticker.ilustrador.startsWith("@")
      ? sticker.ilustrador.slice(1)
      : sticker.ilustrador;
  const artistaUrl = `/artista/${encodeURIComponent(handleSinAt)}`;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Zona imagen → producto */}
      <Link
        href={`/producto/${sticker.id}`}
        className="relative flex aspect-[4/3] w-full items-center justify-center bg-crema"
      >
        <span className="text-6xl transition-transform duration-300 group-hover:scale-110">
          🎨
        </span>
      </Link>

      {/* Info compacta */}
      <div className="flex flex-col gap-1 px-4 py-3">
        <Link
          href={`/producto/${sticker.id}`}
          className="truncate text-base font-semibold text-ink hover:text-primario"
        >
          {sticker.nombre}
        </Link>
        <p className="truncate text-sm text-muted">
          por{" "}
          <Link
            href={artistaUrl}
            className="font-semibold text-primario underline decoration-primario/40 underline-offset-2 transition-colors hover:text-ink hover:decoration-ink"
            title={`Ver el perfil de ${sticker.ilustrador}`}
          >
            {sticker.ilustrador}
            <span className="ml-0.5 inline-block text-xs opacity-60">↗</span>
          </Link>
        </p>
        <p className="text-sm font-bold text-primario">
          ${sticker.precio.toLocaleString("es-AR")} ARS
        </p>

        <AddToCartCard sticker={sticker} />
      </div>
    </div>
  );
}
