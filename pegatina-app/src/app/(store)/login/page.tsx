import { Suspense } from "react";
import LoginForm from "./LoginForm";

/**
 * Login real de Pegatina.
 * Server component: envuelve el formulario (que usa useSearchParams)
 * en un <Suspense> para que el prerendering del build no rompa.
 * Le pasa demoMode al form solo si DEMO_MODE=true (desarrollo).
 */
export default function LoginPage() {
  const demoMode = process.env.DEMO_MODE === "true";
  return (
    <Suspense>
      <LoginForm demoMode={demoMode} />
    </Suspense>
  );
}