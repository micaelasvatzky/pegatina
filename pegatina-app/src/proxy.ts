import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * Proxy global de Pegatina (antes "middleware" — convención renombrada en Next 16).
 * Protege rutas privadas por rol usando la cookie de sesión (JWT).
 *
 * - /perfil, /checkout, /pedidos/:id* → requieren sesión
 * - /dashboard* → requiere rol "ilustrador"
 * - store público (/, /catalogo, /producto, /carrito, /login, /signup, /checkout, /pedidos, /perfil)
 *   → PROHIBIDO para ilustradores (son SOLO vendedores). Única excepción: /artista/[usuario] (su tienda pública).
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

/** El lado comprador del store (todo lo que NO es dashboard ni tienda pública). */
function esRutaStore(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/catalogo" ||
    pathname.startsWith("/producto") ||
    pathname === "/carrito" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/pedidos") ||
    pathname === "/perfil"
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rol = await getSessionRole(request);

  // Un ilustrador SOLO vende: no puede entrar al store del comprador.
  // La única ventana al otro lado es su tienda pública (/artista/[usuario]).
  if (rol === "ilustrador" && esRutaStore(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Rutas del ilustrador
  if (pathname.startsWith("/dashboard")) {
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
    pathname.startsWith("/pedidos")
  ) {
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
    "/",
    "/catalogo",
    "/producto/:path*",
    "/carrito",
    "/login",
    "/signup/:path*",
  ],
};