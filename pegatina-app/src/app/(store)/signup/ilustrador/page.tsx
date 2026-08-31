import Link from "next/link";

/**
 * Registro / Signup de ILUSTRADOR.
 * Datos de quien quiere abrir su tienda y vender stickers.
 */
export default function SignupIlustradorPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center py-16">
      <div className="w-full rounded-xl border border-line bg-white p-10 shadow-sm">
        <h1 className="mb-2 text-4xl font-bold text-ink">
          Abrí tu tienda
        </h1>
        <p className="mb-8 text-muted">
          Vende tus stickers. No pagás nada por tener tu tienda activa.
        </p>

        <form className="flex flex-col gap-5">
          <div>
            <label className="mb-2 block text-[17px] capitalize text-ink">
              Nombre de usuario
            </label>
            <input
              type="text"
              placeholder="@loremipsum"
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
              Nombre de tu tienda
            </label>
            <input
              type="text"
              className="w-full rounded-full border border-line bg-white px-5 py-3 focus:border-primario focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-[17px] capitalize text-ink">
              Descripción de tu tienda
            </label>
            <textarea
              rows={3}
              className="w-full rounded-3xl border border-line bg-white px-5 py-3 focus:border-primario focus:outline-none"
            />
          </div>

          <button className="mt-2 w-full rounded-full bg-primario py-4 text-[20px] font-semibold text-white transition-colors hover:bg-ink">
            Crear mi tienda
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
