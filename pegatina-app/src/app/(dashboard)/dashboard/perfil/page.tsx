/**
 * Mi perfil — datos del ilustrador.
 * (El guardado real contra Mongo llega en la próxima entrega;
 * el diseño ya queda alineado al sistema de la marca.)
 */
export default function MiPerfilPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 text-4xl font-bold text-ink">Mi perfil</h1>

      <div className="rounded-2xl border border-line bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primario text-4xl font-bold text-white">
              🎨
            </div>
            <div>
              <p className="text-2xl font-bold text-ink">@miperfil</p>
              <p className="text-muted">Ilustrador independiente</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-ink">Nombre</label>
              <input
                className="h-[46px] w-full rounded-full border border-line px-5 focus:border-primario focus:outline-none"
                defaultValue="Mi Nombre"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-ink">Email</label>
              <input
                className="h-[46px] w-full rounded-full border border-line px-5 focus:border-primario focus:outline-none"
                defaultValue="mi@email.com"
              />
            </div>
          </div>

          <button className="w-full rounded-full bg-primario py-4 text-xl font-bold text-white transition-colors hover:bg-ink">
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}