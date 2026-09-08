"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Sticker } from "@/lib/types";

/**
 * Formulario de sticker, compartido entre "Subir sticker" y "Editar sticker".
 * - sticker === null → modo crear (POST /api/stickers)
 * - sticker != null  → modo editar (PATCH /api/stickers/[id])
 */
export default function StickerEditorForm({
  sticker = null,
  categorias,
}: {
  sticker?: Sticker | null;
  categorias: string[];
}) {
  const router = useRouter();

  const [nombre, setNombre] = useState(sticker?.nombre ?? "");
  const [precio, setPrecio] = useState(
    sticker ? String(sticker.precio) : ""
  );
  const [categoria, setCategoria] = useState(
    sticker?.categoria ?? categorias[0] ?? ""
  );
  const [material, setMaterial] = useState(sticker?.material ?? "Vinilo");
  const [acabado, setAcabado] = useState(sticker?.acabado ?? "Mate");
  const [resistenteAlAgua, setResistenteAlAgua] = useState(
    sticker?.resistente_al_agua ?? true
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const esEdicion = sticker !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const body = JSON.stringify({
      nombre,
      precio: Number(precio),
      categoria,
      material,
      acabado,
      resistente_al_agua: resistenteAlAgua,
    });

    const url = esEdicion ? `/api/stickers/${sticker.id}` : "/api/stickers";
    const res = await fetch(url, {
      method: esEdicion ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "No pudimos guardar el sticker.");
      setSubmitting(false);
      return;
    }

    // Refresca las páginas server (stickers grid, home con counts).
    router.push("/dashboard/stickers");
    router.refresh();
  };

  const inputCls =
    "h-[46px] rounded-full border border-line bg-white px-5 focus:border-primario focus:outline-none";
  const labelCls = "mb-1.5 block text-sm font-medium text-ink";

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-5">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className={labelCls}>Nombre del sticker</label>
        <input
          type="text"
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Matecito Argentino"
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>Precio de venta (ARS)</label>
        <input
          type="number"
          required
          min={1}
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
          placeholder="Ej: 1200"
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>Categoría</label>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className={inputCls}
        >
          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelCls}>Material</label>
        <select
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
          className={inputCls}
        >
          <option>Vinilo</option>
          <option>Papel</option>
          <option>Holográfico</option>
        </select>
      </div>

      <div>
        <label className={labelCls}>Acabado</label>
        <select
          value={acabado}
          onChange={(e) => setAcabado(e.target.value)}
          className={inputCls}
        >
          <option>Mate</option>
          <option>Brillo</option>
        </select>
      </div>

      <label className="flex cursor-pointer items-center gap-3 pt-1">
        <input
          type="checkbox"
          checked={resistenteAlAgua}
          onChange={(e) => setResistenteAlAgua(e.target.checked)}
          className="h-5 w-5 accent-primario"
        />
        <span className="text-ink">Resistente al agua 💧</span>
      </label>

      <div className="mt-2">
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-primario py-4 text-xl font-bold text-white transition-colors hover:bg-ink disabled:opacity-60"
        >
          {submitting
            ? "Guardando..."
            : esEdicion
              ? "Guardar cambios"
              : "Publicar sticker"}
        </button>
      </div>
    </form>
  );
}