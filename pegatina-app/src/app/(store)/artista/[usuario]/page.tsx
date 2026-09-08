import Link from "next/link";
import { notFound } from "next/navigation";
import { getStickersByIlustrador } from "@/lib/data";
import StickerCard from "@/components/StickerCard";

// Dinámica: consulta MongoDB en runtime, no en build time.
// Así el build no depende de que la base esté disponible/autenticada.
export const dynamic = "force-dynamic";

/**
 * Perfil público de un artista con sus stickers.
 * Ruta dinámica: /artista/[usuario] (ej: /artista/@mateconmili)
 */
export default async function ArtistaPage({
  params,
}: {
  params: Promise<{ usuario: string }>;
}) {
  const { usuario } = await params;
  // Asegurar que viene con @
  const handle = usuario.startsWith("@") ? usuario : `@${usuario}`;

  const stickers = await getStickersByIlustrador(handle);

  if (stickers.length === 0) notFound();

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Header del artista */}
      <div className="mb-10 flex flex-col items-center gap-4 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primario text-4xl">
          🎨
        </div>
        <div>
          <h1 className="text-4xl font-bold text-ink">{handle}</h1>
          <p className="mt-1 text-muted">
            Ilustrador independiente · {stickers.length} sticker
            {stickers.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Stickers del artista */}
      <h2 className="mb-6 text-center text-2xl font-bold text-ink">
        Sus stickers
      </h2>
      <div className="grid grid-cols-3 gap-8">
        {stickers.map((s) => (
          <StickerCard key={s.id} sticker={s} />
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
