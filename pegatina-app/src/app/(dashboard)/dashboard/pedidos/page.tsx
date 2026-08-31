import { orders } from "@/lib/mock-data";

/**
 * Gestión de Pedidos — tabla de pedidos del ilustrador con estado de envío.
 */
export default function PedidosPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-ink">
          Gestión de pedidos
        </h1>
        <p className="mt-1 text-base leading-[170%] text-ink/70">
          Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam
          nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat
          volutpat.
        </p>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded border border-line">
        {/* Header tabla */}
        <div className="flex bg-muted px-7 py-4 text-base font-bold text-white">
          <span className="w-24">Order no</span>
          <span className="w-40">Items</span>
          <span className="flex-1">Status</span>
          <span className="w-44">Tracking ID</span>
          <span className="w-36">Delivery Date</span>
          <span className="w-24">Price</span>
        </div>

        {/* Filas */}
        {orders.map((order, idx) => (
          <div
            key={idx}
            className="flex items-center border-t border-line bg-white px-7 py-5 text-base"
          >
            <span className="w-24 font-bold text-ink/70">
              {order.orderNo}
            </span>
            <div className="flex w-40 items-center gap-2">
              <div className="h-[60px] w-[48px] shrink-0 bg-neutral-300" />
              <span className="text-ink">{order.items}</span>
            </div>
            <div className="flex-1">
              <span className="inline-flex items-center gap-2 rounded bg-ink/15 px-3 py-2 text-sm font-bold text-ink/70">
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M10 5V10L13 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                In Progress
              </span>
            </div>
            <span className="w-44 text-ink/70">
              <span className="underline">{order.trackingId}</span> ↗
            </span>
            <span className="w-36 text-ink/70">
              {order.deliveryDate}
              <br />
              <span className="text-sm">(Expected)</span>
            </span>
            <span className="w-24 text-ink/70">${order.price.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
