import Link from "next/link";
import type { Sticker } from "@/lib/types";

/**
 * Tarjeta de producto reutilizable.
 * Se usa en: Landing (destacados), Catálogo y Mis Stickers.
 */
export default function StickerCard({ sticker }: { sticker: Sticker }) {
  return (
    <Link
      href={`/producto/${sticker.id}`}
      className="group flex flex-col items-center gap-3"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-neutral-300">
        {sticker.imagen ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={sticker.imagen}
            alt={sticker.titulo}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full bg-neutral-300" />
        )}
      </div>

      <div className="flex w-full flex-col items-center gap-2">
        <h3 className="text-[22px] font-normal text-ink">{sticker.titulo}</h3>
        <div className="flex w-full items-center justify-between px-1">
          <span className="text-sm capitalize text-ink">
            ${sticker.precio.toFixed(2)}
          </span>
          <button
            aria-label="Agregar al carrito"
            className="text-ink transition-colors hover:text-primario"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 4V20M4 12H20"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </Link>
  );
}
