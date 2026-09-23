import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  mpOAuthConfigurado,
  urlAutorizacionVendedor,
} from "@/lib/mercadopago";

/**
 * GET /api/mercadopago/connect
 * Inicia el flujo OAuth para que UN ILUSTRADOR conecte su cuenta de Mercado
 * Pago (usando las credenciales de Producción de la app de Pegatina).
 *
 * 1. El ilustrador logueado entra a su dashboard → "Conectar Mercado Pago".
 * 2. Acá generamos un `state` (userId + nonce) y redirigimos al vendedor a MP.
 * 3. MP le pide autorizar y vuelve a /api/mercadopago/oauth/callback con code+state.
 *
 * Sin Client ID/Secret configurados → 503 (el botón no debería mostrarse).
 */
export async function GET() {
  const session = await getSession();
  if (!session || session.rol !== "ilustrador") {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!mpOAuthConfigurado()) {
    return NextResponse.json(
      { error: "Mercado Pago aún no está configurado para conectar artistas." },
      { status: 503 }
    );
  }

  const nonce = Math.random().toString(36).slice(2);
  const state = Buffer.from(`${session.sub}:${nonce}`).toString("base64url");

  try {
    const url = await urlAutorizacionVendedor(state);
    return NextResponse.redirect(url);
  } catch (err: any) {
    return NextResponse.json(
      { error: "No pudimos generar el enlace con Mercado Pago: " + (err?.message ?? "error") },
      { status: 502 }
    );
  }
}