/**
 * Subir Sticker — formulario del ilustrador para publicar un sticker nuevo.
 * Galería de imágenes + título, precio, stock + botones Publicar / Guardar borrador.
 */
export default function NuevoStickerPage() {
  return (
    <div className="mx-auto max-w-5xl py-4">
      <h1 className="mb-8 text-2xl font-bold text-ink">Subir sticker</h1>

      <div className="flex gap-10">
        {/* FORMULARIO */}
        <div className="flex-1">
          <div className="flex flex-col gap-5">
            {/* Título */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-ink">
                Título del sticker
              </label>
              <input
                type="text"
                placeholder="Sticker"
                className="h-[46px] rounded-full border border-line bg-white px-5 focus:border-primario focus:outline-none"
              />
            </div>

            {/* Precio */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-ink">
                Precio de venta
              </label>
              <input
                type="text"
                placeholder="$$$$$$"
                className="h-[46px] rounded-full border border-line bg-white px-5 focus:border-primario focus:outline-none"
              />
            </div>

            {/* Stock */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-ink">Stock Inicial</label>
              <input
                type="number"
                placeholder="0"
                className="h-[46px] rounded-full border border-line bg-white px-5 focus:border-primario focus:outline-none"
              />
            </div>

            {/* Categoría */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-ink">Categoría</label>
              <select className="h-[46px] rounded-full border border-line bg-white px-5 focus:border-primario focus:outline-none">
                <option>Animales</option>
                <option>Comida</option>
                <option>Floral</option>
                <option>Otro</option>
              </select>
            </div>

            {/* Descripción */}
            <div className="flex flex-col gap-1">
              <label className="text-sm text-ink">Descripción</label>
              <textarea
                rows={4}
                className="rounded-3xl border border-line bg-white px-5 py-3 focus:border-primario focus:outline-none"
              />
            </div>

            {/* Botones */}
            <div className="mt-4 flex flex-col gap-3">
              <button className="w-full rounded-full bg-ink py-4 text-xl font-semibold text-white transition-colors hover:bg-primario">
                Publicar
              </button>
              <button className="w-full rounded-full border border-line bg-crema py-4 text-xl font-semibold text-ink transition-colors hover:bg-secundario/10">
                Guardar borrador
              </button>
            </div>
          </div>
        </div>

        {/* GALERÍA PREVIEW */}
        <div className="flex shrink-0 gap-8">
          <div className="flex flex-col justify-between">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[194px] w-[141px] rounded bg-neutral-300" />
            ))}
          </div>
          <div className="h-full w-[498px] rounded-lg bg-neutral-300" />
        </div>
      </div>
    </div>
  );
}
