import CheckoutForm from "./CheckoutForm";
import ColorBlobs from "@/components/ColorBlobs";

/**
 * Checkout — datos de envío + confirmación de compra.
 * (El proxy ya garantiza sesión activa: sin login → /login?redirect=/checkout.)
 */
export default function CheckoutPage() {
  return (
    <div>
      {/* Header con color (sistema de la landing) */}
      <section className="relative overflow-hidden border-b-2 border-line bg-primario px-4 py-10 md:px-6">
        <ColorBlobs />
        <div className="relative z-10 mx-auto max-w-5xl">
          <h1 className="font-display text-4xl font-black uppercase leading-none tracking-tight text-white md:text-6xl">
            Finalizar compra
          </h1>
          <p className="mt-2 font-bold text-white/85">
            Contanos a dónde llega tu pedido 📦
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 pb-20 pt-10 md:px-6">
        <CheckoutForm />
      </div>
    </div>
  );
}