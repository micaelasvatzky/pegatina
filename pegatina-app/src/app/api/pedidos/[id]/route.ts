import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getSession, getUsuarioById } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getStickersByIlustrador } from "@/lib/data";
import { ESTADOS_VALIDOS, normalizarEstado, type PedidoEstado } from "@/lib/pedidos";

interface RouteCtx {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/pedidos/[id]
 * El ilustrador actualiza el estado de envío de un pedido.
 * Valida que el pedido contenga stickers SUYOS (no se tocan pedidos ajenos).
 */
export async function PATCH(req: Request, ctx: RouteCtx) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }
  if (session.rol !== "ilustrador") {
    return NextResponse.json(
      { error: "Solo los ilustradores gestionan envíos." },
      { status: 403 }
    );
  }

  const usuario = await getUsuarioById(session.sub);
  if (!usuario?.usuario) {
    return NextResponse.json(
      { error: "Tu cuenta no tiene @usuario configurado." },
      { status: 400 }
    );
  }
  // El handle en la DB se guarda CON @ (igual que en stickers y signup).
  const handle = usuario.usuario;

  const { id } = await ctx.params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  let body: { estado?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "El cuerpo de la solicitud es inválido." },
      { status: 400 }
    );
  }

  const estado: PedidoEstado = normalizarEstado(body.estado);
  if (!ESTADOS_VALIDOS.includes(estado)) {
    return NextResponse.json(
      { error: "Estado de pedido inválido." },
      { status: 400 }
    );
  }

  // Perfil de pertenencia: el pedido debe contener stickers del ilustrador.
  const stickers = await getStickersByIlustrador(handle);
  const stickerIds = stickers.map((s) => s.id);
  const conds: Record<string, unknown>[] = [{ "items.ilustrador": handle }];
  if (stickerIds.length) {
    conds.push({ "items.sticker_id": { $in: stickerIds } });
  }

  const db = await getDb();
  const result = await db.collection("pedidos").findOneAndUpdate(
    { _id: new ObjectId(id), $or: conds },
    { $set: { estado } },
    { returnDocument: "after" }
  );

  if (!result) {
    // No existe o no te pertenece — mismo error para no filtrar información.
    return NextResponse.json(
      { error: "No encontramos ese pedido." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, estado });
}