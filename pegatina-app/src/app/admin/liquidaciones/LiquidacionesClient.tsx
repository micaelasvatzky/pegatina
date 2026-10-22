"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mensajeDeError } from "@/lib/errors";

export interface LiquidacionItemVista {
  vendedor_handle: string;
  vendedor_id: string;
  bruto: number;
  comision_admin: number;
  neto_vendedor: number;
  pedidos: string[];
  cantidad_items: number;
}

export interface LiquidacionVista {
  id: string;
  periodo: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: "pendiente" | "pagada";
  fecha_generada: string;
  fecha_pagada?: string;
  total_bruto: number;
  comision_admin: number;
  neto_total_pagar: number;
  items: LiquidacionItemVista[];
}

/**
 * Acciones del backoffice de liquidaciones.
 * Los datos llegan del server component; acá solo se ejecutan acciones y se
 * refresca la página con `router.refresh()`.
 */
export default function LiquidacionesClient({
  liquidaciones,
}: {
  liquidaciones: LiquidacionVista[];
}) {
  const router = useRouter();
  const [generando, setGenerando] = useState(false);
  const [marcando, setMarcando] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function generar() {
    setGenerando(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/liquidaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo generar");
      setSuccess(`Liquidación ${data.liquidacion.periodo} generada`);
      router.refresh();
    } catch (e) {
      setError(mensajeDeError(e, "No se pudo generar la liquidación."));
    } finally {
      setGenerando(false);
    }
  }

  async function marcarPagada(id: string) {
    setMarcando(id);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/liquidaciones/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "pagada" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo actualizar");
      setSuccess("Liquidación marcada como PAGADA");
      router.refresh();
    } catch (e) {
      setError(mensajeDeError(e, "No se pudo actualizar la liquidación."));
    } finally {
      setMarcando(null);
    }
  }

  const formatFecha = (f: string) => new Date(f).toLocaleDateString("es-AR");

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">
            Liquidaciones
          </h1>
          <p className="text-ink/70">
            Toma todos los pedidos <strong>enviados o entregados</strong> que
            todavía no fueron liquidados, sin importar la fecha. Comisión 10%
            admin / 90% vendedor.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={generar}
            disabled={generando}
            className="inline-flex items-center gap-2 rounded-full border-2 border-line bg-acento px-5 py-2 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5 hover:bg-ink hover:text-card disabled:cursor-not-allowed disabled:opacity-60 nb-shadow-sm"
          >
            <span className="icon">{generando ? "autorenew" : "add"}</span>
            {generando ? "Generando..." : "Generar liquidación"}
          </button>
        </div>
      </header>

      {error && (
        <div className="rounded-2xl border-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-800 nb-shadow-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-2xl border-2 border-green-600 bg-green-50 px-4 py-3 text-sm text-green-800 nb-shadow-sm">
          {success}
        </div>
      )}

      {liquidaciones.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-line bg-card/50 p-10 text-center">
          <p className="text-ink/70">No hay liquidaciones aún.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {liquidaciones.map((l) => (
            <div
              key={l.id}
              className="overflow-hidden rounded-2xl border-2 border-line bg-card nb-shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-line bg-crema/60 p-4 md:p-6">
                <div className="space-y-1">
                  <h2 className="font-display text-xl font-extrabold">
                    Periodo {l.periodo}
                  </h2>
                  <p className="text-sm text-ink/70">
                    {formatFecha(l.fecha_inicio)} — {formatFecha(l.fecha_fin)} •
                    Generada {formatFecha(l.fecha_generada)}
                  </p>
                  {l.fecha_pagada && (
                    <p className="text-sm text-green-700">
                      Pagada el {formatFecha(l.fecha_pagada)}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border-2 border-line px-3 py-1 text-xs font-bold uppercase ${
                      l.estado === "pagada"
                        ? "bg-green-200 text-green-900"
                        : "bg-acento text-ink"
                    }`}
                  >
                    {l.estado === "pendiente" ? "PENDIENTE" : "PAGADA"}
                  </span>
                  {l.estado === "pendiente" && (
                    <button
                      onClick={() => marcarPagada(l.id)}
                      disabled={marcando === l.id}
                      className="inline-flex items-center gap-2 rounded-full border-2 border-line bg-primario px-4 py-1.5 text-xs font-semibold text-ink transition-transform hover:-translate-y-0.5 hover:bg-ink hover:text-card disabled:cursor-not-allowed disabled:opacity-60 nb-shadow-sm"
                    >
                      <span className="icon">check_circle</span>
                      {marcando === l.id ? "Guardando..." : "Marcar como pagada"}
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4 p-4 md:p-6">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border-2 border-line bg-crema p-3">
                    <p className="text-xs uppercase text-ink/60">Total bruto</p>
                    <p className="mt-1 font-semibold">
                      ${Math.round(l.total_bruto).toLocaleString("es-AR")} ARS
                    </p>
                  </div>
                  <div className="rounded-xl border-2 border-line bg-crema p-3">
                    <p className="text-xs uppercase text-ink/60">
                      Comisión admin (10%)
                    </p>
                    <p className="mt-1 font-semibold">
                      ${Math.round(l.comision_admin).toLocaleString("es-AR")} ARS
                    </p>
                  </div>
                  <div className="rounded-xl border-2 border-line bg-acento/40 p-3">
                    <p className="text-xs uppercase text-ink/60">
                      Neto a pagar (90%)
                    </p>
                    <p className="mt-1 font-bold">
                      ${Math.round(l.neto_total_pagar).toLocaleString("es-AR")}{" "}
                      ARS
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border-2 border-line">
                  <table className="min-w-full divide-y-2 divide-line bg-card text-sm">
                    <thead className="bg-crema">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold">
                          Vendedor
                        </th>
                        <th className="px-3 py-2 text-right font-semibold">
                          Bruto
                        </th>
                        <th className="px-3 py-2 text-right font-semibold">
                          Comisión admin (10%)
                        </th>
                        <th className="px-3 py-2 text-right font-semibold">
                          Neto a pagar (90%)
                        </th>
                        <th className="px-3 py-2 text-right font-semibold">
                          Items
                        </th>
                        <th className="px-3 py-2 text-left font-semibold">
                          Pedidos
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {l.items.map((it) => (
                        <tr key={it.vendedor_handle} className="hover:bg-crema/40">
                          <td className="px-3 py-2 font-medium">
                            {it.vendedor_handle}
                          </td>
                          <td className="px-3 py-2 text-right">
                            ${Math.round(it.bruto).toLocaleString("es-AR")}
                          </td>
                          <td className="px-3 py-2 text-right">
                            ${Math.round(it.comision_admin).toLocaleString("es-AR")}
                          </td>
                          <td className="px-3 py-2 text-right font-semibold">
                            ${Math.round(it.neto_vendedor).toLocaleString("es-AR")}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {it.cantidad_items}
                          </td>
                          <td className="max-w-xs truncate px-3 py-2 text-ink/70">
                            {it.pedidos.join(", ")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pt-2">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-full border-2 border-line bg-card px-4 py-2 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5 nb-shadow-sm"
        >
          <span className="icon">arrow_back</span>
          Volver al panel
        </Link>
      </div>
    </div>
  );
}
