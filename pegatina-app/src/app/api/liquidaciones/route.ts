import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import {
  calcularLiquidacion,
  formatoPeriodo,
} from "@/lib/liquidaciones";
import type { DBLiquidacion, DBUsuario } from "@/lib/types";

async function getAdminSession() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  if (session.rol !== "admin") {
    return NextResponse.json({ error: "Acceso restringido a administradores." }, { status: 403 });
  }
  return session;
}

/** GET /api/liquidaciones → listar liquidaciones (más recientes primero) */
export async function GET() {
  const sessRes = await getAdminSession();
  if (sessRes instanceof NextResponse) return sessRes;

  const db = await getDb();
  const liquidaciones = await db
    .collection<DBLiquidacion>("liquidaciones")
    .find({})
    .sort({ fecha_generada: -1 })
    .toArray();

  return NextResponse.json({
    liquidaciones: liquidaciones.map((l) => ({
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
    })),
  });
}

/**
 * POST /api/liquidaciones → genera una liquidación con TODO pedido enviado o
 * entregado que todavía no haya sido liquidado (sin importar la fecha).
 * Si se manda un rango explícito (fecha_inicio/fecha_fin) se respeta como filtro.
 */
export async function POST(req: Request) {
  const sessRes = await getAdminSession();
  if (sessRes instanceof NextResponse) return sessRes;

  let body: { fecha_inicio?: string; fecha_fin?: string } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    body = {};
  }

  const db = await getDb();

  // Rango OPCIONAL: el admin puede querer liquidar una ventana puntual.
  let rango: { desde: Date; hasta: Date } | null = null;

  if (body.fecha_inicio && body.fecha_fin) {
    const fi = new Date(body.fecha_inicio);
    const ff = new Date(body.fecha_fin);
    if (isNaN(fi.getTime()) || isNaN(ff.getTime()) || ff < fi) {
      return NextResponse.json(
        { error: "Rango de fechas inválido." },
        { status: 400 }
      );
    }
    rango = {
      desde: new Date(fi.getFullYear(), fi.getMonth(), fi.getDate(), 0, 0, 0, 0),
      hasta: new Date(ff.getFullYear(), ff.getMonth(), ff.getDate(), 23, 59, 59, 999),
    };

    const periodoDelRango = formatoPeriodo(rango.desde, rango.hasta);
    const existe = await db
      .collection<DBLiquidacion>("liquidaciones")
      .findOne({ periodo: periodoDelRango });
    if (existe) {
      return NextResponse.json(
        { error: `Ya existe una liquidación para el periodo ${periodoDelRango}.` },
        { status: 400 }
      );
    }
  }

  // Pedidos que ya salieron del taller y todavía no fueron liquidados.
  // ⚠️ 'delivered' TAMBIÉN se liquida: si no, un pedido entregado antes de
  // generar la liquidación quedaba afuera para siempre (el estado avanza
  // shipped → delivered y el filtro viejo solo miraba shipped).
  const pedidosLiquidables = await db
    .collection("pedidos")
    .find({
      estado: { $in: ["shipped", "enviado", "delivered", "entregado"] },
      ...(rango ? { fecha: { $gte: rango.desde, $lte: rango.hasta } } : {}),
    })
    .toArray();

  // Filtrar pedidos NO incluidos en ninguna liquidación (pendiente o pagada)
  const liquidacionesExistentes = await db
    .collection<DBLiquidacion>("liquidaciones")
    .find({})
    .toArray();

  const pedidosYaIncluidos = new Set<string>();
  for (const l of liquidacionesExistentes) {
    for (const it of l.items) {
      for (const pid of it.pedidos) {
        pedidosYaIncluidos.add(pid);
      }
    }
  }

  const pedidosParaLiquidar = pedidosLiquidables.filter(
    (p) => !pedidosYaIncluidos.has(p._id.toString())
  );

  if (pedidosParaLiquidar.length === 0) {
    return NextResponse.json(
      { error: "No hay pedidos enviados ni entregados pendientes de liquidar." },
      { status: 400 }
    );
  }

  // El periodo se deriva de las fechas reales de los pedidos incluidos
  // (o del rango explícito si lo hubo), así la etiqueta nunca miente.
  const fechasPedidos = pedidosParaLiquidar
    .map((p) => (p.fecha instanceof Date ? p.fecha : new Date(p.fecha)))
    .filter((d) => !isNaN(d.getTime()))
    .map((d) => d.getTime());

  const fecha_inicio = rango?.desde ?? new Date(
    fechasPedidos.length ? Math.min(...fechasPedidos) : Date.now()
  );
  const fecha_fin = rango?.hasta ?? new Date(
    fechasPedidos.length ? Math.max(...fechasPedidos) : Date.now()
  );

  const periodo = formatoPeriodo(fecha_inicio, fecha_fin);

  // Mapear vendedores a IDs
  const calculada = calcularLiquidacion(
    pedidosParaLiquidar.map((p) => ({
      _id: p._id,
      fecha: p.fecha instanceof Date ? p.fecha : new Date(p.fecha),
      estado: p.estado,
      items: p.items,
      total: p.total,
    }))
  );

  // Completar vendedor_id
  const handlesUnicos = Array.from(
    new Set(calculada.items.map((i) => i.vendedor_handle))
  );
  const usuariosMap = new Map<string, string>();
  if (handlesUnicos.length > 0) {
    const usuarios = await db
      .collection<DBUsuario>("usuarios")
      .find({ usuario: { $in: handlesUnicos } })
      .toArray();
    for (const u of usuarios) {
      if (u.usuario) usuariosMap.set(u.usuario, u._id.toString());
    }
  }

  const itemsConId = calculada.items.map((i) => ({
    ...i,
    vendedor_id: usuariosMap.get(i.vendedor_handle) ?? "",
  }));

  const nueva: Omit<DBLiquidacion, "_id"> = {
    periodo,
    fecha_inicio,
    fecha_fin,
    estado: "pendiente",
    fecha_generada: new Date(),
    total_bruto: calculada.total_bruto,
    comision_admin: calculada.comision_admin,
    neto_total_pagar: calculada.neto_total_pagar,
    items: itemsConId,
  };

  const resInsert = await db
    .collection<Omit<DBLiquidacion, "_id">>("liquidaciones")
    .insertOne(nueva);
  const creada = await db
    .collection<DBLiquidacion>("liquidaciones")
    .findOne({ _id: resInsert.insertedId });

  if (!creada) {
    return NextResponse.json({ error: "Error al crear liquidación." }, { status: 500 });
  }

  return NextResponse.json(
    {
      liquidacion: {
        id: creada._id.toString(),
        periodo: creada.periodo,
        fecha_inicio: creada.fecha_inicio.toISOString(),
        fecha_fin: creada.fecha_fin.toISOString(),
        estado: creada.estado,
        fecha_generada: creada.fecha_generada.toISOString(),
        fecha_pagada: creada.fecha_pagada?.toISOString(),
        total_bruto: creada.total_bruto,
        comision_admin: creada.comision_admin,
        neto_total_pagar: creada.neto_total_pagar,
        items: creada.items,
      },
    },
    { status: 201 }
  );
}
