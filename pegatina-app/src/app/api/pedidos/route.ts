import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import type { ObjectId } from "mongodb";

/**
 * GET /api/pedidos
 * Devuelve los pedidos del usuario logueado (para el perfil del comprador).
 * Solo accesible con sesión activa.
 */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ pedidos: [] }, { status: 401 });
  }

  const db = await getDb();
  const docs = await db
    .collection("pedidos")
    .find({ usuario_id: session.sub })
    .sort({ fecha: -1 })
    .limit(20)
    .toArray();

  const pedidos = docs.map((d: any) => ({
    id: (d._id as ObjectId).toString(),
    items: d.items ?? [],
    total: d.total ?? 0,
    estado: d.estado ?? "pendiente",
    fecha: d.fecha ? new Date(d.fecha).toISOString() : null,
  }));

  return NextResponse.json({ pedidos });
}
