/**
 * Correcciones de mapeo de fotos pedidas por Mica (09/09):
 * - "Messi Topo Gigio" ← messi.png          (antes tenía quilmes.png)
 * - "Argentina en el Corazón" ← corazon.png (antes tenía argentina.png)
 * - "Matecito Argentino" ← mate argentino.png (antes tenía mate.png)
 * - Borra el sticker "Perro salchicha" (@demoilustrador)
 *
 * Uso: node scripts/apply-fotos-mica.mjs
 * Idempotente.
 */
import { MongoClient } from "mongodb";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");

const envPath = resolve(__dirname, "..", ".env.local");
const envRaw = readFileSync(envPath, "utf-8");
const uriMatch = envRaw.match(/^MONGODB_URI=(.+)$/m);
if (!uriMatch) {
  console.error("No encontré MONGODB_URI en .env.local");
  process.exit(1);
}

const mapPath = resolve(__dirname, "cloudinary-map.json");
if (!existsSync(mapPath)) {
  console.error("Falta cloudinary-map.json (corré upload-cloudinary.mjs)");
  process.exit(1);
}
const urlsPorArchivo = Object.fromEntries(
  JSON.parse(readFileSync(mapPath, "utf-8")).map((r) => [r.archivo, r.url])
);

const ACTUALIZAR = {
  "Messi Topo Gigio": "messi.png",
  "Argentina en el Corazón": "corazon.png",
  "Matecito Argentino": "mate argentino.png",
};
const BORRAR = { nombre: "Perro salchicha", ilustrador: "@demoilustrador" };

const client = new MongoClient(uriMatch[1].trim());
await client.connect();
const db = client.db("pegatina");
const coleccion = db.collection("stickers");

// 1) Actualizar fotos
for (const [nombreSticker, archivo] of Object.entries(ACTUALIZAR)) {
  const url = urlsPorArchivo[archivo];
  if (!url) {
    console.log(`⚠ Sin URL para ${archivo}`);
    continue;
  }
  const res = await coleccion.updateOne(
    { nombre: nombreSticker },
    { $set: { foto: url, fotos: [url] } }
  );
  console.log(
    res.matchedCount
      ? `✓ ${nombreSticker} ← ${archivo}`
      : `✗ No encontré "${nombreSticker}"`
  );
}

// 2) Borrar sticker
const res = await coleccion.deleteOne(BORRAR);
console.log(
  res.deletedCount
    ? `🗑 ${BORRAR.nombre} eliminado`
    : `✗ No encontré "${BORRAR.nombre}" para borrar`
);

await client.close();
console.log("Listo.");