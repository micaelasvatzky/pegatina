/**
 * Helper para leer el mensaje de un error capturado.
 *
 * TypeScript tipa los `catch` como `unknown` (no `any`), así que no se puede
 * acceder a `.message` sin chequear. Esto centraliza ese chequeo para no
 * repetirlo en cada API route.
 */
export function mensajeDeError(err: unknown, fallback = "error"): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (err && typeof err === "object" && "message" in err) {
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === "string" && msg) return msg;
  }
  return fallback;
}
