import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

/**
 * Layout del área de ilustrador (Dashboard).
 * Navbar arriba + Sidebar a la izquierda + contenido.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 bg-crema p-8">{children}</main>
      </div>
    </div>
  );
}
