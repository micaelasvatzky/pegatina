"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { Sticker } from "@/lib/types";
import RoleModal from "@/components/RoleModal";

/**
 * Modal que aparece al intentar agregar al carrito sin estar logueado.
 * Redirige al login con ?redirect= para volver al sticker tras autenticarse.
 * Si quieren crear cuenta, abre el RoleModal para elegir tipo de usuario.
 */
export default function AuthModal({
  sticker,
  onClose,
}: {
  sticker: Sticker | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [showRoleModal, setShowRoleModal] = useState(false);

  if (!sticker) return null;

  const redirect = encodeURIComponent(pathname);

  const goLogin = () => {
    onClose();
    router.push(`/login?redirect=${redirect}`);
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center">
        {/* Overlay */}
        <div className="absolute inset-0 bg-ink/50 backdrop-blur-sm" onClick={onClose} />

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
                <path d="M6 8H18M6 8H3V21H21V8H18M6 8V6C6 4.5 7 3 9 3C9 3 10.5 3 12 5.5C13.5 3 15 3 15 3C17 3 18 4.5 18 6V8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <h2 className="mt-2 text-2xl font-bold text-ink">
              Iniciá sesión para comprar
            </h2>
            <p className="mt-1 text-muted">{sticker.nombre}</p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={goLogin}
              className="w-full rounded-full bg-primario py-3.5 font-bold text-white transition-colors hover:bg-ink"
            >
              Ingresá
            </button>
            <p className="text-center text-sm text-muted">
              ¿No tenés cuenta?{" "}
              <button
                onClick={() => setShowRoleModal(true)}
                className="font-medium text-primario underline"
              >
                Creala gratis
              </button>
            </p>
            <button
              onClick={onClose}
              className="mt-1 text-sm text-muted underline hover:text-ink"
            >
              Seguir mirando
            </button>
          </div>
        </div>
      </div>

      {showRoleModal && (
        <RoleModal onClose={() => setShowRoleModal(false)} redirect={pathname} />
      )}
    </>
  );
}
