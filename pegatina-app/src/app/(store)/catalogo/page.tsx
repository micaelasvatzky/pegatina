import { getStickers } from "@/lib/data";
import StickerCard from "@/components/StickerCard";

// Dinámica: consulta MongoDB en runtime, no en build time.
// Así el build no depende de que la base esté disponible/autenticada.
export const dynamic = "force-dynamic";

const CATEGORIAS = [
  "Bebidas",
  "Comida",
  "Buenos Aires",
  "Argentina",
  "Animales",
  "Cultura",
];

const RANGOS_PRECIO: { label: string; min: number; max: number }[] = [
  { label: "Menos de $1.000", min: 0, max: 1000 },
  { label: "$1.000 - $1.500", min: 1000, max: 1500 },
  { label: "Más de $1.500", min: 1500, max: Infinity },
];

/**
 * Catálogo de productos con filtros.
 * Params: ?q= (texto), ?categoria=, ?precio= (indice de rango)
 */
export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    categoria?: string;
    precio?: string;
  }>;
}) {
  const allStickers = await getStickers();
  const { q, categoria, precio } = await searchParams;

  const rangoIdx = precio !== undefined ? parseInt(precio, 10) : NaN;
  const rango = RANGOS_PRECIO[rangoIdx];

  // Aplicar filtros
  let stickers = allStickers;
  let textoBusqueda = "";

  if (q) {
    textoBusqueda = q;
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

  if (rango) {
    stickers = stickers.filter(
      (s) => s.precio >= rango.min && s.precio < rango.max
    );
  }

  /** Construye la URL base manteniendo los filtros activos */
  const buildUrl = (extra: Record<string, string | null>) => {
    const p = new URLSearchParams();
    const current: Record<string, string | null> = {
      q: q ?? null,
      categoria: categoria ?? null,
      precio: precio ?? null,
    };
    const merged = { ...current, ...extra };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) p.set(k, v);
    });
    const s = p.toString();
    return s ? `/catalogo?${s}` : "/catalogo";
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex gap-10">
        {/* SIDEBAR FILTROS */}
        <aside className="flex w-64 shrink-0 flex-col gap-6">
          {/* Categorías */}
          <div className="rounded-2xl border border-line bg-white p-6">
            <h3 className="mb-5 flex items-center gap-3 text-xl font-bold text-ink">
              <span className="h-6 w-1 rounded-full bg-primario" />
              Categorías
            </h3>
            <ul className="flex flex-col gap-1">
              <li>
                <a
                  href={buildUrl({ categoria: null })}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-base transition-colors ${
                    !categoria
                      ? "bg-primario/10 font-semibold text-primario"
                      : "text-ink hover:bg-crema"
                  }`}
                >
                  <span className="h-3 w-3 rounded-full bg-ink" />
                  <span className="flex-1">Todas</span>
                  <span className="text-sm text-muted">
                    ({allStickers.length})
                  </span>
                </a>
              </li>
              {CATEGORIAS.map((cat) => {
                const count = allStickers.filter(
                  (s) => s.categoria === cat
                ).length;
                const isActive = categoria === cat;
                return (
                  <li key={cat}>
                    <a
                      href={buildUrl({ categoria: cat })}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-base transition-colors ${
                        isActive
                          ? "bg-primario/10 font-semibold text-primario"
                          : "text-ink hover:bg-crema"
                      }`}
                    >
                      <span
                        className={`h-3 w-3 rounded-full ${
                          isActive ? "bg-primario" : "bg-muted"
                        }`}
                      />
                      <span className="flex-1">{cat}</span>
                      <span className="text-sm text-muted">({count})</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Rango de precios */}
          <div className="rounded-2xl border border-line bg-white p-6">
            <h3 className="mb-5 flex items-center gap-3 text-xl font-bold text-ink">
              <span className="h-6 w-1 rounded-full bg-secundario" />
              Precio
            </h3>
            <div className="flex flex-col gap-1">
              <a
                href={buildUrl({ precio: null })}
                className={`rounded-xl px-3 py-2 text-base transition-colors ${
                  !rango || isNaN(rangoIdx)
                    ? "bg-secundario/10 font-semibold text-secundario"
                    : "text-ink hover:bg-crema"
                }`}
              >
                Todos los precios
              </a>
              {RANGOS_PRECIO.map((r, i) => {
                const isActive = rangoIdx === i;
                return (
                  <a
                    key={i}
                    href={buildUrl({ precio: String(i) })}
                    className={`rounded-xl px-3 py-2 text-base transition-colors ${
                      isActive
                        ? "bg-secundario/10 font-semibold text-secundario"
                        : "text-ink hover:bg-crema"
                    }`}
                  >
                    {r.label}
                  </a>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-2xl bg-primario p-6 text-center">
            <p className="text-xl font-bold text-white">
              ¿Sos ilustrador?
            </p>
            <p className="mt-1 text-sm text-white/80">
              Abrí tu tienda gratis
            </p>
            <button className="mt-4 w-full rounded-full bg-white py-2.5 text-sm font-bold text-primario transition-colors hover:bg-crema">
              Crear mi tienda
            </button>
          </div>
        </aside>

        {/* GRID PRODUCTOS */}
        <section className="flex-1">
          <div className="mb-8 flex flex-col items-center gap-3">
            <h1 className="text-center text-4xl font-bold text-ink">
              Catálogo
            </h1>

            {/* Buscador por nombre o ilustrador */}
            <form
              action="/catalogo"
              method="get"
              className="flex w-full max-w-xl items-center justify-between gap-2 rounded-full border border-line bg-white py-2 pl-6 pr-2"
            >
              <input
                type="text"
                name="q"
                defaultValue={textoBusqueda}
                placeholder="Buscar por nombre o ilustrador..."
                className="w-full bg-transparent text-base text-ink outline-none placeholder:text-muted"
              />
              <button
                type="submit"
                aria-label="Buscar"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primario text-white transition-colors hover:bg-ink"
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M14 14L18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </form>

            <p className="mt-1 text-center font-bold text-ink">
              {stickers.length} sticker{stickers.length !== 1 ? "s" : ""}
              {textoBusqueda
                ? ` para "${textoBusqueda}"`
                : categoria
                ? ` en ${categoria}`
                : rango
                ? ` en ${rango.label}`
                : " disponibles"}
            </p>
          </div>

          {stickers.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <span className="text-5xl">🔍</span>
              <p className="text-lg text-muted">
                No encontramos stickers con esos filtros.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-8">
              {stickers.map((s) => (
                <StickerCard key={s.id} sticker={s} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
