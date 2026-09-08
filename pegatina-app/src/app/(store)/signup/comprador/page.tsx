import { Suspense } from "react";
import SignupCompradorForm from "./SignupCompradorForm";

/**
 * Registro de COMPRADOR.
 * Server component: envuelve el formulario (que usa useSearchParams)
 * en un <Suspense> para que el prerendering del build no rompa.
 */
export default function SignupCompradorPage() {
  return (
    <Suspense>
      <SignupCompradorForm />
    </Suspense>
  );
}