import type { Metadata } from "next";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminNavbar } from "@/components/admin/admin-navbar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const instant = false;

export const metadata: Metadata = {
  title: "Admin | NestNeXt",
  description: "User directory and administration.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <SidebarProvider defaultOpen={true}>
        <AdminSidebar />
        <SidebarInset className="flex flex-col min-h-svh">
          <AdminNavbar />
          <div className="flex-1 overflow-auto bg-muted/20">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </AdminGuard>
  );
}
