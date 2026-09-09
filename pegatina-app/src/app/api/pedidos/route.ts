import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getStickerById } from "@/lib/data";

/**
 * POST /api/pedidos
 * Crea un pedido REAL desde el checkout (sin Mercado Pago por ahora:
 * el flujo es "transferencia" — el ilustrador confirma al recibir el pago).
 *
 * Los precios se recalculan en el SERVER contra la DB:
 * el cliente solo manda sticker_id + cantidad (nunca se confía en el total).
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Iniciá sesión." }, { status: 401 });
  }
  if (session.rol !== "comprador") {
    return NextResponse.json(
      { error: "Los ilustradores no pueden comprar: su cuenta solo vende stickers." },
      { status: 403 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "El cuerpo de la solicitud es inválido." },
      { status: 400 }
    );
  }

  // Validación de items
  const rawItems: { sticker_id?: string; cantidad?: number }[] =
    Array.isArray(body.items) ? body.items : [];
  if (rawItems.length === 0) {
    return NextResponse.json(
      { error: "Tu carrito está vacío." },
      { status: 400 }
    );
  }

  // Validación de envío
  const envioRaw = body.envio ?? {};
  const envioNombres: Record<string, string> = {
    nombre: "nombre",
    calle: "calle",
    ciudad: "ciudad",
    provincia: "provincia",
    codigo_postal: "código postal",
  };
  for (const [key, label] of Object.entries(envioNombres)) {
    if (typeof envioRaw[key] !== "string" || !envioRaw[key].trim()) {
      return NextResponse.json(
        { error: `Completá el campo ${label}.` },
        { status: 400 }
      );
    }
  }

  // Recalcular items contra la DB: precios reales, nombre e ilustrador.
  const items = [];
  for (const raw of rawItems) {
    const stickerId = typeof raw.sticker_id === "string" ? raw.sticker_id : "";
    const cantidad = Math.floor(Number(raw.cantidad));
    if (!stickerId || !cantidad || cantidad < 1) {
      return NextResponse.json(
        { error: "Hay un item inválido en tu carrito." },
        { status: 400 }
      );
    }
    const sticker = await getStickerById(stickerId);
    if (!sticker) {
      return NextResponse.json(
        { error: "Uno de los stickers ya no existe." },
        { status: 400 }
      );
    }
    items.push({
      sticker_id: sticker.id,
      nombre: sticker.nombre,
      precio: sticker.precio,
      cantidad,
      // Handle CON @ (convención de la DB — así lo encuentra el vendedor).
      ilustrador: sticker.ilustrador,
    });
  }

  const total = items.reduce((sum, it) => sum + it.precio * it.cantidad, 0);

  const db = await getDb();
  const result = await db.collection("pedidos").insertOne({
    usuario_id: session.sub,
    items,
    envio: {
      nombre: envioRaw.nombre.trim(),
      calle: envioRaw.calle.trim(),
      ciudad: envioRaw.ciudad.trim(),
      provincia: envioRaw.provincia.trim(),
      codigo_postal: envioRaw.codigo_postal.trim(),
      notas: typeof envioRaw.notas === "string" ? envioRaw.notas.trim() : "",
    },
    // Sin Mercado Pago: el comprador transfiere y el ilustrador confirma.
    metodo_pago: "transferencia",
    total,
    estado: "pending",
    fecha: new Date(),
  } as any);

  return NextResponse.json(
    { id: result.insertedId.toString(), ok: true },
    { status: 201 }
  );
}