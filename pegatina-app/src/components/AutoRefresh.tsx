"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Refresca la página server cada `intervaloMs` para que el comprador vea el
 * estado del pedido actualizarse solo (sin F5). router.refresh() re-renderiza
 * el server component manteniendo el estado del navegador (sin parpadeo).
 * No refresca si la pestaña no está visible (ahorra requests).
 */
export default function AutoRefresh({ intervaloMs = 20000 }: { intervaloMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    }, intervaloMs);
    return () => clearInterval(id);
  }, [router, intervaloMs]);

  return null;
}