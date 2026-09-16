import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getStickerById,
  getStickers,
  getVentasPorStickerId,
} from "@/lib/data";
import { getSession, getUsuarioById, getUsuarioPorHandle } from "@/lib/auth";
import AddToCartButton from "@/components/AddToCartButton";
import ComprarAhoraButton from "@/components/ComprarAhoraButton";
import ProductViewTabs from "@/components/ProductViewTabs";
import StickerCard from "@/components/StickerCard";
import ColorBlobs from "@/components/ColorBlobs";

// Dinámica: consulta MongoDB en runtime, no en build time.
export const dynamic = "force-dynamic";

/**
 * Detalle de producto (ruta dinámica /producto/[id]) — fiel al ref Stitch
 * "detalle refinado con acentos azules": breadcrumbs con badges, stage con
 * view pills (✨ 🧉 💻), mini cards de datos reales, Agregar naranja +
 * Comprar ahora cobalt, ficha técnica, artist spotlight con métricas reales
 * y related. El dueño del sticker solo ve "Editar sticker".
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

  const stickersDelArtista = todosStickers.filter(
    (s) => s.ilustrador === sticker.ilustrador
  );
  const unidadesVendidas = stickersDelArtista.reduce(
    (sum, s) => sum + (ventas.get(s.id) ?? 0),
    0
  );
  const anioIngreso = artista?.createdAt
    ? new Date(artista.createdAt).getFullYear()
    : null;

  const nombreArtista = artista?.nombre ?? handleSinAt;
  const bioArtista = artista?.bio ?? null;
  const fotoArtista = artista?.foto ?? null;

  const literalAgua = sticker.resistente_al_agua
    ? "Sí, a prueba de mate"
    : "No";

  return (
    <div>
      {/* ───────────────────── BREADCRUMBS ───────────────────── */}
      <div className="relative overflow-hidden border-b-2 border-line bg-crema">
        <ColorBlobs />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-6">
          <nav className="flex flex-wrap items-center gap-1.5 text-sm font-bold text-muted" aria-label="Breadcrumb">
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-1 rounded-full border-2 border-line bg-card px-3 py-1.5 shadow-[2px_2px_0px_var(--color-line)] transition-all hover:-translate-y-0.5 hover:bg-acento"
            >
              <span className="icon text-base" aria-hidden>
                arrow_back
              </span>
              Catálogo
            </Link>
            <span aria-hidden>/</span>
            <Link
              href={`/catalogo?categoria=${encodeURIComponent(sticker.categoria)}`}
              className="hover:text-cobalt"
            >
              {sticker.categoria}
            </Link>
            <span aria-hidden>/</span>
            <span className="rounded-full border-2 border-line bg-cobalt px-2.5 py-0.5 text-xs font-black uppercase text-white shadow-[1.5px_1.5px_0px_var(--color-line)]">
              {sticker.nombre}
            </span>
          </nav>

          <div className="hidden gap-2 md:flex">
            <span className="rounded-full border-2 border-line bg-card px-3 py-1 text-[11px] font-black uppercase tracking-wide text-ink shadow-[2px_2px_0px_var(--color-line)]">
              ★ Pieza original de taller
            </span>
            <span className="rounded-full border-2 border-line bg-card px-3 py-1 text-[11px] font-black uppercase tracking-wide text-ink shadow-[2px_2px_0px_var(--color-line)]">
              Troquelado individual
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        {/* ───────────────────── STAGE + INFO ───────────────────── */}
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Izquierda: stage + mini cards */}
          <div className="flex flex-col gap-4">
            <ProductViewTabs foto={sticker.foto} nombre={sticker.nombre} />

            {/* Miniaturas (hasta 3 fotos reales) */}
            {sticker.fotos && sticker.fotos.length > 1 && (
              <div className="grid grid-cols-3 gap-3">
                {sticker.fotos.slice(1, 4).map((f, i) => (
                  <div
                    key={i}
                    className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border-2 border-line bg-paper p-1"
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

            {/* Mini cards de datos reales */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border-2 border-line bg-card p-4 shadow-[2px_2px_0px_var(--color-line)]">
                <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-cobalt/10 text-cobalt">
                  <span className="icon text-lg" aria-hidden>
                    water_drop
                  </span>
                </span>
                <p className="text-sm font-black text-ink">Waterproof</p>
                <p className="text-xs font-semibold text-muted">
                  {sticker.resistente_al_agua
                    ? "A prueba de mate"
                    : "No es resistente"}
                </p>
              </div>
              <div className="rounded-2xl border-2 border-line bg-card p-4 shadow-[2px_2px_0px_var(--color-line)]">
                <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-acento/30 text-ink">
                  <span className="icon text-lg" aria-hidden>
                    texture
                  </span>
                </span>
                <p className="text-sm font-black text-ink">Material</p>
                <p className="text-xs font-semibold text-muted">
                  {sticker.material ?? "Vinilo"}
                </p>
              </div>
              <div className="rounded-2xl border-2 border-line bg-card p-4 shadow-[2px_2px_0px_var(--color-line)]">
                <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-mint text-[#4a7c4f]">
                  <span className="icon text-lg" aria-hidden>
                    eco
                  </span>
                </span>
                <p className="text-sm font-black text-ink">Acabado</p>
                <p className="text-xs font-semibold text-muted">
                  {sticker.acabado ?? "Mate"}
                </p>
              </div>
            </div>
          </div>

          {/* Derecha: info card */}
          <div className="flex flex-col gap-5">
            {/* Chip autor */}
            <Link
              href={artistaUrl}
              className="group flex w-fit items-center gap-2 rounded-full border-2 border-line bg-card py-1 pl-1 pr-4 shadow-[2px_2px_0px_var(--color-line)] transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_var(--color-line)]"
            >
              {fotoArtista ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={fotoArtista}
                  alt={nombreArtista}
                  className="h-8 w-8 rounded-full border-2 border-line object-cover"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-line bg-cobalt text-sm font-black text-white">
                  {nombreArtista.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="text-sm font-bold text-ink group-hover:text-cobalt">
                {handleConAt}
                <span className="icon ml-0.5 text-[13px] opacity-70" aria-hidden>
                  open_in_new
                </span>
              </span>
            </Link>

            {/* Título + badge */}
            <div>
              <span className="mb-2 inline-block rounded-full bg-primario/20 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-terracotta">
                ★ Original Pegatina
              </span>
              <h1 className="font-display text-4xl font-black leading-none tracking-tight text-ink md:text-5xl">
                {sticker.nombre}
              </h1>
              <p className="mt-3 text-lg text-ink-soft">
                Ilustración original en{" "}
                {(sticker.acabado ?? sticker.material ?? "vinilo").toLowerCase()}
                , lista para pegar en tu termo, tu compu o tu libreta.
              </p>
            </div>

            {/* Precio */}
            <div className="flex flex-wrap items-end justify-between gap-3">
              <p className="font-display text-5xl font-black leading-none text-ink">
                <span className="text-2xl align-top">$</span>
                {sticker.precio.toLocaleString("es-AR")}
                <span className="ml-2 text-sm font-bold text-muted">ARS</span>
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-line bg-mint px-3 py-1.5 text-xs font-black text-[#4a7c4f]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#4a7c4f]" />
                Disponible en feria
              </span>
            </div>

            {/* Acciones */}
            {esDueño ? (
              <Link
                href={`/dashboard/stickers/${sticker.id}`}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-line bg-primario px-6 py-4 text-lg font-bold text-white shadow-[3px_3px_0px_var(--color-line)] transition-all hover:bg-ink active:translate-x-[1px] active:translate-y-[1px]"
              >
                <span className="icon text-lg" aria-hidden>
                  edit
                </span>
                Editar sticker
              </Link>
            ) : (
              <div className="flex flex-col gap-2">
                <AddToCartButton sticker={sticker} />
                <ComprarAhoraButton sticker={sticker} />
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
                    <span className="icon text-lg" aria-hidden>
                      local_shipping
                    </span>
                  </span>
                  <span className="text-sm font-semibold text-ink">
                    Envío gratis en compras superiores a $2.000
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-line bg-wash text-secundario">
                    <span className="icon text-lg" aria-hidden>
                      package_2
                    </span>
                  </span>
                  <span className="text-sm font-semibold text-ink">
                    Envío a todo el país en 3 a 7 días hábiles
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-line bg-mint text-[#4a7c4f]">
                    <span className="icon text-lg" aria-hidden>
                      assignment_return
                    </span>
                  </span>
                  <span className="text-sm font-semibold text-ink">
                    Devoluciones sin cargo dentro de los 10 días
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ───────────────────── FICHA TÉCNICA & TALLER ───────────────────── */}
        <section className="mt-14 rounded-[24px] border-2 border-line bg-card p-6 shadow-[4px_4px_0px_var(--color-line)] md:p-8">
          <div className="mb-5 flex items-center gap-2">
            <span className="icon text-2xl text-cobalt" aria-hidden>
              precision_manufacturing
            </span>
            <h2 className="font-display text-2xl font-black uppercase leading-none text-ink">
              Ficha técnica & taller
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Material", sticker.material ?? "Vinilo"],
              ["Acabado", sticker.acabado ?? "Mate"],
              ["Categoría", sticker.categoria],
              ["Resistencia al agua", literalAgua],
            ].map(([k, v]) => (
              <div
                key={k}
                className="rounded-xl border border-line/20 bg-paper p-4"
              >
                <p className="text-[11px] font-black uppercase tracking-widest text-muted">
                  {k}
                </p>
                <p className="mt-0.5 text-base font-bold text-ink">{v}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ───────────────────── ARTIST SPOTLIGHT ───────────────────── */}
        <section className="mt-14 rounded-[24px] border-2 border-line bg-card p-6 shadow-[4px_4px_0px_var(--color-line)] md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
            {/* Avatar */}
            <div className="relative shrink-0">
              {fotoArtista ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={fotoArtista}
                  alt={nombreArtista}
                  className="h-32 w-24 rounded-2xl border-2 border-line object-cover shadow-[3px_3px_0px_var(--color-line)]"
                />
              ) : (
                <span className="flex h-32 w-24 items-center justify-center rounded-2xl border-2 border-line bg-lilac font-display text-5xl font-black text-ink shadow-[3px_3px_0px_var(--color-line)]">
                  {nombreArtista.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-line bg-cobalt px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
                ★ Autor verificado
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-3">
              <div>
                <h2 className="font-display text-3xl font-black leading-none text-ink">
                  {nombreArtista}
                </h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full border-2 border-line bg-paper px-3 py-1 text-xs font-black text-ink">
                    {handleConAt}
                  </span>
                  <span className="rounded-full border-2 border-line bg-paper px-3 py-1 text-xs font-black text-ink">
                    Ilustrador/a independiente
                  </span>
                </div>
              </div>

              <p className="max-w-xl text-base text-ink-soft">
                {bioArtista ??
                  "Ilustrador independiente vendiendo sus stickers en la feria federal Pegatina."}
              </p>

              {/* Métricas REALES */}
              <div className="mt-2 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-paper p-4">
                  <span className="icon text-xl text-cobalt" aria-hidden>
                    layers
                  </span>
                  <p className="mt-1 font-display text-xl font-black text-ink">
                    {stickersDelArtista.length}
                  </p>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
                    Stickers en feria
                  </p>
                </div>
                <div className="rounded-xl bg-paper p-4">
                  <span className="icon text-xl text-ink" aria-hidden>
                    package_2
                  </span>
                  <p className="mt-1 font-display text-xl font-black text-ink">
                    {unidadesVendidas}
                  </p>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
                    Unidades vendidas
                  </p>
                </div>
                <div className="rounded-xl bg-paper p-4">
                  <span className="icon text-xl text-primario" aria-hidden>
                    sprout
                  </span>
                  <p className="mt-1 font-display text-xl font-black text-ink">
                    {anioIngreso ?? "—"}
                  </p>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
                    Miembro desde
                  </p>
                </div>
              </div>

              <Link
                href={artistaUrl}
                className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full border-2 border-line bg-acento px-5 py-2.5 text-sm font-bold text-ink shadow-[2px_2px_0px_var(--color-line)] transition-all hover:-translate-y-0.5 hover:bg-ink hover:text-white"
              >
                Ver todos sus stickers ({stickersDelArtista.length})
                <span className="icon text-base" aria-hidden>
                  arrow_forward
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* ───────────────────── RELATED ───────────────────── */}
        {related.length > 0 && (
          <section className="mt-14">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="mb-1 text-xs font-black uppercase tracking-widest text-primario">
                  Completa tu plancha
                </p>
                <h2 className="font-display text-3xl font-black uppercase leading-none text-ink">
                  Quizás te guste 🤍
                </h2>
              </div>
              <Link
                href={`/catalogo?categoria=${encodeURIComponent(sticker.categoria)}`}
                className="rounded-xl border-2 border-line bg-card px-4 py-2 text-sm font-bold text-ink shadow-[2px_2px_0px_var(--color-line)] transition-all hover:-translate-y-0.5 hover:bg-acento"
              >
                Explorar sección {sticker.categoria}
                <span className="icon ml-1 text-base align-middle" aria-hidden>
                  arrow_forward
                </span>
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