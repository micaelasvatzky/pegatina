import Link from "next/link";
import Navbar from "@/components/Navbar";

/**
 * Layout del área pública de compra (store).
 * Incluye el Navbar global y un footer multi-column estilo Stitch
 * con links SOLO a rutas reales de la app.
 */
export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const columnas = [
    {
      titulo: "Explorar",
      links: [
        { href: "/catalogo", label: "Catálogo completo" },
        { href: "/catalogo?categoria=Bebidas", label: "Bebidas" },
        { href: "/catalogo?categoria=Comida", label: "Comida" },
        { href: "/catalogo?categoria=Buenos%20Aires", label: "Buenos Aires" },
        { href: "/catalogo?categoria=Argentina", label: "Argentina" },
        { href: "/catalogo?categoria=Animales", label: "Animales" },
        { href: "/catalogo?categoria=Cultura", label: "Cultura" },
      ],
    },
    {
      titulo: "Artistas",
      links: [
        { href: "/signup/ilustrador", label: "Abrí tu tienda gratis" },
        { href: "/dashboard", label: "Panel del ilustrador" },
        { href: "/login", label: "Iniciar sesión" },
        { href: "/signup/comprador", label: "Crear cuenta" },
      ],
    },
    {
      titulo: "Ayuda",
      links: [
        { href: "/carrito", label: "Tu carrito" },
        { href: "/checkout", label: "Finalizar compra" },
        { href: "/perfil", label: "Tu perfil" },
        { href: "/catalogo", label: "Envíos y devoluciones" },
      ],
    },
  ];

  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>

      {/* FOOTER multi-column estilo Stitch */}
      <footer className="border-t-2 border-line bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-14 md:grid-cols-2 lg:grid-cols-5">
          {/* Marca */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Pegatina" className="h-12 w-auto" />
            <p className="max-w-sm text-sm leading-relaxed text-muted">
              Feria federal de stickers de ilustradores e ilustradoras
              independientes de Argentina. Cada pieza sale del taller de
              quien la dibujó, directo a tu puerta.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Hecho a mano", "Tiradas cortas", "Feria federal"].map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-line bg-paper px-3 py-1 text-xs font-semibold text-ink-soft"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Columnas de links */}
          {columnas.map((col) => (
            <div key={col.titulo}>
              <h3 className="mb-3 text-xs font-black uppercase tracking-widest text-ink">
                {col.titulo}
              </h3>
              <ul className="flex flex-col gap-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm font-semibold text-muted transition-colors hover:text-primario"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Barra inferior */}
        <div className="border-t-2 border-line bg-paper">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 sm:flex-row">
            <p className="text-xs text-muted">
              &copy; 2026 Pegatina. Arte local original, de ilustradores
              argentinos a tu puerta.
            </p>
            <p className="text-xs font-bold text-ink-soft">
              Hecho con ❤️ y tinta en Argentina
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}