import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getPedidoDelComprador } from "@/lib/data";
import { ESTADO_LABEL, ESTADO_STYLE, type PedidoEstado } from "@/lib/pedidos";

interface RouteCtx {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ comprado?: string }>;
}

/**
 * Seguimiento del pedido del comprador.
 * Timeline del estado de envío + detalle de items, total y dirección.
 * Solo visible para el dueño del pedido (verifica usuario_id).
 */
export const dynamic = "force-dynamic";

const FLUJO: PedidoEstado[] = [
  "pending",
  "in_progress",
  "shipped",
  "delivered",
];

const FLUJO_DESC: Record<PedidoEstado, string> = {
  pending: "Esperando confirmación del artista",
  in_progress: "El artista lo está preparando",
  shipped: "Salió para tu casa",
  delivered: "Llegó, ¡a disfrutar!",
};

function Timeline({ estado }: { estado: PedidoEstado }) {
  const actual = FLUJO.indexOf(estado);
  return (
    <ol className="flex flex-col gap-0 sm:flex-row sm:items-center">
      {FLUJO.map((paso, i) => {
        const completo = i < actual;
        const activo = i === actual;
        return (
          <li key={paso} className="flex flex-1 flex-col sm:flex-row sm:items-center">
            {/* Burbuja + label */}
            <div className="flex flex-1 items-center gap-3 sm:flex-col sm:gap-2 sm:text-center">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  completo
                    ? "bg-green-100 text-green-700"
                    : activo
                      ? "bg-primario text-white"
                      : "bg-ink/10 text-ink/40"
                }`}
              >
                {completo ? "✓" : i + 1}
              </span>
              <div className="sm:mt-1">
                <p
                  className={`text-sm font-bold ${
                    completo || activo ? "text-ink" : "text-ink/40"
                  }`}
                >
                  {ESTADO_LABEL[paso]}
                </p>
                <p
                  className={`text-xs ${
                    activo ? "text-primario" : "text-muted"
                  }`}
                >
                  {FLUJO_DESC[paso]}
                </p>
              </div>
            </div>
            {/* Conector */}
            {i < FLUJO.length - 1 && (
              <span
                className={`mx-4 hidden h-0.5 flex-1 rounded-full sm:block ${
                  i < actual ? "bg-green-200" : "bg-ink/10"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default async function SeguimientoPage({ params, searchParams }: RouteCtx) {
  const { id } = await params;
  const { comprado } = await searchParams;
  const session = await getSession();
  if (!session) redirect(`/login?redirect=/pedidos/${id}`);

  const pedido = await getPedidoDelComprador(id, session.sub);
  if (!pedido) notFound();

  const fecha = pedido.fecha
    ? new Date(pedido.fecha).toLocaleDateString("es-AR")
    : "";

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-10 md:px-6">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink md:text-4xl">
          Tu pedido <span className="text-primario">#{id.slice(-8).toUpperCase()}</span>
        </h1>
        <div className="mt-2 flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-sm font-bold ${
              ESTADO_STYLE[pedido.estado]
            }`}
          >
            {ESTADO_LABEL[pedido.estado]}
          </span>
          <span className="text-sm text-muted">{fecha}</span>
        </div>
      </div>

      {/* Banner compra confirmada (solo justo después del checkout) */}
      {comprado === "1" && (
        <p className="mb-8 flex items-center gap-3 rounded-2xl bg-green-100 px-5 py-4 text-sm font-semibold text-green-800">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
            <path d="M8 12.5L10.8 15.2L16 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          ¡Compra confirmada! El artista ya recibió tu pedido y te va a pasar sus
          datos de transferencia. Seguí el avance acá.
        </p>
      )}

      {/* Timeline */}
      <div className="rounded-2xl border border-line bg-white p-6 shadow-sm md:p-8">
        <Timeline estado={pedido.estado} />
      </div>

      {/* Detalle */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Items */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-ink">Detalle</h2>
          <ul className="flex flex-col gap-2">
            {pedido.items.map((it, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-ink">
                  {it.cantidad} × {it.nombre}
                </span>
                <span className="font-semibold text-ink">
                  ${(it.precio * it.cantidad).toLocaleString("es-AR")}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
            <span className="font-bold text-ink">Total</span>
            <span className="text-lg font-bold text-ink">
              ${pedido.total.toLocaleString("es-AR")} ARS
            </span>
          </div>
          <p className="mt-3 rounded-xl bg-primario/10 px-4 py-3 text-xs text-muted">
            {pedido.metodo_pago === "transferencia" ||
            pedido.metodo_pago === null
              ? "Pago por transferencia: el artista te pasa los datos y vos le transferís."
              : "Método de pago: " + pedido.metodo_pago}
          </p>
        </div>

        {/* Envío */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-ink">Envío a</h2>
          {pedido.envio ? (
            <div className="flex flex-col gap-1 text-sm text-ink">
              <span className="font-bold">{pedido.envio.nombre}</span>
              <span>{pedido.envio.calle}</span>
              <span>
                {pedido.envio.ciudad}, {pedido.envio.provincia}{" "}
                ({pedido.envio.codigo_postal})
              </span>
              {pedido.envio.notas && (
                <p className="mt-2 rounded-xl bg-crema px-3 py-2 text-xs text-muted">
                  {pedido.envio.notas}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted">Sin datos de envío.</p>
          )}
        </div>
      </div>

      <Link
        href="/perfil"
        className="mt-8 inline-block text-sm font-semibold text-primario underline hover:text-ink"
      >
        ← Volver a mis compras
      </Link>
    </div>
  );
}