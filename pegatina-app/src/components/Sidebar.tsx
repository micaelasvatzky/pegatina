"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Mi tienda" },
  { href: "/dashboard/stickers", label: "Mis stickers" },
  { href: "/dashboard/pedidos", label: "Seguimiento de pedidos" },
  { href: "/dashboard/perfil", label: "Mi perfil" },
];

/**
 * Sidebar de navegación del ilustrador (Dashboard).
 * Mira el pathname activo para resaltar el link correspondiente.
 */
export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <aside className="h-full w-64 shrink-0 border-r border-line bg-white">
      {/* Banner de la tienda */}
      <div className="relative flex h-32 items-end bg-ink">
        <span className="sr-only">Banner de la tienda</span>
      </div>

      <nav className="mt-6 flex flex-col gap-1 px-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-lg px-3 py-2.5 text-[17px] capitalize transition-colors ${
              isActive(link.href)
                ? "bg-primario/15 font-semibold text-primario"
                : "text-ink hover:bg-crema"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
