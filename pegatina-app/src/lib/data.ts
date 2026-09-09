import { getDb } from "./mongodb";
import type { DBSticker, Sticker } from "./types";
import { ObjectId } from "mongodb";
import {
  normalizarEstado,
  type PedidoVendedor,
} from "./pedidos";

/** Convierte un documento de MongoDB al tipo plano para React */
function serializeSticker(doc: DBSticker): Sticker {
  const fotos = Array.isArray(doc.fotos) ? doc.fotos.filter(Boolean) : [];
  return {
    id: doc._id.toString(),
    nombre: doc.nombre,
    precio: doc.precio,
    ilustrador: doc.ilustrador,
    categoria: doc.categoria,
    foto: doc.foto || fotos[0] || "",
    fotos,
    material: doc.material,
    acabado: doc.acabado,
    resistente_al_agua: doc.resistente_al_agua,
  };
}

/** Trae todos los stickers */
export async function getStickers(): Promise<Sticker[]> {
  const db = await getDb();
  const docs = await db
    .collection<DBSticker>("stickers")
    .find()
    .toArray();
  return docs.map(serializeSticker);
}

/** Trae stickers filtrados por categoría */
export async function getStickersByCategoria(
  categoria: string
): Promise<Sticker[]> {
  const db = await getDb();
  const docs = await db
    .collection<DBSticker>("stickers")
    .find({ categoria })
    .toArray();
  return docs.map(serializeSticker);
}

/** Trae stickers de un ilustrador (por su @usuario) */
export async function getStickersByIlustrador(
  ilustrador: string
): Promise<Sticker[]> {
  const db = await getDb();
  const docs = await db
    .collection<DBSticker>("stickers")
    .find({ ilustrador })
    .toArray();
  return docs.map(serializeSticker);
}

/** Trae un sticker por ID */
export async function getStickerById(id: string): Promise<Sticker | null> {
  const db = await getDb();
  const { ObjectId } = await import("mongodb");
  const doc = await db
    .collection<DBSticker>("stickers")
    .findOne({ _id: new ObjectId(id) });
  return doc ? serializeSticker(doc) : null;
}

/** Trae todas las categorías únicas */
export async function getCategorias(): Promise<string[]> {
  const db = await getDb();
  const cats = await db.collection<DBSticker>("stickers").distinct("categoria");
  return cats.sort();
}

/**
 * Trae las unidades vendidas por sticker (sumando cantidades de todos los
 * pedidos). Devuelve un Map<sticker_id, unidades>.
 */
export async function getVentasPorStickerId(): Promise<Map<string, number>> {
  const db = await getDb();
  const rows = await db
    .collection("pedidos")
    .aggregate<{ _id: string; total: number }>([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.sticker_id",
          total: { $sum: "$items.cantidad" },
        },
      },
    ])
    .toArray();
  return new Map(rows.map((r) => [r._id, r.total]));
}

// ---------------------------------------------------------------------------
// PEDIDOS DEL VENDEDOR (dashboard del ilustrador)
// ---------------------------------------------------------------------------

interface PedidoDoc {
  _id: ObjectId;
  usuario_id?: string;
  items?: {
    sticker_id?: string;
    nombre?: string;
    precio?: number;
    cantidad?: number;
    ilustrador?: string;
  }[];
  total?: number;
  estado?: string;
  fecha?: Date | string;
}

/**
 * Filtro Mongo para pedidos que contengan stickers del ilustrador:
 * por el handle guardado en cada item (futuro checkout) o por sticker_id.
 */
function filtroPedidosDelVendedor(handle: string, stickers: Sticker[]) {
  const stickerIds = stickers.map((s) => s.id);
  const conds: Record<string, unknown>[] = [{ "items.ilustrador": handle }];
  if (stickerIds.length) {
    conds.push({ "items.sticker_id": { $in: stickerIds } });
  }
  return { $or: conds };
}

/** Nombres de los compradores, para mostrar "quién compró" en el dashboard. */
async function getClientesPorIds(ids: string[]) {
  const db = await getDb();
  const oids = ids.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));
  if (!oids.length) return new Map<string, { nombre: string; email: string }>();
  const docs = await db
    .collection("usuarios")
    .find({ _id: { $in: oids } })
    .toArray();
  return new Map(
    docs.map((d: any) => [
      d._id.toString(),
      { nombre: d.nombre, email: d.email },
    ])
  );
}

function serializePedidoVendedor(
  doc: PedidoDoc,
  cliente: { nombre: string; email: string } | null
): PedidoVendedor {
  return {
    id: doc._id.toString(),
    cliente,
    items: (doc.items ?? []).map((it) => ({
      nombre: it.nombre ?? "Sticker",
      cantidad: it.cantidad ?? 1,
      precio: it.precio ?? 0,
    })),
    total: doc.total ?? 0,
    estado: normalizarEstado(doc.estado),
    fecha: doc.fecha ? new Date(doc.fecha).toISOString() : null,
  };
}

/** Pedidos que contienen stickers del ilustrador (dashboard del vendedor). */
export async function getPedidosDelVendedor(
  handle: string
): Promise<PedidoVendedor[]> {
  const stickers = await getStickersByIlustrador(handle);
  const db = await getDb();
  const docs = await db
    .collection<PedidoDoc>("pedidos")
    .find(filtroPedidosDelVendedor(handle, stickers))
    .sort({ fecha: -1 })
    .limit(50)
    .toArray();
  const clientes = await getClientesPorIds(
    docs.map((d) => d.usuario_id ?? "").filter(Boolean)
  );
  return docs.map((d) =>
    serializePedidoVendedor(d, clientes.get(d.usuario_id ?? "") ?? null)
  );
}

/**
 * Ventas del mes en curso: suma del TOTAL de pedidos que contienen stickers
 * del ilustrador. (Si un pedido mezcla stickers de varios vendedores, cuenta
 * el total — un detalle a refinar cuando exista checkout real.)
 */
export async function getVentasDelMes(handle: string): Promise<number> {
  const stickers = await getStickersByIlustrador(handle);
  const db = await getDb();
  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const docs = await db
    .collection<PedidoDoc>("pedidos")
    .find({
      ...filtroPedidosDelVendedor(handle, stickers),
      fecha: { $gte: inicioMes },
    })
    .toArray();
  return docs.reduce((sum, d) => sum + (d.total ?? 0), 0);
}

/** Pedidos del ilustrador que faltan enviar (pending + in_progress). */
export async function getPedidosPorEnviar(handle: string): Promise<PedidoVendedor[]> {
  const stickers = await getStickersByIlustrador(handle);
  const db = await getDb();
  const docs = await db
    .collection<PedidoDoc>("pedidos")
    .find({
      ...filtroPedidosDelVendedor(handle, stickers),
      estado: {
        $in: ["pending", "in_progress", "pendiente", "en_progreso"],
      },
    })
    .sort({ fecha: -1 })
    .toArray();
  const clientes = await getClientesPorIds(
    docs.map((d) => d.usuario_id ?? "").filter(Boolean)
  );
  return docs.map((d) =>
    serializePedidoVendedor(d, clientes.get(d.usuario_id ?? "") ?? null)
  );
}

// ---------------------------------------------------------------------------
// SEGUIMIENTO DEL COMPRADOR
// ---------------------------------------------------------------------------

export interface PedidoSeguimiento {
  id: string;
  items: PedidoVendedor["items"];
  total: number;
  estado: ReturnType<typeof normalizarEstado>;
  fecha: string | null;
  envio: {
    nombre: string;
    calle: string;
    ciudad: string;
    provincia: string;
    codigo_postal: string;
    notas?: string;
  } | null;
  metodo_pago: string | null;
}

/**
 * Trae UN pedido para el comprador logueado (verifica dueño).
 * Devuelve null si no existe o no le pertenece.
 */
export async function getPedidoDelComprador(
  id: string,
  usuarioId: string
): Promise<PedidoSeguimiento | null> {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const doc = await db
    .collection<PedidoDoc & { envio?: PedidoSeguimiento["envio"]; metodo_pago?: string | null }>(
      "pedidos"
    )
    .findOne({ _id: new ObjectId(id), usuario_id: usuarioId });
  if (!doc) return null;

  return {
    id: doc._id.toString(),
    items: (doc.items ?? []).map((it) => ({
      nombre: it.nombre ?? "Sticker",
      cantidad: it.cantidad ?? 1,
      precio: it.precio ?? 0,
    })),
    total: doc.total ?? 0,
    estado: normalizarEstado(doc.estado),
    fecha: doc.fecha ? new Date(doc.fecha).toISOString() : null,
    envio: doc.envio ?? null,
    metodo_pago: doc.metodo_pago ?? null,
  };
}
