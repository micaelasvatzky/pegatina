import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getStickersByIlustrador,
  getIlustradoresUnicos,
  getVentasPorStickerId,
} from "@/lib/data";
import { getUsuarioPorHandle } from "@/lib/auth";
import StickerCard from "@/components/StickerCard";
import SharePerfilButton from "@/components/SharePerfilButton";
import ColorBlobs from "@/components/ColorBlobs";

// Dinámica: consulta MongoDB en runtime, no en build time.
export const dynamic = "force-dynamic";

/**
 * Tienda pública del ilustrador — fiel al ref Stitch "perfil refinado con
 * acentos azules": breadcrumb + banner de marca + tarjeta flotante del
 * artista (avatar, badges, bio, compartir) + 3 métricas REALES + catálogo
 * filtrable por categoría (cards clickeables con carrito) + comunidad.
 * 🚫 Sin manifest "85%", sin card de encargos, sin banner "cada calcomanía"
 * (vetados por Mica).
 */
export default async function ArtistaPage({
  params,
  searchParams,
}: {
  params: Promise<{ usuario: string }>;
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { usuario } = await params;
  const { categoria } = await searchParams;
  const handle = usuario.startsWith("@") ? usuario : `@${usuario}`;
  const handleSinAt = handle.startsWith("@") ? handle.slice(1) : handle;

  const [stickers, artista, ventas, ilustradores] = await Promise.all([
    getStickersByIlustrador(handle),
    getUsuarioPorHandle(handle),
    getVentasPorStickerId(),
    getIlustradoresUnicos(),
  ]);

  if (stickers.length === 0) notFound();

  const nombre = artista?.nombre ?? handleSinAt;
  const bio = artista?.bio ?? null;
  const foto = artista?.foto ?? null;
  const anioIngreso = artista?.createdAt
    ? new Date(artista.createdAt).getFullYear()
    : null;

  const unidadesVendidas = stickers.reduce(
    (sum, s) => sum + (ventas.get(s.id) ?? 0),
    0
  );

  // Categorías reales del artista (para las pills del catálogo)
  const categoriasArtista = [...new Set(stickers.map((s) => s.categoria))];
  const filtrados = categoria
    ? stickers.filter((s) => s.categoria === categoria)
    : stickers;

  // Otros artistas para recomendar (hasta 3, excluyendo al actual)
  const otrosArtistas = ilustradores
    .filter((i) => i.handle !== handle)
    .slice(0, 3);
  const otrosUsuarios = await Promise.all(
    otrosArtistas.map((o) => getUsuarioPorHandle(o.handle))
  );

  return (
    <div>
      {/* ───────────────────── BREADCRUMB ───────────────────── */}
      <div className="mx-auto max-w-7xl px-4 pt-8 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-1 rounded-full border-2 border-line bg-card px-4 py-2 text-sm font-bold text-ink shadow-[2px_2px_0px_var(--color-line)] transition-all hover:-translate-y-0.5 hover:bg-acento"
          >
            <span className="icon text-base" aria-hidden>
              arrow_back
            </span>
            Volver al catálogo
          </Link>

          <div className="flex gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-line bg-card px-3 py-1.5 text-xs font-bold text-ink shadow-[2px_2px_0px_var(--color-line)]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#16a34a]" />
              Feria Activa
            </span>
            <span className="hidden rounded-full border-2 border-line bg-card px-3 py-1.5 text-xs font-bold text-ink shadow-[2px_2px_0px_var(--color-line)] md:inline-flex">
              <span className="icon mr-1 text-sm text-primario" aria-hidden>
                local_shipping
              </span>
              Envíos a todo el país
            </span>
          </div>
        </div>

        {/* ───────────────────── BANNER ───────────────────── */}
        <div className="relative mt-4 h-48 overflow-hidden rounded-2xl border-2 border-line bg-gradient-to-br from-primario via-primario to-acento shadow-[4px_4px_0px_var(--color-line)] sm:h-60 md:h-72">
          <ColorBlobs />
          <div
            aria-hidden
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "radial-gradient(circle, #fff 1.5px, transparent 1.5px)",
              backgroundSize: "26px 26px",
            }}
          />
          <span className="absolute bottom-4 right-4 z-10 rounded-full border-2 border-line bg-card px-3 py-1 text-[11px] font-black uppercase tracking-wide text-ink shadow-[2px_2px_0px_var(--color-line)]">
            🎨 Taller de {nombre.split(" ")[0]}
          </span>
        </div>
      </div>

      {/* ───────────────────── TARJETA FLOTANTE ───────────────────── */}
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="relative z-10 -mt-14 rounded-2xl border-2 border-line bg-card p-5 shadow-[5px_5px_0px_var(--color-line)] md:-mt-16 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
            {/* Avatar + badge */}
            <div className="relative shrink-0">
              {foto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={foto}
                  alt={nombre}
                  className="h-24 w-24 rounded-2xl border-2 border-line object-cover shadow-[3px_3px_0px_var(--color-line)] md:h-28 md:w-28"
                />
              ) : (
                <span className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-line bg-lilac font-display text-5xl font-black text-ink shadow-[3px_3px_0px_var(--color-line)] md:h-28 md:w-28">
                  {nombre.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="absolute -bottom-2 -right-2 rounded-full border-2 border-line bg-acento px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-ink shadow-[1.5px_1.5px_0px_var(--color-line)]">
                ★ Sticker Maker
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-3">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-line bg-mint px-2.5 py-0.5 text-[11px] font-black text-[#4a7c4f]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4a7c4f]" />
                  Feria Activa
                </span>
                <span className="rounded-full border-2 border-line bg-paper px-2.5 py-0.5 text-[11px] font-black text-ink">
                  Ilustrador/a independiente
                </span>
                <span className="rounded-full border-2 border-line bg-wash px-2.5 py-0.5 text-[11px] font-black text-secundario">
                  Colectivo federal
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-display text-3xl font-black leading-none text-ink md:text-4xl">
                  {handle}
                </h1>
                <span className="text-lg font-bold text-primario">{nombre}</span>
              </div>

              {/* Bio real */}
              <p className="max-w-2xl rounded-xl bg-paper p-4 text-sm leading-relaxed text-ink-soft">
                {bio ??
                  "Ilustrador independiente vendiendo sus stickers en la feria federal Pegatina."}
              </p>

              {/* Tags reales del primer sticker */}
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-line/50 bg-card px-3 py-1 text-xs font-bold text-ink-soft">
                  {stickers[0].material ?? "Vinilo"}
                </span>
                <span className="rounded-full border border-line/50 bg-card px-3 py-1 text-xs font-bold text-ink-soft">
                  {stickers[0].acabado ?? "Mate"}
                </span>
                {stickers[0].resistente_al_agua !== false && (
                  <span className="rounded-full border border-line/50 bg-card px-3 py-1 text-xs font-bold text-ink-soft">
                    A prueba de agua
                  </span>
                )}
              </div>

              {/* Acciones */}
              <div className="mt-1">
                <SharePerfilButton />
              </div>
            </div>
          </div>

          {/* Métricas REALES */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border-2 border-line bg-card p-4 shadow-[2px_2px_0px_var(--color-line)]">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cobalt/10 text-cobalt">
                  <span className="icon text-lg" aria-hidden>
                    layers
                  </span>
                </span>
                <div>
                  <p className="font-display text-xl font-black leading-none text-ink">
                    {stickers.length}
                  </p>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
                    Stickers activos
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border-2 border-line bg-card p-4 shadow-[2px_2px_0px_var(--color-line)]">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-acento/30 text-ink">
                  <span className="icon text-lg" aria-hidden>
                    package_2
                  </span>
                </span>
                <div>
                  <p className="font-display text-xl font-black leading-none text-ink">
                    {unidadesVendidas}
                  </p>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
                    Unidades vendidas
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border-2 border-line bg-card p-4 shadow-[2px_2px_0px_var(--color-line)]">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primario/15 text-terracotta">
                  <span className="icon text-lg" aria-hidden>
                    sprout
                  </span>
                </span>
                <div>
                  <p className="font-display text-xl font-black leading-none text-ink">
                    {anioIngreso ?? "—"}
                  </p>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted">
                    Miembro desde
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────── CATÁLOGO DEL ARTISTA ───────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="mb-6">
          <p className="mb-1 text-xs font-black uppercase tracking-widest text-primario">
            Catálogo autogestivo · tirada abierta
          </p>
          <h2 className="font-display text-3xl font-black uppercase leading-none text-ink">
            Sus stickers
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            Vinilo de taller, troquelado individual y a prueba de agua. Cada
            unidad sale directo de {nombre.split(" ")[0]} a tu puerta.
          </p>
        </div>

        {/* Filtros por categoría — pills */}
        <div className="mb-6 flex flex-wrap gap-2">
          <Link
            href={`/artista/${encodeURIComponent(handleSinAt)}`}
            className={`rounded-full border-2 border-line px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide transition-all ${
              !categoria
                ? "bg-cobalt text-white shadow-[2px_2px_0px_var(--color-line)]"
                : "bg-card text-ink hover:bg-paper"
            }`}
          >
            Todos ({stickers.length})
          </Link>
          {categoriasArtista.map((cat) => {
            const count = stickers.filter((s) => s.categoria === cat).length;
            return (
              <Link
                key={cat}
                href={`/artista/${encodeURIComponent(handleSinAt)}?categoria=${encodeURIComponent(cat)}`}
                className={`rounded-full border-2 border-line px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide transition-all ${
                  categoria === cat
                    ? "bg-cobalt text-white shadow-[2px_2px_0px_var(--color-line)]"
                    : "bg-card text-ink hover:bg-paper"
                }`}
              >
                {cat} ({count})
              </Link>
            );
          })}
        </div>

        {filtrados.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-line bg-card py-16 text-center shadow-[3px_3px_0px_var(--color-line)]">
            <span className="icon text-3xl text-muted" aria-hidden>
              search_off
            </span>
            <p className="text-lg font-semibold text-ink-soft">
              No hay stickers de esa categoría por ahora.
            </p>
            <Link
              href={`/artista/${encodeURIComponent(handleSinAt)}`}
              className="mt-1 rounded-xl border-2 border-line bg-acento px-6 py-3 text-sm font-bold text-ink shadow-[2px_2px_0px_var(--color-line)] transition-all hover:bg-primario hover:text-white"
            >
              Ver todos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtrados.map((s) => (
              <StickerCard key={s.id} sticker={s} />
            ))}
          </div>
        )}
      </section>

      {/* ───────────────────── COMUNIDAD GRÁFICA ───────────────────── */}
      <section className="bg-crema py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-6">
            <p className="mb-1 text-xs font-black uppercase tracking-widest text-primario">
              Feria federal
            </p>
            <h2 className="font-display text-3xl font-black uppercase leading-none text-ink">
              Comunidad gráfica
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Otros puestos de la feria que te pueden interesar.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {otrosArtistas.map(({ handle: h, count }, i) => {
              const otro = otrosUsuarios[i];
              const otroNombre = otro?.nombre ?? h.slice(1);
              const otroFoto = otro?.foto ?? null;
              return (
                <Link
                  key={h}
                  href={`/artista/${encodeURIComponent(
                    h.startsWith("@") ? h.slice(1) : h
                  )}`}
                  className="group flex items-center gap-3 rounded-2xl border-2 border-line bg-card p-4 shadow-[3px_3px_0px_var(--color-line)] transition-all hover:-translate-y-1 hover:shadow-[5px_5px_0px_var(--color-line)]"
                >
                  {otroFoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={otroFoto}
                      alt={otroNombre}
                      className="h-12 w-12 shrink-0 rounded-xl border-2 border-line object-cover"
                    />
                  ) : (
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-line bg-wash font-display text-xl font-black text-secundario">
                      {otroNombre.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-black text-ink group-hover:text-cobalt">
                      {h}
                    </span>
                    <span className="block text-xs font-semibold text-muted">
                      {count} sticker{count !== 1 && "s"} activos
                    </span>
                  </span>
                  <span
                    className="icon ml-auto text-lg text-muted transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  >
                    chevron_right
                  </span>
                </Link>
              );
            })}

            {/* Card CTA ilustrador */}
            <Link
              href="/signup/ilustrador"
              className="group flex flex-col justify-between gap-3 rounded-2xl border-2 border-line bg-acento p-4 shadow-[3px_3px_0px_var(--color-line)] transition-all hover:-translate-y-1 hover:shadow-[5px_5px_0px_var(--color-line)]"
            >
              <span className="text-2xl">🎨</span>
              <div>
                <p className="font-display text-base font-black uppercase leading-tight text-ink">
                  ¿Sos ilustrador?
                </p>
                <p className="mt-1 text-xs font-semibold text-ink-soft">
                  Abrí tu tienda en la feria.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-sm font-bold text-primario group-hover:text-cobalt">
                Sumate
                <span className="icon text-base" aria-hidden>
                  arrow_forward
                </span>
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}