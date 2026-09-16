"use client";

import { useState } from "react";

type ViewId = "solo" | "termo" | "notebook";

const VIEWS: { id: ViewId; emoji: string; label: string; transform: string }[] = [
  { id: "solo", emoji: "✨", label: "Sticker solo", transform: "rotate-0 scale-100" },
  { id: "termo", emoji: "🧉", label: "En termo", transform: "rotate-3 scale-110" },
  { id: "notebook", emoji: "💻", label: "En notebook", transform: "-rotate-2 scale-95" },
];

/**
 * Stage del detalle de producto — fiel al ref Stitch "detalle refinado
 * con acentos azules": view pills (✨ solo / 🧉 termo / 💻 notebook) que
 * transforman la foto real del sticker dentro del contenedor.
 */
export default function ProductViewTabs({
  foto,
  nombre,
}: {
  foto: string;
  nombre: string;
}) {
  const [view, setView] = useState<ViewId>("solo");
  const active = VIEWS.find((v) => v.id === view) ?? VIEWS[0];

  return (
    <div>
      {/* Stage */}
      <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-[20px] border-2 border-line bg-paper p-8 shadow-[4px_4px_0px_var(--color-line)]">
        {foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={foto}
            alt={nombre}
            className={`max-h-full max-w-full object-contain transition-transform duration-300 drop-shadow-[2px_4px_6px_rgba(0,0,0,0.12)] ${active.transform}`}
          />
        ) : (
          <span className="text-8xl">🎨</span>
        )}

        {/* Badges sobre la stage */}
        <span className="absolute bottom-3 left-3 rounded-full border-2 border-line bg-card px-3 py-1 text-[11px] font-black uppercase tracking-wide text-ink shadow-[2px_2px_0px_var(--color-line)]">
          ★ Pieza original
        </span>
        <span className="absolute bottom-3 right-3 hidden rounded-full border-2 border-line bg-card px-3 py-1 text-[11px] font-black uppercase tracking-wide text-ink shadow-[2px_2px_0px_var(--color-line)] sm:block">
          Hecho en Argentina
        </span>
      </div>

      {/* View pills */}
      <div className="mt-4 flex flex-wrap gap-2">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setView(v.id)}
            className={`rounded-full border-2 border-line px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide transition-all ${
              view === v.id
                ? "bg-cobalt text-white shadow-[2px_2px_0px_var(--color-line)]"
                : "bg-card text-ink hover:bg-paper"
            }`}
          >
            {v.emoji} {v.label}
          </button>
        ))}
      </div>
    </div>
  );
}