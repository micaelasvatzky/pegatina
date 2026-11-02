"use client";

import { useState, type ReactNode } from "react";

export default function CatalogoFiltros({ children, activos }: { children: ReactNode; activos: boolean }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <aside className="min-w-0 lg:col-span-3">
      <button
        type="button"
        aria-expanded={abierto}
        aria-controls="catalogo-filtros"
        onClick={() => setAbierto(!abierto)}
        className="mb-4 flex w-full flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-line bg-card px-4 py-3 text-sm font-bold text-ink nb-shadow-sm lg:hidden"
      >
        <span className="flex items-center gap-2">
          <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d={abierto ? "M6 6L18 18M6 18L18 6" : "M4 6H20M4 12H20M4 18H20"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Búsqueda y categorías
        </span>
        {activos && <span className="rounded-full bg-cobalt px-2 py-1 text-xs text-white">Filtros activos</span>}
      </button>
      <div id="catalogo-filtros" className={`${abierto ? "block" : "hidden"} lg:sticky lg:top-32 lg:block`}>
        {children}
      </div>
    </aside>
  );
}
