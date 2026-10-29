import { NextResponse } from "next/server";
import { clearSessionCookie, COOKIE_NAME } from "@/lib/auth";

/**
 * POST /api/auth/logout
 * Borra la cookie de sesión.
 */
export async function POST() {
  await clearSessionCookie();
  const res = NextResponse.json({ ok: true });
  const isProd = process.env.NODE_ENV === "production";
  const common = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProd,
    path: "/",
  };
  res.cookies.set(COOKIE_NAME, "", { ...common, maxAge: 0, expires: new Date(0) });
  res.cookies.set(COOKIE_NAME, "", { ...common, expires: new Date("Thu, 01 Jan 1970 00:00:00 GMT") });
  try {
    res.cookies.delete(COOKIE_NAME);
  } catch {}
  return res;
}
