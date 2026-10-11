"use client";

import type { PaginationState, SortingState } from "@tanstack/react-table";
import { AlertCircle, RefreshCw, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { UsersTable } from "@/components/users/users-table";
import { useGetPaginatedUsersQuery } from "@/lib/redux/api/authApi";
import { useAppSelector } from "@/lib/redux/store";
import { cn } from "@/lib/utils";

interface UsersClientProps {
  inAdminLayout?: boolean;
}

export function UsersClient({
  inAdminLayout: _inAdminLayout = false,
}: UsersClientProps = {}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, isInitializing } = useAppSelector(
    (state) => state.auth,
  );

  // Controlled table state for server-side operations
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGlobalFilterChange = (updater: any) => {
    const nextVal =
      typeof updater === "function" ? updater(globalFilter) : updater;
    setGlobalFilter(nextVal ?? "");
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleRoleFilterChange = (role: string) => {
    setRoleFilter(role);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const sortBy = sorting[0]?.id || "createdAt";
  const sortOrder = sorting[0]?.desc ? "DESC" : "ASC";

  const {
    data: paginatedData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetPaginatedUsersQuery(
    {
      page: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      search: globalFilter || undefined,
      role: roleFilter !== "ALL" ? roleFilter : undefined,
      status: statusFilter !== "ALL" ? statusFilter : undefined,
      sortBy,
      sortOrder,
    },
    {
      skip: !mounted || !isAuthenticated,
    },
  );

  useEffect(() => {
    if (mounted && !isInitializing && !isAuthenticated) {
      router.push("/login");
    }
  }, [mounted, isAuthenticated, isInitializing, router]);

  if (!mounted || isInitializing) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[300px]">
        <Spinner className="size-8 text-primary mb-2" />
        <p className="text-xs text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const items = paginatedData?.items ?? [];
  const totalCount = paginatedData?.totalCount ?? 0;

  return (
    <PageLayout
      title="Users"
      description="Manage registered user accounts and roles."
      badge={
        <Badge variant="secondary" className="text-xs font-semibold">
          {totalCount.toLocaleString()} {totalCount === 1 ? "user" : "users"}
        </Badge>
      }
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-1.5 text-xs h-8"
          >
            <RefreshCw
              className={cn("size-3.5", isFetching && "animate-spin")}
            />
            <span>Refresh</span>
          </Button>

          <Link
            href="/admin/users/create"
            className={cn(
              buttonVariants({ size: "sm" }),
              "h-8 gap-1.5 text-xs font-medium bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
            )}
          >
            <UserPlus className="size-3.5" />
            <span>Create User</span>
          </Link>
        </div>
      }
    >
      {/* Error Alert */}
      {isError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="size-4" />
          <AlertTitle>Failed to load users</AlertTitle>
          <AlertDescription className="text-xs">
            {(error as any)?.error ||
              (error as any)?.data?.[0]?.message ||
              "An unexpected error occurred while fetching the users list."}
          </AlertDescription>
        </Alert>
      )}

      {/* Table Card */}
      <Card className="shadow-xs border-border/80">
        <CardContent className="pt-6">
          <UsersTable
            data={items}
            totalCount={totalCount}
            pagination={pagination}
            onPaginationChange={setPagination}
            sorting={sorting}
            onSortingChange={setSorting}
            globalFilter={globalFilter}
            onGlobalFilterChange={handleGlobalFilterChange}
            roleFilter={roleFilter}
            onRoleFilterChange={handleRoleFilterChange}
            statusFilter={statusFilter}
            onStatusFilterChange={handleStatusFilterChange}
            isLoading={isLoading || isFetching}
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
}
