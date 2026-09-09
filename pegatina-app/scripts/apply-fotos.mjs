/**
 * Mapea las fotos ya subidas a Cloudinary (cloudinary-map.json) a los
 * stickers de MongoDB y actualiza `fotos` + `foto` en cada uno.
 *
 * Uso: node scripts/apply-fotos.mjs
 * Idempotente: volver a correrlo solo re-aplica las URLs (mismo resultado).
 *
 * El mapa archivo → sticker es EXPLÍCITO abajo. Los casos ambiguos quedan
 * comentados hasta que Mica confirme a qué sticker corresponde cada foto.
 */
import { MongoClient } from "mongodb";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");

// --- Env ----------------------------------------------------------------
const envPath = resolve(__dirname, "..", ".env.local");
const envRaw = readFileSync(envPath, "utf-8");
const uriMatch = envRaw.match(/^MONGODB_URI=(.+)$/m);
if (!uriMatch) {
  console.error("No encontré MONGODB_URI en .env.local");
  process.exit(1);
}
const MONGODB_URI = uriMatch[1].trim();

// --- Mapa archivo → nombre de sticker (confirmado) -------------------------
const MAPA = {
  "alfajor.png": "Alfajor de Chocolate",
  "ancho de espada.png": "Ancho de Espada",
  "bondi de buenos aires.png": "Bondi de Buenos Aires",
  "Capibara Argentino.png": "Capibara Argentino",
  "choripan.png": "Choripán",
  "dibu.png": "Dibu atajando",
  "empanada criolla.png": "Empanada Criolla",
  "fernet con coca.png": "Fernet con Coca",
  "fileteado.png": "Fileteado Buenos Aires",
  "medialuna.png": "Medialuna Porteña",
  "obelisco.png": "Obelisco Porteño",
  "pizza.png": "Pizza de Guerrín",
  "pochoclos.png": "Pochoclos del Cine",
  "river.png": "Escudo de River",
  "snoopy.png": "Snoopy Matero",
  "sol de mayo.png": "Sol de Mayo",
  // PENDIENTES de confirmar (no se aplican todavía):
  // "corazon.png": "Argentina en el Corazón",
  // "gato.png": "Gato con Camiseta Argentina",
  // "mate argentino.png": "Matecito Argentino",
  // "messi.png": "???" (Messi Topo Gigio vs Messi con la Copa del Mundo)
};

const norm = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ");

// --- Correr ---------------------------------------------------------------
const mapPath = resolve(__dirname, "cloudinary-map.json");
if (!existsSync(mapPath)) {
  console.error("Corré primero upload-cloudinary.mjs (falta cloudinary-map.json)");
  process.exit(1);
}
const urlsPorArchivo = Object.fromEntries(
  JSON.parse(readFileSync(mapPath, "utf-8")).map((r) => [r.archivo, r.url])
);

const client = new MongoClient(MONGODB_URI);
await client.connect();
const db = client.db("pegatina");
const coleccion = db.collection("stickers");

const docs = await coleccion.find({}).toArray();
const porNombre = new Map(docs.map((d) => [norm(d.nombre), d]));

let ok = 0;
let sinMatch = [];
for (const [archivo, nombreSticker] of Object.entries(MAPA)) {
  const url = urlsPorArchivo[archivo];
  if (!url) {
    console.log(`⚠ Sin URL en cloudinary-map.json: ${archivo}`);
    continue;
  }
  const doc = porNombre.get(norm(nombreSticker));
  if (!doc) {
    sinMatch.push(`${archivo} → ${nombreSticker} (no encontré sticker)`);
    continue;
  }
  await coleccion.updateOne(
    { _id: doc._id },
    { $set: { foto: url, fotos: [url] } }
  );
  console.log(`✓ ${nombreSticker} ← ${archivo}`);
  ok++;
}

await client.close();
console.log(`\n${ok} stickers actualizados.`);
if (sinMatch.length) {
  console.log("Sin match:");
  sinMatch.forEach((s) => console.log("  - " + s));
}