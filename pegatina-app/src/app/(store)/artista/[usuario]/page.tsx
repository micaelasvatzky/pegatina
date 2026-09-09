import Link from "next/link";
import { notFound } from "next/navigation";
import { getStickersByIlustrador } from "@/lib/data";
import StickerCard from "@/components/StickerCard";

// Dinámica: consulta MongoDB en runtime, no en build time.
export const dynamic = "force-dynamic";

/**
 * Tienda pública del ilustrador — vista de SOLO LECTURA.
 * Muestra cómo un comprador vería los stickers del artista, pero
 * NO tiene interactividad: nada de carrito, nada de links a producto.
 * El artista entra desde su dashboard (sidebar → "Ver tienda pública").
 */
export default async function ArtistaPage({
  params,
}: {
  params: Promise<{ usuario: string }>;
}) {
  const { usuario } = await params;
  const handle = usuario.startsWith("@") ? usuario : `@${usuario}`;

  const stickers = await getStickersByIlustrador(handle);

  if (stickers.length === 0) notFound();

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Header del artista */}
      <div className="mb-10 flex flex-col items-center gap-4 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primario text-white">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" />
            <path d="M4 21C4 16.5 7.5 14 12 14C16.5 14 20 16.5 20 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-ink">{handle}</h1>
          <p className="mt-1 text-muted">
            Ilustrador independiente · {stickers.length} sticker
            {stickers.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Stickers del artista — read-only, sin carrito ni links */}
      <h2 className="mb-6 text-center text-2xl font-bold text-ink">Sus stickers</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stickers.map((s) => (
          <StickerCard key={s.id} sticker={s} readOnly />
        ))}
      </div>

      {/* Seguir explorando */}
      <div className="mt-12 text-center">
        <Link
          href="/catalogo"
          className="text-sm text-muted underline hover:text-primario"
        >
          ← Volver al catálogo
        </Link>
      </div>
    </div>
  );
}