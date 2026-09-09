"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ESTADOS_VALIDOS,
  ESTADO_LABEL,
  ESTADO_STYLE,
  type PedidoEstado,
} from "@/lib/pedidos";

interface Props {
  pedidoId: string;
  estado: PedidoEstado;
}

/**
 * Selector de estado de envío del pedido (dashboard del ilustrador).
 * PATCHea /api/pedidos/[id] y refresca la página server para re-render.
 */
export default function CambiarEstadoPedido({ pedidoId, estado }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const cambiar = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevo = e.target.value as PedidoEstado;
    if (nuevo === estado) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/pedidos/${pedidoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevo }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "No pudimos actualizar el estado.");
        return;
      }
      router.refresh();
    } catch {
      alert("Hubo un error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold ${
          ESTADO_STYLE[estado] ?? "bg-ink/10 text-ink/70"
        }`}
      >
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
          <circle
            cx="10"
            cy="10"
            r="7.5"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M10 5V10L13 12"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        {ESTADO_LABEL[estado] ?? "Pendiente"}
      </span>

      <select
        value={estado}
        onChange={cambiar}
        disabled={loading}
        title="Cambiar estado del pedido"
        className="h-9 cursor-pointer rounded-full border border-line bg-white px-3 text-sm font-semibold text-ink focus:border-primario focus:outline-none disabled:opacity-50"
      >
        {ESTADOS_VALIDOS.map((s) => (
          <option key={s} value={s}>
            {ESTADO_LABEL[s]}
          </option>
        ))}
      </select>
    </div>
  );
}