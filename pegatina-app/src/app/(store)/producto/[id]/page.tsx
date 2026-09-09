import Link from "next/link";
import { notFound } from "next/navigation";
import { getStickerById } from "@/lib/data";
import { getSession, getUsuarioById } from "@/lib/auth";
import AddToCartButton from "@/components/AddToCartButton";

// Dinámica: consulta MongoDB en runtime, no en build time.
// Así el build no depende de que la base esté disponible/autenticada.
export const dynamic = "force-dynamic";

/** Colores por categoría para la galería */
const catBg: Record<string, string> = {
  Bebidas: "bg-secundario/15",
  Comida: "bg-primario/15",
  "Buenos Aires": "bg-acento/25",
  Argentina: "bg-secundario/25",
  Animales: "bg-primario/10",
  Cultura: "bg-acento/15",
};

const catEmoji: Record<string, string> = {
  Bebidas: "\u2615",
  Comida: "\uD83C\uDF5D",
  "Buenos Aires": "\uD83C\uDFD9\uFE0F",
  Argentina: "\uD83C\uDDE6\uD83C\uDDF7",
  Animales: "\uD83D\uDC3E",
  Cultura: "\uD83C\uDFA8",
};

/**
 * Detalle de producto (ruta dinámica /producto/[id]).
 */
export default async function ProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sticker = await getStickerById(id);

  if (!sticker) notFound();

  // Si el visitante logueado ES el dueño del sticker, no le ofrecemos
  // comprar su propio producto: solo puede editarlo desde el dashboard.
  const sesion = await getSession();
  const esDueño = sesion
    ? (await getUsuarioById(sesion.sub))?.usuario === sticker.ilustrador
    : false;

  const bg = catBg[sticker.categoria] ?? "bg-acento/15";
  const emoji = catEmoji[sticker.categoria] ?? "\u2B50";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-1 text-base text-muted">
        <Link href="/catalogo" className="hover:text-primario">
          Catálogo
        </Link>
        <span>/</span>
        <span className="text-ink">{sticker.nombre}</span>
      </nav>

      <div className="flex flex-col items-start gap-8 lg:flex-row lg:gap-12">
        {/* Galería */}
        <div className="flex w-full gap-3 lg:w-auto lg:gap-7">
          {/* Miniaturas (solo desktop) */}
          <div className="hidden flex-col justify-between gap-7 lg:flex">
            {sticker.fotos && sticker.fotos.length > 0
              ? sticker.fotos.slice(0, 3).map((f, i) => (
                  <div
                    key={i}
                    className={`flex h-[194px] w-[141px] items-center justify-center overflow-hidden rounded-xl ${bg}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={f}
                      alt={`${sticker.nombre} ${i + 1}`}
                      className="h-full w-full object-contain p-1"
                    />
                  </div>
                ))
              : [0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`flex h-[194px] w-[141px] items-center justify-center rounded-xl ${bg}`}
                  >
                    <span className="text-3xl">{emoji}</span>
                  </div>
                ))}
          </div>
          <div
            className={`relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl lg:h-[627px] lg:w-[498px] lg:aspect-auto ${bg}`}
          >
            {sticker.foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={sticker.foto}
                alt={sticker.nombre}
                className="absolute inset-0 h-full w-full object-contain p-4"
              />
            ) : (
              <span className="text-8xl">{emoji}</span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex w-full max-w-lg flex-col gap-8">
          <div className="flex flex-col gap-5">
            <div className="flex items-start justify-between">
              <h1 className="text-3xl font-bold text-ink">{sticker.nombre}</h1>
              <button
                aria-label="Guardar en favoritos"
                className="text-muted hover:text-primario"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 21C12 21 4 15.5 4 9.5C4 6.5 6.5 4 9.5 4C11 4 12 4.7 12 5.5C12 4.7 13 4 14.5 4C17.5 4 20 6.5 20 9.5C20 15.5 12 21 12 21Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <p className="text-sm text-muted">
              por{" "}
              <Link
                href={`/artista/${encodeURIComponent(
                  sticker.ilustrador.startsWith("@")
                    ? sticker.ilustrador.slice(1)
                    : sticker.ilustrador
                )}`}
                className="font-semibold text-primario underline decoration-primario/40 underline-offset-2 transition-colors hover:text-ink hover:decoration-ink"
                title={`Ver el perfil de ${sticker.ilustrador}`}
              >
                {sticker.ilustrador}
                <span className="ml-0.5 inline-block text-xs opacity-60">↗</span>
              </Link>
            </p>

            <p className="text-3xl font-bold text-primario">
              ${sticker.precio.toLocaleString("es-AR")} ARS
            </p>

            <hr className="border-line" />

            <div className="flex flex-col gap-2 text-sm text-ink">
              <p>
                <span className="font-semibold">Material:</span>{" "}
                {sticker.material}
              </p>
              <p>
                <span className="font-semibold">Categoría:</span>{" "}
                {sticker.categoria}
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-col gap-4">
            {esDueño ? (
              <Link
                href={`/dashboard/stickers/${sticker.id}`}
                className="rounded-full bg-primario px-6 py-4 text-center text-xl font-bold text-white transition-colors hover:bg-ink"
              >
                Editar sticker
              </Link>
            ) : (
              <AddToCartButton sticker={sticker} />
            )}
          </div>

          {/* Envío */}
          <div className="rounded-2xl border border-line bg-white p-5">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primario/10 text-primario">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M4 5.5H20V19.5H4V5.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 3.5V7.5M16 3.5V7.5M4 10.5H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="text-sm text-ink">
                  Envío gratis en compras superiores a $2.000
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secundario/15 text-secundario">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M3 7H14V17H3V7ZM10 7V17M10 12H19M19 12V17H21V10L19 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-sm text-ink">
                  Envío a todo el país en 3 a 7 días hábiles
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-acento/20 text-[#c99400]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M4 8H20M4 8L4 20H20V8M4 8V4H20V8M9 12H15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-sm text-ink">
                  Devoluciones sin cargo dentro de los 10 días
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
