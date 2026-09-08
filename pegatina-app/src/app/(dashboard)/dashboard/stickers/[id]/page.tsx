import { redirect, notFound } from "next/navigation";
import { getSession, getUsuarioById } from "@/lib/auth";
import { getStickerById, getCategorias } from "@/lib/data";
import StickerEditorForm from "../StickerEditorForm";

/**
 * Editar sticker — solo el dueño (mismo @usuario) puede entrar acá.
 * Si no es el dueño → redirect a Mis stickers.
 */
export default async function EditarStickerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const sesion = await getSession();
  const usuario = sesion ? await getUsuarioById(sesion.sub) : null;
  const handle = usuario?.usuario;

  const sticker = await getStickerById(id);
  if (!sticker) notFound();

  // Autorización: el sticker tiene que ser del ilustrador logueado.
  if (!handle || sticker.ilustrador !== handle) {
    redirect("/dashboard/stickers");
  }

  const categorias = await getCategorias();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 text-4xl font-bold text-ink">Editar sticker</h1>

      <div className="rounded-2xl border border-line bg-white p-8 shadow-sm">
        <StickerEditorForm sticker={sticker} categorias={categorias} />
      </div>
    </div>
  );
}