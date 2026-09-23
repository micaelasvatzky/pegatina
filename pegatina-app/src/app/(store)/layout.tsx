import Link from "next/link";
import Navbar from "@/components/Navbar";

/**
 * Layout del área pública de compra (store).
 * Incluye el Navbar global y un footer multi-column fiel a los refs Stitch:
 * pill del logo + badges de color, columnas Explorar/Comunidad/Feria Semanal
 * (newsletter) con links SOLO a rutas reales de la app.
 */
export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categorias = [
    "Bebidas",
    "Comida",
    "Buenos Aires",
    "Argentina",
    "Animales",
    "Cultura",
  ];

  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>

      {/* FOOTER multi-column estilo Stitch */}
      <footer className="border-t-2 border-line bg-paper">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-14 md:grid-cols-2 lg:grid-cols-12">
          {/* Marca — logo suelto (sin contenedor) */}
          <div className="flex flex-col gap-4 lg:col-span-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Pegatina" className="h-9 w-auto" />
            <p className="max-w-sm text-sm leading-relaxed text-muted">
              Feria federal de stickers de ilustradores independientes de
              Argentina. Cada pieza sale del taller de quien la dibujó,
              directo a tu puerta.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-line bg-mint px-3 py-1 text-xs font-bold text-ink">
                Hecho a mano
              </span>
              <span className="rounded-full border border-line bg-lilac px-3 py-1 text-xs font-bold text-ink">
                Tiradas cortas
              </span>
              <span className="rounded-full border border-line bg-wash px-3 py-1 text-xs font-bold text-ink">
                Feria federal
              </span>
            </div>
          </div>

          {/* Explorar */}
          <div className="lg:col-span-2">
            <h3 className="mb-3 font-display text-xs font-black uppercase tracking-widest text-ink">
              Explorar
            </h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  href="/catalogo"
                  className="text-sm font-semibold text-muted transition-colors hover:text-cobalt"
                >
                  Catálogo completo
                </Link>
              </li>
              {categorias.map((c) => (
                <li key={c}>
                  <Link
                    href={`/catalogo?categoria=${encodeURIComponent(c)}`}
                    className="text-sm font-semibold text-muted transition-colors hover:text-cobalt"
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Comunidad */}
          <div className="lg:col-span-2">
            <h3 className="mb-3 font-display text-xs font-black uppercase tracking-widest text-ink">
              Comunidad
            </h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  href="/signup/ilustrador"
                  className="text-sm font-semibold text-muted transition-colors hover:text-cobalt"
                >
                  Abrí tu tienda gratis
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm font-semibold text-muted transition-colors hover:text-cobalt"
                >
                  Panel del ilustrador
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-sm font-semibold text-muted transition-colors hover:text-cobalt"
                >
                  Iniciar sesión
                </Link>
              </li>
              <li>
                <Link
                  href="/signup/comprador"
                  className="text-sm font-semibold text-muted transition-colors hover:text-cobalt"
                >
                  Crear cuenta
                </Link>
              </li>
            </ul>
          </div>

          {/* Feria Semanal */}
          <div className="lg:col-span-4">
            <h3 className="mb-3 font-display text-xs font-black uppercase tracking-widest text-ink">
              Feria Semanal
            </h3>
            <p className="mb-3 max-w-xs text-sm text-muted">
              Novedades de la feria, lanzamientos de ilustradores y pilas de
              stickers, una vez por semana.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                placeholder="tu@email.com"
                aria-label="Email para la feria semanal"
                className="w-full flex-1 rounded-full border-2 border-line bg-card px-4 py-2.5 text-sm text-ink shadow-[2px_2px_0px_var(--color-line)] outline-none placeholder:text-muted focus:ring-2 focus:ring-cobalt"
              />
              <button
                type="button"
                className="rounded-full border-2 border-line bg-cobalt px-5 py-2.5 text-sm font-bold text-white shadow-[2px_2px_0px_var(--color-line)] transition-all hover:-translate-y-0.5 hover:bg-cobalt-dark"
              >
                Sumarse
              </button>
            </div>
            <p className="mt-2 text-xs font-semibold text-muted">
              Newsletter en camino — por ahora te esperamos en la feria.
            </p>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="border-t-2 border-line bg-card">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 sm:flex-row">
            <p className="text-xs text-muted">
              &copy; 2026 Pegatina. Arte local original, de ilustradores
              argentinos a tu puerta.
            </p>
            <p className="text-xs font-bold text-ink-soft">
              Hecho con papel, vinilo y cariño · Buenos Aires, Argentina
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}