"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import LogoutButton from "@/components/LogoutButton";

/**
 * Navbar de Pegatina, con dos modos:
 *
 * - "store" (default): el de compradores/invitados — announcement bar +
 *   logo pill + nav pill (Catálogo) + buscador + "Abrí tu tienda" +
 *   carrito con badge + avatar. Fiel a los refs Stitch "con acentos azules".
 *   Un ilustrador logueado SOLO vende: ve una versión mínima (logo + avatar).
 * - "dashboard": el del ilustrador — SOLO su espacio, sin carrito ni buscador.
 */
export default function Navbar({
  mode = "store",
}: {
  mode?: "store" | "dashboard";
}) {
  const { count, openCart } = useCart();
  const { usuario, isLoggedIn, loading } = useAuth();

  const isDashboard = mode === "dashboard";
  const esIlustrador = isLoggedIn && usuario?.rol === "ilustrador";
  const esAdmin = isLoggedIn && usuario?.rol === "admin";

  // En el dashboard, el logo lleva al espacio del ilustrador.
  // En el store: si el logueado es ilustrador, el logo también lo lleva
  // al dashboard (el vendedor no navega la tienda para comprar).
  // Si es admin, logo siempre a /admin.
  const logoHref =
    esAdmin
      ? "/admin"
      : isDashboard || esIlustrador
        ? "/dashboard"
        : "/";

  const perfilHref = esAdmin ? "/admin" : esIlustrador ? "/dashboard" : "/perfil";

  const inicial = usuario?.nombre?.charAt(0).toUpperCase() ?? "";
  const primerNombre = usuario?.nombre?.split(" ")[0] ?? "";

  /** Avatar (foto si existe, sino inicial en círculo cobalt) o botón login. */
  const avatar =
    !loading &&
    (isLoggedIn && usuario ? (
      <details
        className="relative"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.currentTarget.open = false;
            event.currentTarget.querySelector("summary")?.focus();
          }
        }}
      >
      <summary
        aria-label={`Abrir opciones de ${usuario.nombre}`}
        className="flex cursor-pointer list-none items-center gap-2 rounded-full border-2 border-line bg-card py-1.5 pl-1.5 pr-3 shadow-[2px_2px_0px_var(--color-line)] transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_var(--color-line)] [&::-webkit-details-marker]:hidden"
      >
        {usuario.foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={usuario.foto}
            alt={usuario.nombre}
            className="h-8 w-8 rounded-full border border-line object-cover"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cobalt text-sm font-bold text-white">
            {inicial}
          </span>
        )}
        <span className="hidden max-w-[7rem] truncate text-sm font-bold text-ink md:block">
          {primerNombre}
        </span>
      </summary>
      <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border-2 border-line bg-card p-2 nb-shadow-sm">
        {!esIlustrador && <Link
          href={perfilHref}
          onClick={(event) => event.currentTarget.closest("details")?.removeAttribute("open")}
          className="mb-2 block rounded-full px-3 py-1.5 text-xs font-semibold text-ink hover:bg-crema"
        >
          {esAdmin ? "Ir al panel" : "Mi perfil"}
        </Link>}
        <LogoutButton compact />
      </div>
      </details>
    ) : (
      <Link
        href="/login"
        aria-label="Iniciar sesión"
        className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-line bg-cobalt text-white shadow-[2px_2px_0px_var(--color-line)] transition-all hover:-translate-y-0.5 hover:bg-cobalt-dark"
      >
        <span className="icon text-2xl" aria-hidden>
          person
        </span>
      </Link>
    ));

  // ─────────────────────────── DASHBOARD ───────────────────────────
  if (isDashboard) {
    return (
      <header className="sticky top-0 z-50 w-full border-b-2 border-line bg-paper/95 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 md:px-6">
          <Link href="/dashboard" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Pegatina" className="h-10 w-auto md:h-12" />
          </Link>
          <div className="flex items-center gap-3 md:gap-5">{avatar}</div>
        </nav>
      </header>
    );
  }

  // ─────────────────────────── STORE ───────────────────────────
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="border-b-2 border-line bg-paper/95 backdrop-blur-md">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 md:px-6">
          {/* Logo suelto (sin contenedor) */}
          <Link href={logoHref} className="flex shrink-0 items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Pegatina" className="h-10 w-auto md:h-12" />
          </Link>

          {/* Nav pills — SOLO rutas reales (Arte DIY / Ilustradores / Feria
              Virtual del ref no existen en la app, ver AGENTS.md).
              Botón "Catálogo" SIEMPRE azul (decisión de Mica). */}
          {!esIlustrador && !esAdmin && (
            <Link
              href="/catalogo"
              className="hidden rounded-full bg-cobalt px-5 py-2 text-sm font-bold text-white shadow-[2px_2px_0px_var(--color-line)] transition-all outline-none hover:-translate-y-0.5 hover:bg-cobalt-dark focus-visible:ring-2 focus-visible:ring-line lg:inline-block"
            >
              Catálogo
            </Link>
          )}

          {/* Buscador — md+ */}
          {!esIlustrador && !esAdmin && (
            <form
              action="/catalogo"
              method="get"
              className="hidden max-w-md flex-1 items-center gap-2 rounded-full border-2 border-line bg-card px-4 py-2.5 shadow-[2px_2px_0px_var(--color-line)] transition-shadow focus-within:ring-2 focus-within:ring-cobalt md:flex"
            >
              <span className="icon text-lg text-muted" aria-hidden>
                search
              </span>
              <input
                type="text"
                name="q"
                placeholder="Buscar stickers, ilustradores…"
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
              />
            </form>
          )}

          {/* Lado derecho */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* "Abrí tu tienda" — sm+ */}
            {!esIlustrador && !esAdmin && (
              <Link
                href="/signup/ilustrador"
                className="hidden items-center gap-1.5 rounded-full border-2 border-line bg-primario px-4 py-2.5 text-xs font-extrabold uppercase tracking-wide text-white shadow-[2px_2px_0px_var(--color-line)] transition-all hover:-translate-y-0.5 hover:bg-ink sm:inline-flex"
              >
                <span className="icon text-base" aria-hidden>
                  storefront
                </span>
                Abrí tu tienda
              </Link>
            )}

            {/* Carrito — solo compradores logueados */}
            {isLoggedIn && !esIlustrador && !esAdmin && (
              <button
                onClick={openCart}
                aria-label="Abrir carrito"
                className="relative flex h-11 w-11 items-center justify-center rounded-full border-2 border-line bg-card text-ink shadow-[2px_2px_0px_var(--color-line)] transition-all hover:-translate-y-0.5 hover:bg-acento/30"
              >
                <span className="icon text-2xl" aria-hidden>
                  shopping_bag
                </span>
                {count > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-line bg-acento px-1 text-[11px] font-black text-ink tabular-nums">
                    {count}
                  </span>
                )}
              </button>
            )}

            {avatar}
          </div>
        </nav>
      </div>
    </header>
  );
}
