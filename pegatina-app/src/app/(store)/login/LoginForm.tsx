"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import RoleModal from "@/components/RoleModal";

/**
 * Formulario de login real de Pegatina.
 * Client component: usa useSearchParams para leer ?redirect.
 * Llama a POST /api/auth/login y redirige según ?redirect o el rol.
 */
export default function LoginForm({ demoMode = false }: { demoMode?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const { login, demoLogin } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [demoSubmitting, setDemoSubmitting] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await login(email, password);

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    // Redirigir según el destino pedido o el rol del usuario logueado.
    const rol = result.usuario?.rol;
    if (redirect) {
      router.push(redirect);
    } else if (rol === "ilustrador") {
      router.push("/dashboard");
    } else {
      // El comprador va directo al catálogo (no a la home).
      router.push("/catalogo");
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setDemoSubmitting(true);

    const result = await demoLogin();

    if (result.error) {
      setError(result.error);
      setDemoSubmitting(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-16 md:px-6">
      <div className="grid w-full overflow-hidden rounded-2xl border border-line shadow-sm md:grid-cols-2">
        {/* Formulario */}
        <div className="bg-white p-6 md:p-10">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-ink">Iniciar sesión</h1>
            <p className="text-muted">
              ¿No tenés cuenta?{" "}
              <button
                onClick={() => setShowRoleModal(true)}
                className="font-medium text-primario underline"
              >
                Creala gratis
              </button>
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="mb-2 block text-[17px] text-ink">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full border border-line bg-white px-5 py-3 text-[17px] focus:border-primario focus:outline-none"
                placeholder="tu@email.com"
              />
            </div>

            <div className="mb-2">
              <label className="mb-2 block text-[17px] text-ink">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-full border border-line bg-white px-5 py-3 text-[17px] focus:border-primario focus:outline-none"
                placeholder="••••••"
              />
            </div>

            <p className="mb-6 mt-2 text-right">
              <span className="cursor-pointer text-[17px] text-primario underline">
                ¿Olvidaste tu contraseña?
              </span>
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-primario py-4 text-[20px] font-bold text-white transition-colors hover:bg-ink disabled:opacity-60"
            >
              {submitting ? "Ingresando..." : "Entrar"}
            </button>
          </form>

          {/* Links a signups por rol */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/signup/comprador${redirect ? `?redirect=${redirect}` : ""}`}
              className="flex-1 rounded-full border border-line py-3 text-center font-medium text-ink transition-colors hover:bg-crema"
            >
              Soy comprador
            </Link>
            <Link
              href="/signup/ilustrador"
              className="flex-1 rounded-full border border-primario bg-primario/5 py-3 text-center font-medium text-primario transition-colors hover:bg-primario/10"
            >
              Soy ilustrador
            </Link>
          </div>

          {/* Acceso demo: SOLO con DEMO_MODE=true en desarrollo */}
          {demoMode && (
            <div className="mt-6">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-px flex-1 bg-line" />
                <span className="text-xs font-medium uppercase tracking-wide text-muted">
                  solo desarrollo
                </span>
                <span className="h-px flex-1 bg-line" />
              </div>
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={demoSubmitting}
                className="w-full rounded-full border-2 border-dashed border-acento bg-acento/10 py-4 text-[20px] font-bold text-ink transition-colors hover:bg-acento/20 disabled:opacity-60"
              >
                {demoSubmitting ? (
                  "Entrando..."
                ) : (
                  <>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="inline-block align-[-4px]">
                      <path d="M4 20C4 20 4.5 15 9 12C13.5 9 18 5 20 4C21 7.5 17 13 13 17.5C10.5 20 4 20 4 20Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M4 20L10 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>{" "}
                    Entrar como ilustrador demo
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Lado derecho - ilustración decorativa */}
        <div className="flex items-center justify-center bg-primario p-10">
          <div className="flex flex-col items-center gap-4 text-center">
            <svg width="88" height="88" viewBox="0 0 24 24" fill="none" className="text-white/90">
              <path d="M12 3L15 6H19V10L22 13L19 16V20H15L12 23L9 20H5V16L2 13L5 10V6H9L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p className="text-3xl font-bold text-white">Pegatina</p>
            <p className="max-w-xs text-base text-white/80">
              Tu marketplace de stickers de artistas argentinos
            </p>
          </div>
        </div>
      </div>

      {showRoleModal && (
        <RoleModal onClose={() => setShowRoleModal(false)} />
      )}
    </div>
  );
}