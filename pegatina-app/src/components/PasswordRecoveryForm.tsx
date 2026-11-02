"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import PasswordInput from "@/components/PasswordInput";

export default function PasswordRecoveryForm({ token }: { token?: string }) {
  const reset = token !== undefined;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputClass = "w-full rounded-full border border-line bg-white px-5 py-3 focus:border-primario focus:outline-none";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (reset && password !== confirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`/api/auth/${reset ? "reset-password" : "forgot-password"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reset ? { token, password } : { email }),
        signal: AbortSignal.timeout(20000),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "No pudimos completar la solicitud. Intentá de nuevo.");
        return;
      }
      setDone(true);
    } catch {
      setError("No pudimos conectar con el servidor. Intentá de nuevo en unos segundos.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="rounded-2xl border-2 border-line bg-card p-6 nb-shadow-md md:p-10">
        <h1 className="mb-3 text-3xl font-bold text-ink">
          {reset ? "Elegí tu nueva contraseña" : "Recuperá tu contraseña"}
        </h1>
        {done ? (
          <p role="status" className="rounded-xl bg-mint p-4 text-ink">
            {reset
              ? "¡Listo! Cambiaste tu contraseña. Ya podés iniciar sesión con la nueva."
              : "Si hay una cuenta con ese email, te vamos a enviar un enlace para cambiar la contraseña. Revisá también la carpeta de spam. El enlace dura 30 minutos. Si ya lo pediste, esperá un minuto antes de volver a intentarlo."}
          </p>
        ) : (
          <>
            <p className="mb-6 text-muted">
              {reset ? "Usá entre 6 y 72 caracteres." : "Ingresá el email de tu cuenta y te enviamos un enlace para cambiarla."}
            </p>
            {error && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
            <form onSubmit={submit} className="flex flex-col gap-5">
              {reset ? (
                <>
                  <div>
                    <label htmlFor="new-password" className="mb-2 block text-ink">Nueva contraseña</label>
                    <PasswordInput id="new-password" autoComplete="new-password" required minLength={6} maxLength={72} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className="mb-2 block text-ink">Repetí la contraseña</label>
                    <PasswordInput id="confirm-password" autoComplete="new-password" required minLength={6} maxLength={72} value={confirmation} onChange={(e) => setConfirmation(e.target.value)} className={inputClass} />
                  </div>
                </>
              ) : (
                <div>
                  <label htmlFor="recovery-email" className="mb-2 block text-ink">Email</label>
                  <input id="recovery-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                </div>
              )}
              <button disabled={submitting} className="rounded-full border-2 border-line bg-primario px-6 py-3 font-bold text-white nb-shadow-sm hover:bg-ink disabled:opacity-60">
                {submitting ? "Procesando..." : reset ? "Guardar contraseña" : "Enviar enlace"}
              </button>
            </form>
            {reset && <Link href="/recuperar-contrasena" className="mt-5 block text-primario underline">Pedir un enlace nuevo</Link>}
          </>
        )}
        <Link href="/login" className="mt-6 block text-center text-primario underline">Volver a iniciar sesión</Link>
      </div>
    </div>
  );
}
