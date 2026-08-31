import { stickers } from "@/lib/mock-data";
import StickerCard from "@/components/StickerCard";

/**
 * Landing / Home público del comprador.
 * Hero con overlay, búsqueda y productos destacados.
 */
export default function HomePage() {
  const destacados = stickers.slice(0, 4);

  return (
    <div>
      {/* HERO */}
      <section className="relative flex h-[460px] w-full items-center justify-center bg-ink">
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex flex-col items-center gap-8 px-4 text-center">
          <h1 className="font-display max-w-3xl text-5xl font-bold text-white">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit
          </h1>

          {/* búsqueda */}
          <div className="flex w-full max-w-sm items-center justify-between gap-2 rounded-full border border-white/60 bg-black/15 py-2 pl-5 pr-2 backdrop-blur-md">
            <span className="text-base text-muted">Search An Item</span>
            <button
              aria-label="Buscar"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white"
            >
              <svg
                width="16"
                height="16"
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
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <h2 className="mb-10 text-center text-4xl font-bold text-ink">
          Productos destacados
        </h2>

        <div className="grid grid-cols-4 gap-6">
          {destacados.map((sticker) => (
            <StickerCard key={sticker.id} sticker={sticker} />
          ))}
        </div>
      </section>
    </div>
  );
}
