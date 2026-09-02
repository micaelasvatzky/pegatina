import { NextResponse } from "next/server";
import { getSession, getUsuarioById, publicUsuario } from "@/lib/auth";

/**
 * GET /api/auth/me
 * Devuelve el usuario logueado, o { usuario: null } si no hay sesión.
 */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ usuario: null });
  }

  const usuario = await getUsuarioById(session.sub);
  if (!usuario) {
    return NextResponse.json({ usuario: null });
  }

  return NextResponse.json({ usuario: publicUsuario(usuario) });
}
