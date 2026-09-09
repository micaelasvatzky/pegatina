import { redirect } from "next/navigation";
import { getSession, getUsuarioById } from "@/lib/auth";
import MiPerfilForm from "./MiPerfilForm";

/**
 * Mi perfil — datos REALES del ilustrador logueado.
 * Header con la identidad de la tienda + form editable (PATCH /api/usuarios/me).
 */
export const dynamic = "force-dynamic";

export default async function MiPerfilPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const usuario = await getUsuarioById(session.sub);
  if (!usuario) redirect("/login");

  const inicial = usuario.nombre.charAt(0).toUpperCase();
  const sinHandle = !usuario.usuario;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-8 text-4xl font-bold text-ink">Mi perfil</h1>

      <div className="rounded-2xl border border-line bg-white p-8 shadow-sm">
        {/* Identidad */}
        <div className="mb-8 flex items-center gap-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primario text-4xl font-bold text-white">
            {inicial}
          </div>
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
          }}
          handle={usuario.usuario ?? null}
        />
      </div>
    </div>
  );
}