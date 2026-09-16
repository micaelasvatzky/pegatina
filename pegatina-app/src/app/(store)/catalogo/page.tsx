import {
  getStickers,
  getCategoriasConConteo,
  getVentasPorStickerId,
} from "@/lib/data";
import StickerCard from "@/components/StickerCard";
import OrdenarSelect from "@/components/OrdenarSelect";
import Link from "next/link";

// Dinámica: consulta MongoDB en runtime, no en build time.
export const dynamic = "force-dynamic";

const RANGOS_PRECIO: { label: string; min: number; max: number }[] = [
  { label: "Todos los precios", min: 0, max: Infinity },
  { label: "Menos de $1.000", min: 0, max: 1000 },
  { label: "$1.000 a $1.500", min: 1000, max: 1500 },
  { label: "Más de $1.500", min: 1500, max: Infinity },
];

type SortKey = "destacados" | "precio-asc" | "precio-desc" | "nombres";

/**
 * Catálogo — fiel al ref Stitch "catálogo refinado con acentos azules":
 * breadcrumbs con badge cobalt, hero banner naranja con círculo amarillo,
 * sidebar única (buscador, categorías, costo en feria, callout ilustrador,
 * trust) y grid de product cards con paginación en card.
 * Params: ?q= (texto), ?categoria=, ?precio= (índice), ?sort=
 */
export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    categoria?: string;
    precio?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  const { q, categoria, precio, sort } = params;

  const [categorias, allStickers, ventas] = await Promise.all([
    getCategoriasConConteo(),
    getStickers(),
    getVentasPorStickerId(),
  ]);
  const total = allStickers.length;

  const rangoIdx = precio !== undefined ? parseInt(precio, 10) : 0;
  const rango = RANGOS_PRECIO[rangoIdx] ?? RANGOS_PRECIO[0];
  const sortKey: SortKey = ["destacados", "precio-asc", "precio-desc", "nombres"].includes(
    sort ?? ""
  )
    ? (sort as SortKey)
    : "destacados";

  // Filtros
  let stickers = allStickers;

  if (q) {
    const busq = q.toLowerCase();
    stickers = stickers.filter(
      (s) =>
        s.nombre.toLowerCase().includes(busq) ||
        s.ilustrador.toLowerCase().includes(busq)
    );
  }

  if (categoria) {
    stickers = stickers.filter((s) => s.categoria === categoria);
  }

  stickers = stickers.filter(
    (s) => s.precio >= rango.min && s.precio < rango.max
  );

  // Orden
  switch (sortKey) {
    case "precio-asc":
      stickers = [...stickers].sort((a, b) => a.precio - b.precio);
      break;
    case "precio-desc":
      stickers = [...stickers].sort((a, b) => b.precio - a.precio);
      break;
    case "nombres":
      stickers = [...stickers].sort((a, b) =>
        a.nombre.localeCompare(b.nombre, "es")
      );
      break;
    default:
      stickers = [...stickers].sort(
        (a, b) => (ventas.get(b.id) ?? 0) - (ventas.get(a.id) ?? 0)
      );
  }

  /** Construye la URL manteniendo los filtros activos */
  const buildUrl = (extra: Record<string, string | null | undefined>) => {
    const current: Record<string, string | null | undefined> = {
      q: q ?? null,
      categoria: categoria ?? null,
      precio: precio ?? null,
      sort: sortKey,
    };
    const merged = { ...current, ...extra };
    const p = new URLSearchParams();
    Object.entries(merged).forEach(([k, v]) => {
      if (v) p.set(k, v);
    });
    const s = p.toString();
    return s ? `/catalogo?${s}` : "/catalogo";
  };

  const badgeCategoria = categoria ?? "Todos los stickers";

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 pt-8 md:px-6">
        {/* ───────────────────── BREADCRUMBS ───────────────────── */}
        <nav
          className="mb-4 flex flex-wrap items-center gap-1.5 text-sm font-bold text-muted"
          aria-label="Breadcrumb"
        >
          <Link href="/" className="hover:text-cobalt">
            Inicio
          </Link>
          <span aria-hidden>/</span>
          <Link href="/catalogo" className="hover:text-cobalt">
            Catálogo
          </Link>
          <span aria-hidden>/</span>
          <span className="rounded-full border-2 border-line bg-cobalt px-3 py-0.5 text-xs font-black uppercase text-white shadow-[1.5px_1.5px_0px_var(--color-line)]">
            {badgeCategoria}
          </span>
          <span className="ml-auto hidden items-center gap-1.5 rounded-full border-2 border-line bg-card px-3 py-1 text-xs font-bold text-ink shadow-[2px_2px_0px_var(--color-line)] md:inline-flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primario" />
            Stock físico garantizado por cada ilustrador
          </span>
        </nav>

        {/* ───────────────────── HERO BANNER ───────────────────── */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-line bg-primario px-6 py-8 shadow-[4px_4px_0px_var(--color-line)] md:px-10 md:py-10">
          <div
            aria-hidden
            className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full border-4 border-acento/60 opacity-60"
          />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-line bg-card px-3 py-1 text-[11px] font-black uppercase tracking-wide text-ink shadow-[2px_2px_0px_var(--color-line)]">
              <span className="icon text-sm text-primario" aria-hidden>
                storefront
              </span>
              Feria Federal Autogestiva
            </span>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-4xl font-black uppercase leading-none text-white md:text-5xl">
                  Feria de Stickers
                </h1>
                <p className="mt-2 max-w-xl text-base font-semibold text-white/90">
                  {total} piezas originales en exposición directa de
                  ilustradores independientes de Argentina.
                </p>
              </div>
              <OrdenarSelect value={sortKey} baseUrl={buildUrl({})} />
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────── FILTROS + GRID ───────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          {/* SIDEBAR */}
          <aside className="lg:col-span-3">
            <div className="flex flex-col gap-6 rounded-2xl border-2 border-line bg-card p-5 shadow-[3px_3px_0px_var(--color-line)] lg:sticky lg:top-32">
              {/* Buscador */}
              <form action="/catalogo" method="get" className="relative">
                <span
                  className="icon absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted"
                  aria-hidden
                >
                  search
                </span>
                <input
                  type="text"
                  name="q"
                  defaultValue={q ?? ""}
                  placeholder="Buscar en la feria…"
                  className="w-full rounded-xl border-2 border-line bg-paper py-2.5 pl-10 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-cobalt"
                />
              </form>

              {/* Categorías */}
              <div>
                <h2 className="mb-2 flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-ink">
                  <span className="icon text-base text-cobalt" aria-hidden>
                    category
                  </span>
                  Categorías
                </h2>
                <ul className="flex flex-col gap-0.5">
                  <li>
                    <Link
                      href={buildUrl({ categoria: null })}
                      className={`flex w-full items-center justify-between rounded-lg border-2 px-2.5 py-1.5 text-sm font-semibold transition-all ${
                        !categoria
                          ? "border-line bg-cobalt text-white shadow-[2px_2px_0px_var(--color-line)]"
                          : "border-transparent text-ink hover:bg-paper"
                      }`}
                    >
                      Todas
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${
                          !categoria
                            ? "border-white/40 bg-white/15 text-white"
                            : "border-line/40 bg-paper text-muted"
                        }`}
                      >
                        {total}
                      </span>
                    </Link>
                  </li>
                  {categorias.map(({ id, count }) => {
                    const active = categoria === id;
                    return (
                      <li key={id}>
                        <Link
                          href={buildUrl({ categoria: id })}
                          className={`flex w-full items-center justify-between rounded-lg border-2 px-2.5 py-1.5 text-sm font-semibold transition-all ${
                            active
                              ? "border-line bg-cobalt text-white shadow-[2px_2px_0px_var(--color-line)]"
                              : "border-transparent text-ink hover:bg-paper"
                          }`}
                        >
                          {id}
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${
                              active
                                ? "border-white/40 bg-white/15 text-white"
                                : "border-line/40 bg-paper text-muted"
                            }`}
                          >
                            {count}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <hr className="border-line/20" />

              {/* Costo en feria (ARS) */}
              <div>
                <h2 className="mb-2 flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-ink">
                  <span className="icon text-base text-cobalt" aria-hidden>
                    payments
                  </span>
                  Costo en feria (ARS)
                </h2>
                <ul className="flex flex-col gap-0.5">
                  {RANGOS_PRECIO.map((r, i) => {
                    const active = rangoIdx === i;
                    return (
                      <li key={i}>
                        <Link
                          href={buildUrl({ precio: i === 0 ? null : String(i) })}
                          className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
                            active
                              ? "font-bold text-cobalt"
                              : "text-ink hover:bg-paper"
                          }`}
                        >
                          <span
                            className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                              active
                                ? "border-cobalt"
                                : "border-muted"
                            }`}
                          >
                            {active && (
                              <span className="h-2 w-2 rounded-full bg-cobalt" />
                            )}
                          </span>
                          {r.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <hr className="border-line/20" />

              {/* Callout ilustrador */}
              <div className="rounded-2xl border-2 border-line bg-acento p-4">
                <p className="flex items-center gap-1.5 text-sm font-black text-ink">
                  <span className="icon text-lg" aria-hidden>
                    draw
                  </span>
                  ¿Sos ilustrador o hacés fanzines?
                </p>
                <p className="mt-1 text-xs font-semibold text-ink-soft">
                  Abrí tu tienda sin costo de mantenimiento y vendé directo en
                  la feria.
                </p>
                <Link
                  href="/signup/ilustrador"
                  className="mt-3 inline-flex w-full items-center justify-center gap-1 rounded-lg border-2 border-line bg-card px-3 py-2 text-xs font-extrabold uppercase tracking-wide shadow-[2px_2px_0px_var(--color-line)] transition-all hover:bg-ink hover:text-white"
                >
                  Crear mi tienda
                  <span className="icon text-sm" aria-hidden>
                    arrow_forward
                  </span>
                </Link>
              </div>

              {/* Trust */}
              <div className="flex items-start gap-3 rounded-2xl border border-line/30 bg-paper p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cobalt text-white">
                  <span className="icon text-lg" aria-hidden>
                    water_drop
                  </span>
                </span>
                <p className="text-xs font-semibold leading-relaxed text-ink-soft">
                  Calidad termo & té: a prueba de agua, mate y rayones.
                </p>
              </div>
            </div>
          </aside>

          {/* GRID */}
          <section className="lg:col-span-9">
            {stickers.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-line bg-card py-20 text-center shadow-[3px_3px_0px_var(--color-line)]">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-lilac/60 text-muted">
                  <span className="icon text-3xl" aria-hidden>
                    search_off
                  </span>
                </span>
                <p className="text-lg font-semibold text-ink-soft">
                  No encontramos stickers con esos filtros.
                </p>
                <Link
                  href="/catalogo"
                  className="mt-2 rounded-xl border-2 border-line bg-acento px-6 py-3 text-sm font-bold text-ink shadow-[2px_2px_0px_var(--color-line)] transition-all hover:bg-primario hover:text-white"
                >
                  Limpiar filtros
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {stickers.map((s) => (
                  <StickerCard key={s.id} sticker={s} />
                ))}
              </div>
            )}

            {/* Paginación — card estilo ref */}
            <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border-2 border-line bg-card p-5 shadow-[3px_3px_0px_var(--color-line)]">
              <p className="flex items-center gap-2 text-sm font-bold text-ink-soft">
                <span className="icon text-base text-cobalt" aria-hidden>
                  fiber_manual_record
                </span>
                Mostrando {stickers.length} de {total} stickers de la feria
                independiente
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled
                  className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-line bg-paper text-muted"
                  aria-label="Página anterior"
                >
                  <span className="icon text-lg" aria-hidden>
                    chevron_left
                  </span>
                </button>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-line bg-cobalt font-black text-white shadow-[2px_2px_0px_var(--color-line)]">
                  1
                </span>
                <button
                  disabled
                  className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-line bg-paper text-muted"
                  aria-label="Página siguiente"
                >
                  <span className="icon text-lg" aria-hidden>
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ───────────────────── BANNER DIBUJANTES ───────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
        <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-line bg-card p-8 text-center shadow-[4px_4px_0px_var(--color-line)]">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cobalt/10 text-cobalt">
            <span className="icon text-2xl" aria-hidden>
              volunteer_activism
            </span>
          </span>
          <h2 className="font-display max-w-xl text-2xl font-black uppercase leading-tight text-ink md:text-3xl">
            Cada calco es de un ilustrador real
          </h2>
          <p className="max-w-lg text-sm text-ink-soft">
            Conocé quién está detrás de cada pieza de la feria y descubrí más
            del arte que se vende por acá.
          </p>
          <Link
            href={`/artista/${firstHandle(allStickers)}`}
            className="rounded-full border-2 border-line bg-acento px-8 py-3 font-bold text-ink shadow-[3px_3px_0px_var(--color-line)] transition-all hover:bg-ink hover:text-white active:translate-x-[1px] active:translate-y-[1px]"
          >
            Conocer a los ilustradores
          </Link>
        </div>
      </section>
    </div>
  );
}

/** @returns handle público (sin @) del primer sticker, o "demoilustrador". */
function firstHandle(stickers: { ilustrador: string }[]): string {
  const h = stickers[0]?.ilustrador ?? "@demoilustrador";
  return h.startsWith("@") ? h.slice(1) : h;
}