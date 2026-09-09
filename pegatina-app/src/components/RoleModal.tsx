"use client";

import { useRouter, useSearchParams } from "next/navigation";

/**
 * Modal que pregunta qué tipo de cuenta (Comprador o Ilustrador)
 * va a crear la persona, antes de mandarla al formulario de registro.
 *
 * Soporta un `redirect` opcional por prop (para no perder el destino
 * cuando se abre desde otro modal, ej: el de agregar al carrito).
 */

export default function RoleModal({
  onClose,
  redirect,
}: {
  onClose: () => void;
  redirect?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = redirect ?? searchParams.get("redirect") ?? "";

  const go = (tipo: "comprador" | "ilustrador") => {
    const base =
      tipo === "comprador"
        ? "/signup/comprador"
        : "/signup/ilustrador";
    onClose();
    router.push(
      redirectTo ? `${base}?redirect=${encodeURIComponent(redirectTo)}` : base
    );
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative z-10 mx-4 w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <button
          aria-label="Cerrar"
          onClick={onClose}
          className="absolute right-4 top-4 text-muted hover:text-ink"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        <div className="mb-6 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primario/10 text-primario">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L15 6H19V10L22 13L19 16V20H15L12 23L9 20H5V16L2 13L5 10V6H9L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <h2 className="mt-2 text-2xl font-bold text-ink">
            ¿Qué tipo de cuenta querés?
          </h2>
          <p className="mt-1 text-muted">Elegí para armar tu cuenta como corresponde.</p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => go("comprador")}
            className="flex w-full items-center gap-4 rounded-2xl border border-line bg-white p-4 text-left transition-colors hover:border-primario hover:bg-primario/5"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primario/10 text-primario">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M3 7H21V21H3V7Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 10V5.5C8 3.5 10 2 12 2C14 2 16 3.5 16 5.5V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <span>
              <span className="block font-bold text-ink">Comprador</span>
              <span className="block text-sm text-muted">
                Comprá arte local original
              </span>
            </span>
          </button>

          <button
            onClick={() => go("ilustrador")}
            className="flex w-full items-center gap-4 rounded-2xl border border-line bg-white p-4 text-left transition-colors hover:border-primario hover:bg-primario/5"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primario/10 text-primario">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M4 20C4 20 4.5 15 9 12C13.5 9 18 5 20 4C21 7.5 17 13 13 17.5C10.5 20 4 20 4 20Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 20L10 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <span>
              <span className="block font-bold text-ink">Ilustrador</span>
              <span className="block text-sm text-muted">
                Abrí tu tienda y vendé tus stickers
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
