import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { clearSessionCookie, hashPassword } from "@/lib/auth";
import { hashResetToken, validResetToken } from "@/lib/password-reset";
import type { DBUsuario } from "@/lib/types";

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "La solicitud no es válida." }, { status: 400 });
  }
  const { token, password } = body ?? {};
  if (!validResetToken(token)) {
    return NextResponse.json({ error: "El enlace no es válido o ya venció. Pedí uno nuevo." }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 6 || password.length > 72) {
    return NextResponse.json({ error: "Usá una contraseña de entre 6 y 72 caracteres." }, { status: 400 });
  }
  try {
    const db = await getDb();
    const users = db.collection<DBUsuario>("usuarios");
    const filter = {
      "password_reset.token_hash": hashResetToken(token),
      "password_reset.expires_at": { $gt: new Date() },
    };
    // Rechazar enlaces inválidos antes de calcular el hash de la contraseña.
    if (!await users.findOne(filter, { projection: { _id: 1 } })) {
      return NextResponse.json({ error: "El enlace no es válido o ya venció. Pedí uno nuevo." }, { status: 400 });
    }
    const password_hash = await hashPassword(password);
    // Consumir el token y cambiar la contraseña en una sola escritura.
    const result = await users.updateOne(
      { ...filter, "password_reset.expires_at": { $gt: new Date() } },
      { $set: { password_hash }, $unset: { password_reset: "" } }
    );
    if (!result.modifiedCount) {
      return NextResponse.json({ error: "El enlace no es válido o ya venció. Pedí uno nuevo." }, { status: 400 });
    }
    await clearSessionCookie();
    return NextResponse.json({ ok: true });
  } catch {
    console.error("No se pudo restablecer la contraseña.");
    return NextResponse.json({ error: "No pudimos cambiar la contraseña. Intentá de nuevo." }, { status: 500 });
  }
}
