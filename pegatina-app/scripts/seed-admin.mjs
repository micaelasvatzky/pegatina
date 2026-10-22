import { MongoClient, ServerApiVersion } from "mongodb";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnvLocal() {
  const envPath = path.resolve(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim();
    if (!key || key in process.env) continue;
    process.env[key] = value;
  }
}

loadEnvLocal();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI no está definida en .env.local");
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function main() {
  try {
    await client.connect();
    const db = client.db("pegatina");
    const usuarios = db.collection("usuarios");

    const adminEmail = "admin@pegatina.app";
    const adminUsuario = "@admin";
    const adminPassword = "pegatina-admin-2026";

    const existing = await usuarios.findOne({
      $or: [{ email: adminEmail }, { usuario: adminUsuario }],
    });

    if (existing) {
      console.log("Admin ya existe:");
      console.log("- _id:", existing._id.toString());
      console.log("- email:", existing.email);
      console.log("- usuario:", existing.usuario);
      console.log("- rol:", existing.rol);
      return;
    }

    const password_hash = await bcrypt.hash(adminPassword, 10);

    const result = await usuarios.insertOne({
      nombre: "Administrador",
      email: adminEmail,
      password_hash,
      rol: "admin",
      usuario: adminUsuario,
      foto: null,
      direccion: null,
      bio: "Administrador de Pegatina",
      createdAt: new Date(),
    });

    console.log("Admin creado exitosamente:");
    console.log("- _id:", result.insertedId.toString());
    console.log("- email:", adminEmail);
    console.log("- usuario:", adminUsuario);
    console.log("- password:", adminPassword);
    console.log("- rol: admin");
    console.log("\nIMPORTANTE: Cambiar este password en producción.");
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
