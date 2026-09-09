"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

/**
 * Botón de cerrar sesión con confirmación.
 * Sirve para el perfil del comprador (store).
 */
export default function LogoutButton() {
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

  const confirmStyles = confirming
    ? "bg-red-600 text-white hover:bg-red-700"
    : "border border-line bg-white text-ink hover:border-red-300 hover:text-red-600";

  return (
    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
      {confirming ? (
        <>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="rounded-full bg-red-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Saliendo..." : "Sí, salir"}
          </button>
          <button
            onClick={() => setConfirming(false)}
            disabled={loading}
            className="rounded-full border border-line bg-white px-5 py-2 text-sm font-semibold text-muted transition hover:text-ink disabled:opacity-50"
          >
            Cancelar
          </button>
        </>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className={`rounded-full px-5 py-2 text-sm font-bold transition ${confirmStyles}`}
        >
          Cerrar sesión
        </button>
      )}
    </div>
  );
}