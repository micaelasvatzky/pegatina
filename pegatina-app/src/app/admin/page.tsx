import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/mongodb";
import type { DBLiquidacion } from "@/lib/types";

export default async function AdminHome() {
  const session = await getSession();
  if (!session || session.rol !== "admin") redirect("/");

  const db = await getDb();
  const pendientes = await db
    .collection<DBLiquidacion>("liquidaciones")
    .countDocuments({ estado: "pendiente" });

  const [res] = await db
    .collection<DBLiquidacion>("liquidaciones")
    .aggregate([
      { $match: { estado: "pendiente" } },
      {
        $group: {
          _id: null,
          neto_total_pagar: { $sum: "$neto_total_pagar" },
          comision_admin: { $sum: "$comision_admin" },
          total_bruto: { $sum: "$total_bruto" },
        },
      },
    ])
    .toArray();

  const stats = res ?? {
    neto_total_pagar: 0,
    comision_admin: 0,
    total_bruto: 0,
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">
          Panel de administración
        </h1>
        <p className="text-ink/70">
          El admin cobra todas las ventas y liquida a los vendedores cada 15
          días (90% vendedor / 10% comisión).
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border-2 border-line bg-card p-6 nb-shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">
            Liquidaciones pendientes
          </p>
          <p className="mt-2 font-display text-4xl font-extrabold">{pendientes}</p>
        </div>
        <div className="rounded-2xl border-2 border-line bg-card p-6 nb-shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">
            Neto a pagar (total pendiente)
          </p>
          <p className="mt-2 font-display text-4xl font-extrabold">
            ${Math.round(stats.neto_total_pagar).toLocaleString("es-AR")} ARS
          </p>
        </div>
        <div className="rounded-2xl border-2 border-line bg-card p-6 nb-shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">
            Comisión admin (total pendiente)
          </p>
          <p className="mt-2 font-display text-4xl font-extrabold">
            ${Math.round(stats.comision_admin).toLocaleString("es-AR")} ARS
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/liquidaciones"
          className="inline-flex items-center gap-2 rounded-full border-2 border-line bg-primario px-5 py-2 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5 hover:bg-ink hover:text-card nb-shadow-sm"
        >
          <span className="icon">balance</span>
          Ver liquidaciones
        </Link>
        <Link
          href="/admin/liquidaciones"
          className="inline-flex items-center gap-2 rounded-full border-2 border-line bg-acento px-5 py-2 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5 hover:bg-ink hover:text-card nb-shadow-sm"
        >
          <span className="icon">add</span>
          Generar liquidación
        </Link>
      </div>
    </div>
  );
}
