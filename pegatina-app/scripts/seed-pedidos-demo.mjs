/**
 * Seed de pedidos DEMO para el dashboard del ilustrador.
 *
 * Crea comprador(es) fake y pedidos que contienen stickers del @demoilustrador,
 * con estados variados y fechas distribuidas (este mes + meses pasados) para
 * que las stats de la home (ventas del mes / por enviar) se vean REALES.
 *
 * Uso: node scripts/seed-pedidos-demo.mjs
 * Idempotente: no crea nada si ya existen pedidos del demo.
 */
import { MongoClient, ObjectId } from "mongodb";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");

// Leer MONGODB_URI de .env.local
const envPath = resolve(__dirname, "..", ".env.local");
const envRaw = readFileSync(envPath, "utf-8");
const uriMatch = envRaw.match(/^MONGODB_URI=(.+)$/m);
if (!uriMatch) {
  console.error("No encontré MONGODB_URI en .env.local");
  process.exit(1);
}
const MONGODB_URI = uriMatch[1].trim();

const DEMO_HANDLE = "@demoilustrador";

const client = new MongoClient(MONGODB_URI);
await client.connect();
const db = client.db("pegatina");

// 1) Stickers del demo
const stickers = await db
  .collection("stickers")
  .find({ ilustrador: DEMO_HANDLE })
  .toArray();

if (stickers.length === 0) {
  console.error(
    `No hay stickers de ${DEMO_HANDLE}. Primero entrá como ilustrador demo (botón en /login) para sembrarlos.`
  );
  process.exit(1);
}

// 2) Idempotencia: si ya hay pedidos con sticker_id de los demo, salir.
const stickerIds = stickers.map((s) => s._id.toString());
const yaExisten = await db.collection("pedidos").countDocuments({
  "items.sticker_id": { $in: stickerIds },
});
if (yaExisten > 0) {
  console.log(`Ya hay ${yaExisten} pedido(s) del demo. No sembré nada.`);
  process.exit(0);
}

// 3) Comprador fake (para que el lookup de cliente del dashboard funcione)
const compradorOid = new ObjectId();
await db.collection("usuarios").insertOne({
  _id: compradorOid,
  nombre: "Comprador Demo",
  email: "comprador-demo@pegatina.app",
  password_hash: "no-aplica",
  rol: "comprador",
  usuario: null,
  createdAt: new Date(),
});

function itemDe(sticker, cantidad) {
  return {
    sticker_id: sticker._id.toString(),
    nombre: sticker.nombre,
    precio: sticker.precio,
    cantidad,
    ilustrador: DEMO_HANDLE,
  };
}

const hoy = new Date();
const mesesAtras = (n) => new Date(hoy.getFullYear(), hoy.getMonth() - n, 5);

// 4) Pedidos: 2 del mes en curso (pending, in_progress), 2 de meses pasados (shipped, delivered).
const pedidos = [
  {
    usuario_id: compradorOid.toString(),
    items: [itemDe(stickers[0], 2), itemDe(stickers[1] ?? stickers[0], 1)],
    estado: "pending",
    fecha: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 1),
  },
  {
    usuario_id: compradorOid.toString(),
    items: [itemDe(stickers[0], 1)],
    estado: "in_progress",
    fecha: new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 4),
  },
  {
    usuario_id: compradorOid.toString(),
    items: [itemDe(stickers[2] ?? stickers[0], 3), itemDe(stickers[0], 2)],
    estado: "shipped",
    fecha: mesesAtras(1),
  },
  {
    usuario_id: compradorOid.toString(),
    items: [itemDe(stickers[1] ?? stickers[0], 1), itemDe(stickers[2] ?? stickers[0], 2)],
    estado: "delivered",
    fecha: mesesAtras(2),
  },
].map((p) => ({
  ...p,
  total: p.items.reduce((s, it) => s + it.precio * it.cantidad, 0),
}));

await db.collection("pedidos").insertMany(pedidos);

console.log(`Sembré ${pedidos.length} pedidos demo para ${DEMO_HANDLE}:`);
for (const p of pedidos) {
  console.log(
    `  - ${p.estado.padEnd(11)} ${p.fecha.toISOString().slice(0, 10)}  $${p.total}  (${p.items.length} item(s))`
  );
}

await client.close();