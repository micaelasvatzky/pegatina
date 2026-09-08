import { getDb } from "./mongodb";
import type { DBSticker, Sticker } from "./types";

/** Convierte un documento de MongoDB al tipo plano para React */
function serializeSticker(doc: DBSticker): Sticker {
  return {
    id: doc._id.toString(),
    nombre: doc.nombre,
    precio: doc.precio,
    ilustrador: doc.ilustrador,
    categoria: doc.categoria,
    foto: doc.foto,
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
