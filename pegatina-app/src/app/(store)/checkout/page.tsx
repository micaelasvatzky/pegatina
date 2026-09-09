import CheckoutForm from "./CheckoutForm";

/**
 * Checkout — datos de envío + confirmación de compra.
 * (El proxy ya garantiza sesión activa: sin login → /login?redirect=/checkout.)
 */
export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-10 md:px-6">
      <h1 className="mb-8 text-3xl font-bold text-ink md:text-4xl">
        Finalizar compra
      </h1>
      <CheckoutForm />
    </div>
  );
}