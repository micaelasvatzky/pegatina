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
  const [filtro, setFiltro] = useState<"todas" | "pendiente" | "pagada">("todas");
  const pendientes = liquidaciones.filter((l) => l.estado === "pendiente");
  const visibles = liquidaciones.filter((l) => filtro === "todas" || l.estado === filtro);
  const dinero = (monto: number) => monto.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 });

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
          <p className="max-w-2xl text-sm leading-relaxed text-ink/70">
            Toma todos los pedidos <strong>enviados o entregados</strong> que
            todavía no fueron liquidados, sin importar la fecha. Comisión 10%
            admin / 90% vendedor.
          </p>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <button
            onClick={generar}
            disabled={generando}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-line bg-acento px-5 py-3 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5 hover:bg-ink hover:text-card disabled:cursor-not-allowed disabled:opacity-60 nb-shadow-sm sm:w-auto"
          >
            <span className="icon">{generando ? "autorenew" : "add"}</span>
            {generando ? "Generando..." : "Generar liquidación"}
          </button>
        </div>
      </header>

      <div className="grid gap-3 lg:grid-cols-3">
        {[
          { label: "Pendiente de transferir", valor: dinero(pendientes.reduce((s, l) => s + l.neto_total_pagar, 0)), color: "bg-acento/40" },
          { label: "Liquidaciones pendientes", valor: String(pendientes.length), color: "bg-card" },
          { label: "Total transferido", valor: dinero(liquidaciones.filter((l) => l.estado === "pagada").reduce((s, l) => s + l.neto_total_pagar, 0)), color: "bg-mint" },
        ].map((stat) => (
          <div key={stat.label} className={`min-w-0 rounded-2xl border-2 border-line p-4 nb-shadow-sm ${stat.color}`}>
            <p className="text-xs font-bold uppercase text-ink/70">{stat.label}</p>
            <p className="mt-2 break-words text-2xl font-black tabular-nums">{stat.valor}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex flex-wrap items-center gap-2 text-sm font-bold">
          Ver liquidaciones
          <select value={filtro} onChange={(e) => setFiltro(e.target.value as typeof filtro)} className="min-h-11 rounded-xl border-2 border-line bg-card px-3">
            <option value="todas">Todas</option>
            <option value="pendiente">Pendientes</option>
            <option value="pagada">Pagadas</option>
          </select>
        </label>
        <p className="text-sm text-muted">{visibles.length} de {liquidaciones.length} liquidaciones</p>
      </div>

      {error && (
        <div role="alert" className="rounded-2xl border-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-800 nb-shadow-sm">
          {error}
        </div>
      )}
      {success && (
        <div role="status" className="rounded-2xl border-2 border-green-600 bg-green-50 px-4 py-3 text-sm text-green-800 nb-shadow-sm">
          {success}
        </div>
      )}

      {visibles.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-line bg-card/50 p-10 text-center">
          <p className="text-ink/70">{liquidaciones.length === 0 ? "No hay liquidaciones aún." : "No hay liquidaciones con este estado."}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {visibles.map((l) => (
            <div
              key={l.id}
              className="overflow-hidden rounded-2xl border-2 border-line bg-card nb-shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-line bg-crema/60 p-4 md:p-6">
                <div className="min-w-0 space-y-1">
                  <h2 className="break-words font-display text-xl font-extrabold">
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
                <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:flex-col sm:items-end">
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
                <div className="grid gap-3 xl:grid-cols-3">
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

                <div className="rounded-xl border-2 border-line xl:overflow-x-auto">
                  <table className="block w-full bg-card text-sm xl:table">
                    <thead className="hidden bg-crema xl:table-header-group">
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
                    <tbody className="block divide-y divide-line xl:table-row-group">
                      {l.items.map((it) => (
                        <tr key={it.vendedor_handle} className="grid min-w-0 grid-cols-1 gap-1 p-3 hover:bg-crema/40 sm:grid-cols-2 xl:table-row xl:p-0">
                          <td className="block min-w-0 break-all px-3 py-2 font-bold sm:col-span-2 xl:table-cell">
                            {it.vendedor_handle}
                          </td>
                          <td className="block px-3 py-2 xl:table-cell xl:text-right">
                            <span className="mb-1 block text-xs text-muted xl:hidden">Bruto</span>
                            {dinero(it.bruto)}
                          </td>
                          <td className="block px-3 py-2 xl:table-cell xl:text-right">
                            <span className="mb-1 block text-xs text-muted xl:hidden">Comisión (10%)</span>
                            {dinero(it.comision_admin)}
                          </td>
                          <td className="block rounded-lg bg-acento/20 px-3 py-2 font-bold xl:table-cell xl:text-right">
                            <span className="mb-1 block text-xs font-normal text-muted xl:hidden">A transferir (90%)</span>
                            {dinero(it.neto_vendedor)}
                          </td>
                          <td className="block px-3 py-2 xl:table-cell xl:text-right">
                            <span className="mb-1 block text-xs text-muted xl:hidden">Unidades</span>
                            {it.cantidad_items}
                          </td>
                          <td className="block min-w-0 px-3 py-2 text-ink/70 sm:col-span-2 xl:table-cell">
                            <details>
                              <summary className="cursor-pointer py-1 font-semibold">{it.pedidos.length} pedidos</summary>
                              <ul className="mt-2 space-y-1">
                                {it.pedidos.map((id) => <li key={id} className="break-all font-mono text-xs">#{id}</li>)}
                              </ul>
                            </details>
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
