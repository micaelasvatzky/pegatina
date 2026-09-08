"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

/**
 * Navbar de Pegatina, con dos modos:
 *
 * - "store" (default): el de compradores — Explorar + carrito + avatar/login.
 * - "dashboard": el del ilustrador — SOLO su espacio: sin carrito, sin
 *   Explorar. Muestra un acceso a su tienda pública + avatar.
 */
export default function Navbar({ mode = "store" }: { mode?: "store" | "dashboard" }) {
  const { count, openCart } = useCart();
  const { usuario, isLoggedIn, loading } = useAuth();

  const isDashboard = mode === "dashboard";

  // En el dashboard, el logo lleva a su espacio; en el store, a la landing.
  const logoHref = isDashboard ? "/dashboard" : "/";

  const perfilHref = usuario?.rol === "ilustrador" ? "/dashboard" : "/perfil";
  const inicial = usuario?.nombre?.charAt(0).toUpperCase() ?? "";
  const primerNombre = usuario?.nombre?.split(" ")[0] ?? "";

  // Link a la tienda pública (ruta sin @, SEO-friendly). Solo si tiene handle.
  const tiendaHref = usuario?.usuario
    ? `/artista/${usuario.usuario.replace("@", "")}`
    : null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-line bg-crema/95 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href={logoHref} className="text-3xl font-bold text-primario">
          Pegatina
        </Link>

        {/* Lado derecho */}
        <div className="flex items-center gap-5">
          {isDashboard ? (
            <>
              {/* Acceso a la tienda pública */}
              {tiendaHref && (
                <Link
                  href={tiendaHref}
                  className="rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-primario hover:text-primario"
                >
                  Ver mi tienda <span aria-hidden>↗</span>
                </Link>
              )}

              {/* Avatar (lleva al dashboard si es ilustrador) */}
              {!loading &&
                (isLoggedIn && usuario ? (
                  <Link
                    href={perfilHref}
                    className="flex items-center gap-2 rounded-full border border-line bg-white py-1.5 pl-1.5 pr-4 transition-colors hover:border-primario"
                    title={usuario.nombre}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primario text-sm font-bold text-white">
                      {inicial}
                    </span>
                    <span className="max-w-[7rem] truncate text-sm font-semibold text-ink">
                      {primerNombre}
                    </span>
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    aria-label="Iniciar sesión"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-primario/10 hover:text-primario"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="10"
                        cy="6"
                        r="3.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M3 18C3 13.5 6 11 10 11C14 11 17 13.5 17 18"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </Link>
                ))}
            </>
          ) : (
            <>
              {/* Navegación del store */}
              <Link
                href="/catalogo"
                className="text-base font-medium text-ink transition-colors hover:text-primario"
              >
                Explorar
              </Link>

              {/* Perfil / Login */}
              {!loading &&
                (isLoggedIn && usuario ? (
                  <Link
                    href={perfilHref}
                    className="flex items-center gap-2 rounded-full border border-line bg-white py-1.5 pl-1.5 pr-4 transition-colors hover:border-primario"
                    title={usuario.nombre}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primario text-sm font-bold text-white">
                      {inicial}
                    </span>
                    <span className="max-w-[7rem] truncate text-sm font-semibold text-ink">
                      {primerNombre}
                    </span>
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    aria-label="Iniciar sesión"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-primario/10 hover:text-primario"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="10"
                        cy="6"
                        r="3.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M3 18C3 13.5 6 11 10 11C14 11 17 13.5 17 18"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </Link>
                ))}

              {/* Carrito */}
              <button
                onClick={openCart}
                aria-label="Abrir carrito"
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-primario/10 hover:text-primario"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 3H4L5.5 13H15L17 5H5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="8" cy="17" r="1.3" fill="currentColor" />
                  <circle cx="14" cy="17" r="1.3" fill="currentColor" />
                </svg>
                {count > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primario text-[11px] font-bold text-white">
                    {count}
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}