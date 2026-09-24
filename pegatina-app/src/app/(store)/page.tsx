import {
  getStickers,
  getCategorias,
} from "@/lib/data";
import StickerCard from "@/components/StickerCard";
import ColorBlobs from "@/components/ColorBlobs";
import Link from "next/link";

// Dinámica: consulta MongoDB en runtime, no en build time.
export const dynamic = "force-dynamic";

/** Emoji + color por categoría real (tiles de la home). */
const CAT_TILE: Record<string, { emoji: string; bg: string }> = {
  Bebidas: { emoji: "🧉", bg: "bg-wash" },
  Comida: { emoji: "🍫", bg: "bg-primario/15" },
  "Buenos Aires": { emoji: "🗼", bg: "bg-acento/30" },
  Argentina: { emoji: "🇦🇷", bg: "bg-secundario/15" },
  Animales: { emoji: "🦥", bg: "bg-mint" },
  Cultura: { emoji: "🎸", bg: "bg-lilac" },
};

const DEFAULT_TILE = { emoji: "✨", bg: "bg-wash" };

/**
 * Landing / Home público del comprador — hero centrado con caja naranja,
 * search pill con botón "Explorar", destacados (community cards),
 * categorías con conteo real y callout para ilustradores con sello.
 * Todos los datos salen de MongoDB (nada inventado).
 */
export default async function HomePage() {
  const [stickers, categorias] = await Promise.all([
    getStickers(),
    getCategorias(),
  ]);

  const destacados = stickers.slice(0, 4);

  return (
    <div>
      {/* ───────────────────────── HERO ───────────────────────── */}
      <section className="relative overflow-hidden bg-crema px-4 py-14 md:px-6 md:py-20">
        <ColorBlobs />

        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
          {/* H1 con "STICKERS" en caja naranja rotada */}
          <h1 className="font-display text-4xl font-black uppercase leading-[0.95] tracking-tight text-ink md:text-6xl">
            Arte local en{" "}
            <span className="inline-flex -rotate-2 items-center rounded-xl border-2 border-line bg-primario px-3 py-1.5 text-white shadow-[4px_4px_0px_var(--color-line)]">
              stickers
            </span>{" "}
            de ilustradores
          </h1>

          <p className="max-w-2xl text-lg text-ink-soft">
            Descubrí diseños originales de ilustradores independientes de
            Argentina. Pegalos en tu termo, tu compu o tu libreta.
          </p>

          {/* Search pill — hero */}
          <form
            action="/catalogo"
            method="get"
            className="flex w-full max-w-xl items-center gap-2 rounded-full border-2 border-line bg-card p-2 pl-5 shadow-[4px_4px_0px_var(--color-line)] transition-shadow focus-within:ring-2 focus-within:ring-cobalt"
          >
            <span className="icon text-xl text-muted" aria-hidden>
              search
            </span>
            <input
              type="text"
              name="q"
              placeholder="Buscar por nombre o dibujante…"
              className="w-full bg-transparent text-base text-ink outline-none placeholder:text-muted"
            />
            <button
              type="submit"
              className="flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-cobalt"
            >
              Explorar
              <span className="icon text-base" aria-hidden>
                arrow_forward
              </span>
            </button>
          </form>

          {/* Pills reales de producto */}
          <div className="flex flex-wrap justify-center gap-2">
            <span className="rounded-full border-2 border-line bg-wash px-3 py-1.5 text-sm font-semibold text-ink shadow-[2px_2px_0px_var(--color-line)]">
              ✉️ Envíos a todo el país
            </span>
            <span className="rounded-full border-2 border-line bg-mint px-3 py-1.5 text-sm font-semibold text-ink shadow-[2px_2px_0px_var(--color-line)]">
              🇦🇷 Hecho en Argentina
            </span>
          </div>
        </div>
      </section>

      {/* ───────────────────────── DESTACADOS ───────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-3xl font-black uppercase leading-none text-ink md:text-4xl">
              Destacados de la semana
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Los stickers que más le gustan a la comunidad gráfica.
            </p>
          </div>
          <Link
            href="/catalogo"
            className="rounded-xl border-2 border-line bg-cobalt px-5 py-2.5 text-sm font-bold text-white shadow-[2px_2px_0px_var(--color-line)] transition-all hover:-translate-y-0.5 hover:bg-cobalt-dark active:translate-x-[1px] active:translate-y-[1px]"
          >
            Ver catálogo completo →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {destacados.map((s, i) => (
            <StickerCard
              key={s.id}
              sticker={s}
              variant="home"
              // Variedad visual del ref: una card con botón cobalt.
              botonCobalt={i === 1}
            />
          ))}
        </div>
      </section>

      {/* ───────────────────────── CATEGORÍAS ───────────────────────── */}
      <section className="bg-crema py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-8 text-center">
            <h2 className="font-display text-3xl font-black uppercase leading-none text-ink md:text-4xl">
              Explorá por categoría
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Encontrá la estética justa para tu termo, compu, libreta o
              pedalera.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {categorias.map((id) => {
              const tile = CAT_TILE[id] ?? DEFAULT_TILE;
              return (
                <Link
                  key={id}
                  href={`/catalogo?categoria=${encodeURIComponent(id)}`}
                  className={`group flex items-center justify-between gap-3 rounded-2xl border-2 border-line p-5 shadow-[3px_3px_0px_var(--color-line)] transition-all hover:-translate-y-1 hover:shadow-[5px_5px_0px_var(--color-line)] ${tile.bg}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{tile.emoji}</span>
                    <h3 className="font-display text-lg font-black uppercase leading-none text-ink">
                      {id}
                    </h3>
                  </div>
                  <span
                    aria-hidden
                    className="icon text-lg text-ink transition-transform group-hover:translate-x-0.5"
                  >
                    chevron_right
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───────────────────────── CALLOUT ILUSTRADOR ───────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="relative overflow-hidden rounded-[32px] border-2 border-line bg-acento p-8 shadow-[6px_6px_0px_var(--color-line)] md:p-12">
          <ColorBlobs />

          <div className="relative z-10 grid items-center gap-10 md:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-black uppercase leading-none text-ink md:text-4xl">
                ¿Sos ilustrador o hacés tus propios diseños?
              </h2>
              <p className="mt-4 max-w-lg text-lg text-ink-soft">
                Pegatina es una feria federal autogestiva: abrí tu tienda
                gratis y vendé tus stickers directo a compradores de todo el
                país, con tu catálogo en tus manos.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  "🛍️ Tu tienda propia gratis",
                  "💸 Comisión solo al vender",
                  "🇦🇷 Comunidad federal de artistas",
                ].map((b) => (
                  <span
                    key={b}
                    className="rounded-full border-2 border-line bg-card/80 px-3 py-1.5 text-sm font-semibold text-ink"
                  >
                    {b}
                  </span>
                ))}
              </div>

              <Link
                href="/signup/ilustrador"
                className="mt-7 inline-flex items-center gap-2 rounded-2xl border-2 border-line bg-card px-8 py-4 font-display text-base font-black uppercase text-ink shadow-[4px_4px_0px_var(--color-line)] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_var(--color-line)] active:translate-x-[1px] active:translate-y-[1px]"
              >
                Abrir mi tienda gratis
                <span className="icon text-lg" aria-hidden>
                  arrow_forward
                </span>
              </Link>
              <p className="mt-3 text-sm font-semibold text-ink-soft">
                Sin costo mensual · Sin requisitos de venta mínima.
              </p>
            </div>

            {/* Sello circular */}
            <div className="hidden justify-center md:flex">
              <div className="relative flex h-56 w-56 items-center justify-center rounded-full border-2 border-dashed border-line bg-card shadow-[4px_4px_0px_var(--color-line)]">
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg
                    viewBox="0 0 100 100"
                    className="anim-girar-lento h-full w-full p-2"
                  >
                    <defs>
                      <path
                        id="sello-argentina"
                        d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
                      />
                    </defs>
                    <text className="fill-ink text-[10px] font-bold uppercase tracking-[0.22em]">
                      <textPath href="#sello-argentina">
                        arte 100% argentino ·
                      </textPath>
                    </text>
                  </svg>
                </span>
                <span className="text-5xl">🖌️</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}