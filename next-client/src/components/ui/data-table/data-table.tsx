"use client";

import { FlexRender, type RowData } from "@tanstack/react-table";
import { Spinner } from "@/components/ui/spinner";
import {
  Table as TableRoot,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AppTable } from "@/hooks/use-data-table";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";

interface DataTableProps<TData extends RowData = any> {
  table: AppTable<TData>;
  isLoading?: boolean;
  searchPlaceholder?: string;
  toolbarContent?: React.ReactNode;
  emptyMessage?: string;
  pageSizeOptions?: number[];
}

export function DataTable<TData extends RowData = any>({
  table,
  isLoading = false,
  searchPlaceholder,
  toolbarContent,
  emptyMessage = "No results found matching your criteria.",
  pageSizeOptions,
}: DataTableProps<TData>) {
  const leafColumnsCount = table.getVisibleLeafColumns().length;

  return (
    <div className="w-full space-y-3">
      {/* Search, Filter, and Column Visibility Toolbar */}
      <DataTableToolbar table={table} searchPlaceholder={searchPlaceholder}>
        {toolbarContent}
      </DataTableToolbar>

      {/* Main Data Table */}
      <div className="rounded-lg border bg-card shadow-xs overflow-hidden">
        <TableRoot>
          <TableHeader className="bg-muted/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{
                      width:
                        header.getSize() !== 150 ? header.getSize() : undefined,
                    }}
                  >
                    {header.isPlaceholder ? null : (
                      <FlexRender header={header} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={leafColumnsCount || 6}
                  className="h-40 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Spinner className="size-6 text-primary" />
                    <span className="text-xs text-muted-foreground">
                      Loading data...
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className="hover:bg-muted/40 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={leafColumnsCount || 6}
                  className="h-32 text-center text-xs text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </TableRoot>

        {/* Pagination & Row Selection Summary */}
        <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
      </div>
    </div>
  );
}
