import Link from "next/link";

/**
 * Registro / Signup de COMPRADOR.
 * Datos de quien quiere comprar stickers.
 */
export default function SignupCompradorPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center py-16">
      <div className="w-full rounded-xl border border-line bg-white p-10 shadow-sm">
        <h1 className="mb-2 text-4xl font-bold text-ink">
          Crear cuenta
        </h1>
        <p className="mb-8 text-muted">Comprá arte local original.</p>

        <form className="flex flex-col gap-5">
          <div>
            <label className="mb-2 block text-[17px] capitalize text-ink">
              Nombre completo
            </label>
            <input
              type="text"
              className="w-full rounded-full border border-line bg-white px-5 py-3 focus:border-primario focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-[17px] capitalize text-ink">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-full border border-line bg-white px-5 py-3 focus:border-primario focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-[17px] capitalize text-ink">
              Contraseña
            </label>
            <input
              type="password"
              className="w-full rounded-full border border-line bg-white px-5 py-3 focus:border-primario focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-[17px] capitalize text-ink">
              Dirección de envío
            </label>
            <input
              type="text"
              className="w-full rounded-full border border-line bg-white px-5 py-3 focus:border-primario focus:outline-none"
            />
          </div>

          <button className="mt-2 w-full rounded-full bg-primario py-4 text-[20px] font-semibold text-white transition-colors hover:bg-ink">
            Crear cuenta
          </button>
        </form>

        <p className="mt-6 text-center text-muted">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="underline">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
