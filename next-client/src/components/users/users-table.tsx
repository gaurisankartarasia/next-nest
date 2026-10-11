"use client";

import { useMemo, useState } from "react";
import {
  Ban,
  Check,
  CheckCircle2,
  ChevronDownIcon,
  Clock,
  Copy,
  MoreHorizontal,
  Pencil,
  Shield,
  Trash2,
  UserCheck,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import type {
  OnChangeFn,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Spinner } from "@/components/ui/spinner";
import { DataTable } from "@/components/ui/data-table";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { createAppColumnHelper, useAppTable } from "@/hooks/use-data-table";
import { useUpdateUserStatusMutation } from "@/lib/redux/api/authApi";
import type { User } from "@/lib/redux/slices/authSlice";
import { cn } from "@/lib/utils";

interface UsersTableProps {
  data: User[];
  totalCount: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  globalFilter: string;
  onGlobalFilterChange: OnChangeFn<string>;
  roleFilter: string;
  onRoleFilterChange: (role: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  isLoading?: boolean;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; badgeClass: string; icon: React.ReactNode }
> = {
  ACTIVE: {
    label: "Active",
    badgeClass:
      "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/40",
    icon: (
      <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
    ),
  },
  INACTIVE: {
    label: "Inactive",
    badgeClass:
      "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/40",
    icon: <Clock className="size-3 text-amber-600 dark:text-amber-400" />,
  },
  BANNED: {
    label: "Banned",
    badgeClass:
      "bg-red-500/10 text-red-600 border-red-500/30 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/40",
    icon: <Ban className="size-3 text-red-600 dark:text-red-400" />,
  },
  DELETED: {
    label: "Deleted",
    badgeClass:
      "bg-slate-500/10 text-slate-600 border-slate-500/30 dark:bg-slate-500/15 dark:text-slate-400 dark:border-slate-500/40",
    icon: <Trash2 className="size-3 text-slate-600 dark:text-slate-400" />,
  },
};

const STATUS_OPTIONS = [
  {
    value: "ACTIVE",
    label: "Active",
    icon: <CheckCircle2 className="size-3.5 text-emerald-600" />,
  },
  {
    value: "INACTIVE",
    label: "Inactive",
    icon: <Clock className="size-3.5 text-amber-600" />,
  },
  {
    value: "BANNED",
    label: "Banned",
    icon: <Ban className="size-3.5 text-red-600" />,
  },
  {
    value: "DELETED",
    label: "Deleted",
    icon: <Trash2 className="size-3.5 text-slate-600" />,
  },
];

export function UsersTable({
  data,
  totalCount,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  globalFilter,
  onGlobalFilterChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  isLoading = false,
}: UsersTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [updateUserStatus] = useUpdateUserStatusMutation();

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      setUpdatingUserId(userId);
      await updateUserStatus({ id: userId, status: newStatus }).unwrap();
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const columnHelper = useMemo(() => createAppColumnHelper<User>(), []);

  const columns = useMemo(() => {
    return columnHelper.columns([
      // Select Checkbox Column
      columnHelper.display({
        id: "select",
        size: 40,
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(val) =>
              table.toggleAllPageRowsSelected(Boolean(val))
            }
            aria-label="Select all rows"
            className="translate-y-[2px]"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(val) => row.toggleSelected(Boolean(val))}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      }),

      // ID Column
      columnHelper.accessor("id", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="ID" />
        ),
        cell: ({ getValue }) => (
          <span className="font-mono text-xs font-semibold text-muted-foreground">
            #{getValue()}
          </span>
        ),
        size: 70,
      }),

      // Public ID (PID) Column
      columnHelper.accessor("pid", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="PID" />
        ),
        cell: ({ getValue, row }) => {
          const pid = getValue();
          if (!pid) return <span className="text-muted-foreground text-xs">—</span>;
          const isCopied = copiedId === `pid-${row.original.id}`;
          return (
            <button
              type="button"
              onClick={() => handleCopy(pid, `pid-${row.original.id}`)}
              title="Click to copy full PID"
              className="inline-flex items-center gap-1 font-mono text-[11px] bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded transition-colors cursor-pointer group"
            >
              <span>{pid.slice(0, 8)}…{pid.slice(-4)}</span>
              {isCopied ? (
                <Check className="size-3 text-emerald-600 shrink-0" />
              ) : (
                <Copy className="size-3 text-muted-foreground/70 group-hover:text-foreground shrink-0" />
              )}
            </button>
          );
        },
        size: 140,
      }),

      // Name & Email Column
      columnHelper.accessor("name", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="User" />
        ),
        cell: ({ row }) => {
          const name = row.getValue("name") as string | null;
          const email = row.original.email;
          const initials = name
            ? name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
            : email.slice(0, 2).toUpperCase();

          return (
            <div className="flex items-center gap-3">
              <Avatar className="size-8 rounded-full border border-border/80">
                <AvatarFallback className="text-[11px] font-bold bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="font-medium text-foreground truncate">
                  {name || "Unnamed User"}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {email}
                </span>
              </div>
            </div>
          );
        },
      }),

      // Email Direct Column
      columnHelper.accessor("email", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Email Address" />
        ),
        cell: ({ getValue }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {getValue()}
          </span>
        ),
      }),

      // Role Column
      columnHelper.accessor("role", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Role" />
        ),
        cell: ({ getValue }) => {
          const role = (getValue() as string) || "USER";
          const isAdmin = role.toUpperCase() === "ADMIN";

          return (
            <Badge
              variant={isAdmin ? "destructive" : "secondary"}
              className="text-[11px] font-semibold tracking-wider gap-1 uppercase"
            >
              {isAdmin ? (
                <Shield className="size-3" />
              ) : (
                <UserIcon className="size-3" />
              )}
              {role}
            </Badge>
          );
        },
        size: 100,
      }),

      // Status Column with interactive dropdown to change status directly
      columnHelper.accessor("status", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
          const user = row.original;
          const statusKey = (user.status || "ACTIVE").toUpperCase();
          const config = STATUS_CONFIG[statusKey] || {
            label: statusKey,
            badgeClass: "bg-muted text-muted-foreground",
            icon: null,
          };
          const isUpdating = updatingUserId === user.id;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger
                disabled={isUpdating}
                className="inline-flex items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer select-none"
                aria-label={`Change status for user ${user.email}, currently ${config.label}`}
              >
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[11px] font-semibold tracking-wide gap-1.5 uppercase transition-opacity hover:opacity-85 py-0.5 px-2",
                    config.badgeClass,
                    isUpdating && "opacity-60 cursor-wait",
                  )}
                >
                  {isUpdating ? (
                    <Spinner className="size-3 animate-spin" />
                  ) : (
                    config.icon
                  )}
                  <span>{config.label}</span>
                  <ChevronDownIcon className="size-3 opacity-60 ml-0.5" />
                </Badge>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40 text-xs">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground">
                    Set User Status
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {STATUS_OPTIONS.map((opt) => (
                    <DropdownMenuItem
                      key={opt.value}
                      disabled={statusKey === opt.value || isUpdating}
                      onClick={() => handleStatusChange(user.id, opt.value)}
                      className="gap-2 cursor-pointer text-xs"
                    >
                      {opt.icon}
                      <span>{opt.label}</span>
                      {statusKey === opt.value && (
                        <Check className="size-3.5 ml-auto text-primary" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        size: 130,
      }),

      // Created At Column
      columnHelper.accessor("createdAt", {
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Joined Date" />
        ),
        cell: ({ getValue }) => {
          const val = getValue();
          if (!val)
            return <span className="text-muted-foreground text-xs">—</span>;

          try {
            const date = new Date(val);
            return (
              <span className="text-xs text-muted-foreground">
                {date.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            );
          } catch {
            return (
              <span className="text-xs text-muted-foreground">
                {String(val)}
              </span>
            );
          }
        },
      }),

      // Actions Column
      columnHelper.display({
        id: "actions",
        size: 50,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const user = row.original;
          const isCopied = copiedId === user.id;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex size-7 items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground outline-none cursor-pointer"
                aria-label="Open row actions"
              >
                <MoreHorizontal className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 text-xs">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                    User Actions
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    render={<Link href={`/admin/users/edit/${user.id}`} />}
                    className="gap-2 cursor-pointer font-medium text-foreground"
                  >
                    <Pencil className="size-3.5 text-primary" />
                    <span>Edit User</span>
                  </DropdownMenuItem>

                  {user.pid && (
                    <DropdownMenuItem
                      onClick={() => handleCopy(user.pid, `menu-pid-${user.id}`)}
                      className="gap-2 cursor-pointer"
                    >
                      {copiedId === `menu-pid-${user.id}` ? (
                        <Check className="size-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="size-3.5 text-muted-foreground" />
                      )}
                      <span>Copy PID</span>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    onClick={() => handleCopy(user.id, user.id)}
                    className="gap-2 cursor-pointer"
                  >
                    {isCopied ? (
                      <Check className="size-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="size-3.5 text-muted-foreground" />
                    )}
                    <span>Copy ID</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => handleCopy(user.email, `email-${user.id}`)}
                    className="gap-2 cursor-pointer"
                  >
                    <Copy className="size-3.5 text-muted-foreground" />
                    <span>Copy Email</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-[11px] font-semibold text-muted-foreground">
                    Quick Status Change
                  </DropdownMenuLabel>

                  {STATUS_OPTIONS.map((opt) => (
                    <DropdownMenuItem
                      key={`action-status-${opt.value}`}
                      disabled={user.status === opt.value}
                      onClick={() => handleStatusChange(user.id, opt.value)}
                      className="gap-2 cursor-pointer text-xs"
                    >
                      {opt.icon}
                      <span>Set {opt.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        enableSorting: false,
        enableHiding: false,
      }),
    ]);
  }, [columnHelper, copiedId, updatingUserId]);

  // Create TanStack Table v9 instance with server-side processing ownership
  const table = useAppTable({
    key: "users-datatable-v9",
    columns,
    data,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    rowCount: totalCount,
    state: {
      pagination,
      sorting,
      globalFilter,
    },
    onPaginationChange,
    onSortingChange,
    onGlobalFilterChange,
    initialState: {
      columnVisibility: {
        email: true,
      },
    },
  });

  return (
    <DataTable
      table={table}
      isLoading={isLoading}
      searchPlaceholder="Search users by email..."
      emptyMessage="No registered users found matching your filters."
      pageSizeOptions={[5, 10, 20, 50]}
      toolbarContent={
        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Role:
            </span>
            <NativeSelect
              size="sm"
              value={roleFilter}
              onChange={(e) => onRoleFilterChange(e.target.value)}
              className="w-28 text-xs"
              aria-label="Filter by user role"
            >
              <NativeSelectOption value="ALL">All Roles</NativeSelectOption>
              <NativeSelectOption value="USER">USER</NativeSelectOption>
              <NativeSelectOption value="ADMIN">ADMIN</NativeSelectOption>
            </NativeSelect>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Status:
            </span>
            <NativeSelect
              size="sm"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="w-32 text-xs"
              aria-label="Filter by user status"
            >
              <NativeSelectOption value="ALL">All Statuses</NativeSelectOption>
              <NativeSelectOption value="ACTIVE">ACTIVE</NativeSelectOption>
              <NativeSelectOption value="INACTIVE">INACTIVE</NativeSelectOption>
              <NativeSelectOption value="BANNED">BANNED</NativeSelectOption>
              <NativeSelectOption value="DELETED">DELETED</NativeSelectOption>
            </NativeSelect>
          </div>
        </div>
      }
    />
  );
}
