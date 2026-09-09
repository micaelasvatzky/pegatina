import { getStickers, getCategorias } from "@/lib/data";
import StickerCard from "@/components/StickerCard";

// Dinámica: consulta MongoDB en runtime, no en build time.
export const dynamic = "force-dynamic";

/**
 * Landing / Home público del comprador.
 * Hero con marca, búsqueda y productos destacados desde MongoDB.
 */
export default async function HomePage() {
  const [stickers, categorias] = await Promise.all([
    getStickers(),
    getCategorias(),
  ]);
  const destacados = stickers.slice(0, 4);

  return (
    <div>
      {/* HERO */}
      <section className="relative flex min-h-[520px] w-full items-center justify-center overflow-hidden bg-primario">
        {/* Patrón de puntos */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
        </div>

        {/* Stickers flotando (decorativos, no interactivos) */}
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden md:block">
          <span className="anim-flotar absolute left-[8%] top-[18%] flex h-16 w-16 items-center justify-center rounded-2xl bg-acento text-3xl shadow-lg">
            ⭐
          </span>
          <span className="anim-flotar-suave absolute right-[10%] top-[22%] flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-lg">
            🎨
          </span>
          <span
            className="anim-flotar absolute bottom-[16%] left-[16%] flex h-12 w-12 items-center justify-center rounded-xl bg-secundario text-xl shadow-lg"
            style={{ animationDelay: "1.2s" }}
          >
            ✂️
          </span>
          <span
            className="anim-flotar-suave absolute bottom-[20%] right-[14%] flex h-14 w-14 items-center justify-center rounded-2xl bg-acento text-2xl shadow-lg"
            style={{ animationDelay: "0.6s" }}
          >
            💛
          </span>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6 px-4 py-16 text-center">
          <h1 className="anim-aparecer-arriba max-w-3xl text-4xl font-bold text-white drop-shadow-sm md:text-6xl">
            Arte local en stickers
          </h1>
          <p className="anim-aparecer-arriba anim-delay-1 max-w-xl text-base text-white/85 md:text-lg">
            Descubrí diseños originales de ilustradores argentinos. Directo del
            estudio a tu puerta.
          </p>

          <form
            action="/catalogo"
            method="get"
            className="anim-aparecer-arriba anim-delay-2 flex w-full max-w-md items-center justify-between gap-2 rounded-full bg-white py-2 pl-6 pr-2 shadow-lg"
          >
            <input
              type="text"
              name="q"
              placeholder="Buscar stickers..."
              className="w-full bg-transparent text-base text-ink outline-none placeholder:text-muted"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primario text-white transition-colors hover:bg-ink"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.6" />
                <path d="M14 14L18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </form>
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <h2 className="mb-2 text-center text-3xl font-bold text-ink md:text-4xl">
          Destacados
        </h2>
        <p className="mb-10 text-center text-muted">
          Los stickers que más le gustan a la comunidad
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {destacados.map((s) => (
            <StickerCard key={s.id} sticker={s} />
          ))}
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="mx-auto max-w-7xl px-4 pb-14 md:px-6">
        <h2 className="mb-2 text-center text-3xl font-bold text-ink md:text-4xl">
          Explorá por categoría
        </h2>
        <p className="mb-10 text-center text-muted">
          Encontrá el sticker perfecto para vos
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categorias.map((cat) => (
            <a
              key={cat}
              href={`/catalogo?categoria=${encodeURIComponent(cat)}`}
              className="flex h-28 items-center justify-center rounded-2xl bg-primario transition-transform hover:scale-[1.02] md:h-36"
            >
              <span className="text-2xl font-bold text-white md:text-3xl">
                {cat}
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}