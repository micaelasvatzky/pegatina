import Link from "next/link";
import Navbar from "@/components/Navbar";

/**
 * Layout del área pública de compra (store).
 * Incluye el Navbar global y una sección de pie de página.
 */
export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>

      {/* FOOTER */}
      <footer className="border-t border-line bg-crema">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-6 py-12">
          {/* Logo */}
          <span className="text-4xl font-bold text-primario">
            Pegatina
          </span>

          {/* Links */}
          <div className="flex gap-10 text-sm text-muted">
            <Link href="/catalogo" className="hover:text-primario">
              Catálogo
            </Link>
            <Link href="/signup/ilustrador" className="hover:text-primario">
              Abrí tu tienda
            </Link>
            <Link href="/login" className="hover:text-primario">
              Iniciar sesión
            </Link>
          </div>

          {/* Copy */}
          <p className="text-xs text-muted">
            &copy; 2026 Pegatina. Arte local original, de ilustradores
            argentinos a tu puerta.
          </p>
        </div>
      </footer>
    </div>
  );
}
