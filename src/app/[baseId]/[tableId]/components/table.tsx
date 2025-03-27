"use client";

import { Baseline, ChevronDown, Hash, Plus } from "lucide-react";
import { api } from "~/trpc/react";
import Loader from "./loader";
import { useVirtualizer, type VirtualItem } from "@tanstack/react-virtual";
import { EditableCell } from "./editable-cell";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type Row as TableRow,
} from "@tanstack/react-table";
import { useMemo, useCallback, useRef, memo, useEffect } from "react";
import { useCellNavigation } from "../hooks/use-cell-navigation";
import React from "react";
import AddColumnDropDownButton from "./add-column-dropdown-button";
import { notFound } from "next/navigation";
import { useSearch } from "../contexts/search-context";

type TableProps = {
  baseId: number;
  tableId: number;
};

type RowData = {
  id: number;
  table: number;
  data: Record<string, string | number | null>;
  createdAt: Date;
  updatedAt: Date;
};

type ColumnDef = {
  id: number;
  table: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  type: "number" | "text";
};

const Row = memo(function Row({
  row,
  virtualRow,
  columns,
  sortedColumnIds,
}: {
  row: TableRow<Record<string, string | number | null>>;
  virtualRow: VirtualItem;
  columns: ColumnDef[];
  sortedColumnIds: number[];
}) {
  const cells = useMemo(() => {
    return row.getVisibleCells().map((cell, cellIndex) => {
      const column = columns.find((col) => col.name === cell.column.id);
      if (!column) return null;

      return (
        <div
          key={`${row.id}-${column.id}`}
          className="flex h-[32px] items-center border-b border-slate-300"
          style={{
            width: cell.column.getSize(),
            backgroundColor:
              cellIndex === 0 && sortedColumnIds.includes(columns[0]?.id ?? 0)
                ? "#fff2ea"
                : undefined,
          }}
        >
          {cellIndex === 0 && (
            <span className="flex h-full w-[70px] items-center p-4 text-gray-500">
              {virtualRow.index + 1}
            </span>
          )}
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </div>
      );
    });
  }, [row, columns, virtualRow.index, sortedColumnIds]);

  return (
    <div
      className="absolute left-0 top-0 flex w-fit bg-white text-xs hover:bg-gray-100"
      style={{
        height: `${virtualRow.size}px`,
        transform: `translateY(${virtualRow.start}px)`,
      }}
    >
      {cells}
    </div>
  );
});

export function Table({ tableId }: TableProps) {
  const { searchValue } = useSearch();
  const utils = api.useUtils();
  const cellUpdatesRef = useRef<Record<string, unknown>>({});
  const parentRef = useRef<HTMLDivElement>(null);
  const columnHelper =
    createColumnHelper<Record<string, string | number | null>>();

  const tableQuery = api.table.getTableById.useQuery({
    tableId,
  });

  const rowsQuery = api.table.fetchRows.useInfiniteQuery(
    { tableId, pageSize: 100, search: searchValue },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      enabled: tableQuery.isSuccess,
    },
  );

  const rows = useMemo(
    () =>
      rowsQuery.isSuccess
        ? rowsQuery.data.pages.flatMap((page) => page.rows)
        : [],
    [rowsQuery.data, rowsQuery.isSuccess],
  );

  const columns = useMemo(
    () => (tableQuery.isSuccess ? tableQuery.data.columns : []),
    [tableQuery.data, tableQuery.isSuccess],
  );

  const sortedColumnIds = useMemo(
    () =>
      tableQuery.isSuccess
        ? (tableQuery.data.view?.config.sort?.map((sort) => sort.columnId) ??
          [])
        : [],
    [tableQuery.data, tableQuery.isSuccess],
  );

  const handleNavigate = useCellNavigation(rows, columns);

  const storeCellUpdate = useCallback(
    (rowId: number, columnId: number, value: unknown) => {
      const column = columns.find((col) => col.id === columnId);
      if (!column) return;

      if (column.type === "number" && value === "") {
        value = null;
      }

      const key = `${rowId}-${columnId}`;
      cellUpdatesRef.current[key] = value;
    },
    [columns],
  );

  const applyCellUpdates = useCallback(() => {
    utils.table.fetchRows.setInfiniteData(
      { tableId, pageSize: 100, search: searchValue },
      (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            rows: page.rows.map((row) => {
              const updatedData = { ...row.data };
              let hasUpdates = false;

              columns.forEach((col) => {
                const key = `${row.id}-${col.id}`;
                if (key in cellUpdatesRef.current) {
                  updatedData[col.name] = cellUpdatesRef.current[key] as
                    | string
                    | number
                    | null;
                  hasUpdates = true;
                }
              });
              if (hasUpdates) {
                return {
                  ...row,
                  data: updatedData,
                };
              }
              return row;
            }),
          })),
        };
      },
    );
  }, [utils.table.fetchRows, tableId, columns, searchValue]);

  const addRow = api.table.addRow.useMutation({
    onMutate: async () => {
      applyCellUpdates();

      await utils.table.fetchRows.cancel();

      const emptyRowData: Record<string, null> = {};
      columns.forEach((col) => {
        emptyRowData[col.name] = null;
      });

      const tempId = -Date.now();

      const tempRow: RowData = {
        id: tempId,
        table: tableId,
        data: emptyRowData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      utils.table.fetchRows.setInfiniteData(
        { tableId, pageSize: 100, search: searchValue },
        (old) => {
          if (!old) return old;
          const lastPageIndex = old.pages.length - 1;
          return {
            ...old,
            pages: old.pages.map((page, pageIndex) => {
              if (pageIndex === lastPageIndex) {
                return {
                  ...page,
                  rows: [...page.rows, tempRow],
                };
              }
              return page;
            }),
          };
        },
      );

      return { tempRow, tempId };
    },
    onError: (err, _, context) => {
      utils.table.fetchRows.setInfiniteData(
        { tableId, pageSize: 100, search: searchValue },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              rows: page.rows.filter((row) => row.id !== context?.tempRow.id),
            })),
          };
        },
      );
    },
    onSuccess: (newRow, _, context) => {
      utils.table.fetchRows.setInfiniteData(
        { tableId, pageSize: 100, search: searchValue },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              rows: page.rows.map((row) => {
                if (row.id === context?.tempId) {
                  return newRow;
                }
                return row;
              }),
            })),
          };
        },
      );
    },
  });

  const handleAddRow = useCallback(() => {
    addRow.mutate({
      tableId,
    });
  }, [tableId, addRow]);

  const generateFakeRows = api.table.generateFakeRows.useMutation({
    onMutate: async () => {
      await utils.table.fetchRows.cancel();
    },
    onSettled: () => {
      void utils.table.fetchRows.invalidate({
        tableId,
        search: searchValue,
        pageSize: 100,
      });
    },
  });

  const handleGenerateFakeRows = useCallback(() => {
    generateFakeRows.mutate({
      tableId,
      numRows: 100000,
    });
  }, [tableId, generateFakeRows]);

  const tableColumns = useMemo(
    () =>
      columns.map((col) =>
        columnHelper.accessor(col.name, {
          id: col.name,
          header: () => (
            <div className="flex h-[32px] w-full items-center justify-between px-2 text-xs">
              <div className="flex items-center">
                {col.type === "number" ? (
                  <Hash size={15} className="mr-2" />
                ) : (
                  <Baseline size={15} className="mr-2" />
                )}
                <span>{col.name}</span>
              </div>
              <ChevronDown size={15} />
            </div>
          ),
          cell: (info) => {
            const value = info.getValue();
            const rowIndex = info.row.index;
            const row = rows[rowIndex];
            const column = columns.find((col) => col.name === info.column.id);

            if (!row || !column) return null;

            return (
              <EditableCell
                key={`cell-${row.id}-${column.id}`}
                value={value}
                rowId={row.id}
                columnId={column.id}
                columnType={column.type}
                tableId={tableId}
                onNavigate={handleNavigate}
                onCellUpdate={storeCellUpdate}
                isSorted={sortedColumnIds.includes(column.id)}
              />
            );
          },
          size: col.name === "Name" ? 230 : 180,
        }),
      ),
    [
      columns,
      columnHelper,
      rows,
      tableId,
      handleNavigate,
      storeCellUpdate,
      sortedColumnIds,
    ],
  );

  const rowData = useMemo(() => rows.map((row) => row.data || {}), [rows]);

  const reactTable = useReactTable({
    data: rowData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      const pages = rowsQuery.data?.pages;

      if (
        scrollHeight - scrollTop - clientHeight < 100 &&
        rowsQuery.hasNextPage &&
        !rowsQuery.isFetchingNextPage &&
        !rowsQuery.isRefetching &&
        pages &&
        pages.length > 0
      ) {
        void rowsQuery.fetchNextPage();
      }
    },
    [rowsQuery],
  );

  const rowVirtualizer = useVirtualizer({
    count: reactTable.getRowModel().rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32,
    overscan: 100,
  });

  useEffect(() => {
    if (parentRef.current) {
      parentRef.current.scrollTop = 0;
    }
  }, [tableId]);

  const isTableLoading = useMemo(
    () =>
      tableQuery.isPending ||
      rowsQuery.isPending ||
      rowsQuery.isRefetching ||
      (rowsQuery.isSuccess && rowsQuery.data.pages.length === 0),
    [
      tableQuery.isPending,
      rowsQuery.isPending,
      rowsQuery.isRefetching,
      rowsQuery.isSuccess,
      rowsQuery.data?.pages,
    ],
  );

  if (tableQuery.isError) {
    notFound();
  }

  if (isTableLoading) {
    return (
      <div className="flex h-full w-full flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="flex h-full w-full items-center justify-center">
            <Loader />
          </div>
        </div>
        <div className="flex border-t border-slate-300 text-xs">
          <p className="mr-2 py-2 pl-4">0 records</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div
        ref={parentRef}
        data-table-container="true"
        className="flex-1 overflow-auto"
        onScroll={handleScroll}
      >
        <div className="w-fit">
          <div className="sticky top-0 z-10 border-b border-slate-300 bg-white">
            {reactTable.getHeaderGroups().map((headerGroup) => (
              <div key={headerGroup.id} className="flex">
                {headerGroup.headers.map((header) => (
                  <div
                    key={header.id}
                    className="flex h-[32px] items-center justify-between border-r border-slate-300 bg-gray-100"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </div>
                ))}
                <AddColumnDropDownButton tableId={tableId} />
              </div>
            ))}
          </div>
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "fit-content",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = reactTable.getRowModel().rows[virtualRow.index];
              if (!row) return null;
              return (
                <Row
                  key={`row-${row.id}`}
                  row={row}
                  virtualRow={virtualRow}
                  columns={columns}
                  sortedColumnIds={sortedColumnIds}
                />
              );
            })}
          </div>
          <div
            className="flex w-fit border-b border-slate-300 bg-white text-xs hover:bg-gray-100"
            onClick={handleAddRow}
          >
            <div className="flex h-[32px] w-[230px] cursor-pointer items-center border-r border-slate-300 py-4 pl-4">
              <Plus size={15} />
            </div>
          </div>
          {rowsQuery.isFetchingNextPage && (
            <div className="flex w-full items-center justify-center py-4">
              <Loader />
            </div>
          )}
        </div>
      </div>
      <div className="flex border-t border-slate-300 text-xs">
        <p className="mr-2 py-2 pl-4">
          {reactTable.getRowModel().rows.length} records
        </p>
        <button
          className="flex cursor-pointer items-center p-2 text-black hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleGenerateFakeRows}
          disabled={generateFakeRows.isPending}
        >
          {generateFakeRows.isPending ? (
            <p>Generating...</p>
          ) : (
            <>
              <Plus size={15} className="mr-2" />
              <span>Generate Fake Rows</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
