import { Suspense } from "react";
import LoginForm from "./LoginForm";

/**
 * Login real de Pegatina.
 * Server component: envuelve el formulario (que usa useSearchParams)
 * en un <Suspense> para que el prerendering del build no rompa.
 */
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}