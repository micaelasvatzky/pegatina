import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { passwordEmailConfig, sendPasswordResetEmail } from "@/lib/email";
import { createResetToken, RESET_COOLDOWN_MS, RESET_DURATION_MS } from "@/lib/password-reset";
import type { DBUsuario } from "@/lib/types";

const accepted = () => NextResponse.json({ ok: true });

export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "La solicitud no es válida." }, { status: 400 });
  }
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Ingresá un email válido." }, { status: 400 });
  }
  if (!passwordEmailConfig()) {
    return NextResponse.json({ error: "La recuperación por email todavía no está disponible. Intentá más tarde." }, { status: 503 });
  }
  try {
    const users = (await getDb()).collection<DBUsuario>("usuarios");
    const now = new Date();
    const { token, hash } = createResetToken();
    // El filtro persiste el límite entre instancias de Vercel y evita envíos simultáneos.
    const user = await users.findOneAndUpdate({
      email,
      $or: [
        { "password_reset.requested_at": { $exists: false } },
        { "password_reset.requested_at": { $lte: new Date(now.getTime() - RESET_COOLDOWN_MS) } },
      ],
    }, {
      $set: { password_reset: {
        token_hash: hash,
        expires_at: new Date(now.getTime() + RESET_DURATION_MS),
        requested_at: now,
      } },
    }, { returnDocument: "after", projection: { _id: 1, email: 1 } });
    // Mismo resultado si no existe la cuenta o pidió un enlace hace menos de un minuto.
    if (!user) return accepted();
    try {
      await sendPasswordResetEmail(user.email, token);
    } catch {
      // Invalidar solo este enlace, sin eliminar uno posterior.
      await users.updateOne({ _id: user._id, "password_reset.token_hash": hash }, {
        $unset: { password_reset: "" },
      });
      // No revelar si el email existe ni registrar tokens o direcciones personales.
      console.error("Falló el envío de recuperación de contraseña.");
    }
    return accepted();
  } catch {
    console.error("Falló la solicitud de recuperación de contraseña.");
    return NextResponse.json({ error: "No pudimos procesar la solicitud. Intentá de nuevo." }, { status: 500 });
  }
}
