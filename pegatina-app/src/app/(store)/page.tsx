import {
  getStickers,
  getCategoriasConConteo,
  getVentasPorStickerId,
} from "@/lib/data";
import StickerCard from "@/components/StickerCard";
import ColorBlobs from "@/components/ColorBlobs";
import Link from "next/link";

// Dinámica: consulta MongoDB en runtime, no en build time.
export const dynamic = "force-dynamic";

/** Emoji + color por categoría real (tiles de la home). */
const CAT_TILE: Record<
  string,
  { emoji: string; bg: string; desc: string }
> = {
  Bebidas: { emoji: "🧉", bg: "bg-wash", desc: "Para el mate, el fernet y lo que pinte" },
  Comida: { emoji: "🍫", bg: "bg-primario/15", desc: "Bodegones, alfajores y antojos" },
  "Buenos Aires": { emoji: "🗼", bg: "bg-acento/30", desc: "Calles, subte y obeliscos" },
  Argentina: { emoji: "🇦🇷", bg: "bg-secundario/15", desc: "Patria, selección y pasión" },
  Animales: { emoji: "🦥", bg: "bg-mint", desc: "Carpinchos, perritos y bichos" },
  Cultura: { emoji: "🎸", bg: "bg-lilac", desc: "Fanzines, rock y micros" },
};

const DEFAULT_TILE = { emoji: "✨", bg: "bg-wash", desc: "Diseños originales" };

/**
 * Landing / Home público del comprador — fiel al sistema Stitch:
 * tape + hero 3-panel + search strip + destacados + categorías + CTA ilustrador.
 * Todos los datos salen de MongoDB (nada inventado).
 */
export default async function HomePage() {
  const [stickers, categorias, ventas] = await Promise.all([
    getStickers(),
    getCategoriasConConteo(),
    getVentasPorStickerId(),
  ]);

  const destacados = stickers.slice(0, 4);

  // "Top del mes" = el sticker con más unidades vendidas (o el primero).
  const topDelMes =
    [...stickers]
      .slice()
      .sort(
        (a, b) => (ventas.get(b.id) ?? 0) - (ventas.get(a.id) ?? 0)
      )[0] ?? stickers[0];

  const totalStickers = stickers.length;

  return (
    <div>
      {/* ───────────────────────── NOTIFICATION TAPE ───────────────────────── */}
      <div className="border-b-2 border-line bg-acento">
        <p className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2.5 text-center text-sm font-bold text-ink">
          <span className="hidden sm:inline">✷</span>
          Feria de stickers federal · Envíos a todo el país
          <span aria-hidden>→</span>
          <Link
            href="/catalogo"
            className="underline underline-offset-2 hover:text-primario"
          >
            Explorar
          </Link>
        </p>
      </div>

      {/* ───────────────────────── HERO ───────────────────────── */}
      <section className="relative overflow-hidden bg-crema px-4 py-14 md:px-6 md:py-20">
        {/* Blobs de color decorativos (paleta de marca) */}
        <ColorBlobs />

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
          {/* Columna izquierda — copy */}
          <div className="flex max-w-lg flex-col gap-6">
            <span className="nb-stamp nb-shadow-sm inline-flex w-fit items-center gap-2 self-start rounded-full border-2 border-line bg-card px-3 py-1.5 text-xs font-bold text-ink">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primario" />
              FERIA ACTIVA · PIEZAS EN CATÁLOGO
            </span>

            <h1 className="font-display text-4xl font-black uppercase leading-[0.95] tracking-tight text-ink md:text-6xl">
              Arte local en
              <br />
              <span className="relative z-0 inline-block">
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-1 z-[-1] h-3 -rotate-1 rounded-sm bg-acento"
                />
                stickers &
              </span>
              <br />
              calcos <span className="text-primario">.</span>
            </h1>

            <p className="text-lg text-ink-soft">
              Ilustraciones originales de diseñadores independientes argentinos. Directo del taller a tu mesa.
            </p>

            {/* Pills */}
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border-2 border-line bg-card px-3 py-1.5 text-sm font-semibold text-ink shadow-[2px_2px_0px_var(--color-line)]">
                ✉️ Envíos federales
              </span>
            </div>
          </div>

          {/* Columna derecha — 3-panel showcase */}
          <div className="relative grid grid-cols-2 gap-4 md:grid-cols-3">
            {/* Panel A — Top del mes */}
            <div
              className="nb-lift nb-shadow-md group relative flex flex-col rounded-2xl border-2 border-line bg-card p-3"
            >
              <span className="mb-2 w-fit rounded-full border-2 border-line bg-acento px-2.5 py-1 text-[11px] font-black text-ink">
                #1 TOP DEL MES
              </span>
              <div className="relative mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-paper">
                {topDelMes.foto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={topDelMes.foto}
                    alt={topDelMes.nombre}
                    className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <span className="text-5xl">🎨</span>
                )}
              </div>
              <p className="font-display text-sm font-bold leading-tight text-ink line-clamp-2">
                {topDelMes.nombre}
              </p>
              <p className="mt-auto pt-1 text-sm font-black text-primario">
                ${topDelMes.precio.toLocaleString("es-AR")}
                <span className="text-[10px] text-muted"> ARS</span>
              </p>
            </div>

            {/* Panel B — CTA central con washi */}
            <div
              className="nb-shadow-lg group relative col-span-1 flex flex-col justify-between gap-4 overflow-hidden rounded-2xl border-2 border-line bg-primario p-4 text-white"
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  aria-hidden
                  className="nb-washi pointer-events-none -mt-4 h-5 w-14 -rotate-3"
                />
              </div>
              <p className="font-display text-2xl font-black uppercase leading-none md:text-3xl">
                Pegá arte
                <br />
                en tu vida
              </p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-white/85">
                  Feria de stickers
                  <br />
                  federal argentina
                </p>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-line bg-acento text-ink shadow-[2px_2px_0px_var(--color-line)]">
                  →
                </span>
              </div>
            </div>

            {/* Panel C — Envíos federales */}
            <div className="nb-lift nb-shadow-md group col-span-2 flex flex-col justify-between gap-3 rounded-2xl border-2 border-line bg-card p-4 md:col-span-1">
              <div className="flex items-center justify-between">
                <span className="rounded-full border-2 border-line bg-wash px-2.5 py-1 text-[11px] font-black text-secundario">
                  ✉️ ENVÍOS FEDERALES
                </span>
                <span
                  aria-hidden
                  className="nb-washi pointer-events-none h-5 w-10 rotate-2"
                />
              </div>
              <p className="text-sm leading-snug text-ink-soft">
                Llega a todo el país. Cada pedido viaja directo del taller del
                artista a tu casa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── SEARCH STRIP ───────────────────────── */}
      <section className="border-y-2 border-line bg-azul-soft">
        <form
          action="/catalogo"
          method="get"
          className="mx-auto flex max-w-7xl flex-col items-stretch gap-3 px-4 py-10 sm:flex-row sm:items-center md:px-6"
        >
          <input
            type="text"
            name="q"
            placeholder={`Buscar entre ${totalStickers} stickers · por nombre o dibujante…`}
            className="w-full flex-1 rounded-xl border-2 border-line bg-paper px-5 py-4 text-base text-ink shadow-[3px_3px_0px_rgba(27,27,28,0.9)] outline-none transition-colors placeholder:text-muted focus:bg-white"
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-line bg-acento px-8 py-4 font-bold text-ink shadow-[3px_3px_0px_var(--color-line)] transition-all hover:bg-ink hover:text-white active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_var(--color-line)]"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.8" />
              <path d="M14 14L18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Explorar
          </button>
        </form>
      </section>

      {/* ───────────────────────── DESTACADOS ───────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-1 text-xs font-black uppercase tracking-widest text-primario">
              Más pedidos en feria
            </p>
            <h2 className="font-display text-3xl font-black uppercase leading-none text-ink md:text-4xl">
              Destacados ⭐
            </h2>
          </div>
          <Link
            href="/catalogo"
            className="rounded-xl border-2 border-line bg-card px-5 py-2.5 text-sm font-bold text-ink shadow-[2px_2px_0px_var(--color-line)] transition-all hover:bg-acento active:translate-x-[1px] active:translate-y-[1px]"
          >
            Ver todo el catálogo →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {destacados.map((s) => (
            <StickerCard key={s.id} sticker={s} />
          ))}
        </div>
      </section>

      {/* ───────────────────────── CATEGORÍAS ───────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="mb-8 text-center">
          <p className="mb-1 text-xs font-black uppercase tracking-widest text-primario">
            Por temática
          </p>
          <h2 className="font-display text-3xl font-black uppercase leading-none text-ink md:text-4xl">
            Piezas por categoría
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {categorias.map(({ id, count }) => {
            const tile = CAT_TILE[id] ?? DEFAULT_TILE;
            return (
              <Link
                key={id}
                href={`/catalogo?categoria=${encodeURIComponent(id)}`}
                className={`nb-lift nb-shadow group flex flex-col gap-3 rounded-2xl border-2 border-line p-5 transition-colors hover:bg-acento/20 ${tile.bg}`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{tile.emoji}</span>
                  <span className="rounded-full border-2 border-line bg-card px-2 py-0.5 text-[11px] font-black text-ink">
                    {count}
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-xl font-black uppercase leading-none text-ink">
                    {id}
                  </h3>
                  <p className="mt-1 text-sm text-ink-soft">{tile.desc}</p>
                </div>
                <span className="text-sm font-bold text-primario transition-transform group-hover:translate-x-1">
                  Explorar →
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ───────────────────────── CTA ILUSTRADOR ─────────────────────────
          (fiel a Stitch — Mica indicó qué sacar después de la pasada) */}
      <section className="border-t-2 border-line bg-acento">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-14 md:grid-cols-2 md:px-6">
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-widest text-secundario">
              Para diseñadores
            </p>
            <h2 className="font-display text-3xl font-black uppercase leading-none text-ink md:text-4xl">
              ¿Sos ilustrador o hacés tus propios diseños?
            </h2>
            <p className="mt-3 text-lg text-ink-soft">
              Abrí tu tienda gratis en Pegatina. Sin costo de mantenimiento:
              tu sticker se suma al catálogo federal y es tuyo el arte, el
              precio y el ritmo.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["Sin costo fijo", "Catálogo federal", "Comunidad de artistas"].map(
                (b) => (
                  <span
                    key={b}
                    className="rounded-full border-2 border-line bg-card px-3 py-1.5 text-sm font-semibold text-ink"
                  >
                    {b}
                  </span>
                )
              )}
            </div>
            <Link
              href="/signup/ilustrador"
              className="mt-6 inline-flex items-center gap-2 rounded-xl border-2 border-line bg-primario px-8 py-4 font-bold text-white shadow-[3px_3px_0px_var(--color-line)] transition-all hover:bg-ink active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_var(--color-line)]"
            >
              Abrir mi tienda gratis
              <span aria-hidden>→</span>
            </Link>
          </div>

          {/* Sello circular decorativo */}
          <div className="hidden justify-center md:flex">
            <div className="nb-stamp nb-shadow relative flex h-44 w-44 items-center justify-center rounded-full border-2 border-line bg-card">
              <span className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="anim-girar-lento h-full w-full p-3">
                  <defs>
                    <path
                      id="sello-circ"
                      d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                    />
                  </defs>
                  <text className="fill-ink text-[9.5px] font-bold uppercase tracking-[0.18em]">
                    <textPath href="#sello-circ">
                      autogestión · stickers federales · made in ar ·
                    </textPath>
                  </text>
                </svg>
              </span>
              <span className="text-3xl">🎪</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}