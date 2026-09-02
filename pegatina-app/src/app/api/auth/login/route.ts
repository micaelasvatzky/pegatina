import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import {
  verifyPassword,
  signSession,
  setSessionCookie,
  publicUsuario,
} from "@/lib/auth";
import type { DBUsuario } from "@/lib/types";

/**
 * POST /api/auth/login
 * Valida email+password, arranca sesión y devuelve el usuario.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = (body.email ?? "").toString().trim().toLowerCase();
    const password = (body.password ?? "").toString();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Ingresá email y contraseña." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const usuario = await db
      .collection<DBUsuario>("usuarios")
      .findOne({ email });

    if (!usuario) {
      // Mismo mensaje genérico para no revelar qué emails existen.
      return NextResponse.json(
        { error: "Email o contraseña incorrectos." },
        { status: 401 }
      );
    }

    const ok = await verifyPassword(password, usuario.password_hash);
    if (!ok) {
      return NextResponse.json(
        { error: "Email o contraseña incorrectos." },
        { status: 401 }
      );
    }

    const id = usuario._id.toString();
    await setSessionCookie(
      signSession({ sub: id, nombre: usuario.nombre, rol: usuario.rol })
    );

    return NextResponse.json({
      usuario: publicUsuario(usuario),
    });
  } catch (err) {
    console.error("login error", err);
    return NextResponse.json(
      { error: "Hubo un error al iniciar sesión." },
      { status: 500 }
    );
  }
}
