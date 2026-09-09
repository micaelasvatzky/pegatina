"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

/**
 * Iconos SVG (line) — reemplazan a los emojis en la UI de control.
 */
const IconTienda = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M3 8L4.5 3.5H15.5L17 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 8H17V16.5H3V8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.5 8V11C6.5 12.5 8 13.5 10 13.5C12 13.5 13.5 12.5 13.5 11V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconStickers = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M10 2.5L12.5 5H15.5V8L18 10.5L15.5 13V16H12.5L10 18.5L7.5 16H4.5V13L2 10.5L4.5 8V5H7.5L10 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 6.5V13.5M6.5 10H13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconPedidos = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M2.5 4H17.5V16H2.5V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2.5 8H17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M6 12.5H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconPerfil = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3 18C3 13.5 6 11 10 11C14 11 17 13.5 17 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconGlobo = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2.5 10H17.5M10 2.5C11.8 4.2 12.8 7 12.8 10C12.8 13 11.8 15.8 10 17.5C8.2 15.8 7.2 13 7.2 10C7.2 7 8.2 4.2 10 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconSalir = (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M8 3.5H3.5V16.5H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.5 6.5L16 10L12.5 13.5M16 10H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const links = [
  { href: "/dashboard", label: "Mi tienda", icon: IconTienda },
  { href: "/dashboard/stickers", label: "Mis stickers", icon: IconStickers },
  { href: "/dashboard/pedidos", label: "Pedidos", icon: IconPedidos },
  { href: "/dashboard/perfil", label: "Mi perfil", icon: IconPerfil },
];

/**
 * Sidebar del dashboard de ilustrador.
 * Identidad de la tienda arriba, navegación al medio, acciones abajo.
 * El cierre de sesión pide confirmación y redirige al login.
 */
export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { usuario, logout } = useAuth();
  const [confirmandoSalida, setConfirmandoSalida] = useState(false);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  const inicial = usuario?.nombre?.charAt(0).toUpperCase() ?? "?";
  const salida = usuario?.usuario
    ? `/artista/${usuario.usuario.replace("@", "")}`
    : null;

  const cerrarSesion = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <>
      <aside className="flex w-20 shrink-0 flex-col border-r border-line bg-white md:w-72">
        {/* Identidad de la tienda */}
        <div className="flex flex-col items-center gap-3 border-b border-line px-2 py-8 md:px-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primario text-xl font-bold text-white md:h-16 md:w-16 md:text-3xl">
            {inicial}
          </span>
          <div className="hidden text-center md:block">
            <p className="truncate text-lg font-bold text-ink">
              {usuario?.nombre ?? "Tu tienda"}
            </p>
            <p className="text-base font-semibold text-primario">
              {usuario?.usuario ? usuario.usuario : "Ilustrador"}
            </p>
          </div>
        </div>

        {/* Navegación */}
        <nav className="mt-6 flex flex-1 flex-col gap-1 px-2 md:px-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              title={link.label}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-[16px] transition-colors md:px-4 ${
                isActive(link.href)
                  ? "bg-primario/15 font-semibold text-primario"
                  : "text-ink hover:bg-crema"
              }`}
            >
              <span aria-hidden className="flex shrink-0 items-center">
                {link.icon}
              </span>
              <span className="hidden md:inline">{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Acciones */}
        <div className="flex flex-col gap-1 border-t border-line p-2 md:p-4">
          {salida && (
            <Link
              href={salida}
              title="Ver tienda pública"
              className="flex items-center gap-3 rounded-xl px-3 py-3 text-[16px] text-ink transition-colors hover:bg-crema hover:text-primario md:px-4"
            >
              <span aria-hidden className="flex shrink-0 items-center">
                {IconGlobo}
              </span>
              <span className="hidden md:inline">
                Ver tienda pública <span aria-hidden>↗</span>
              </span>
            </Link>
          )}
          <button
            onClick={() => setConfirmandoSalida(true)}
            title="Cerrar sesión"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-[16px] text-ink transition-colors hover:bg-red-50 hover:text-red-600 md:px-4"
          >
            <span aria-hidden className="flex shrink-0 items-center">
              {IconSalir}
            </span>
            <span className="hidden md:inline">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Modal de confirmación de cierre de sesión */}
      {confirmandoSalida && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            onClick={() => setConfirmandoSalida(false)}
          />
          <div className="relative z-10 mx-4 w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              {IconSalir}
            </span>
            <h2 className="mt-4 text-xl font-bold text-ink">¿Cerrar sesión?</h2>
            <p className="mt-1 text-sm text-muted">
              Vas a salir de tu cuenta de ilustrador. Podés volver a entrar
              cuando quieras.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={cerrarSesion}
                className="w-full rounded-full bg-red-600 py-3 font-bold text-white transition-colors hover:bg-red-700"
              >
                Sí, cerrar sesión
              </button>
              <button
                onClick={() => setConfirmandoSalida(false)}
                className="w-full rounded-full border border-line bg-white py-3 font-semibold text-ink transition-colors hover:bg-crema"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}