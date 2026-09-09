"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Botón "Eliminar" de un sticker con confirmación inline.
 * Borra el sticker del ilustrador logueado vía DELETE /api/stickers/[id]
 * y refresca la lista de "Mis stickers".
 */
export default function EliminarStickerButton({
  stickerId,
  stickerNombre,
}: {
  stickerId: string;
  stickerNombre: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEliminar = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/stickers/${stickerId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "No pudimos eliminar el sticker.");
        setConfirming(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Hubo un problema de conexión. Probá de nuevo.");
      setConfirming(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2 flex flex-col gap-1">
      {confirming ? (
        <div className="flex flex-col gap-2">
          <button
            onClick={handleEliminar}
            disabled={loading}
            className="rounded-full bg-red-600 px-4 py-2.5 text-center text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Eliminando..." : "Sí, eliminar"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            disabled={loading}
            className="rounded-full border border-line px-4 py-2.5 text-center text-sm font-semibold text-muted transition hover:text-ink disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="rounded-full border border-red-200 px-4 py-2.5 text-center text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50"
        >
          Eliminar
        </button>
      )}
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      {confirming && !error && (
        <p className="text-xs text-muted">
          Se va a eliminar “{stickerNombre}” de tu tienda para siempre.
        </p>
      )}
    </div>
  );
}