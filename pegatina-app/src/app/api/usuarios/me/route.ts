import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getSession, getUsuarioById, publicUsuario } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

/**
 * PATCH /api/usuarios/me
 * Actualiza los datos del perfil del usuario logueado (nombre, email, bio).
 * El @usuario (handle) NO se puede cambiar: es la identidad pública.
 */
export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "El cuerpo de la solicitud es inválido." },
      { status: 400 }
    );
  }

  const nombre =
    typeof body.nombre === "string" ? body.nombre.trim() : undefined;
  const email = typeof body.email === "string" ? body.email.trim() : undefined;
  const bio = typeof body.bio === "string" ? body.bio.trim() : undefined;

  if (nombre !== undefined && nombre.length < 2) {
    return NextResponse.json(
      { error: "El nombre es muy corto." },
      { status: 400 }
    );
  }

  if (
    email !== undefined &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return NextResponse.json(
      { error: "El email no es válido." },
      { status: 400 }
    );
  }

  if (bio !== undefined && bio.length > 300) {
    return NextResponse.json(
      { error: "La bio es demasiado larga (máx. 300 caracteres)." },
      { status: 400 }
    );
  }

  const update: { nombre?: string; email?: string; bio?: string } = {};
  if (nombre !== undefined) update.nombre = nombre;
  if (email !== undefined) update.email = email;
  if (bio !== undefined) update.bio = bio;

  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      { error: "No hay campos para actualizar." },
      { status: 400 }
    );
  }

  const db = await getDb();

  // Email único entre otros usuarios
  if (update.email) {
    const dup = await db.collection("usuarios").findOne({
      email: update.email,
      _id: { $ne: new ObjectId(session.sub) },
    });
    if (dup) {
      return NextResponse.json(
        { error: "Ese email ya está en uso por otra cuenta." },
        { status: 409 }
      );
    }
  }

  await db
    .collection("usuarios")
    .updateOne({ _id: new ObjectId(session.sub) }, { $set: update });

  const updated = await getUsuarioById(session.sub);
  if (!updated) {
    return NextResponse.json(
      { error: "No encontramos tu usuario." },
      { status: 404 }
    );
  }

  return NextResponse.json({ usuario: publicUsuario(updated) });
}