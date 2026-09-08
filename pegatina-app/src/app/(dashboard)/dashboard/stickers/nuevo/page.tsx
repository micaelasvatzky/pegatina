import { getCategorias } from "@/lib/data";
import StickerEditorForm from "../StickerEditorForm";

/**
 * Subir Sticker — formulario del ilustrador para publicar un sticker nuevo.
 * Usa el mismo formulario que "Editar" (StickerEditorForm).
 */
export default async function NuevoStickerPage() {
  const categorias = await getCategorias();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 text-4xl font-bold text-ink">Subir sticker</h1>

      <div className="rounded-2xl border border-line bg-white p-8 shadow-sm">
        <StickerEditorForm categorias={categorias} />
      </div>
    </div>
  );
}