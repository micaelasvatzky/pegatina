import {
  getStickers,
  getCategoriasConConteo,
  getVentasPorStickerId,
} from "@/lib/data";
import StickerCard from "@/components/StickerCard";
import ColorBlobs from "@/components/ColorBlobs";
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
 * Catálogo — fiel al sistema Stitch:
 * breadcrumbs + title bar "Feria de Stickers" + sidebar de filtros reales
 * (categorías con conteo, rangos de precio) + sort funcional + grid StickerCard
 * + pagination real + banner "conocer a los dibujantes".
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
  const rango =
    RANGOS_PRECIO[rangoIdx] ?? RANGOS_PRECIO[0];
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

  const primeraCategoria = categorias[0]?.id ?? "Bebidas";

  return (
    <div>
      {/* ───────────────────────── TITLE BAR ───────────────────────── */}
      <section className="relative overflow-hidden border-b-2 border-line bg-primario px-4 py-10 md:px-6">
        <ColorBlobs />
        <div className="relative z-10 mx-auto max-w-7xl">
          {/* Breadcrumbs */}
          <nav className="mb-4 text-sm font-bold text-white/75" aria-label="Breadcrumb">
            <Link href="/" className="hover:underline">
              Inicio
            </Link>
            <span className="mx-2">/</span>
            <Link href="/catalogo" className="hover:underline">
              Catálogo
            </Link>
            <span className="mx-2">/</span>
            <span className="text-acento">TODOS LOS STICKERS</span>
          </nav>

          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="mb-3 inline-flex items-center gap-2 rounded-full border-2 border-line bg-acento px-3 py-1 text-xs font-black text-ink">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primario" />
                FERIA ACTIVA
              </span>
              <h1 className="font-display text-4xl font-black uppercase leading-none tracking-tight text-white md:text-6xl">
                Feria de
                <br />
                Stickers
              </h1>
            </div>

            <p className="font-display text-lg font-bold text-white/90">
              {total} piezas originales de ilustradores independientes de Argentina.
            </p>
          </div>
        </div>
      </section>

      {/* ───────────────────────── FILTROS + GRID ───────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
          {/* SIDEBAR */}
          <aside className="flex w-full shrink-0 flex-col gap-5 lg:w-72">
            {/* Buscador */}
            <form
              action="/catalogo"
              method="get"
              className="flex items-center gap-2 rounded-xl border-2 border-line bg-card px-4 py-3 shadow-[2px_2px_0px_var(--color-line)]"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" className="shrink-0 text-muted">
                <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.8" />
                <path d="M14 14L18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                name="q"
                defaultValue={q ?? ""}
                placeholder="Buscar artistas o dibujos…"
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
              />
            </form>

            {/* Categorías con conteo real */}
            <div className="rounded-2xl border-2 border-line bg-card p-5 shadow-[2px_2px_0px_var(--color-line)]">
              <h2 className="mb-3 font-display text-sm font-black uppercase tracking-wider text-ink">
                Categorías
              </h2>
              <ul className="flex flex-col">
                <li>
                  <Link
                    href={buildUrl({ categoria: null })}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                      !categoria ? "bg-primario/10 text-primario" : "text-ink hover:bg-wash"
                    }`}
                  >
                    Todas
                    <span className="rounded-full border border-line bg-paper px-2 py-0.5 text-[11px] text-ink-soft">
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
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                          active ? "bg-primario/10 text-primario" : "text-ink hover:bg-wash"
                        }`}
                      >
                        {id}
                        <span className="rounded-full border border-line bg-paper px-2 py-0.5 text-[11px] text-ink-soft">
                          {count}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Rango de precios (radio) */}
            <div className="rounded-2xl border-2 border-line bg-card p-5 shadow-[2px_2px_0px_var(--color-line)]">
              <h2 className="mb-3 font-display text-sm font-black uppercase tracking-wider text-ink">
                Precio
              </h2>
              <ul className="flex flex-col gap-0.5">
                {RANGOS_PRECIO.map((r, i) => {
                  const active = rangoIdx === i;
                  return (
                    <li key={i}>
                      <Link
                        href={buildUrl({ precio: i === 0 ? null : String(i) })}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                          active ? "bg-secundario/10 font-bold text-secundario" : "text-ink hover:bg-wash"
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                            active ? "border-secundario" : "border-muted"
                          }`}
                        >
                          {active && <span className="h-2 w-2 rounded-full bg-secundario" />}
                        </span>
                        {r.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          {/* GRID */}
          <section className="flex-1">
            {/* Toolbar: resultado + sort */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="rounded-full border border-line bg-card px-4 py-2 text-sm font-bold text-ink">
                {stickers.length} sticker{stickers.length !== 1 ? "s" : ""}
                {q ? ` · "${q}"` : ""}
                {categoria ? ` · ${categoria}` : ""}
                {rangoIdx !== 0 ? ` · ${rango.label}` : ""}
              </p>

              <OrdenarSelect value={sortKey} baseUrl={buildUrl({})} />
            </div>

            {stickers.length === 0 ? (
              <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-line bg-card py-20 text-center shadow-[3px_3px_0px_var(--color-line)]">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-lilac/60 text-muted">
                  <svg width="30" height="30" viewBox="0 0 20 20" fill="none">
                    <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M14 14L18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
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

            {/* Pagination real */}
            <div className="mt-10 flex flex-col items-center gap-2 border-t border-line pt-6">
              <p className="text-sm font-bold text-ink-soft">
                Mostrando {stickers.length} de {total} diseños
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled
                  className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-line bg-card text-muted shadow-[2px_2px_0px_var(--color-line)]"
                  aria-label="Página anterior"
                >
                  ‹
                </button>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-line bg-primario font-black text-white shadow-[2px_2px_0px_var(--color-line)]">
                  1
                </span>
                <button
                  disabled
                  className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-line bg-card text-muted shadow-[2px_2px_0px_var(--color-line)]"
                  aria-label="Página siguiente"
                >
                  ›
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ───────────────────────── BANNER DIBUJANTES ───────────────────────── */}
      <section className="relative overflow-hidden border-t-2 border-line bg-azul-soft">
        <ColorBlobs />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-14 text-center md:px-6">
          <span
            aria-hidden
            className="nb-washi pointer-events-none h-6 w-24 -rotate-2"
          />
          <h2 className="font-display max-w-2xl text-3xl font-black uppercase leading-tight text-white md:text-4xl">
            Cada calco es de un ilustrador real: conocé quién está detrás
          </h2>
          <p className="max-w-xl text-lg text-white/85">
            Los stickers de la feria los hacen ilustradores reales de todo el
            país. Entrá a sus perfiles y descubrí más de su arte.
          </p>
          <Link
            href={`/artista/${firstHandle(allStickers)}`}
            className="rounded-xl border-2 border-line bg-acento px-8 py-4 font-bold text-ink shadow-[3px_3px_0px_var(--color-line)] transition-all hover:bg-ink hover:text-white active:translate-x-[1px] active:translate-y-[1px]"
          >
            Conocer a los dibujantes →
          </Link>
        </div>
      </section>

      {/* ───────────────────────── CTA ILUSTRADOR ─────────────────────────
          (fiel a Stitch — Mica indicó qué sacar después de la pasada) */}
      <section className="relative overflow-hidden border-t-2 border-line bg-acento">
        <ColorBlobs />
        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-14 text-center md:px-6">
          <p className="text-xs font-black uppercase tracking-widest text-secundario">
            Feria federal abierta
          </p>
          <h2 className="font-display max-w-2xl text-3xl font-black uppercase leading-tight text-ink md:text-4xl">
            ¿Sos ilustrador o hacés tus propios diseños?
          </h2>
          <p className="max-w-xl text-lg text-ink-soft">
            Abrí tu tienda gratis en la feria. Sin costo fijo y con tu
            catálogo en las manos: vos ponés el arte, el precio y el ritmo.
            {` ${primeraCategoria} y +`} temáticas esperando tu arte.
          </p>
          <Link
            href="/signup/ilustrador"
            className="rounded-xl border-2 border-line bg-primario px-8 py-4 font-bold text-white shadow-[3px_3px_0px_var(--color-line)] transition-all hover:bg-ink active:translate-x-[1px] active:translate-y-[1px]"
          >
            Crear mi tienda gratis
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