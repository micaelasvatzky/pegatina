import { getStickers, getCategorias } from "@/lib/data";
import StickerCard from "@/components/StickerCard";

// Dinámica: consulta MongoDB en runtime, no en build time.
// Así el build no depende de que la base esté disponible/autenticada.
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
      <section className="relative flex h-[480px] w-full items-center justify-center overflow-hidden bg-primario">
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

        <div className="relative z-10 flex flex-col items-center gap-6 px-4 text-center">
          <h1 className="max-w-3xl text-5xl font-bold text-white drop-shadow-sm">
            Arte local en stickers
          </h1>
          <p className="max-w-xl text-lg text-white/85">
            Descubrí diseños originales de ilustradores argentinos. Directo del
            estudio a tu puerta.
          </p>

          <form
            action="/catalogo"
            method="get"
            className="flex w-full max-w-md items-center justify-between gap-2 rounded-full bg-white py-2 pl-6 pr-2 shadow-lg"
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
      <section className="mx-auto max-w-7xl px-6 py-14">
        <h2 className="mb-2 text-center text-4xl font-bold text-ink">
          Destacados
        </h2>
        <p className="mb-10 text-center text-muted">
          Los stickers que más le gustan a la comunidad
        </p>

        <div className="grid grid-cols-4 gap-6">
          {destacados.map((s) => (
            <StickerCard key={s.id} sticker={s} />
          ))}
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="mx-auto max-w-7xl px-6 pb-14">
        <h2 className="mb-2 text-center text-4xl font-bold text-ink">
          Explorá por categoría
        </h2>
        <p className="mb-10 text-center text-muted">
          Encontrá el sticker perfecto para vos
        </p>

        <div className="grid grid-cols-3 gap-6">
          {categorias.map((cat) => (
            <a
              key={cat}
              href={`/catalogo?categoria=${encodeURIComponent(cat)}`}
              className="flex h-36 items-center justify-center rounded-2xl bg-primario transition-transform hover:scale-[1.02]"
            >
              <span className="text-3xl font-bold text-white">
                {cat}
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
