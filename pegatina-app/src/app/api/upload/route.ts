import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import crypto from "node:crypto";

/**
 * POST /api/upload
 * Sube una imagen a Cloudinary y devuelve su URL pública.
 *
 * Solo ilustradores logueados. La firma SHA-1 se genera acá (server-side):
 * el API secret NUNCA viaja al navegador.
 *
 * Requiere en las env vars (Vercel / .env.local):
 *   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 */
export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const TIPOS = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export async function POST(request: Request) {
  // 1) Sesión + rol (solo ilustradores suben fotos de stickers)
  const sesion = await getSession();
  if (!sesion) {
    return NextResponse.json({ error: "Iniciá sesión." }, { status: 401 });
  }
  if (sesion.rol !== "ilustrador") {
    return NextResponse.json(
      { error: "Solo ilustradores pueden subir fotos." },
      { status: 403 }
    );
  }

  // 2) Credenciales de Cloudinary
  const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
  const API_KEY = process.env.CLOUDINARY_API_KEY;
  const API_SECRET = process.env.CLOUDINARY_API_SECRET;
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    return NextResponse.json(
      { error: "Cloudinary no está configurado en el server." },
      { status: 500 }
    );
  }

  // 3) Archivo
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "No se recibió ningún archivo." },
      { status: 400 }
    );
  }
  if (!TIPOS.includes(file.type)) {
    return NextResponse.json(
      { error: "Solo se aceptan imágenes PNG, JPG, WEBP o GIF." },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "La imagen supera los 5 MB." },
      { status: 400 }
    );
  }

  // 4) Firma SHA-1
  const timestamp = Math.floor(Date.now() / 1000);
  const params: Record<string, string> = {
    timestamp: String(timestamp),
    folder: "stickers",
  };
  const firma = crypto
    .createHash("sha1")
    .update(
      Object.keys(params)
        .sort()
        .map((k) => `${k}=${params[k]}`)
        .join("&") + API_SECRET
    )
    .digest("hex");

  // 5) Upload a Cloudinary (re-envío el File tal cual)
  const body = new FormData();
  body.append("file", file, file.name);
  body.append("api_key", API_KEY);
  body.append("timestamp", String(timestamp));
  body.append("folder", "stickers");
  body.append("signature", firma);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body }
  );
  const data = await res.json();
  if (!res.ok) {
    console.error("cloudinary upload error", data);
    return NextResponse.json(
      { error: "No pudimos subir la imagen a Cloudinary." },
      { status: 502 }
    );
  }

  return NextResponse.json({ url: data.secure_url as string });
}