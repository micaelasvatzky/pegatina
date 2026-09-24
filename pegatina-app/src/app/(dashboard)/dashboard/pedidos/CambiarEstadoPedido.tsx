"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ESTADOS_VALIDOS,
  ESTADO_LABEL,
  ESTADO_STYLE,
  type PedidoEstado,
  type SeguimientoEnvio,
} from "@/lib/pedidos";

interface Props {
  pedidoId: string;
  estado: PedidoEstado;
  seguimiento?: SeguimientoEnvio | null;
}

const SE_MUESTRA_EDITOR: PedidoEstado[] = ["shipped", "delivered"];

/**
 * Selector de estado de envío + seguimiento del pedido (dashboard del
 * ilustrador). PATCHea /api/pedidos/[id] y refresca la página server.
 * El editor de seguimiento aparece recién cuando el pedido salió
 * (shipped/delivered): ahí el artista pega el número y link del correo.
 */
export default function CambiarEstadoPedido({ pedidoId, estado, seguimiento }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [numero, setNumero] = useState(seguimiento?.numero ?? "");
  const [link, setLink] = useState(seguimiento?.link ?? "");
  const [mensaje, setMensaje] = useState<string | null>(null);

  const cambiar = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevo = e.target.value as PedidoEstado;
    if (nuevo === estado) return;
    setLoading(true);
    setMensaje(null);
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

  const guardarSeguimiento = async () => {
    setGuardando(true);
    setMensaje(null);
    try {
      const res = await fetch(`/api/pedidos/${pedidoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado, seguimiento: { numero, link } }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error ?? "No pudimos guardar el seguimiento.");
        return;
      }
      setMensaje("Seguimiento guardado ✓");
      router.refresh();
    } catch {
      alert("Hubo un error de conexión.");
    } finally {
      setGuardando(false);
    }
  };

  const haySeguimientoGuardado = Boolean(seguimiento?.numero || seguimiento?.link);
  const muestroEditor = SE_MUESTRA_EDITOR.includes(estado);

  return (
    <div className="flex w-full flex-col items-start gap-2 lg:w-64 lg:shrink-0">
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
          className="h-9 cursor-pointer rounded-full border-2 border-line bg-card px-3 text-sm font-semibold text-ink transition-colors hover:border-primario focus:border-primario focus:outline-none disabled:opacity-50"
        >
          {ESTADOS_VALIDOS.map((s) => (
            <option key={s} value={s}>
              {ESTADO_LABEL[s]}
            </option>
          ))}
        </select>
      </div>

      {/* Seguimiento del envío (solo cuando el pedido salió) */}
      {muestroEditor && (
        <div className="mt-1 w-full rounded-xl border-2 border-dashed border-line bg-paper px-3 py-2.5">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-ink">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path
                d="M2 6.5H14V13.5H2V6.5Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path
                d="M14 9H16.5L18 10.5V13.5H14"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path
                d="M5 16C5.8 16 6.5 15.3 6.5 14.5C6.5 13.7 5.8 13 5 13C4.2 13 3.5 13.7 3.5 14.5C3.5 15.3 4.2 16 5 16Z"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M14.5 16C15.3 16 16 15.3 16 14.5C16 13.7 15.3 13 14.5 13C13.7 13 13 13.7 13 14.5C13 15.3 13.7 16 14.5 16Z"
                stroke="currentColor"
                strokeWidth="1.6"
              />
            </svg>
            Seguimiento del envío
          </p>
          <div className="flex flex-col gap-2">
            <input
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              placeholder="N° de seguimiento (opcional)"
              className="h-9 w-full rounded-full border-2 border-line bg-card px-3 text-sm text-ink transition-colors placeholder:text-muted/70 hover:border-primario focus:border-primario focus:outline-none"
            />
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="Link de seguimiento (https://…, opcional)"
              className="h-9 w-full rounded-full border-2 border-line bg-card px-3 text-sm text-ink transition-colors placeholder:text-muted/70 hover:border-primario focus:border-primario focus:outline-none"
            />
            <button
              onClick={guardarSeguimiento}
              disabled={guardando}
              className="inline-flex h-9 w-fit items-center gap-1.5 rounded-full bg-secundario px-4 text-sm font-bold text-white transition-colors hover:bg-cobalt-dark disabled:opacity-50"
            >
              {guardando ? "Guardando…" : "Guardar seguimiento"}
            </button>
            {mensaje ? (
              <span className="text-xs font-semibold text-green-700">{mensaje}</span>
            ) : haySeguimientoGuardado ? (
              <span className="text-xs font-semibold text-ink/60">
                Ya cargado: {seguimiento?.numero || "—"}
                {seguimiento?.link ? " · link ✓" : ""}
              </span>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}