import { getDb } from "@/lib/mongodb";
import type { DBLiquidacion } from "@/lib/types";
import LiquidacionesClient, { type LiquidacionVista } from "./LiquidacionesClient";

/**
 * Liquidaciones (backoffice admin).
 *
 * Server component: lee las liquidaciones de Mongo y las pasa al cliente, que
 * solo se encarga de las ACCIONES (generar / marcar pagada). Así no hay
 * `useEffect` con fetch ni estado duplicado en el cliente.
 */
export const dynamic = "force-dynamic";

async function getLiquidaciones(): Promise<LiquidacionVista[]> {
  const db = await getDb();
  const docs = await db
    .collection<DBLiquidacion>("liquidaciones")
    .find({})
    .sort({ fecha_generada: -1 })
    .toArray();

  return docs.map((l) => ({
    id: l._id.toString(),
    periodo: l.periodo,
    fecha_inicio: l.fecha_inicio.toISOString(),
    fecha_fin: l.fecha_fin.toISOString(),
    estado: l.estado,
    fecha_generada: l.fecha_generada.toISOString(),
    fecha_pagada: l.fecha_pagada?.toISOString(),
    total_bruto: l.total_bruto,
    comision_admin: l.comision_admin,
    neto_total_pagar: l.neto_total_pagar,
    items: l.items,
  }));
}

export default async function LiquidacionesAdminPage() {
  const liquidaciones = await getLiquidaciones();
  return <LiquidacionesClient liquidaciones={liquidaciones} />;
}
