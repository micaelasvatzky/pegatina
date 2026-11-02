import { redirect } from "next/navigation";
import { getSession, getUsuarioById } from "@/lib/auth";
import MiPerfilForm from "./MiPerfilForm";

/**
 * Mi perfil — datos REALES del ilustrador logueado.
 * Header con la identidad de la tienda + form editable (PATCH /api/usuarios/me)
 * + información de cobros centralizados y liquidaciones de Pegatina.
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

  return (
    <div className="mx-auto max-w-2xl">
      {mp === "conectado" && (
        <p className="mb-6 flex items-center gap-3 rounded-2xl bg-green-100 px-5 py-4 text-sm font-semibold text-green-800">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
            <path d="M8 12.5L10.8 15.2L16 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Cuenta de Mercado Pago conectada. Pegatina recibe los pagos, retiene
          el 10% de comisión y te transfiere el 90% cada 15 días mediante
          una liquidación manual.
        </p>
      )}
      {mp === "error" && (
        <p className="mb-6 flex items-center gap-3 rounded-2xl bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          No pudimos conectar tu cuenta de Mercado Pago. Podés seguir vendiendo:
          Pegatina recibe los pagos y te transfiere el 90% cada 15 días.
        </p>
      )}

      <h1 className="mb-8 text-4xl font-bold text-ink">Mi perfil</h1>

      <div className="min-w-0 rounded-2xl border-2 border-line bg-card p-4 sm:p-8 nb-shadow-md">
        {/* Identidad */}
        <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
          {usuario.foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={usuario.foto}
              alt={usuario.nombre}
              className="h-24 w-24 shrink-0 rounded-full border-2 border-line object-cover shadow-[2px_2px_0px_var(--color-line)]"
            />
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2 border-line bg-primario text-4xl font-bold text-white shadow-[2px_2px_0px_var(--color-line)]">
              {inicial}
            </div>
          )}
          <div className="min-w-0">
            <p className="break-all text-2xl font-bold text-ink">
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

      {/* Cobros centralizados */}
      <div className="mt-8 rounded-2xl border-2 border-line bg-card p-4 sm:p-8 nb-shadow-md">
        <h2 className="text-lg font-bold text-ink">Cómo cobrás tus ventas</h2>
        <p className="mt-1 text-sm text-muted">
          Pegatina recibe los pagos de tus ventas y retiene el 10% de comisión.
          Te transferimos el 90% cada 15 días mediante una liquidación manual.
        </p>
      </div>
    </div>
  );
}
