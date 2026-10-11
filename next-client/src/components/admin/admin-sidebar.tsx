"use client";

import {
  ArrowLeft,
  Database,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { useLogoutMutationMutation } from "@/lib/redux/api/authApi";
import { logout } from "@/lib/redux/slices/authSlice";
import { useAppDispatch, useAppSelector } from "@/lib/redux/store";

export function AdminSidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [logoutMutation, { isLoading: isLoggingOut }] =
    useLogoutMutationMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch {
      // Clear local credentials on network/server error
    } finally {
      dispatch(logout());
    }
  };

  const isOverviewActive = pathname === "/admin";
  const isUsersActive =
    pathname === "/admin/users" || pathname.startsWith("/admin/users/");

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "A";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      {/* Sidebar Header / Brand */}
      <SidebarHeader className="border-b border-sidebar-border/60 p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
            <ShieldCheck className="size-5" />
          </div>
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm tracking-tight text-sidebar-foreground truncate">
                NestNeXt
              </span>
              <Badge
                variant="secondary"
                className="text-[10px] px-1 py-0 h-4 font-mono font-normal"
              >
                Admin
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground truncate">
              Platform Console
            </span>
          </div>
        </div>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isOverviewActive}
                  tooltip="Admin Overview"
                  render={<Link href="/admin" />}
                >
                  <LayoutDashboard className="size-4" />
                  <span>Overview</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isUsersActive}
                  tooltip="Users Directory"
                  render={<Link href="/admin/users" />}
                >
                  <Users className="size-4" />
                  <span>Users Directory</span>
                </SidebarMenuButton>
                <SidebarMenuBadge className="text-[10px] font-mono">
                  RBAC
                </SidebarMenuBadge>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-1" />

        <SidebarGroup>
          <SidebarGroupLabel>System & Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Back to User Dashboard"
                  render={<Link href="/" />}
                >
                  <ArrowLeft className="size-4" />
                  <span>User Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="GraphQL Endpoint"
                  render={
                    // biome-ignore lint/a11y/useAnchorContent: Children are provided by SidebarMenuButton useRender
                    <a
                      href="http://localhost:4000/graphql"
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                >
                  <Database className="size-4" />
                  <span className="flex items-center justify-between flex-1">
                    GraphQL API
                    <ExternalLink className="size-3 text-muted-foreground opacity-70" />
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Sidebar Footer with Admin Profile & Sign Out */}
      <SidebarFooter className="border-t border-sidebar-border/60 p-3">
        <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center">
          <div className="flex items-center gap-2.5 min-w-0 group-data-[collapsible=icon]:hidden">
            <Avatar size="sm">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-sidebar-foreground truncate">
                {user?.name || user?.email || "Admin"}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                {user?.email}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleLogout}
            disabled={isLoggingOut}
            title="Sign Out"
            aria-label="Sign Out"
            className="text-muted-foreground hover:text-destructive shrink-0"
          >
            {isLoggingOut ? (
              <Spinner className="size-3.5" />
            ) : (
              <LogOut className="size-3.5" />
            )}
          </Button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
