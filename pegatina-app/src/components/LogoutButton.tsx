"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * Botón de cerrar sesión con confirmación.
 * Sirve para el perfil del comprador (store).
 */
export default function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { logout } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
    } finally {
      // El carrito se vacía solo al cambiar la identidad (ver CartContext).
      router.push("/login");
    }
  };

  const buttonStyles = `rounded-full border-2 border-red-600 bg-card font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50 ${compact ? "px-3 py-1.5 text-xs" : "px-5 py-2 text-sm"}`;

  return (
    <div className={`flex gap-2 ${compact ? "flex-col items-stretch" : "flex-col items-stretch sm:flex-row sm:items-center"}`}>
      {confirming ? (
        <>
          <button
            onClick={handleLogout}
            disabled={loading}
            className={buttonStyles}
          >
            {loading ? "Saliendo..." : "Sí, salir"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            disabled={loading}
            className={`rounded-full border-2 border-line bg-card font-semibold text-muted transition hover:text-ink disabled:opacity-50 ${compact ? "px-3 py-1.5 text-xs" : "px-5 py-2 text-sm"}`}
          >
            Cancelar
          </button>
        </>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className={buttonStyles}
        >
          Cerrar sesión
        </button>
      )}
    </div>
  );
}
