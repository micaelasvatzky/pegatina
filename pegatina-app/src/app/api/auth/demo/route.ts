import { NextResponse } from "next/server";
import crypto from "crypto";
import { getDb } from "@/lib/mongodb";
import {
  hashPassword,
  signSession,
  setSessionCookie,
  publicUsuario,
} from "@/lib/auth";
import type { DBUsuario, DBSticker } from "@/lib/types";

/**
 * POST /api/auth/demo
 * Acceso DEMO para desarrollo: entra como ilustrador de prueba con un toque.
 *
 * SOLO activo cuando DEMO_MODE=true (ver .env.example).
 * En producción devuelve 404 para ni siquiera revelar que existe.
 *
 * La primera vez crea el usuario demo + siembra 2 stickers de prueba,
 * así el dashboard se puede probar con datos. Después, solo loguea.
 */

const DEMO_EMAIL = "demo@pegatina.app";
const DEMO_HANDLE = "@demoilustrador";

const DEMO_STICKERS: Omit<DBSticker, "_id">[] = [
  {
    nombre: "Matecito Demo",
    precio: 1500,
    ilustrador: DEMO_HANDLE,
    categoria: "Argentina",
    foto: "",
    material: "Vinilo",
    resistente_al_agua: true,
    acabado: "Mate",
  },
  {
    nombre: "Fernet con amigos",
    precio: 1800,
    ilustrador: DEMO_HANDLE,
    categoria: "Bebidas",
    foto: "",
    material: "Vinilo",
    resistente_al_agua: true,
    acabado: "Brillo",
  },
];

export async function POST() {
  if (process.env.DEMO_MODE !== "true") {
    return NextResponse.json({ error: "No encontrado." }, { status: 404 });
  }

  try {
    const db = await getDb();
    const usuarios = db.collection<DBUsuario>("usuarios");

    let usuario = await usuarios.findOne({ email: DEMO_EMAIL });

    if (!usuario) {
      // Primera vez: creamos la cuenta demo con password aleatoria
      // (no se puede entrar por login normal, solo por este botón).
      const passwordHash = await hashPassword(crypto.randomUUID());
      // El driver pide _id en el tipo; Mongo lo genera solo (mismo patrón que signup).
      const resultado = await usuarios.insertOne({
        nombre: "Demo Ilustrador",
        email: DEMO_EMAIL,
        password_hash: passwordHash,
        rol: "ilustrador",
        usuario: DEMO_HANDLE,
        bio: "Tienda de prueba para el desarrollo de Pegatina",
        createdAt: new Date(),
      } as any);

      // Sembramos stickers de prueba para que el dashboard tenga data.
      const stickers = db.collection<DBSticker>("stickers");
      await stickers.insertMany(DEMO_STICKERS as any);

      const creado = await usuarios.findOne({ _id: resultado.insertedId });
      if (creado) usuario = creado;
    }

    if (!usuario) {
      return NextResponse.json(
        { error: "No pudimos preparar la cuenta demo." },
        { status: 500 }
      );
    }

    const id = usuario._id.toString();
    await setSessionCookie(
      signSession({ sub: id, nombre: usuario.nombre, rol: usuario.rol })
    );

    return NextResponse.json({ usuario: publicUsuario(usuario) });
  } catch (err) {
    console.error("demo login error", err);
    return NextResponse.json(
      { error: "Hubo un error al entrar con la cuenta demo." },
      { status: 500 }
    );
  }
}