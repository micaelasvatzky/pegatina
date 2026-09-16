import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getStickerById,
  getStickers,
  getVentasPorStickerId,
} from "@/lib/data";
import { getSession, getUsuarioById, getUsuarioPorHandle } from "@/lib/auth";
import AddToCartButton from "@/components/AddToCartButton";
import StickerCard from "@/components/StickerCard";
import ColorBlobs from "@/components/ColorBlobs";

// Dinámica: consulta MongoDB en runtime, no en build time.
export const dynamic = "force-dynamic";

/** Colores por categoría para la galería */
const catBg: Record<string, string> = {
  Bebidas: "bg-secundario/10",
  Comida: "bg-primario/10",
  "Buenos Aires": "bg-acento/20",
  Argentina: "bg-wash",
  Animales: "bg-mint/60",
  Cultura: "bg-lilac/60",
};

/**
 * Detalle de producto (ruta dinámica /producto/[id]) — fiel a Stitch:
 * breadcrumbs, badges técnicos reales, galería, ficha técnica real, shipping,
 * artist spotlight con datos reales del usuario + related.
 */
export default async function ProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sticker = await getStickerById(id);

  if (!sticker) notFound();

  // Si el visitante logueado ES el dueño del sticker, no le ofrecemos
  // comprar su propio producto: solo puede editarlo desde el dashboard.
  const sesion = await getSession();
  const esDueño = sesion
    ? (await getUsuarioById(sesion.sub))?.usuario === sticker.ilustrador
    : false;

  const bg = catBg[sticker.categoria] ?? "bg-acento/15";

  const handleConAt = sticker.ilustrador.startsWith("@")
    ? sticker.ilustrador
    : `@${sticker.ilustrador}`;
  const handleSinAt = sticker.ilustrador.startsWith("@")
    ? sticker.ilustrador.slice(1)
    : sticker.ilustrador;
  const artistaUrl = `/artista/${encodeURIComponent(handleSinAt)}`;

  // Spotlight del artista: datos reales del usuario.
  const [artista, todosStickers, ventas] = await Promise.all([
    getUsuarioPorHandle(handleConAt),
    getStickers(),
    getVentasPorStickerId(),
  ]);

  // Related: misma categoría, excluyendo el actual; relleno con otros si faltan.
  const related = [
    ...todosStickers.filter(
      (s) => s.categoria === sticker.categoria && s.id !== sticker.id
    ),
    ...todosStickers.filter(
      (s) => s.categoria !== sticker.categoria && s.id !== sticker.id
    ),
  ].slice(0, 3);

  const ventasSticker = ventas.get(sticker.id) ?? 0;

  const nombreArtista = artista?.nombre ?? handleSinAt;
  const bioArtista = artista?.bio ?? null;
  const fotoArtista = artista?.foto ?? null;

  const literalAgua = sticker.resistente_al_agua ? "Sí, a prueba de mate" : "No";

  return (
    <div>
      {/* ───────────────────────── BREADCRUMBS ───────────────────────── */}
      <div className="relative overflow-hidden border-b-2 border-line bg-crema">
        <ColorBlobs />
        <nav
          className="relative z-10 mx-auto flex max-w-7xl items-center gap-1.5 px-4 py-4 text-sm font-bold text-muted md:px-6"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-primario">
            Inicio
          </Link>
          <span aria-hidden>/</span>
          <Link href="/catalogo" className="hover:text-primario">
            Catálogo
          </Link>
          <span aria-hidden>/</span>
          <Link
            href={`/catalogo?categoria=${encodeURIComponent(sticker.categoria)}`}
            className="hover:text-primario"
          >
            {sticker.categoria}
          </Link>
          <span aria-hidden>/</span>
          <span className="truncate text-ink">{sticker.nombre}</span>
        </nav>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        {/* ───────────────────────── GALERÍA + INFO ───────────────────────── */}
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Galería */}
          <div className="flex flex-col gap-4">
            <div
              className={`relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-line ${bg} nb-shadow-lg`}
            >
              <span
                aria-hidden
                className="nb-washi pointer-events-none absolute -top-2 left-1/2 z-10 h-6 w-20 -translate-x-1/2 -rotate-2"
              />
              {sticker.foto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={sticker.foto}
                  alt={sticker.nombre}
                  className="absolute inset-0 h-full w-full object-contain p-6"
                />
              ) : (
                <span className="text-8xl">🎨</span>
              )}
            </div>

            {/* Miniaturas (hasta 3 fotos reales) */}
            {sticker.fotos && sticker.fotos.length > 1 && (
              <div className="grid grid-cols-3 gap-3">
                {sticker.fotos.slice(1, 4).map((f, i) => (
                  <div
                    key={i}
                    className={`flex aspect-square items-center justify-center overflow-hidden rounded-xl border-2 border-line ${bg} p-1`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={f}
                      alt={`${sticker.nombre} ${i + 2}`}
                      className="h-full w-full object-contain"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info card */}
          <div className="flex flex-col gap-6">
            {/* Autor */}
            <Link
              href={artistaUrl}
              className="group flex w-fit items-center gap-2 rounded-full border-2 border-line bg-crema py-1 pl-1 pr-4 shadow-[2px_2px_0px_var(--color-line)] transition-all hover:bg-acento/30"
            >
              {fotoArtista ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={fotoArtista}
                  alt={nombreArtista}
                  className="h-8 w-8 rounded-full border-2 border-line object-cover"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-line bg-primario text-sm font-black text-white">
                  {nombreArtista.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="text-sm font-bold text-ink group-hover:text-primario">
                {sticker.ilustrador}
                <span aria-hidden className="ml-0.5 text-xs opacity-60">
                  ↗
                </span>
              </span>
            </Link>

            <div>
              <h1 className="font-display text-4xl font-black uppercase leading-none tracking-tight text-ink md:text-5xl">
                {sticker.nombre}
              </h1>
              <p className="mt-3 text-lg text-ink-soft">
                Ilustración original en{" "}
                {(sticker.acabado ?? sticker.material ?? "vinilo").toLowerCase()}
                , lista para pegar en tu termo, tu compu o tu libreta.
              </p>
            </div>

            {/* Precio + ficha técnica real */}
            <div className="flex items-end justify-between gap-4 rounded-2xl border-2 border-line bg-card p-5 shadow-[3px_3px_0px_var(--color-line)]">
              <p className="font-display text-5xl font-black leading-none text-ink">
                <span className="text-2xl align-top">$</span>
                {sticker.precio.toLocaleString("es-AR")}
                <span className="ml-2 text-sm font-bold text-muted">ARS</span>
              </p>
              {ventasSticker > 0 && (
                <span className="rounded-full border-2 border-line bg-acento px-3 py-1.5 text-xs font-black text-ink">
                  {ventasSticker} vendido{ventasSticker !== 1 ? "s" : ""} en feria
                </span>
              )}
            </div>

            {/* Ficha técnica */}
            <div className="grid grid-cols-2 gap-3 rounded-2xl border-2 border-line bg-card p-5 shadow-[2px_2px_0px_var(--color-line)]">
              {[
                ["Material", sticker.material ?? "Vinilo"],
                ["Acabado", sticker.acabado ?? "Mate"],
                ["Resistente al agua", literalAgua],
                ["Categoría", sticker.categoria],
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-[11px] font-black uppercase tracking-widest text-muted">
                    {k}
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-ink">{v}</p>
                </div>
              ))}
            </div>

            {/* Acciones */}
            {esDueño ? (
              <Link
                href={`/dashboard/stickers/${sticker.id}`}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-line bg-primario px-6 py-4 text-lg font-bold text-white shadow-[3px_3px_0px_var(--color-line)] transition-all hover:bg-ink active:translate-x-[1px] active:translate-y-[1px]"
              >
                ✏️ Editar sticker
              </Link>
            ) : (
              <div className="flex flex-col gap-2">
                <AddToCartButton sticker={sticker} />
                <p className="text-center text-xs font-semibold text-muted">
                  Pago por transferencia
                </p>
              </div>
            )}

            {/* Shipping */}
            <div className="rounded-2xl border-2 border-line bg-card p-5 shadow-[2px_2px_0px_var(--color-line)]">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-line bg-acento text-ink">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M4 5.5H20V19.5H4V5.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8 3.5V7.5M16 3.5V7.5M4 10.5H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </span>
                  <span className="text-sm font-semibold text-ink">
                    Envío gratis en compras superiores a $2.000
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-line bg-wash text-secundario">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M3 7H14V17H3V7ZM10 7V17M10 12H19M19 12V17H21V10L19 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-sm font-semibold text-ink">
                    Envío a todo el país en 3 a 7 días hábiles
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-line bg-mint text-[#4a7c4f]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M4 8H20M4 8L4 20H20V8M4 8V4H20V8M9 12H15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <span className="text-sm font-semibold text-ink">
                    Devoluciones sin cargo dentro de los 10 días
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ───────────────────────── ARTIST SPOTLIGHT ───────────────────────── */}
        <section className="mt-16 overflow-hidden rounded-2xl border-2 border-line bg-crema shadow-[4px_4px_0px_var(--color-line)]">
          <div className="grid gap-6 bg-primario p-6 text-white md:grid-cols-3 md:items-center md:p-8">
            <div className="flex items-center gap-4">
              {fotoArtista ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={fotoArtista}
                  alt={nombreArtista}
                  className="h-16 w-16 rounded-full border-2 border-line object-cover shadow-[2px_2px_0px_var(--color-line)]"
                />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-line bg-acento text-2xl font-black text-ink shadow-[2px_2px_0px_var(--color-line)]">
                  {nombreArtista.charAt(0).toUpperCase()}
                </span>
              )}
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-acento">
                  Dibuja esto
                </p>
                <h2 className="font-display text-2xl font-black uppercase leading-none">
                  {nombreArtista}
                </h2>
                <p className="text-sm font-bold text-white/80">{sticker.ilustrador}</p>
              </div>
            </div>

            <p className="text-base font-semibold text-white/90 md:col-span-1 md:text-center">
              {bioArtista ??
                "Ilustrador independiente vendiendo en la feria federal Pegatina."}
            </p>

            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link
                href={artistaUrl}
                className="flex items-center gap-1 rounded-xl border-2 border-line bg-acento px-4 py-2 font-bold text-ink shadow-[2px_2px_0px_var(--color-line)] transition-all hover:bg-ink hover:text-white active:translate-x-[1px] active:translate-y-[1px]"
              >
                Ver perfil ↗
              </Link>
            </div>
          </div>
        </section>

        {/* ───────────────────────── RELATED ───────────────────────── */}
        {related.length > 0 && (
          <section className="mt-16">
            <div className="mb-6 flex items-end justify-between gap-3">
              <div>
                <p className="mb-1 text-xs font-black uppercase tracking-widest text-primario">
                  Quizás te guste
                </p>
                <h2 className="font-display text-3xl font-black uppercase leading-none text-ink">
                  Quizás te guste 🤍
                </h2>
              </div>
              <Link
                href={`/catalogo?categoria=${encodeURIComponent(sticker.categoria)}`}
                className="rounded-xl border-2 border-line bg-card px-4 py-2 text-sm font-bold text-ink shadow-[2px_2px_0px_var(--color-line)] transition-all hover:bg-acento"
              >
                Ver más stickers de {sticker.categoria} →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((s) => (
                <StickerCard key={s.id} sticker={s} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}