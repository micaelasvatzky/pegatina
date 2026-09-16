import Link from "next/link";
import type { Sticker } from "@/lib/types";
import AddToCartCard from "@/components/AddToCartCard";

type Variant = "catalogo" | "home";

/**
 * Tarjeta de producto — dos variantes fieles a los refs Stitch
 * ("refinados con acentos azules"):
 *
 * - "catalogo" (product card del catálogo): rounded-2xl, sombra 3px,
 *   imagen que en hover pasa a bg-cobalt-light/40, nombre → hover cobalt,
 *   autor en COBALT con ↗ (north_east) y precio + stepper/Agregar.
 *
 * - "home" (community card de la landing): rounded-[24px], sombra 4px,
 *   tag superior opcional, autor chico arriba, título + sub de material.
 *
 * Ambas linkean al detalle y tienen carrito real (con la regla de un solo
 * artista por carrito).
 */
export default function StickerCard({
  sticker,
  variant = "catalogo",
  tag,
  tagClassName = "bg-acento text-ink",
  botonCobalt = false,
}: {
  sticker: Sticker;
  variant?: Variant;
  /** Tag superior (solo variant "home"): ej. "MÁS PEDIDO" / "CLÁSICO". */
  tag?: string;
  tagClassName?: string;
  /** Variedad visual: botón "Agregar" cobalt (los refs alternan colores). */
  botonCobalt?: boolean;
}) {
  const handle = sticker.ilustrador.startsWith("@")
    ? sticker.ilustrador
    : `@${sticker.ilustrador}`;
  const handleSinAt = handle.startsWith("@") ? handle.slice(1) : handle;
  const artistaUrl = `/artista/${encodeURIComponent(handleSinAt)}`;
  const productoUrl = `/producto/${sticker.id}`;

  const precio = (
    <p className="font-display leading-none text-ink">
      <span className="align-top text-sm font-black">$</span>
      <span className={variant === "home" ? "text-xl font-black" : "text-lg font-black"}>
        {sticker.precio.toLocaleString("es-AR")}
      </span>
      <span className="ml-1 text-xs font-bold text-muted">ARS</span>
    </p>
  );

  const imagen = (extra: string, imgSize: string) => (
    <Link
      href={productoUrl}
      className={`relative flex items-center justify-center overflow-hidden border border-line/5 bg-paper transition-colors group-hover:bg-cobalt-light/40 ${extra}`}
    >
      {sticker.foto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={sticker.foto}
          alt={sticker.nombre}
          className={`${imgSize} object-contain drop-shadow-[2px_4px_6px_rgba(0,0,0,0.12)] transition-transform duration-300 group-hover:scale-105`}
        />
      ) : (
        <span className={variant === "home" ? "text-6xl" : "text-5xl"}>🎨</span>
      )}
    </Link>
  );

  // ───────────────────────── VARIANTE CATÁLOGO ─────────────────────────
  if (variant === "catalogo") {
    return (
      <article className="group flex flex-col justify-between gap-3 rounded-2xl border-2 border-line bg-card p-3 shadow-[3px_3px_0px_var(--color-line)] transition-all hover:-translate-y-1 hover:shadow-[5px_5px_0px_var(--color-line)] sm:p-4">
        {imagen("aspect-square w-full rounded-xl p-3", "h-32 w-32")}

        <div className="flex flex-col gap-1">
          <h3 className="font-display truncate text-base font-extrabold text-ink">
            <Link href={productoUrl} className="transition-colors hover:text-cobalt">
              {sticker.nombre}
            </Link>
          </h3>
          <p className="truncate text-xs text-muted">
            por{" "}
            <Link
              href={artistaUrl}
              title={`Ver el perfil de ${handle}`}
              className="inline-flex items-center gap-0.5 font-semibold text-cobalt hover:underline"
            >
              {handle}
              <span className="icon text-[13px]" aria-hidden>
                north_east
              </span>
            </Link>
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          {precio}
          <AddToCartCard
            sticker={sticker}
            accent={botonCobalt ? "cobalt" : "primario"}
          />
        </div>
      </article>
    );
  }

  // ───────────────────────── VARIANTE HOME ─────────────────────────
  return (
    <article className="group flex flex-col gap-3 rounded-[24px] border-2 border-line bg-card p-5 shadow-[4px_4px_0px_var(--color-line)] transition-all hover:-translate-y-1.5 hover:shadow-[7px_7px_0px_var(--color-line)]">
      {tag && (
        <span
          className={`w-fit rounded-full border-2 border-line px-2.5 py-1 text-[11px] font-black uppercase tracking-wide ${tagClassName}`}
        >
          {tag}
        </span>
      )}

      {imagen("aspect-square w-full rounded-[18px] p-4", "h-36 w-36")}

      <div className="flex flex-col gap-0.5">
        <p className="text-[11px] font-bold text-muted">por {handle}</p>
        <h3 className="font-display truncate text-base font-extrabold text-ink">
          <Link href={productoUrl} className="transition-colors hover:text-cobalt">
            {sticker.nombre}
          </Link>
        </h3>
        <p className="truncate text-xs font-medium text-muted">
          {sticker.material ?? "Vinilo"}
          {sticker.acabado ? ` · ${sticker.acabado}` : ""}
        </p>
      </div>

      <div className="mt-auto flex items-end justify-between gap-3 pt-1">
        {precio}
        <AddToCartCard
          sticker={sticker}
          accent={botonCobalt ? "cobalt" : "acento"}
        />
      </div>
    </article>
  );
}