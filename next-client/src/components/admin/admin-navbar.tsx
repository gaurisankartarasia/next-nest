"use client";

import { Shield, UserCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAppSelector } from "@/lib/redux/store";
import { cn } from "@/lib/utils";

export function AdminNavbar() {
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);

  const isCreateOrEdit =
    pathname === "/admin/users/create" || pathname === "/admin/users/edit";
  const isUsers =
    pathname === "/admin/users" || pathname.startsWith("/admin/users/");

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/95 px-4 transition-all sm:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/admin" />}>
                Admin
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {isCreateOrEdit ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink render={<Link href="/admin/users" />}>
                    Users
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>User Form</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            ) : (
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {isUsers ? "Users Directory" : "Overview"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="hidden sm:flex items-center gap-2">
          <Badge variant="secondary" className="text-[11px] gap-1 font-mono">
            <Shield className="size-3 text-primary" />
            <span>{user?.role || "ADMIN"}</span>
          </Badge>
        </div>

        <Link
          href="/"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-8 gap-1.5 text-xs font-medium",
          )}
        >
          <UserCheck className="size-3.5 text-primary" />
          <span className="hidden sm:inline">My Profile</span>
        </Link>
      </div>
    </header>
  );
}
