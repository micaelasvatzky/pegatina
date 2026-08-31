import Link from "next/link";
import { notFound } from "next/navigation";
import { stickers } from "@/lib/mock-data";

/**
 * Detalle de producto (ruta dinámica /producto/[id]).
 * Galería de imágenes, precio, rating, descripción, cantidad,
 * Add to Cart / Buy Now e info de envío.
 */
export default async function ProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sticker = stickers.find((s) => s.id === id);

  if (!sticker) notFound();

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-1 text-base text-muted">
        <Link href="/catalogo" className="hover:text-primario">
          Product Listing
        </Link>
        <span className="text-muted">/</span>
        <span className="text-ink">Dummy Product Page</span>
      </nav>

      <div className="flex items-start gap-12">
        {/* Galería */}
        <div className="flex gap-7">
          <div className="flex flex-col justify-between gap-7">
            <div className="h-[194px] w-[141px] rounded bg-neutral-300" />
            <div className="h-[192px] w-[139px] rounded border border-black bg-neutral-300" />
            <div className="h-[194px] w-[141px] rounded bg-neutral-300" />
          </div>
          <div className="h-[627px] w-[498px] rounded-lg bg-neutral-300" />
        </div>

        {/* Info */}
        <div className="flex w-full max-w-lg flex-col gap-8">
          <div className="flex flex-col gap-7">
            {/* Título + corazón */}
            <div className="flex items-start justify-between">
              <h1 className="text-3xl font-bold text-ink">
                {sticker.titulo}
              </h1>
              <button
                aria-label="Guardar en favoritos"
                className="text-ink hover:text-primario"
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 21C12 21 4 15.5 4 9.5C4 6.5 6.5 4 9.5 4C11 4 12 4.7 12 5.5C12 4.7 13 4 14.5 4C17.5 4 20 6.5 20 9.5C20 15.5 12 21 12 21Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Precio */}
            <div className="flex items-center gap-3">
              <span className="text-3xl text-ink">
                ${sticker.precio.toFixed(2)}
              </span>
              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill={i < 4 ? "#fdc623" : "none"}
                      stroke="#fdc623"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 2l2.9 6.2 6.6.9-4.8 4.6 1.2 6.6L12 17.7 6.1 20.3l1.2-6.6L2.5 9.1l6.6-.9L12 2z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-ink">( 32 review )</span>
              </div>
            </div>

            <hr className="border-line" />

            {/* Descripción */}
            <p className="text-[15px] leading-[170%] text-ink">
              {sticker.descripcion}
            </p>
          </div>

          {/* Acciones */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex items-center gap-5 rounded-full border border-line bg-white px-6 py-3">
                <button aria-label="Restar" className="text-ink">
                  −
                </button>
                <span className="font-bold">1</span>
                <button aria-label="Sumar" className="text-ink">
                  +
                </button>
              </div>
              <button className="flex-1 rounded-full bg-ink px-6 py-4 font-bold text-white transition-colors hover:bg-primario">
                Add to Cart
              </button>
            </div>
            <button className="rounded-full border border-ink bg-white px-6 py-4 font-bold text-ink transition-colors hover:bg-ink hover:text-white">
              Buy Now
            </button>
          </div>

          {/* Envío */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-5">
              <span className="text-ink">icon</span>
              <span className="text-sm text-ink/70">
                Free worldwide shipping on all orders over $100
              </span>
            </div>
            <div className="flex items-center gap-5">
              <span className="text-ink">icon</span>
              <span className="text-sm text-ink/70">
                Delivers in: 3-7 Working Days{" "}
                <span className="underline">Shipping & Return</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
