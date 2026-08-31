"use client";

import Link from "next/link";

/**
 * Navbar global de Pegatina.
 * Logo a la izquierda, navegación (Categorías, Búsqueda, Perfil/Carrito)
 * a la derecha. El logo se reemplaza cuando Mica suba el SVG.
 */
export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-crema/90 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="font-display text-3xl text-ink">
          Pegatina
        </Link>

        {/* Navegación */}
        <div className="flex items-center gap-6">
          <Link
            href="/catalogo"
            className="flex items-center gap-1 text-base text-ink transition-colors hover:text-primario"
          >
            Categorías
            <svg
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1.5L6 6.5L11 1.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>

          {/* Búsqueda */}
          <button
            aria-label="Buscar"
            className="text-ink transition-colors hover:text-primario"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="9"
                cy="9"
                r="6.5"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M14 14L18 18"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* Perfil / Login */}
          <Link
            href="/login"
            aria-label="Iniciar sesión"
            className="text-ink transition-colors hover:text-primario"
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

          {/* Carrito */}
          <Link
            href="/carrito"
            aria-label="Carrito"
            className="text-ink transition-colors hover:text-primario"
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
          </Link>
        </div>
      </nav>
    </header>
  );
}
