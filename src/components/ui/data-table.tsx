'use client';

import * as React from 'react';
import {
  createColumnHelper,
  tableFeatures,
  useTable,
  type RowData,
  type TableOptions,
} from '@tanstack/react-table';
import { cn } from '@/lib/utils';

/** Core features only: Caseline tables sort and filter in the data layer. */
export const dataTableFeatures = tableFeatures({});

export type DataTableFeatures = typeof dataTableFeatures;

export type DataTableColumns<TData extends RowData> = NonNullable<
  TableOptions<DataTableFeatures, TData>['columns']
>;

/** Typed column helper bound to the shared feature set. */
export function dataTableColumnHelper<TData extends RowData>() {
  return createColumnHelper<DataTableFeatures, TData>();
}

export type DataTableDensity = 'compact' | 'comfortable';

export interface DataTableProps<TData extends RowData> {
  columns: DataTableColumns<TData>;
  data: TData[];
  /** Describes the table for screen readers; visually hidden by default. */
  caption: string;
  density?: DataTableDensity;
  /** Sticky header keeps column meaning visible in a long queue. */
  stickyHeader?: boolean;
  getRowId?: (row: TData, index: number) => string;
  onRowActivate?: (row: TData) => void;
  emptyMessage?: React.ReactNode;
  className?: string;
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  caption,
  density = 'comfortable',
  stickyHeader = true,
  getRowId,
  onRowActivate,
  emptyMessage = 'Nothing to show.',
  className,
}: DataTableProps<TData>) {
  const table = useTable({ features: dataTableFeatures, columns, data, getRowId });
  const cellPadding = density === 'compact' ? 'px-3 py-1.5' : 'px-4 py-3';
  const rows = table.getRowModel().rows;

  return (
    <div className={cn('relative overflow-auto', className)}>
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className={cn(stickyHeader && 'sticky top-0 z-10')}>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id} className="bg-[var(--surface-muted)]">
              {group.headers.map((header) => (
                <th
                  key={header.id}
                  scope="col"
                  className={cn(
                    'border-b border-[var(--border)] bg-[var(--surface-muted)] text-left text-2xs font-medium tracking-wide text-text-muted uppercase',
                    cellPadding,
                  )}
                >
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={table.getAllColumns().length}
                className={cn('text-center text-text-muted', cellPadding)}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.id}
                tabIndex={onRowActivate ? 0 : undefined}
                onClick={onRowActivate ? () => onRowActivate(row.original) : undefined}
                onKeyDown={
                  onRowActivate
                    ? (event) => {
                        if (event.key === 'Enter') onRowActivate(row.original);
                      }
                    : undefined
                }
                className={cn(
                  'border-b border-[var(--border)] last:border-b-0',
                  onRowActivate && 'cursor-pointer hover:bg-[var(--brand-soft)]',
                )}
              >
                {row.getAllCells().map((cell) => (
                  <td key={cell.id} className={cn('align-top text-text', cellPadding)}>
                    <table.FlexRender cell={cell} />
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
