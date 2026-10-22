import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getStickerById } from "@/lib/data";
import { mensajeDeError } from "@/lib/errors";
import {
  mpConfigurado,
  crearOrderCheckout,
  calcularSplit,
  type PagoInfo,
} from "@/lib/mercadopago";
import { ObjectId } from "mongodb";

/**
 * POST /api/pedidos
 * Crea un pedido REAL desde el checkout y, si Mercado Pago está configurado,
 * genera la order de Checkout Pro (API de Orders) para redirigir al comprador.
 *
 * Seguridad: los precios se recalculan en el SERVER contra la DB — el cliente
 * solo manda sticker_id + cantidad (nunca se confía en el total).
 *
 * Pagos: modelo ADMIN CENTRALIZADO. La order se crea SIEMPRE con el token de
 * Pegatina (sin `marketplace_fee` ni token de vendedor): toda la plata entra a
 * la cuenta de la app y el admin liquida a cada ilustrador cada 15 días
 * (90% vendedor / 10% comisión). Ver src/lib/liquidaciones.ts.
 */

/** Cuerpo del checkout (lo mínimo que manda el cliente). */
interface CheckoutBody {
  items?: { sticker_id?: string; cantidad?: number }[];
  envio?: Record<string, string>;
}

/** Documento de pedido tal como se inserta (sin _id: lo genera Mongo). */
interface NuevoPedido {
  usuario_id: string;
  items: {
    sticker_id: string;
    nombre: string;
    precio: number;
    cantidad: number;
    ilustrador: string;
  }[];
  envio: {
    nombre: string;
    calle: string;
    ciudad: string;
    provincia: string;
    codigo_postal: string;
    notas: string;
  };
  metodo_pago: "mercadopago" | "transferencia";
  total: number;
  estado: string;
  fecha: Date;
  pago: PagoInfo;
}
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

  let body: CheckoutBody;
  try {
    body = (await req.json()) as CheckoutBody;
  } catch {
    return NextResponse.json(
      { error: "El cuerpo de la solicitud es inválido." },
      { status: 400 }
    );
  }

  // Validación de items
  const rawItems = Array.isArray(body.items) ? body.items : [];
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
  const items: {
    sticker_id: string;
    nombre: string;
    precio: number;
    cantidad: number;
    ilustrador: string;
  }[] = [];
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
  const mpActivo = mpConfigurado();

  // Pago inicial: pendiente. Con MP activo, se guarda también el split 10/90.
  const split = mpActivo ? calcularSplit(total) : null;
  const pago: PagoInfo = {
    proveedor: mpActivo ? "mercadopago" : "transferencia",
    estado: "pendiente",
    total,
    modelo: mpActivo ? "admin_centralizado" : undefined,
    ...(split
      ? {
          comision: split.comision,
          neto_artista: split.neto_artista,
        }
      : {}),
  };

  const db = await getDb();
  const nuevoPedido: NuevoPedido = {
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
    metodo_pago: mpActivo ? "mercadopago" : "transferencia",
    total,
    estado: "pending",
    fecha: new Date(),
    pago,
  };
  const result = await db
    .collection<NuevoPedido>("pedidos")
    .insertOne(nuevoPedido);

  const pedidoId = result.insertedId.toString();

  // Sin MP configurado → flujo transferencia (fallback) como siempre.
  if (!mpActivo) {
    return NextResponse.json({ id: pedidoId, ok: true }, { status: 201 });
  }

  try {
    const order = await crearOrderCheckout({
      items: items.map((it) => ({
        title: it.nombre,
        quantity: it.cantidad,
        unit_price: it.precio,
      })),
      total,
      externalReference: pedidoId,
      // Modelo admin centralizado: sin token de vendedor ni marketplace_fee.
      centralizado: true,
    });

    // Guardar el id de la order MP en el pedido.
    await db.collection("pedidos").updateOne(
      { _id: new ObjectId(pedidoId) },
      { $set: { "pago.order_id": order.id } }
    );

    return NextResponse.json(
      { id: pedidoId, ok: true, checkout_url: order.checkout_url },
      { status: 201 }
    );
  } catch (err) {
    // No dejamos pedidos huérfanos: si MP falló, el pedido no se crea.
    await db.collection("pedidos").deleteOne({ _id: new ObjectId(pedidoId) });
    return NextResponse.json(
      {
        error:
          "No pudimos iniciar el pago con Mercado Pago. " +
          mensajeDeError(err, "Intentá de nuevo."),
      },
      { status: 502 }
    );
  }
}