import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getStickersByIlustrador,
  getIlustradoresUnicos,
} from "@/lib/data";
import { getUsuarioPorHandle } from "@/lib/auth";
import StickerCard from "@/components/StickerCard";
import ColorBlobs from "@/components/ColorBlobs";

// Dinámica: consulta MongoDB en runtime, no en build time.
export const dynamic = "force-dynamic";

/**
 * Tienda pública del ilustrador — fiel a Stitch:
 * hero banner + card flotante del artista (datos reales), grid de stickers
 * con las mismas cards del catálogo (clickeables al detalle + carrito,
 * con la regla de un solo artista por carrito) + otros artistas.
 */
export default async function ArtistaPage({
  params,
}: {
  params: Promise<{ usuario: string }>;
}) {
  const { usuario } = await params;
  const handle = usuario.startsWith("@") ? usuario : `@${usuario}`;
  const handleSinAt = handle.startsWith("@") ? handle.slice(1) : handle;

  const [stickers, artista, ilustradores] = await Promise.all([
    getStickersByIlustrador(handle),
    getUsuarioPorHandle(handle),
    getIlustradoresUnicos(),
  ]);

  if (stickers.length === 0) notFound();

  const nombre = artista?.nombre ?? handleSinAt;
  const bio = artista?.bio ?? null;
  const foto = artista?.foto ?? null;

  // Otros artistas para recomendar (hasta 3, excluyendo al actual)
  const otrosArtistas = ilustradores
    .filter((i) => i.handle !== handle)
    .slice(0, 3);

  return (
    <div>
      {/* ───────────────────────── BREADCRUMB ───────────────────────── */}
      <div className="relative overflow-hidden border-b-2 border-line bg-crema">
        <ColorBlobs />
        <nav className="relative z-10 mx-auto max-w-7xl px-4 py-4 md:px-6" aria-label="Breadcrumb">
          <Link
            href="/catalogo"
            className="text-sm font-bold text-muted transition-colors hover:text-primario"
          >
            ← Volver al catálogo
          </Link>
        </nav>
      </div>

      {/* ───────────────────────── HERO BANNER ───────────────────────── */}
      <section className="relative overflow-hidden border-b-2 border-line bg-primario">
        {/* Banner decorativo (sin foto real del taller) */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "radial-gradient(circle, #fff 1.5px, transparent 1.5px)",
            backgroundSize: "26px 26px",
          }}
        />
        <span
          aria-hidden
          className="nb-washi pointer-events-none absolute right-10 top-6 z-10 hidden h-6 w-24 rotate-3 md:block"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-line bg-acento px-3 py-1 text-xs font-black text-ink shadow-[2px_2px_0px_var(--color-line)]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primario" />
            FERIA ACTIVA
          </span>

          {/* Card flotante del artista — full width, abarca toda la longitud */}
          <div className="nb-shadow-md relative z-10 flex flex-col gap-5 rounded-2xl border-2 border-line bg-card p-6 md:flex-row md:items-start md:gap-6 md:p-8">
            {foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={foto}
                alt={nombre}
                className="h-24 w-24 shrink-0 rounded-2xl border-2 border-line object-cover shadow-[3px_3px_0px_var(--color-line)] md:h-28 md:w-28"
              />
            ) : (
              <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border-2 border-line bg-acento font-display text-5xl font-black text-ink shadow-[3px_3px_0px_var(--color-line)] md:h-28 md:w-28">
                {nombre.charAt(0).toUpperCase()}
              </span>
            )}

            <div className="flex flex-col gap-2">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border-2 border-line bg-primario px-2.5 py-0.5 text-[11px] font-black text-white">
                  PRO
                </span>
                <span className="rounded-full border-2 border-line bg-wash px-2.5 py-0.5 text-[11px] font-black text-secundario">
                  STICKER MAKER
                </span>
                <span className="rounded-full border-2 border-line bg-mint px-2.5 py-0.5 text-[11px] font-black text-[#4a7c4f]">
                  FERIA ACTIVA
                </span>
              </div>

              <h1 className="font-display text-3xl font-black leading-none text-ink md:text-4xl">
                {handle}
              </h1>
              <p className="text-lg font-bold text-primario">{nombre}</p>
              <p className="max-w-xl text-sm leading-relaxed text-ink-soft">
                {bio ?? "Ilustrador independiente vendiendo sus stickers en la feria federal Pegatina."}
              </p>

              {/* Tags */}
              <div className="mt-1 flex flex-wrap gap-2">
                <span className="rounded-full border border-line bg-paper px-3 py-1 text-xs font-semibold text-ink-soft">
                  {stickers[0].material ?? "Vinilo"}
                </span>
                <span className="rounded-full border border-line bg-paper px-3 py-1 text-xs font-semibold text-ink-soft">
                  {stickers[0].acabado ?? "Mate"}
                </span>
                {stickers[0].resistente_al_agua !== false && (
                  <span className="rounded-full border border-line bg-paper px-3 py-1 text-xs font-semibold text-ink-soft">
                    A prueba de agua
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── GRID DE STICKERS ───────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="mb-6 flex items-end justify-between gap-3">
          <div>
            <p className="mb-1 text-xs font-black uppercase tracking-widest text-primario">
              En venta ahora
            </p>
            <h2 className="font-display text-3xl font-black uppercase leading-none text-ink">
              Los stickers de {nombre.split(" ")[0]}
            </h2>
          </div>
          <span className="hidden rounded-full border-2 border-line bg-card px-4 py-2 text-sm font-bold text-ink shadow-[2px_2px_0px_var(--color-line)] sm:block">
            {stickers.length} pieza{stickers.length !== 1 && "s"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stickers.map((s) => (
            <StickerCard key={s.id} sticker={s} />
          ))}
        </div>
      </section>

      {/* ───────────────────────── OTROS ARTISTAS ───────────────────────── */}
      {otrosArtistas.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <div className="mb-6">
            <p className="mb-1 text-xs font-black uppercase tracking-widest text-primario">
              Feria federal
            </p>
            <h2 className="font-display text-3xl font-black uppercase leading-none text-ink">
              Otros artistas en la feria
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {otrosArtistas.map(({ handle: h, count }) => (
              <Link
                key={h}
                href={`/artista/${encodeURIComponent(
                  h.startsWith("@") ? h.slice(1) : h
                )}`}
                className="nb-lift nb-shadow group flex items-center gap-3 rounded-2xl border-2 border-line bg-card p-4 transition-colors hover:bg-acento/20"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-line bg-wash font-display text-xl font-black text-secundario">
                  {(h.startsWith("@") ? h[1] : h[0]).toUpperCase()}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-black text-ink group-hover:text-primario">
                    {h}
                  </span>
                  <span className="block text-xs font-semibold text-muted">
                    {count} sticker{count !== 1 && "s"} en la feria ↗
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}