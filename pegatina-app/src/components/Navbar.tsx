"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

/**
 * Navbar de Pegatina, con dos modos:
 *
 * - "store" (default): el de compradores — Explorar + carrito + avatar/login.
 * - "dashboard": el del ilustrador — SOLO su espacio: sin carrito, sin
 *   Explorar. Solo muestra el avatar. (La tienda pública se accede desde
 *   el Sidebar.)
 */
export default function Navbar({ mode = "store" }: { mode?: "store" | "dashboard" }) {
  const { count, openCart } = useCart();
  const { usuario, isLoggedIn, loading } = useAuth();

  const isDashboard = mode === "dashboard";

  // En el dashboard, el logo lleva al espacio del ilustrador.
  // En el store: si el logueado es ilustrador, el logo también lo lleva
  // al dashboard (el vendedor no navega la tienda para comprar).
  const logoHref =
    isDashboard || (isLoggedIn && usuario?.rol === "ilustrador")
      ? "/dashboard"
      : "/";

  const perfilHref = usuario?.rol === "ilustrador" ? "/dashboard" : "/perfil";
  const inicial = usuario?.nombre?.charAt(0).toUpperCase() ?? "";
  const primerNombre = usuario?.nombre?.split(" ")[0] ?? "";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-line bg-crema/95 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 md:px-6">
        {/* Logo */}
        <Link href={logoHref} className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Pegatina" className="h-10 w-auto md:h-12" />
        </Link>

        {/* Lado derecho */}
        <div className="flex items-center gap-3 md:gap-5">
          {isDashboard ? (
            <>
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
                    <span className="hidden max-w-[7rem] truncate text-sm font-semibold text-ink md:block">
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
              {/* Navegación del store — un ilustrador logueado SOLO vende:
                  no ve Explorar ni carrito (su única ventana al store es su
                  tienda pública, y el proxy bloquea el resto). */}
              {!(isLoggedIn && usuario?.rol === "ilustrador") && (
                <Link
                  href="/catalogo"
                  className="text-base font-medium text-ink transition-colors hover:text-primario"
                >
                  Explorar
                </Link>
              )}

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
                    <span className="hidden max-w-[7rem] truncate text-sm font-semibold text-ink md:block">
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

              {/* Carrito — solo para compradores logueados (ilustradores venden, no compran; sin sesión no tiene sentido) */}
              {isLoggedIn && usuario?.rol !== "ilustrador" && (
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
              )}
            </>
          )}
        </div>
      </nav>
    </header>
  );
}