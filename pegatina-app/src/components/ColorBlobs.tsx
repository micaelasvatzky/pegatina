/**
 * Blobs decorativos de la paleta (naranja/amarillo/azul) para dar color de
 * fondo a secciones — mismo sistema que la landing.
 *
 * Uso: dentro de un contenedor `relative overflow-hidden`. El contenido que
 * va "por encima" necesita `relative z-10` (o `z-10` en su wrapper).
 * Server component: no tiene interactividad.
 */
export default function ColorBlobs() {
  return (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-acento/50 blur-3xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-20 top-1/4 h-80 w-80 rounded-full bg-secundario/20 blur-3xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-primario/20 blur-3xl"
      />
    </>
  );
}