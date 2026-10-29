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

    const email = "demo@pegatina.app";
    const usuario = "@demoilustrador";
    const password = process.env.DEMO_PASSWORD;
    if (!password) {
      throw new Error("Definí DEMO_PASSWORD para configurar la cuenta demo.");
    }
    const password_hash = await bcrypt.hash(password, 10);

    const res = await usuarios.updateOne(
      { $or: [{ email }, { usuario }] },
      {
        $set: {
          email,
          usuario,
          nombre: "Demo Ilustrador",
          rol: "ilustrador",
          password_hash,
          bio: "Tienda de prueba para el desarrollo de Pegatina",
        },
        $setOnInsert: {
          foto: null,
          direccion: null,
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    if (res.upsertedId) {
      console.log("Usuario demo CREADO");
    } else {
      console.log("Usuario demo ACTUALIZADO");
    }

    console.log("- email:", email);
    console.log("- usuario:", usuario);
    console.log("- rol: ilustrador");
    console.log("\nYa podés loguearte por /login con esas credenciales, sin necesidad de DEMO_MODE.");
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
