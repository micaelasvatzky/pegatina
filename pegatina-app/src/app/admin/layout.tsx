import Navbar from "@/components/Navbar";
import ColorBlobs from "@/components/ColorBlobs";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar mode="dashboard" />
      <div className="flex flex-1 flex-col md:flex-row">
        <AdminSidebar />
        <main className="relative flex-1 overflow-hidden bg-crema p-4 md:p-8">
          <ColorBlobs />
          <div className="relative z-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
