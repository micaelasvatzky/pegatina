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
  const [fotos, setFotos] = useState<string[]>(() => {
    if (sticker?.fotos && sticker.fotos.length > 0) return [...sticker.fotos];
    if (sticker?.foto) return [sticker.foto];
    return [""];
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const esEdicion = sticker !== null;

  const actualizarFoto = (idx: number, valor: string) =>
    setFotos((prev) => prev.map((f, i) => (i === idx ? valor : f)));

  const agregarFoto = () => {
    if (fotos.length < 4) setFotos((prev) => [...prev, ""]);
  };

  const quitarFoto = (idx: number) =>
    setFotos((prev) => prev.filter((_, i) => i !== idx));

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
      fotos: fotos.map((f) => f.trim()).filter(Boolean),
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

      {/* Fotos del sticker (URLs por ahora — Cloudinary en el futuro) */}
      <div>
        <label className={labelCls}>
          Fotos del sticker ({fotos.length}/4)
        </label>
        <div className="flex flex-col gap-3">
          {fotos.map((f, idx) => (
            <div key={idx} className="flex items-center gap-3">
              {/* Thumb de la foto / slot */}
              <div className="flex h-[46px] w-[64px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-crema">
                {f.trim() ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={f.trim()}
                    alt={`Foto ${idx + 1}`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.opacity = "0.3";
                    }}
                    onLoad={(e) => {
                      (e.target as HTMLImageElement).style.opacity = "1";
                    }}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xl">🎨</span>
                )}
              </div>
              <input
                type="url"
                value={f}
                onChange={(e) => actualizarFoto(idx, e.target.value)}
                placeholder={`Link de la foto ${idx + 1}`}
                className={`${inputCls} min-w-0 flex-1`}
              />
              {fotos.length > 1 && (
                <button
                  type="button"
                  onClick={() => quitarFoto(idx)}
                  aria-label={`Quitar foto ${idx + 1}`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-red-300 hover:text-red-600"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6 6L18 18M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        {fotos.length < 4 && (
          <button
            type="button"
            onClick={agregarFoto}
            className="mt-3 flex items-center gap-2 rounded-full border border-dashed border-primario px-4 py-2 text-sm font-semibold text-primario transition-colors hover:bg-primario/5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5V19M5 12H19"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
            Agregar otra foto
          </button>
        )}

        <p className="mt-2 text-xs text-muted">
          Hasta 4 fotos. La primera es la portada del sticker.
        </p>
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