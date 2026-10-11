"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, EyeOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { RowData } from "@tanstack/react-table";
import type { AppColumn } from "@/hooks/use-data-table";
import { cn } from "@/lib/utils";

interface DataTableColumnHeaderProps<TData extends RowData = any, TValue = any>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: AppColumn<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<
  TData extends RowData = any,
  TValue = any,
>({ column, title, className }: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return (
      <div
        className={cn(
          "text-xs font-semibold uppercase tracking-wider",
          className,
        )}
      >
        {title}
      </div>
    );
  }

  const isSorted = column.getIsSorted();

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger className="-ml-2 flex h-7 items-center gap-1 rounded-md px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:bg-muted hover:text-foreground outline-none cursor-pointer data-[state=open]:bg-accent">
          <span>{title}</span>
          {isSorted === "desc" ? (
            <ArrowDown className="size-3 text-primary" />
          ) : isSorted === "asc" ? (
            <ArrowUp className="size-3 text-primary" />
          ) : (
            <ArrowUpDown className="size-3 opacity-50" />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-36 text-xs">
          <DropdownMenuItem
            onClick={() => column.toggleSorting(false)}
            className="gap-2 cursor-pointer"
          >
            <ArrowUp className="size-3.5 text-muted-foreground" />
            Ascending
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => column.toggleSorting(true)}
            className="gap-2 cursor-pointer"
          >
            <ArrowDown className="size-3.5 text-muted-foreground" />
            Descending
          </DropdownMenuItem>
          {column.getCanHide() && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => column.toggleVisibility(false)}
                className="gap-2 cursor-pointer"
              >
                <EyeOff className="size-3.5 text-muted-foreground" />
                Hide Column
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
