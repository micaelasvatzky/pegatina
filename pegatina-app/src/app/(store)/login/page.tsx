import Link from "next/link";

/**
 * Login compartido para comprador e ilustrador.
 * Tras autenticarse, el rol decide la redirección.
 */
export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-6xl items-center justify-center py-16">
      <div className="grid w-full overflow-hidden rounded-xl border border-line shadow-sm md:grid-cols-2">
        {/* Formulario */}
        <div className="bg-white p-10">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-ink">Login</h1>
            <p className="text-muted">
              Do not have an account,{" "}
              <span className="underline">create a new one.</span>
            </p>
          </div>

          {/* Email */}
          <div className="mb-6">
            <label className="mb-2 block text-[17px] capitalize text-ink">
              Enter Your Email or Phone
            </label>
            <input
              type="email"
              className="w-full rounded-full border border-line bg-white px-5 py-3 text-[17px] focus:border-primario focus:outline-none"
              placeholder="michael.joe@xmail.com"
            />
          </div>

          {/* Password */}
          <div className="mb-2">
            <label className="mb-2 block text-[17px] capitalize text-ink">
              Enter Your Password
            </label>
            <div className="flex items-center justify-between gap-2 rounded-full border border-line bg-white px-5 py-2">
              <input
                type="password"
                className="w-full bg-transparent text-[17px] focus:outline-none"
                placeholder="••••••"
              />
              <button aria-label="Mostrar contraseña" className="text-muted">
                👁
              </button>
            </div>
          </div>

          <p className="mb-6 mt-2 text-right">
            <span className="cursor-pointer text-[17px] capitalize text-ink underline">
              Forgot Your Password
            </span>
          </p>

          <button className="w-full rounded-full bg-ink py-4 text-[22px] font-semibold text-white transition-colors hover:bg-primario">
            Login
          </button>

          {/* Links a signups por rol */}
          <div className="mt-8 flex gap-2">
            <Link
              href="/signup/comprador"
              className="flex-1 rounded-full border border-line py-3 text-center hover:bg-crema"
            >
              Soy comprador
            </Link>
            <Link
              href="/signup/ilustrador"
              className="flex-1 rounded-full border border-line py-3 text-center hover:bg-crema"
            >
              Soy ilustrador
            </Link>
          </div>
        </div>

        {/* Imagen lado derecho */}
        <div className="bg-neutral-300" />
      </div>
    </div>
  );
}
