/**
 * Dashboard principal del ilustrador.
 * Header con @usuario + cards de estadísticas de su tienda.
 */
export default function DashboardPage() {
  return (
    <div>
      {/* Header */}
      <h1 className="mb-8 text-4xl font-bold text-ink">
        Dashboard principal
      </h1>

      <div className="flex flex-col gap-6">
        {/* @usuario */}
        <p className="text-2xl font-bold text-ink">@tutienda</p>

        {/* Stats */}
        <div className="grid max-w-[560px] grid-cols-1 gap-5">
          {/* Ventas del mes */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <p className="text-lg text-ink">Ventas del mes</p>
            <p className="mt-2 text-4xl text-ink">$500.00 ARS</p>
          </div>

          {/* Pedidos pendientes */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <p className="text-lg text-ink">Pedidos pendientes</p>
            <p className="mt-2 text-4xl text-ink">3 por enviar</p>
          </div>

          {/* Stickers vendidos */}
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <p className="text-lg text-ink">Stickers vendidos</p>
            <p className="mt-2 text-4xl text-ink">10 unidades</p>
          </div>
        </div>
      </div>
    </div>
  );
}
