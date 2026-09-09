import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * Proxy global de Pegatina (antes "middleware" — convención renombrada en Next 16).
 * Protege rutas privadas por rol usando la cookie de sesión (JWT).
 *
 * - /perfil, /checkout, /pedidos/:id* → requieren sesión
 * - /dashboard* → requiere rol "ilustrador"
 * - sin sesión → redirige a /login
 */

const JWT_SECRET =
  process.env.JWT_SECRET || "pegatina-secreto-desarrollo-cambiar-antes-de-producir";
const SECRET = new TextEncoder().encode(JWT_SECRET);
const COOKIE_NAME = "pegatina-sesion";

async function getSessionRole(request: NextRequest): Promise<string | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return (payload.rol as string) ?? null;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas del ilustrador
  if (pathname.startsWith("/dashboard")) {
    const rol = await getSessionRole(request);
    if (!rol) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (rol !== "ilustrador") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Perfil, checkout y seguimiento del comprador
  if (
    pathname.startsWith("/perfil") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/pedidos/")
  ) {
    const rol = await getSessionRole(request);
    if (!rol) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/perfil",
    "/checkout",
    "/pedidos/:path*",
  ],
};