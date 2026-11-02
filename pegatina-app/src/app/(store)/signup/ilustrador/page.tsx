"use client";
import PasswordInput from "@/components/PasswordInput";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ColorBlobs from "@/components/ColorBlobs";

/**
 * Registro de ILUSTRADOR.
 * Crea la cuenta con rol="ilustrador" y redirige al dashboard.
 */
export default function SignupIlustradorPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usuario, setUsuario] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await signup({
      nombre,
      email,
      password,
      rol: "ilustrador",
      usuario,
    });

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="relative overflow-hidden px-5 py-8 sm:px-6 sm:py-12">
      <ColorBlobs />
      <div className="relative z-10 mx-auto flex max-w-md flex-col items-center">
        <div className="w-full min-w-0 rounded-2xl border-2 border-line bg-card p-5 nb-shadow-md sm:p-7">
        <h1 className="mb-2 text-3xl font-bold text-ink">Abrí tu tienda</h1>
        <p className="mb-5 text-sm text-muted">
          Vendé tus stickers sin costo por publicar: Pegatina retiene el 10%
          solo cuando vendés y te transfiere el 90% cada 15 días.
        </p>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-[17px] capitalize text-ink">
              Nombre
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full rounded-full border border-line bg-white px-5 py-3 focus:border-primario focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-[17px] capitalize text-ink">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-full border border-line bg-white px-5 py-3 focus:border-primario focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-[17px] capitalize text-ink">
              @usuario (el nombre de tu tienda)
            </label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={24}
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="w-full rounded-full border border-line bg-white px-5 py-3 focus:border-primario focus:outline-none"
              placeholder="ej: matesconmili"
            />
            <p className="mt-1 break-words text-xs text-muted">
              Sin espacios, letras/números/_. Va a ser la URL pública de tu
              tienda: pegatina.com/artista/matesconmili
            </p>
          </div>
          <div>
            <label htmlFor="ilustrador-password" className="mb-2 block text-[17px] capitalize text-ink">
              Contraseña
            </label>
            <PasswordInput
              id="ilustrador-password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-full border border-line bg-white px-5 py-3 focus:border-primario focus:outline-none"
            />
            <p className="mt-1 text-xs text-muted">Mínimo 6 caracteres.</p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 w-full rounded-full border-2 border-line bg-primario py-3 text-base font-bold text-white transition-colors hover:bg-ink disabled:opacity-60 nb-shadow-sm nb-lift"
          >
            {submitting ? "Creando..." : "Crear mi tienda"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-primario underline">
            Iniciá sesión
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
}
