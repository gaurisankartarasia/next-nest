"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RowData } from "@tanstack/react-table";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import type { AppTable } from "@/hooks/use-data-table";

interface DataTablePaginationProps<TData extends RowData = any> {
  table: AppTable<TData>;
  pageSizeOptions?: number[];
}

export function DataTablePagination<TData extends RowData = any>({
  table,
  pageSizeOptions = [5, 10, 20, 50],
}: DataTablePaginationProps<TData>) {
  const selectedRowCount = table.getFilteredSelectedRowModel().rows.length;
  const totalRowCount = table.getRowCount();
  const pageIndex = table.state.pagination.pageIndex;
  const pageSize = table.state.pagination.pageSize;
  const pageCount = Math.max(1, table.getPageCount());

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-3 text-xs text-muted-foreground border-t">
      {/* Selected rows count */}
      <div className="flex-1 text-xs">
        {selectedRowCount > 0 ? (
          <span>
            <strong className="text-foreground">{selectedRowCount}</strong> of{" "}
            <strong className="text-foreground">{totalRowCount}</strong> row(s)
            selected.
          </span>
        ) : (
          <span>
            Total <strong className="text-foreground">{totalRowCount}</strong>{" "}
            row(s)
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        {/* Rows per page selector */}
        <div className="flex items-center gap-2">
          <span>Rows per page</span>
          <NativeSelect
            size="sm"
            value={pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
          >
            {pageSizeOptions.map((size) => (
              <NativeSelectOption key={size} value={size}>
                {size}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>

        {/* Page status */}
        <div className="flex items-center justify-center font-medium">
          Page {pageIndex + 1} of {pageCount}
        </div>

        {/* Page navigation buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Go to first page"
          >
            <ChevronsLeft className="size-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="size-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Go to next page"
          >
            <ChevronRight className="size-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}
            aria-label="Go to last page"
          >
            <ChevronsRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
