/**
 * Sube las fotos de la carpeta imgStickers a Cloudinary y genera
 * scripts/cloudinary-map.json con { archivo, public_id, url }.
 *
 * Uso: node scripts/upload-cloudinary.mjs [<carpeta con fotos>]
 * (si no se pasa carpeta, busca ../imgStickers relativo al proyecto)
 *
 * NO toca MongoDB: solo sube imágenes. El mapeo archivo→sticker se hace
 * en un paso aparte (upload-stickers.mjs) después de confirmar nombres.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");

// --- Leer CLOUDINARY_* de .env.local -------------------------------------
const envPath = resolve(__dirname, "..", ".env.local");
const envRaw = readFileSync(envPath, "utf-8");
const getEnv = (key) => {
  const m = envRaw.match(new RegExp(`^${key}=(.*)$`, "m"));
  return m ? m[1].trim() : null;
};

const CLOUD_NAME = getEnv("CLOUDINARY_CLOUD_NAME");
const API_KEY = getEnv("CLOUDINARY_API_KEY");
const API_SECRET = getEnv("CLOUDINARY_API_SECRET");
if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.error("Faltan CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET en .env.local");
  process.exit(1);
}

// --- Carpeta de fotos -----------------------------------------------------
const carpeta = process.argv[2]
  ? resolve(process.argv[2])
  : resolve(__dirname, "..", "..", "imgStickers");
if (!statSync(carpeta).isDirectory()) {
  console.error(`La carpeta no existe o no es un directorio: ${carpeta}`);
  process.exit(1);
}

const MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
};
const fotos = readdirSync(carpeta)
  .filter((f) => /\.(png|jpe?g|webp|gif)$/i.test(f))
  .sort();

if (fotos.length === 0) {
  console.error("No hay imágenes (png/jpg/webp/gif) en la carpeta.");
  process.exit(1);
}

// --- Upload con firma SHA-1 ----------------------------------------------
async function subir(rutaCompleta, nombreArchivo) {
  const buf = readFileSync(rutaCompleta);
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { timestamp, folder: "stickers" };

  const firma = crypto
    .createHash("sha1")
    .update(
      Object.keys(params)
        .sort()
        .map((k) => `${k}=${params[k]}`)
        .join("&") + API_SECRET
    )
    .digest("hex");

  const ext = nombreArchivo.slice(nombreArchivo.lastIndexOf(".")).toLowerCase();
  const fd = new FormData();
  fd.append("file", new Blob([buf], { type: MIME[ext] ?? "image/png" }), nombreArchivo);
  fd.append("api_key", API_KEY);
  fd.append("timestamp", String(timestamp));
  fd.append("folder", "stickers");
  fd.append("signature", firma);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: fd }
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Cloudinary ${res.status}: ${JSON.stringify(data.error ?? data)}`);
  }
  return data;
}

// --- Correr ---------------------------------------------------------------
console.log(`Cloudinary: ${CLOUD_NAME} — ${fotos.length} imágenes en ${carpeta}\n`);
const resultado = [];
for (const f of fotos) {
  process.stdout.write(`Subiendo ${f} ... `);
  try {
    const data = await subir(join(carpeta, f), f);
    resultado.push({ archivo: f, public_id: data.public_id, url: data.secure_url });
    console.log(`OK (${data.bytes} bytes)`);
  } catch (err) {
    console.log(`ERROR: ${err.message}`);
  }
}

const salida = resolve(__dirname, "cloudinary-map.json");
writeFileSync(salida, JSON.stringify(resultado, null, 2));
console.log(`\n${resultado.length}/${fotos.length} subidas → ${salida}`);