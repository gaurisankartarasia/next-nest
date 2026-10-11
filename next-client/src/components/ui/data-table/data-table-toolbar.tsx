"use client";

import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { RowData } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import type { AppTable } from "@/hooks/use-data-table";

interface DataTableToolbarProps<TData extends RowData = any> {
  table: AppTable<TData>;
  searchPlaceholder?: string;
  children?: React.ReactNode;
}

export function DataTableToolbar<TData extends RowData = any>({
  table,
  searchPlaceholder = "Search across all records...",
  children,
}: DataTableToolbarProps<TData>) {
  const globalFilter = (table.state.globalFilter as string) ?? "";
  const [searchValue, setSearchValue] = useState(globalFilter);

  useEffect(() => {
    setSearchValue(globalFilter);
  }, [globalFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchValue !== globalFilter) {
        table.setGlobalFilter(searchValue);
      }
    }, 350);
    return () => clearTimeout(timeout);
  }, [searchValue, globalFilter, table]);

  const isFiltered =
    Boolean(table.state.globalFilter) || table.state.columnFilters.length > 0;

  const handleResetFilters = () => {
    setSearchValue("");
    table.setGlobalFilter("");
    table.resetColumnFilters();
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 py-3">
      {/* Left side: Search & filters */}
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="h-8 pl-8 pr-8 text-xs bg-card"
          />
          {Boolean(searchValue) && (
            <button
              type="button"
              onClick={() => {
                setSearchValue("");
                table.setGlobalFilter("");
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer"
              aria-label="Clear search"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        {/* Custom filter slots (e.g. role filter) */}
        {children}

        {/* Reset button when filters are applied */}
        {isFiltered && (
          <Button
            variant="ghost"
            size="xs"
            onClick={handleResetFilters}
            className="h-8 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
          >
            Reset
            <X className="size-3" />
          </Button>
        )}
      </div>

      {/* Right side: View / Column visibility toggle */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-8 items-center gap-1.5 rounded-lg border border-input bg-card px-2.5 text-xs font-medium text-foreground hover:bg-muted outline-none cursor-pointer">
            <SlidersHorizontal className="size-3.5 text-muted-foreground" />
            <span>Columns</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 text-xs">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
                Toggle Columns
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllLeafColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide(),
                )
                .map((column) => {
                  const headerText =
                    typeof column.columnDef.header === "string"
                      ? column.columnDef.header
                      : column.id;
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize cursor-pointer text-xs"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(Boolean(value))
                      }
                    >
                      {headerText}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
