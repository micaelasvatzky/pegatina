import { redirect } from "next/navigation";
import { getSession, getUsuarioById } from "@/lib/auth";
import { getPedidosDelVendedor } from "@/lib/data";
import { PAGO_LABEL, PAGO_STYLE } from "@/lib/pedidos";
import CambiarEstadoPedido from "./CambiarEstadoPedido";

/**
 * Gestión de Pedidos — datos REALES desde Mongo.
 * Muestra los pedidos que contienen stickers del ilustrador logueado
 * y permite avanzar su estado de envío (PATCH /api/pedidos/[id]).
 */
export const dynamic = "force-dynamic";

const MONTHS = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

function formatFecha(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export default async function PedidosPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const usuario = await getUsuarioById(session.sub);
  if (!usuario) redirect("/login");

  // El handle en la DB se guarda CON @ (igual que en stickers y signup).
  const handle = usuario.usuario ?? "";
  const pedidos = handle ? await getPedidosDelVendedor(handle) : [];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink md:text-4xl">Pedidos</h1>
        <p className="mt-1 text-muted">
          Seguí el estado de tus pedidos y administrá los envíos.
        </p>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border-2 border-line bg-card nb-shadow">
        {/* Header tabla */}
        <div className="hidden grid-cols-[5rem_minmax(0,1.3fr)_minmax(0,1.5fr)_minmax(0,1fr)_4rem_7rem] gap-4 bg-primario px-5 py-4 text-sm font-bold text-white 2xl:grid">
          <span>Pedido</span>
          <span>Items</span>
          <span>Estado</span>
          <span>Cliente</span>
          <span>Fecha</span>
          <span className="text-right">Total</span>
        </div>

        {/* Filas */}
        {pedidos.map((p) => (
          <div
            key={p.id}
            className="grid min-w-0 grid-cols-1 gap-4 border-t border-line px-4 py-5 text-sm sm:grid-cols-2 2xl:grid-cols-[5rem_minmax(0,1.3fr)_minmax(0,1.5fr)_minmax(0,1fr)_4rem_7rem] 2xl:items-start 2xl:px-5"
          >
            {/* Pedido */}
            <span className="font-bold text-ink/70">
              #{p.id.slice(-6).toUpperCase()}
            </span>

            {/* Items */}
            <div className="flex min-w-0 w-full flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-xl bg-primario/10 text-xl">
                  🎨
                </div>
                <span className="min-w-0 flex-1 break-words text-ink">
                  {p.items.map((it) => it.nombre).join(", ")}
                </span>
              </div>
              <span className="break-words text-sm text-muted">
                {p.items
                  .map((it) => `${it.cantidad} × ${it.nombre}`)
                  .join(" · ")}
              </span>
            </div>

            {/* Estado + selector */}
            <div className="flex min-w-0 flex-col items-start gap-2">
              <CambiarEstadoPedido
                pedidoId={p.id}
                estado={p.estado}
                pagoAprobado={p.pago?.estado === "aprobado"}
              />
              {p.pago && (
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${PAGO_STYLE[p.pago.estado]}`}
                  title={
                    p.pago.proveedor === "mercadopago"
                      ? "Pago a través de Mercado Pago"
                      : "Pago por transferencia"
                  }
                >
                  {PAGO_LABEL[p.pago.estado]}
                </span>
              )}
            </div>

            {/* Cliente */}
            <div className="min-w-0">
              <span className="mb-1 block text-xs font-bold uppercase text-muted 2xl:hidden">Cliente</span>
              <span className="break-words text-ink">{p.cliente?.nombre ?? "Cliente"}</span>
              <span className="block break-all text-sm text-muted">
                {p.cliente?.email ?? ""}
              </span>
            </div>

            {/* Fecha */}
            <span className="text-ink/70">
              <span className="mr-2 text-xs font-bold uppercase text-muted 2xl:hidden">Fecha</span>
              {formatFecha(p.fecha)}
            </span>

            {/* Total */}
            <span className="break-words font-semibold text-ink 2xl:text-right">
              <span className="mr-2 text-xs font-bold uppercase text-muted 2xl:hidden">Total</span>
              {p.total.toLocaleString("es-AR", {
                style: "currency",
                currency: "ARS",
              })}
            </span>
          </div>
        ))}
      </div>

      {/* Estado vacío */}
      {pedidos.length === 0 && (
        <p className="mt-8 flex items-center justify-center gap-2 text-center text-muted">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 5.5H20V19.5H4V5.5Z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8 3.5V7.5M16 3.5V7.5M4 10.5H20"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          Todavía no tenés pedidos. Cuando alguien compre tus stickers, los vas
          a ver acá.
        </p>
      )}
    </div>
  );
}
