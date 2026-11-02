import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, getUsuarioById } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import type { ObjectId } from "mongodb";
import LogoutButton from "@/components/LogoutButton";
import { ESTADO_LABEL, normalizarEstado } from "@/lib/pedidos";
import ColorBlobs from "@/components/ColorBlobs";

/**
 * Perfil del COMPRADOR.
 * Muestra foto + nombre y las últimas compras.
 * (Las compras reales llegarán cuando implementemos el pago.)
 */

/** Documento de pedido tal como lo leemos para el perfil del comprador. */
interface PedidoPerfilDoc {
  _id: ObjectId;
  items?: { nombre?: string; cantidad?: number }[];
  total?: number;
  estado?: string;
  fecha?: Date | string;
}

async function getPedidos(usuarioId: string) {
  const db = await getDb();
  const docs = await db
    .collection<PedidoPerfilDoc>("pedidos")
    .find({ usuario_id: usuarioId })
    .sort({ fecha: -1 })
    .limit(10)
    .toArray();
  return docs.map((d) => ({
    id: d._id.toString(),
    items: d.items ?? [],
    total: d.total ?? 0,
    estado: d.estado ?? "pendiente",
    fecha: d.fecha ? new Date(d.fecha).toISOString() : null,
  }));
}

export const dynamic = "force-dynamic";

export default async function PerfilPage() {
  const session = await getSession();
  if (!session) redirect("/login?redirect=/perfil");

  const usuario = await getUsuarioById(session.sub);
  if (!usuario) redirect("/login");

  const pedidos = await getPedidos(session.sub);
  const inicial = usuario.nombre.charAt(0).toUpperCase();

  return (
    <div>
      {/* Header con color (sistema de la landing) */}
      <section className="relative overflow-hidden border-b-2 border-line bg-azul-soft px-4 py-10 md:px-6">
        <ColorBlobs />
        <div className="relative z-10 mx-auto max-w-3xl">
          <h1 className="font-display text-4xl font-black uppercase leading-none tracking-tight text-white md:text-5xl">
            Mi perfil
          </h1>
          <p className="mt-2 font-bold text-white/85">
            Tus datos y tus últimas compras
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-2xl px-4 py-6 md:px-6 md:py-8">
        {/* Encabezado del perfil */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border-2 border-line bg-card p-4 sm:p-5 nb-shadow-sm">
        {usuario.foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={usuario.foto}
            alt={usuario.nombre}
            className="h-12 w-12 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primario text-xl font-bold text-white">
            {inicial}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="break-words text-xl font-bold text-ink">{usuario.nombre}</h2>
          <p title={usuario.email} className="truncate text-sm text-muted">{usuario.email}</p>
          <span className="mt-1 inline-block rounded-full bg-primario/10 px-3 py-0.5 text-xs font-semibold uppercase tracking-wide text-primario">
            Comprador
          </span>
        </div>
        {/* Cerrar sesión con confirmación */}
        <LogoutButton />
      </div>

      {/* Últimas compras */}
      <div className="mt-6">
        <h2 className="mb-3 text-xl font-bold text-ink">Últimas compras</h2>

        {pedidos.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-line bg-card p-5 text-center nb-shadow-sm">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-lilac/60 text-muted">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path d="M3 7H21V21H3V7Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 10V5.5C8 3.5 10 2 12 2C14 2 16 3.5 16 5.5V10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
            <p className="mt-4 text-lg font-semibold text-ink">
              Todavía no compraste nada
            </p>
            <p className="mt-1 text-muted">
              Cuando hagas tu primera compra, va a aparecer acá.
            </p>
            <Link
              href="/catalogo"
              className="mt-4 inline-block rounded-full border-2 border-line bg-primario px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-ink nb-lift"
            >
              Explorar catálogo
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {pedidos.map((p) => (
              <li
                key={p.id}
                className="min-w-0 rounded-2xl border-2 border-line bg-card p-4 nb-shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link
                    href={`/pedidos/${p.id}`}
                    className="text-sm font-bold text-primario underline hover:text-ink"
                  >
                    #{p.id.slice(-8).toUpperCase()}
                  </Link>
                  <span className="rounded-full bg-primario/10 px-2.5 py-1 text-xs font-semibold text-primario">
                    {ESTADO_LABEL[normalizarEstado(p.estado)]}
                  </span>
                </div>
                <div className="mt-2 flex flex-col gap-0.5 break-words text-sm text-muted">
                  {Array.isArray(p.items) &&
                    p.items.map((it, i: number) => (
                      <span key={i}>
                        {it.cantidad ?? 1}× {it.nombre ?? "Sticker"}
                      </span>
                    ))}
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-muted">
                    {p.fecha
                      ? new Date(p.fecha).toLocaleDateString("es-AR")
                      : ""}
                  </span>
                  <span className="text-base font-bold text-ink">
                    {p.total.toLocaleString("es-AR", {
                      style: "currency",
                      currency: "ARS",
                    })}
                  </span>
                </div>
                <Link
                  href={`/pedidos/${p.id}`}
                  className="mt-2 inline-block text-sm font-semibold text-primario underline hover:text-ink"
                >
                  Ver seguimiento →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      </div>
    </div>
  );
}
