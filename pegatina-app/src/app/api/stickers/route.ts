import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { getSession, getUsuarioById } from "@/lib/auth";
import { getCategorias } from "@/lib/data";
import type { DBSticker } from "@/lib/types";

/**
 * POST /api/stickers
 * Crea un sticker nuevo para el ilustrador logueado.
 * El campo `ilustrador` se toma del @usuario del usuario (nunca del body).
 */
export async function POST(request: Request) {
  try {
    const sesion = await getSession();
    if (!sesion) {
      return NextResponse.json({ error: "Iniciá sesión." }, { status: 401 });
    }
    if (sesion.rol !== "ilustrador") {
      return NextResponse.json(
        { error: "Solo ilustradores pueden publicar stickers." },
        { status: 403 }
      );
    }

    const usuario = await getUsuarioById(sesion.sub);
    const handle = usuario?.usuario;

    if (!usuario || !handle) {
      return NextResponse.json(
        { error: "Tu cuenta todavía no tiene @usuario. Configuralo en Mi perfil." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const nombre = (body.nombre ?? "").toString().trim();
    const precio = Number(body.precio);
    const categoria = (body.categoria ?? "").toString().trim();
    const material = (body.material ?? "Vinilo").toString().trim();
    const acabado = (body.acabado ?? "Mate").toString().trim();
    const resistente_al_agua = body.resistente_al_agua !== false;
    const fotos = Array.isArray(body.fotos)
      ? body.fotos.map((f: unknown) => String(f).trim()).filter(Boolean)
      : [];

    if (!nombre || !precio || precio <= 0) {
      return NextResponse.json(
        { error: "Ingresá un nombre y un precio válido." },
        { status: 400 }
      );
    }

    if (fotos.length > 4) {
      return NextResponse.json(
        { error: "Máximo 4 fotos por sticker." },
        { status: 400 }
      );
    }

    if (fotos.some((f: string) => !/^https?:\/\//.test(f))) {
      return NextResponse.json(
        { error: "Las URLs de las fotos deben empezar con http:// o https://." },
        { status: 400 }
      );
    }

    const categorias = await getCategorias();
    if (!categorias.includes(categoria)) {
      return NextResponse.json(
        {
          error: `Elegí una categoría válida: ${categorias.join(", ")}.`,
        },
        { status: 400 }
      );
    }

    const db = await getDb();
    const doc: Omit<DBSticker, "_id"> = {
      nombre,
      precio,
      ilustrador: handle,
      categoria,
      foto: fotos[0] ?? "",
      fotos,
      material,
      resistente_al_agua,
      acabado,
    };
    const result = await db
      .collection<DBSticker>("stickers")
      .insertOne(doc as any);

    return NextResponse.json(
      { id: result.insertedId.toString(), ok: true },
      { status: 201 }
    );
  } catch (err) {
    console.error("crear sticker error", err);
    return NextResponse.json(
      { error: "No pudimos crear el sticker." },
      { status: 500 }
    );
  }
}