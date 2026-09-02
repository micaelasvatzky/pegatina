import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type { DBUsuario } from "@/lib/types";

/**
 * Utilidades de autenticación de Pegatina.
 *
 * Sesión basada en JWT en una cookie httpOnly (no legible por JS → resistente a XSS).
 * Solo se firma/verifica con el secreto; NUNCA se guarda el password en el token.
 */

const COOKIE_NAME = "pegatina-sesion";
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 días

// Secreto para firmar/verificar los JWT de sesión.
// Vive en .env.local (ver .env.example). El fallback solo sirve para desarrollo local.
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "pegatina-secreto-desarrollo-cambiar-antes-de-producir";

export interface SessionPayload {
  sub: string;
  nombre: string;
  rol: "comprador" | "ilustrador";
}

/** Hash de password con bcrypt (costo 10, buen balance seguridad/velocidad). */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

/** Compara una password en texto plano contra un hash. */
export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** Genera un JWT firmado con el payload de sesión. */
export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: SESSION_MAX_AGE_SEC,
  });
}

/** Verifica y decodifica un token. Devuelve null si es inválido/vencido. */
export function verifyToken(token: string): SessionPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionPayload;
    return decoded;
  } catch {
    return null;
  }
}

/** Escribe la cookie de sesión (httpOnly + secure en producción). */
export async function setSessionCookie(token: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SEC,
    path: "/",
  });
}

/** Borra la cookie de sesión (logout). */
export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}

/** Lee y valida la sesión actual. Devuelve el payload o null si no hay sesión. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Trae el usuario completo desde Mongo por id (sin el hash de password).
 * Se usa cuando se necesitan datos frescos (perfil, etc.).
 */
export async function getUsuarioById(
  id: string
): Promise<DBUsuario | null> {
  try {
    const db = await getDb();
    const doc = await db
      .collection<DBUsuario>("usuarios")
      .findOne({ _id: new ObjectId(id) });
    return doc ?? null;
  } catch {
    return null;
  }
}

/** Serializa un usuario de DB a la forma segura de exponer al cliente. */
export function publicUsuario(u: DBUsuario) {
  return {
    id: u._id.toString(),
    nombre: u.nombre,
    email: u.email,
    rol: u.rol,
    foto: u.foto ?? null,
  };
}
