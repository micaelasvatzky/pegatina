import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession, getUsuarioById } from "@/lib/auth";
import { mpOAuthConfigurado } from "@/lib/mercadopago";
import MiPerfilForm from "./MiPerfilForm";

/**
 * Mi perfil — datos REALES del ilustrador logueado.
 * Header con la identidad de la tienda + form editable (PATCH /api/usuarios/me)
 * + conexión con Mercado Pago (para cobrar el 90% de cada venta).
 */
export const dynamic = "force-dynamic";

export default async function MiPerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ mp?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const usuario = await getUsuarioById(session.sub);
  if (!usuario) redirect("/login");

  const { mp } = await searchParams;
  const inicial = usuario.nombre.charAt(0).toUpperCase();
  const sinHandle = !usuario.usuario;
  const mpOAuthListo = mpOAuthConfigurado();
  const mpConectado = Boolean(usuario.mp?.access_token);

  return (
    <div className="mx-auto max-w-2xl">
      {mp === "conectado" && (
        <p className="mb-6 flex items-center gap-3 rounded-2xl bg-green-100 px-5 py-4 text-sm font-semibold text-green-800">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
            <path d="M8 12.5L10.8 15.2L16 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          ¡Conectaste tu cuenta de Mercado Pago! Desde ahora cobrás el 90% de
          cada venta de forma automática.
        </p>
      )}
      {mp === "error" && (
        <p className="mb-6 flex items-center gap-3 rounded-2xl bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          No pudimos conectar tu cuenta de Mercado Pago. Intentá de nuevo.
        </p>
      )}

      <h1 className="mb-8 text-4xl font-bold text-ink">Mi perfil</h1>

      <div className="rounded-2xl border-2 border-line bg-card p-8 nb-shadow-md">
        {/* Identidad */}
        <div className="mb-8 flex items-center gap-6">
          {usuario.foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={usuario.foto}
              alt={usuario.nombre}
              className="h-24 w-24 shrink-0 rounded-full border-2 border-line object-cover shadow-[2px_2px_0px_var(--color-line)]"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-line bg-primario text-4xl font-bold text-white shadow-[2px_2px_0px_var(--color-line)]">
              {inicial}
            </div>
          )}
          <div>
            <p className="text-2xl font-bold text-ink">
              {usuario.usuario ? `@${usuario.usuario.replace(/^@/, "")}` : usuario.nombre}
            </p>
            <p className="text-muted">Ilustrador independiente</p>
            {sinHandle && (
              <p className="mt-1 rounded-full bg-acento/30 px-3 py-1 text-xs font-semibold text-[#a07d00]">
                Sin @usuario todavía — no podés publicar stickers
              </p>
            )}
          </div>
        </div>

        {/* Form editable */}
        <MiPerfilForm
          initial={{
            nombre: usuario.nombre,
            email: usuario.email,
            bio: usuario.bio ?? null,
            foto: usuario.foto ?? null,
          }}
          handle={usuario.usuario ?? null}
        />
      </div>

      {/* Mercado Pago — cobros */}
      <div className="mt-8 rounded-2xl border-2 border-line bg-card p-8 nb-shadow-md">
        <h2 className="text-lg font-bold text-ink">Cobros con Mercado Pago</h2>
        <p className="mt-1 text-sm text-muted">
          Cada vez que vendés un sticker, el comprador paga con Mercado Pago y
          el 90% del valor te llega directo a tu cuenta (el 10% es la comisión
          de Pegatina). Para eso necesitás conectar tu cuenta de vendedor.
        </p>

        {mpConectado ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
                <path d="M8 12.5L10.8 15.2L16 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Cuenta conectada
            </span>
            {usuario.mp?.user_id && (
              <span className="text-xs text-muted">
                Usuario MP: {usuario.mp.user_id}
              </span>
            )}
          </div>
        ) : mpOAuthListo ? (
          <Link
            href="/api/mercadopago/connect"
            className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-line bg-secundario px-6 py-3 font-bold text-white nb-lift hover:bg-ink"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M8 12.5L10.8 15.2L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Conectar mi cuenta de Mercado Pago
          </Link>
        ) : (
          <p className="mt-4 rounded-2xl bg-acento/30 px-5 py-4 text-sm font-semibold text-[#a07d00]">
            Muy pronto: la conexión con Mercado Pago se habilita cuando la
            tienda esté en producción. Por ahora el pago es por transferencia.
          </p>
        )}
      </div>
    </div>
  );
}