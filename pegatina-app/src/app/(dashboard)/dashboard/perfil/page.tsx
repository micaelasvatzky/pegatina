/**
 * Mi perfil — datos del ilustrador.
 * (Placeholder MVP; el wireframe no la especificaba en detalle.)
 */
export default function MiPerfilPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 text-4xl font-bold text-ink">Mi perfil</h1>

      <div className="rounded-xl border border-line bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-neutral-300 text-3xl text-white">
              L
            </div>
            <div>
              <p className="text-2xl font-bold text-ink">@loremipsum</p>
              <p className="text-muted">Ilustrador independiente</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="mb-2 block text-sm capitalize text-ink">
                Nombre
              </label>
              <input
                className="w-full rounded-full border border-line px-5 py-3 focus:border-primario focus:outline-none"
                defaultValue="Lorem Ipsum"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm capitalize text-ink">
                Email
              </label>
              <input
                className="w-full rounded-full border border-line px-5 py-3 focus:border-primario focus:outline-none"
                defaultValue="lorem@ipsum.com"
              />
            </div>
          </div>

          <button className="w-full rounded-full bg-primario py-4 text-xl font-semibold text-white transition-colors hover:bg-ink">
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}
