import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import type { DBLiquidacion } from "@/lib/types";

async function getAdminSession() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  if (session.rol !== "admin") {
    return NextResponse.json({ error: "Acceso restringido a administradores." }, { status: 403 });
  }
  return session;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessRes = await getAdminSession();
  if (sessRes instanceof NextResponse) return sessRes;

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const db = await getDb();
  const l = await db.collection<DBLiquidacion>("liquidaciones").findOne({ _id: new ObjectId(id) });

  if (!l) return NextResponse.json({ error: "No encontrado." }, { status: 404 });

  return NextResponse.json({
    liquidacion: {
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
    },
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessRes = await getAdminSession();
  if (sessRes instanceof NextResponse) return sessRes;

  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  let body: { estado?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    body = {};
  }

  const estado = body.estado;
  const db = await getDb();
  const l = await db.collection<DBLiquidacion>("liquidaciones").findOne({ _id: new ObjectId(id) });

  if (!l) return NextResponse.json({ error: "No encontrado." }, { status: 404 });

  if (estado === "pagada" && l.estado !== "pagada") {
    await db.collection("liquidaciones").updateOne(
      { _id: new ObjectId(id) },
      { $set: { estado: "pagada", fecha_pagada: new Date() } }
    );

    const updated = await db
      .collection<DBLiquidacion>("liquidaciones")
      .findOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      liquidacion: updated
        ? {
            id: updated._id.toString(),
            periodo: updated.periodo,
            fecha_inicio: updated.fecha_inicio.toISOString(),
            fecha_fin: updated.fecha_fin.toISOString(),
            estado: updated.estado,
            fecha_generada: updated.fecha_generada.toISOString(),
            fecha_pagada: updated.fecha_pagada?.toISOString(),
            total_bruto: updated.total_bruto,
            comision_admin: updated.comision_admin,
            neto_total_pagar: updated.neto_total_pagar,
            items: updated.items,
          }
        : null,
    });
  }

  return NextResponse.json({ liquidacion: null });
}
