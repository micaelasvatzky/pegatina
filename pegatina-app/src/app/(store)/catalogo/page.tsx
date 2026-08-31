import { stickers } from "@/lib/mock-data";
import StickerCard from "@/components/StickerCard";

const categorias = [
  "Lorem ipsum (3)",
  "Lorem ipsum (3)",
  "Lorem ipsum (3)",
  "Lorem ipsum (3)",
  "Lorem ipsum (3)",
  "Lorem ipsum (3)",
];

const precios = [
  "$20.00 - $50.00",
  "$20.00 - $50.00",
  "$20.00 - $50.00",
  "$20.00 - $50.00",
];

/**
 * Catálogo de productos con filtros laterales.
 * Sidebar: Categorías + Rango de precios. Grid de stickers a la derecha.
 */
export default function CatalogoPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex gap-10">
        {/* SIDEBAR FILTROS */}
        <aside className="flex w-64 shrink-0 flex-col gap-6">
          {/* Categorías */}
          <div className="border border-line bg-white p-6">
            <h3 className="mb-4 flex items-center gap-3 text-2xl text-ink">
              <span className="h-6 w-1 bg-primario" />
              Categorías
            </h3>
            <ul className="flex flex-col gap-3">
              {categorias.map((cat, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span className="text-base text-ink">{cat}</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 12 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-muted"
                  >
                    <path
                      d="M1 1.5L6 6.5L11 1.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </li>
              ))}
            </ul>
          </div>

          {/* Rango de precios */}
          <div className="border border-line bg-white p-6">
            <h3 className="mb-4 flex items-center gap-3 text-2xl text-ink">
              <span className="h-6 w-1 bg-primario" />
              Price Range
            </h3>
            <div className="flex flex-col gap-4">
              {precios.map((precio, i) => (
                <label
                  key={i}
                  className="flex cursor-pointer items-center gap-5"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-primario"
                    defaultChecked={i === 0}
                  />
                  <span className="text-base text-ink">{precio}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* GRID PRODUCTOS */}
        <section className="flex-1">
          <div className="mb-8 flex flex-col gap-2">
            <h1 className="text-center text-4xl font-bold text-ink">
              Catálogo de productos
            </h1>

            {/* búsqueda */}
            <div className="mx-auto mt-4 flex w-full max-w-3xl items-center justify-between gap-2 rounded-full border border-black/15 py-2 pl-5 pr-2">
              <span className="text-base text-muted">Search An Item</span>
              <button
                aria-label="Buscar"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/60 text-white"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="9"
                    cy="9"
                    r="6.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M14 14L18 18"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <p className="mt-4 font-bold text-ink">
              Showing 1–12 of 24 item(s)
            </p>
            <p className="text-muted">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {stickers.map((sticker) => (
              <StickerCard key={sticker.id} sticker={sticker} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
