"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface Props {
  initial: { nombre: string; email: string; bio: string | null; foto: string | null };
  handle: string | null;
}

/**
 * Formulario REAL de edición del perfil del ilustrador.
 * PATCHea /api/usuarios/me y refresca el AuthContext para que
 * navbar/sidebar muestren los datos nuevos al instante.
 * El @handle es identidad: no se puede editar.
 */
export default function MiPerfilForm({ initial, handle }: Props) {
  const { refreshMe } = useAuth();
  const [nombre, setNombre] = useState(initial.nombre);
  const [email, setEmail] = useState(initial.email);
  const [bio, setBio] = useState(initial.bio ?? "");
  const [foto, setFoto] = useState(initial.foto ?? "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Sube la foto desde la computadora al instante (POST /api/upload →
   * Cloudinary). El Guardar cambios guarda la URL que quedó en `foto`.
   */
  const subirFoto = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    setSuccess(false);
    setSubiendoFoto(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "perfiles");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No pudimos subir la foto.");
        return;
      }
      setFoto(data.url as string);
    } catch {
      setError("Hubo un error de conexión al subir la foto.");
    } finally {
      setSubiendoFoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);
    try {
      const res = await fetch("/api/usuarios/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, bio, foto }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No pudimos guardar los cambios.");
        return;
      }
      await refreshMe();
      setSuccess(true);
    } catch {
      setError("Hubo un error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "h-[46px] w-full rounded-full border border-line px-5 text-ink focus:border-primario focus:outline-none bg-white";

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {/* Foto de perfil */}
      <div className="sm:col-span-2">
        <label className="mb-2 block text-sm font-semibold text-ink">
          Foto de perfil
        </label>
        <div className="flex items-center gap-4">
          {foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={foto}
              alt="Foto de perfil"
              className="h-16 w-16 shrink-0 rounded-full border-2 border-line object-cover shadow-[2px_2px_0px_var(--color-line)]"
            />
          ) : (
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-line bg-crema text-2xl font-black text-muted">
              {(nombre || "P").charAt(0).toUpperCase()}
            </span>
          )}
          <div className="flex flex-wrap gap-2">
            <label
              className={`inline-flex h-[46px] cursor-pointer items-center gap-2 rounded-full border-2 border-line bg-white px-5 font-bold text-ink transition-colors hover:bg-crema ${subiendoFoto ? "pointer-events-none opacity-50" : ""}`}
            >
              {subiendoFoto ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />
                  Subiendo...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M4 16L8 12L12 15.5L16 11.5L20 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 20H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <circle cx="8.5" cy="7.5" r="1.8" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M12 4L12 2M17 5L18.5 3.5M6 5L4.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  Subir foto desde mi compu
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => subirFoto(e.target.files?.[0])}
              />
            </label>
            {foto && (
              <button
                type="button"
                onClick={() => setFoto("")}
                className="h-[46px] rounded-full border-2 border-line bg-white px-4 text-sm font-bold text-muted transition-colors hover:bg-red-50 hover:text-red-600"
              >
                Quitar
              </button>
            )}
          </div>
        </div>
        <p className="mt-1.5 text-xs text-muted">
          Se muestra en tu tienda pública y junto a tus stickers. PNG o JPG de
          hasta 5 MB, elegila desde tu computadora.
        </p>
      </div>

      {/* Handle — identidad, solo lectura */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-ink">
          Tu @usuario
        </label>
        <div className="flex h-[46px] items-center rounded-full border border-line bg-crema/60 px-5 text-ink/70">
          {handle ? `@${handle.replace(/^@/, "")}` : "Sin handle"}
        </div>
        <p className="mt-1.5 text-xs text-muted">
          Es tu identidad pública y no se puede cambiar.
        </p>
      </div>

      {/* Nombre */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-ink">
          Nombre
        </label>
        <input
          className={inputClass}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          minLength={2}
        />
      </div>

      {/* Email */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-ink">
          Email
        </label>
        <input
          type="email"
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      {/* Bio */}
      <div className="sm:col-span-2">
        <label className="mb-2 block text-sm font-semibold text-ink">
          Bio
        </label>
        <textarea
          className="w-full resize-none rounded-2xl border border-line px-5 py-3 text-ink focus:border-primario focus:outline-none bg-white"
          rows={3}
          maxLength={300}
          placeholder="Contanos quién sos, qué te inspira..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        <p className="mt-1 text-right text-xs text-muted">{bio.length}/300</p>
      </div>

      {/* Mensajes */}
      {error && (
        <p className="rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 sm:col-span-2">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700 sm:col-span-2">
          ¡Perfil actualizado!
        </p>
      )}

      {/* Guardar */}
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full border-2 border-line bg-primario py-3.5 text-lg font-bold text-white transition-colors hover:bg-ink disabled:opacity-50 nb-shadow-sm nb-lift"
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}