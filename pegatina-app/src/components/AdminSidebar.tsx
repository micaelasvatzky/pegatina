"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const IconPanel = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M3 3H8.5V8.5H3V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M11.5 3H17V8.5H11.5V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M3 11.5H8.5V17H3V11.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M11.5 11.5H17V17H11.5V11.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const IconBalance = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M10 3V17M6.5 17H13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M3 6H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M3 6L1 11H5L3 6ZM17 6L15 11H19L17 6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const IconSalir = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M8 3.5H3.5V16.5H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.5 6.5L16 10L12.5 13.5M16 10H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const links = [
  { href: "/admin", label: "Panel", icon: IconPanel },
  { href: "/admin/liquidaciones", label: "Liquidaciones", icon: IconBalance },
];

/**
 * Navegación del backoffice de administración.
 * Desktop: columna a la izquierda. Mobile: barra horizontal arriba.
 */
export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <aside className="flex w-full shrink-0 items-center justify-between gap-1 border-b-2 border-line bg-card p-2 md:w-72 md:flex-col md:items-stretch md:justify-start md:border-b-0 md:border-r-2 md:p-0">
      <nav className="flex items-center gap-1 md:flex-1 md:flex-col md:items-stretch md:p-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            title={link.label}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors md:gap-3 md:px-4 md:py-3 md:text-sm ${
              isActive(link.href)
                ? "bg-primario/15 text-primario"
                : "text-ink hover:bg-crema"
            }`}
          >
            <span aria-hidden className="flex shrink-0 items-center">
              {link.icon}
            </span>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>

      <div className="md:border-t-2 md:border-line md:p-3">
        <button
          onClick={handleLogout}
          title="Cerrar sesión"
          className="flex w-full items-center gap-2 rounded-xl border-2 border-red-600 px-3 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 md:gap-3 md:px-4 md:py-3 md:text-sm"
        >
          <span aria-hidden className="flex shrink-0 items-center">
            {IconSalir}
          </span>
          <span className="hidden sm:inline">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
