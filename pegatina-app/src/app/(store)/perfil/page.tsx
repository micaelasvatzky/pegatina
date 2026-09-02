import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, getUsuarioById } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import type { ObjectId } from "mongodb";

/**
 * Perfil del COMPRADOR.
 * Muestra foto + nombre y las últimas compras.
 * (Las compras reales llegarán cuando implementemos el pago.)
 */

async function getPedidos(usuarioId: string) {
  const db = await getDb();
  const docs = await db
    .collection("pedidos")
    .find({ usuario_id: usuarioId })
    .sort({ fecha: -1 })
    .limit(10)
    .toArray();
  return docs.map((d: any) => ({
    id: (d._id as ObjectId).toString(),
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
  const estadoTexto: Record<string, string> = {
    pendiente: "Pendiente",
    entregado: "Entregado",
    enviado: "Enviado",
    en_progreso: "En progreso",
  };

  return (
    <div className="mx-auto max-w-3xl py-12">
      {/* Encabezado del perfil */}
      <div className="flex items-center gap-6 rounded-2xl border border-line bg-white p-8">
        {usuario.foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={usuario.foto}
            alt={usuario.nombre}
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primario text-3xl font-bold text-white">
            {inicial}
          </span>
        )}
        <div>
          <h1 className="text-3xl font-bold text-ink">{usuario.nombre}</h1>
          <p className="text-muted">{usuario.email}</p>
          <span className="mt-1 inline-block rounded-full bg-primario/10 px-3 py-0.5 text-xs font-semibold uppercase tracking-wide text-primario">
            Comprador
          </span>
        </div>
      </div>

      {/* Últimas compras */}
      <div className="mt-10">
        <h2 className="mb-4 text-2xl font-bold text-ink">Últimas compras</h2>

        {pedidos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white p-10 text-center">
            <span className="text-5xl">🛍️</span>
            <p className="mt-4 text-lg font-semibold text-ink">
              Todavía no compraste nada
            </p>
            <p className="mt-1 text-muted">
              Cuando hagas tu primera compra, va a aparecer acá.
            </p>
            <Link
              href="/catalogo"
              className="mt-6 inline-block rounded-full bg-primario px-6 py-3 font-bold text-white transition-colors hover:bg-ink"
            >
              Explorar catálogo
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {pedidos.map((p) => (
              <li
                key={p.id}
                className="rounded-2xl border border-line bg-white p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-muted">
                    #{p.id.slice(-8).toUpperCase()}
                  </span>
                  <span className="rounded-full bg-primario/10 px-3 py-1 text-sm font-semibold text-primario">
                    {estadoTexto[p.estado] ?? p.estado}
                  </span>
                </div>
                <div className="mt-3 flex flex-col gap-1 text-sm text-muted">
                  {Array.isArray(p.items) &&
                    p.items.map((it: any, i: number) => (
                      <span key={i}>
                        {it.cantidad ?? 1}× {it.nombre ?? "Sticker"}
                      </span>
                    ))}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted">
                    {p.fecha
                      ? new Date(p.fecha).toLocaleDateString("es-AR")
                      : ""}
                  </span>
                  <span className="text-lg font-bold text-ink">
                    {p.total.toLocaleString("es-AR", {
                      style: "currency",
                      currency: "ARS",
                    })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
