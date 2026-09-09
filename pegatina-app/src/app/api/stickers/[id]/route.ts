import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getSession, getUsuarioById } from "@/lib/auth";
import { getStickerById, getCategorias } from "@/lib/data";
import type { DBSticker, Sticker } from "@/lib/types";

/**
 * PATCH /api/stickers/[id]
 * Edita UN sticker. Solamente su dueño (mismo @usuario) puede editarlo.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const sesion = await getSession();
    if (!sesion) {
      return NextResponse.json({ error: "Iniciá sesión." }, { status: 401 });
    }
    if (sesion.rol !== "ilustrador") {
      return NextResponse.json(
        { error: "Solo ilustradores pueden editar stickers." },
        { status: 403 }
      );
    }

    const usuario = await getUsuarioById(sesion.sub);
    const handle = usuario?.usuario;

    if (!handle) {
      return NextResponse.json(
        { error: "Tu cuenta todavía no tiene @usuario." },
        { status: 400 }
      );
    }

    let sticker: Sticker | null = null;
    try {
      sticker = await getStickerById(id);
    } catch {
      sticker = null;
    }
    if (!sticker) {
      return NextResponse.json(
        { error: "No encontramos ese sticker." },
        { status: 404 }
      );
    }
    if (sticker.ilustrador !== handle) {
      return NextResponse.json(
        { error: "No podés editar un sticker que no es tuyo." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const nombre = (body.nombre ?? sticker.nombre).toString().trim();
    const precio = Number(body.precio ?? sticker.precio);
    const categoria = (body.categoria ?? sticker.categoria).toString().trim();
    const material = (body.material ?? sticker.material).toString().trim();
    const acabado = (body.acabado ?? "Mate").toString().trim();
    const resistente_al_agua = body.resistente_al_agua !== false;
    const fotos =
      typeof body.fotos !== "undefined"
        ? Array.isArray(body.fotos)
          ? body.fotos.map((f: unknown) => String(f).trim()).filter(Boolean)
          : [sticker.foto]
        : sticker.fotos && sticker.fotos.length > 0
          ? sticker.fotos
          : sticker.foto
            ? [sticker.foto]
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
        { error: `Elegí una categoría válida: ${categorias.join(", ")}.` },
        { status: 400 }
      );
    }

    const db = await getDb();
    await db
      .collection<DBSticker>("stickers")
      .updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            nombre,
            precio,
            categoria,
            material,
            acabado,
            resistente_al_agua,
            foto: fotos[0] ?? "",
            fotos,
          },
        }
      );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("editar sticker error", err);
    return NextResponse.json(
      { error: "No pudimos editar el sticker." },
      { status: 500 }
    );
  }
}