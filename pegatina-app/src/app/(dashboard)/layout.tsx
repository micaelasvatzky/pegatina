import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

/**
 * Layout del área de ilustrador (Dashboard).
 * Navbar en modo dashboard (sin carrito ni Explorar) + Sidebar + contenido.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar mode="dashboard" />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-crema p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}