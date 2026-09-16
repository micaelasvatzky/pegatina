"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import AuthModal from "@/components/AuthModal";
import type { Sticker } from "@/lib/types";

/**
 * "Comprar ahora" (cobalt, con ⚡) del detalle — fiel al ref Stitch.
 * Agrega el sticker al carrito y va directo al checkout.
 * Sin sesión → AuthModal. Si el carrito ya tiene otro artista, abre el
 * carrito para que la persona lo resuelva (regla: un solo artista por carrito).
 */
export default function ComprarAhoraButton({ sticker }: { sticker: Sticker }) {
  const { isLoggedIn, usuario } = useAuth();
  const { add, openCart } = useCart();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  // El ilustrador solo vende — el server ya oculta este botón para el dueño,
  // pero cubrimos el caso de un ilustrador viendo otro sticker.
  if (isLoggedIn && usuario?.rol === "ilustrador") {
    return null;
  }

  function handleClick() {
    if (!isLoggedIn) {
      setShowModal(true);
      return;
    }
    if (usuario?.rol === "ilustrador") return;

    const res = add(sticker, 1);
    if (!res.ok) {
      // Carrito ocupado por otro artista → mostrale qué tiene.
      openCart();
      return;
    }
    router.push("/checkout");
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-line bg-cobalt px-6 py-3.5 font-bold text-white shadow-[3px_3px_0px_var(--color-line)] transition-all hover:bg-cobalt-dark active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_var(--color-line)]"
      >
        <span className="icon text-lg" aria-hidden>
          bolt
        </span>
        Comprar ahora
      </button>

      {showModal && (
        <AuthModal sticker={sticker} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}