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
 * El ilustrador actualiza el estado de envío de un pedido y/o el seguimiento
 * del envío (número + link de la empresa de correo).
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

  let body: { estado?: string; seguimiento?: { numero?: string; link?: string } | null };
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

  // Seguimiento opcional: si viene, validamos que sea un objeto con
  // numero (texto) y link (URL http/https). Ambos pueden quedar vacíos
  // (borra el seguimiento guardado).
  const update: Record<string, unknown> = { estado };
  if (body.seguimiento !== undefined) {
    const seg = body.seguimiento ?? {};
    const numero = typeof seg.numero === "string" ? seg.numero.trim() : "";
    const link = typeof seg.link === "string" ? seg.link.trim() : "";
    if (numero.length > 100) {
      return NextResponse.json(
        { error: "El número de seguimiento es demasiado largo." },
        { status: 400 }
      );
    }
    if (link) {
      let url: URL;
      try {
        url = new URL(link);
      } catch {
        return NextResponse.json(
          { error: "El link de seguimiento no es una URL válida." },
          { status: 400 }
        );
      }
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        return NextResponse.json(
          { error: "El link de seguimiento debe ser http/https." },
          { status: 400 }
        );
      }
    }
    update.seguimiento =
      numero || link ? { numero: numero || undefined, link: link || undefined } : null;
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
    { $set: update },
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