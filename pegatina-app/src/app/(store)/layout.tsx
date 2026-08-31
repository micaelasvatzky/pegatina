import Navbar from "@/components/Navbar";

/**
 * Layout del área pública de compra (store).
 * Incluye el Navbar global y una sección de pie de página.
 */
export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-line bg-white py-8 text-center text-sm text-muted">
        <span className="font-display text-xl text-ink">Pegatina</span>
        <p>Arte local original, directo de la ilustradora a tu puerta.</p>
      </footer>
    </div>
  );
}
