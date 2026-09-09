import { redirect } from "next/navigation";
import { getSession, getUsuarioById } from "@/lib/auth";
import { getPedidosDelVendedor } from "@/lib/data";
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
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
        {/* Header tabla */}
        <div className="hidden gap-4 bg-primario px-7 py-4 text-base font-bold text-white lg:flex">
          <span className="w-24 shrink-0">Pedido</span>
          <span className="w-56 shrink-0">Items</span>
          <span className="w-64 shrink-0">Estado</span>
          <span className="w-44 shrink-0">Cliente</span>
          <span className="w-20 shrink-0">Fecha</span>
          <span className="flex-1 text-right">Total</span>
        </div>

        {/* Filas */}
        {pedidos.map((p) => (
          <div
            key={p.id}
            className="flex flex-col gap-3 border-t border-line bg-white px-6 py-5 text-base lg:flex-row lg:items-center lg:gap-4 lg:px-7"
          >
            {/* Pedido */}
            <span className="font-bold text-ink/70">
              #{p.id.slice(-6).toUpperCase()}
            </span>

            {/* Items */}
            <div className="flex w-full flex-col gap-1 lg:w-56 lg:shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-xl bg-primario/10 text-xl">
                  🎨
                </div>
                <span className="flex-1 truncate text-ink">
                  {p.items.map((it) => it.nombre).join(", ")}
                </span>
              </div>
              <span className="ml-12 text-sm text-muted">
                {p.items
                  .map((it) => `${it.cantidad} × ${it.nombre}`)
                  .join(" · ")}
              </span>
            </div>

            {/* Estado + selector */}
            <div className="flex items-center lg:w-64 lg:shrink-0">
              <CambiarEstadoPedido pedidoId={p.id} estado={p.estado} />
            </div>

            {/* Cliente */}
            <div className="min-w-0 lg:w-44 lg:shrink-0">
              <span className="truncate text-ink">{p.cliente?.nombre ?? "Cliente"}</span>
              <span className="block truncate text-sm text-muted">
                {p.cliente?.email ?? ""}
              </span>
            </div>

            {/* Fecha */}
            <span className="text-ink/70 lg:w-20 lg:shrink-0">
              {formatFecha(p.fecha)}
            </span>

            {/* Total */}
            <span className="font-semibold text-ink lg:flex-1 lg:text-right">
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