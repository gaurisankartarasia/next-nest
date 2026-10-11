import {
  columnFilteringFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  createTableHook,
  filterFns,
  globalFilteringFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
} from "@tanstack/react-table";

/**
 * Shared table features for TanStack Table v9
 * Bundles sorting, column filtering, global filtering, pagination, selection, visibility, and sizing
 */
export const appTableFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns,
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns,
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  rowSelectionFeature,
  columnVisibilityFeature,
  columnSizingFeature,
});

import type { RowData } from "@tanstack/react-table";

export type AppTableFeatures = typeof appTableFeatures;
export type AppTable<TData extends RowData = any> =
  import("@tanstack/react-table").ReactTable<AppTableFeatures, TData>;
export type AppColumn<
  TData extends RowData = any,
  TValue = any,
> = import("@tanstack/react-table").Column<AppTableFeatures, TData, TValue>;

/**
 * Factory created via createTableHook from TanStack Table v9.
 * Provides useAppTable and createAppColumnHelper pre-bound to appTableFeatures.
 */
export const { useAppTable, createAppColumnHelper } = createTableHook({
  features: appTableFeatures,
});
