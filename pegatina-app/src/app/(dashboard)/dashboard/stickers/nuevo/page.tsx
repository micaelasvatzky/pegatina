/**
 * Subir Sticker — formulario del ilustrador para publicar un sticker nuevo.
 */
export default function NuevoStickerPage() {
  return (
    <div className="mx-auto max-w-5xl py-4">
      <h1 className="mb-8 text-2xl font-bold text-ink">Subir sticker</h1>

      <div className="flex gap-10">
        {/* FORMULARIO */}
        <div className="flex-1">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-ink">Nombre del sticker</label>
              <input
                type="text"
                placeholder="Ej: Matecito Argentino"
                className="h-[46px] rounded-full border border-line bg-white px-5 focus:border-primario focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-ink">Precio de venta</label>
              <input
                type="text"
                placeholder="Ej: 1200"
                className="h-[46px] rounded-full border border-line bg-white px-5 focus:border-primario focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-ink">Stock inicial</label>
              <input
                type="number"
                placeholder="0"
                className="h-[46px] rounded-full border border-line bg-white px-5 focus:border-primario focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-ink">Categoría</label>
              <select className="h-[46px] rounded-full border border-line bg-white px-5 focus:border-primario focus:outline-none">
                <option>Bebidas</option>
                <option>Comida</option>
                <option>Buenos Aires</option>
                <option>Argentina</option>
                <option>Animales</option>
                <option>Cultura</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-ink">Descripción</label>
              <textarea
                rows={4}
                className="rounded-3xl border border-line bg-white px-5 py-3 focus:border-primario focus:outline-none"
              />
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <button className="w-full rounded-full bg-primario py-4 text-xl font-bold text-white transition-colors hover:bg-ink">
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
              <div
                key={i}
                className="flex h-[194px] w-[141px] items-center justify-center rounded-xl bg-primario/10"
              >
                <span className="text-3xl">🎨</span>
              </div>
            ))}
          </div>
          <div className="flex h-[627px] w-[498px] items-center justify-center rounded-2xl bg-primario/10">
            <span className="text-7xl">🎨</span>
          </div>
        </div>
      </div>
    </div>
  );
}
