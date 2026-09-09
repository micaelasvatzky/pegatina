"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

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
    <div className="mx-auto flex max-w-lg flex-col items-center py-16">
      <div className="w-full rounded-xl border border-line bg-white p-6 shadow-sm md:p-10">
        <h1 className="mb-2 text-4xl font-bold text-ink">Abrí tu tienda</h1>
        <p className="mb-8 text-muted">
          Vende tus stickers. No pagás nada por tener tu tienda activa.
        </p>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
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
            <p className="mt-1 text-xs text-muted">
              Sin espacios, letras/números/_. Va a ser la URL pública de tu
              tienda: pegatina.com/artista/matesconmili
            </p>
          </div>
          <div>
            <label className="mb-2 block text-[17px] capitalize text-ink">
              Contraseña
            </label>
            <input
              type="password"
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
            className="mt-2 w-full rounded-full bg-primario py-4 text-[20px] font-bold text-white transition-colors hover:bg-ink disabled:opacity-60"
          >
            {submitting ? "Creando..." : "Crear mi tienda"}
          </button>
        </form>

        <p className="mt-6 text-center text-muted">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-primario underline">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
