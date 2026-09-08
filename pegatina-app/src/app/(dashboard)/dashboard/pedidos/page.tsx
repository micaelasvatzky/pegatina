import { orders } from "@/lib/mock-data";

/**
 * Gestión de Pedidos — pedidos del ilustrador con estado de envío.
 * (Los datos reales desde Mongo llegan en la próxima entrega;
 * el diseño ya queda alineado al sistema de la marca.)
 */

/** Color por estado, usando la paleta de Pegatina. */
const estadoEstilo: Record<string, string> = {
  pending: "bg-ink/10 text-ink/70",
  in_progress: "bg-acento/20 text-ink",
  shipped: "bg-primario/15 text-primario",
  delivered: "bg-secundario/20 text-ink",
};

/** Etiqueta por estado. */
const estadoLabel: Record<string, string> = {
  pending: "Pendiente",
  in_progress: "En progreso",
  shipped: "Enviado",
  delivered: "Entregado",
};

export default function PedidosPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-ink">Pedidos</h1>
        <p className="mt-1 text-muted">
          Seguí el estado de tus pedidos y administrá los envíos.
        </p>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
        {/* Header tabla */}
        <div className="flex bg-primario px-7 py-4 text-base font-bold text-white">
          <span className="w-24">Pedido</span>
          <span className="w-40">Items</span>
          <span className="flex-1">Estado</span>
          <span className="w-44">Tracking</span>
          <span className="w-36">Entrega</span>
          <span className="w-28">Precio</span>
        </div>

        {/* Filas */}
        {orders.map((order, idx) => (
          <div
            key={idx}
            className="flex items-center border-t border-line bg-white px-7 py-5 text-base"
          >
            <span className="w-24 font-bold text-ink/70">
              #{order.orderNo}
            </span>
            <div className="flex w-40 items-center gap-2">
              <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-xl bg-primario/10 text-xl">
                📦
              </div>
              <span className="truncate text-ink">{order.items}</span>
            </div>
            <div className="flex-1">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-bold ${
                  estadoEstilo[order.status] ?? "bg-ink/10 text-ink/70"
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M10 5V10L13 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                {estadoLabel[order.status] ?? "Pendiente"}
              </span>
            </div>
            <span className="w-44 text-ink/70">
              <span className="underline">{order.trackingId}</span> ↗
            </span>
            <span className="w-36 text-ink/70">
              {order.deliveryDate}
              <br />
              <span className="text-sm">(Estimada)</span>
            </span>
            <span className="w-28 font-semibold text-ink">
              ${order.price.toLocaleString("es-AR")}
            </span>
          </div>
        ))}
      </div>

      {/* Pie */}
      {orders.length === 0 && (
        <p className="mt-8 text-center text-muted">
          Todavía no tenés pedidos. Cuando alguien compre tus stickers, los vas a ver acá. 📦
        </p>
      )}
    </div>
  );
}