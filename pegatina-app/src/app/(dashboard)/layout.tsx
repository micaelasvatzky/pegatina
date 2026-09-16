import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ColorBlobs from "@/components/ColorBlobs";

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
        <main className="relative flex-1 overflow-hidden bg-crema p-4 md:p-8">
          <ColorBlobs />
          <div className="relative z-10">{children}</div>
        </main>
      </div>
    </div>
  );
}