import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { canjearCodigoOAuth } from "@/lib/mercadopago";

/**
 * GET /api/mercadopago/oauth/callback
 * MP vuelve acá después de que el ilustrador autoriza su cuenta:
 *   ?code=...&state=<userId>:<nonce>
 *
 * Guardamos el access_token del VENDEDOR en su documento (usuario.mp) y lo
 * redirigimos al dashboard para que vea que quedó conectado.
 *
 * Con ese token, las próximas compras crean orders CON SU CUENTA y el split
 * 90/10 lo reparte MP automáticamente (marketplace_fee).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error || !code || !state) {
    return NextResponse.redirect(
      new URL("/dashboard/perfil?mp=error", url.origin)
    );
  }

  // state = base64url(`${userId}:${nonce}`) — lo armamos en /connect.
  let userId: string | null = null;
  try {
    const decoded = Buffer.from(state, "base64url").toString("utf8");
    const [id] = decoded.split(":");
    if (id && ObjectId.isValid(id)) userId = id;
  } catch {
    userId = null;
  }
  if (!userId) {
    return NextResponse.redirect(
      new URL("/dashboard/perfil?mp=error", url.origin)
    );
  }

  try {
    const tokens = await canjearCodigoOAuth(code);
    const accessToken = tokens.access_token;
    if (!accessToken) {
      console.error("[mp-oauth] MP no devolvió access_token:", tokens);
      return NextResponse.redirect(
        new URL("/dashboard/perfil?mp=error", url.origin)
      );
    }

    const db = await getDb();
    await db.collection("usuarios").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          "mp.access_token": accessToken,
          "mp.refresh_token": tokens.refresh_token,
          "mp.user_id": tokens.user_id,
          "mp.public_key": tokens.public_key,
          "mp.conectado_en": new Date(),
        },
      }
    );

    return NextResponse.redirect(
      new URL("/dashboard/perfil?mp=conectado", url.origin)
    );
  } catch (err: any) {
    console.error("[mp-oauth] Error canjeando código:", err?.message);
    return NextResponse.redirect(
      new URL("/dashboard/perfil?mp=error", url.origin)
    );
  }
}