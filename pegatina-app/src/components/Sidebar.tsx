"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const links = [
  { href: "/dashboard", label: "Mi tienda", emoji: "🏪" },
  { href: "/dashboard/stickers", label: "Mis stickers", emoji: "🎨" },
  { href: "/dashboard/pedidos", label: "Pedidos", emoji: "📦" },
  { href: "/dashboard/perfil", label: "Mi perfil", emoji: "👤" },
];

/**
 * Sidebar del dashboard de ilustrador.
 * Identidad de la tienda arriba, navegación al medio, acciones abajo.
 */
export default function Sidebar() {
  const pathname = usePathname();
  const { usuario, logout } = useAuth();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  const inicial = usuario?.nombre?.charAt(0).toUpperCase() ?? "🎨";
  const salida = usuario?.usuario
    ? `/artista/${usuario.usuario.replace("@", "")}`
    : null;

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-line bg-white">
      {/* Identidad de la tienda */}
      <div className="flex flex-col items-center gap-3 border-b border-line px-6 py-8">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primario text-3xl font-bold text-white">
          {inicial}
        </span>
        <div className="text-center">
          <p className="truncate text-lg font-bold text-ink">
            {usuario?.nombre ?? "Tu tienda"}
          </p>
          <p className="text-base font-semibold text-primario">
            {usuario?.usuario ? usuario.usuario : "Ilustrador"}
          </p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="mt-6 flex flex-1 flex-col gap-1 px-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-[16px] transition-colors ${
              isActive(link.href)
                ? "bg-primario/15 font-semibold text-primario"
                : "text-ink hover:bg-crema"
            }`}
          >
            <span aria-hidden className="text-xl">
              {link.emoji}
            </span>
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Acciones */}
      <div className="flex flex-col gap-1 border-t border-line p-4">
        {salida && (
          <Link
            href={salida}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-[16px] text-ink transition-colors hover:bg-crema hover:text-primario"
          >
            <span aria-hidden className="text-xl">
              🌐
            </span>
            Ver tienda pública <span aria-hidden>↗</span>
          </Link>
        )}
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-[16px] text-ink transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <span aria-hidden className="text-xl">
            🚪
          </span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}