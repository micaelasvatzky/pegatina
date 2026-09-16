"use client";

import { useState } from "react";

/**
 * Botón "Compartir perfil" del perfil público del artista.
 * Usa Web Share API si está disponible; si no, copia el link al portapapeles
 * y muestra un feedback temporal ("Link copiado ✓").
 */
export default function SharePerfilButton() {
  const [copiado, setCopiado] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, url });
        return;
      } catch {
        // El usuario canceló o falló — caemos al portapapeles.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sin clipboard disponible: no pasa nada, el link sigue en la URL.
    }
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 rounded-full border-2 border-line bg-card px-4 py-2 text-sm font-bold text-ink shadow-[2px_2px_0px_var(--color-line)] transition-all hover:-translate-y-0.5 hover:bg-acento"
    >
      <span className="icon text-base text-cobalt" aria-hidden>
        share
      </span>
      {copiado ? "Link copiado ✓" : "Compartir perfil"}
    </button>
  );
}