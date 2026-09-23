import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { obtenerOrder, obtenerPayment, validarFirmaWebhook } from "@/lib/mercadopago";

/**
 * POST /api/mercadopago/webhook
 * Webhook (notificaciones) de Mercado Pago para Checkout Pro vía API de Orders.
 *
 * MP nos toca el timbre cada vez que pasa algo con un pago:
 *   - topic/type "payment" → consultamos /v1/payments/{id}
 *   - topic/type "orders"  → consultamos /v1/orders/{id}
 *
 * Verificamos la firma (x-signature) contra MP_NOTIFICATION_SECRET y SIEMPRE
 * revalidamos contra la API de MP antes de marcar el pedido como pagado.
 * Conectamos la notificación a nuestro pedido vía `external_reference`
 * (= id del pedido en la DB).
 */
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    // MP mandó algo que no es JSON (a veces manda query params nada más).
  }

  const url = new URL(req.url);
  const type =
    (body?.type as string) ?? (url.searchParams.get("type") as string) ?? "";
  const dataId =
    (body?.data?.id as string) ?? (url.searchParams.get("data.id") as string) ?? "";

  if (!type || !dataId) {
    return NextResponse.json({ error: "Notificación inválida." }, { status: 400 });
  }

  // Validación de firma (si el secret está configurado en el panel).
  const xSignature = req.headers.get("x-signature") ?? "";
  const xRequestId = req.headers.get("x-request-id") ?? "";
  try {
    // IMPORTANTE (doc MP): data.id llega en MAYÚSCULAS pero la firma se
    // valida con el id en minúsculas.
    if (!validarFirmaWebhook({ xSignature, xRequestId, dataId: dataId.toLowerCase() })) {
      return NextResponse.json({ error: "Firma inválida." }, { status: 401 });
    }
  } catch (err: any) {
    // Sin secret configurado (desarrollo): avisamos y seguimos. La validación
    // contra la API de MP del paso siguiente es la red de seguridad real.
    console.warn("[webhook] MP_NOTIFICATION_SECRET no configurado — salteo validación de firma:", err?.message);
  }

  try {
    const db = await getDb();

    // 1) Consultar el recurso en MP para verificar que existe y su estado real.
    let extRef: string | undefined;
    let pagoAprobado = false;
    let paymentId: string | undefined;
    let orderId: string | undefined;

    if (type === "payment") {
      const payment: any = await obtenerPayment(dataId);
      extRef = payment?.external_reference;
      paymentId = payment?.id?.toString();
      orderId = payment?.order?.id?.toString();
      pagoAprobado = payment?.status === "approved";
    } else if (type === "orders" || type === "order") {
      const order: any = await obtenerOrder(dataId);
      extRef = order?.external_reference;
      orderId = order?.id?.toString();
      const payments: any[] = order?.transactions?.payments ?? [];
      paymentId = payments[0]?.id?.toString();
      pagoAprobado =
        order?.status === "processed" ||
        payments.some((p) => p?.status === "approved");
    } else {
      // Otros topics (mp-connect, claims...) — no nos interesan por ahora.
      return NextResponse.json({ ok: true });
    }

    if (!pagoAprobado) {
      // Notificación válida pero el pago no está aprobado (pendiente/rechazado).
      // Si conocemos el pedido, dejamos registro del estado, sino dormimos.
      return NextResponse.json({ ok: true });
    }

    // 2) Encontrar nuestro pedido por external_reference (id de Mongo).
    let pedidoId: string | null = null;
    if (extRef && ObjectId.isValid(extRef)) {
      pedidoId = extRef;
    }
    if (!pedidoId) {
      const porOrder = orderId
        ? await db.collection("pedidos").findOne({ "pago.order_id": orderId })
        : null;
      const porPayment = paymentId
        ? await db.collection("pedidos").findOne({ "pago.payment_id": paymentId })
        : null;
      pedidoId = (porOrder ?? porPayment)?._id?.toString() ?? null;
    }

    if (!pedidoId) {
      console.warn("[webhook] Pago aprobado sin pedido asociado:", { type, dataId, extRef });
      return NextResponse.json({ ok: true });
    }

    // 3) Marcar el pedido como pagado.
    const update: Record<string, unknown> = {
      "pago.estado": "aprobado",
      "pago.payment_id": paymentId,
      "pago.fecha_pago": new Date().toISOString(),
    };
    if (orderId) update["pago.order_id"] = orderId;

    const res = await db.collection("pedidos").updateOne(
      { _id: new ObjectId(pedidoId) },
      { $set: update }
    );

    console.log(
      `[webhook] Pedido ${pedidoId} marcado como pagado (${res.modifiedCount > 0 ? "ok" : "sin cambios"}).`
    );
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[webhook] Error procesando notificación:", err?.message);
    // Devolvemos 500 para que MP reintente (retry cada 15 min).
    return NextResponse.json({ error: "Error interno." }, { status: 500 });
  }
}