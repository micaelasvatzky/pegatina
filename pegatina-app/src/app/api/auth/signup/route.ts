import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { hashPassword, signSession, setSessionCookie } from "@/lib/auth";
import type { DBUsuario, Role } from "@/lib/types";

/**
 * POST /api/auth/signup
 * Crea un usuario (comprador o ilustrador) y arranca una sesión.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const nombre = (body.nombre ?? "").toString().trim();
    const email = (body.email ?? "").toString().trim().toLowerCase();
    const password = (body.password ?? "").toString();
    const rol: Role = body.rol === "ilustrador" ? "ilustrador" : "comprador";

    // ---- Validaciones ----
    if (!nombre || nombre.length < 2) {
      return NextResponse.json(
        { error: "Ingresá tu nombre." },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "El email no es válido." },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const usuarios = db.collection<DBUsuario>("usuarios");

    // Email único
    const existing = await usuarios.findOne({ email });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese email." },
        { status: 409 }
      );
    }

    const password_hash = await hashPassword(password);
    const now = new Date();

    const doc = {
      nombre,
      email,
      password_hash,
      rol,
      foto: null,
      direccion: null,
      bio: null,
      createdAt: now,
    };

    const result = await usuarios.insertOne(doc as any);
    const id = result.insertedId.toString();

    await setSessionCookie(
      signSession({ sub: id, nombre, rol })
    );

    return NextResponse.json(
      {
        usuario: { id, nombre, email, rol, foto: null },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("signup error", err);
    return NextResponse.json(
      { error: "Hubo un error al crear la cuenta." },
      { status: 500 }
    );
  }
}
