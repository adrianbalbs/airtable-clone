"use client";

import { Baseline, ChevronDown, Hash, Plus } from "lucide-react";
import { api, type RouterOutputs } from "~/trpc/react";
import Loader from "./loader";
import { useVirtualizer } from "@tanstack/react-virtual";
import { EditableCell } from "./editable-cell";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useCallback, useRef } from "react";
import { useCellNavigation } from "../hooks/use-cell-navigation";

type TableProps = {
  tableData: RouterOutputs["table"]["getTableById"];
};

type RowData = {
  id: number;
  table: number;
  data: Record<string, string | number | null>;
  createdAt: Date;
  updatedAt: Date;
};

export function Table({ tableData: initialData }: TableProps) {
  const { table: tableInfo, columns } = initialData;
  const columnHelper =
    createColumnHelper<Record<string, string | number | null>>();
  const utils = api.useUtils();

  const { data, isPending, isError, fetchNextPage, hasNextPage } =
    api.table.fetchRows.useInfiniteQuery(
      { tableId: tableInfo.id, pageSize: 50 },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        enabled: !!tableInfo.id,
        staleTime: 0,
        refetchOnWindowFocus: false,
      },
    );

  const rows = useMemo(() => {
    return data?.pages.flatMap((page) => page.rows) ?? [];
  }, [data]) as RowData[];

  const handleNavigate = useCellNavigation(rows, columns);

  const addRow = api.table.addRow.useMutation({
    onMutate: async () => {
      console.log("onMutate");
      await utils.table.fetchRows.cancel();

      const emptyRowData: Record<string, null> = {};
      columns.forEach((col) => {
        emptyRowData[col.name] = null;
      });
      const optimisticRow: RowData = {
        id: -Date.now(),
        table: tableInfo.id,
        data: emptyRowData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      utils.table.fetchRows.setInfiniteData(
        { tableId: tableInfo.id, pageSize: 50 },
        (old) => {
          if (!old) return old;
          const lastPageIndex = old.pages.length - 1;
          return {
            ...old,
            pages: old.pages.map((page, pageIndex) => {
              if (pageIndex === lastPageIndex) {
                return {
                  ...page,
                  rows: [...page.rows, optimisticRow],
                };
              }
              return page;
            }),
          };
        },
      );

      return { optimisticRow };
    },
    onError: (err, _, context) => {
      if (context?.optimisticRow) {
        utils.table.fetchRows.setInfiniteData(
          { tableId: tableInfo.id },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                rows: page.rows.filter(
                  (row) => row.id !== context.optimisticRow.id,
                ),
              })),
            };
          },
        );
      }
    },
    onSettled: () => {
      void utils.table.fetchRows.invalidate({ tableId: tableInfo.id });
    },
  });

  const handleAddRow = useCallback(() => {
    addRow.mutate({
      tableId: tableInfo.id,
    });
  }, [tableInfo.id, addRow]);

  const generateFakeRows = api.table.generateFakeRows.useMutation({
    onMutate: async () => {
      await utils.table.fetchRows.cancel();
    },
    onSettled: () => {
      void utils.table.fetchRows.invalidate({ tableId: tableInfo.id });
    },
  });

  const handleGenerateFakeRows = useCallback(() => {
    generateFakeRows.mutate({
      tableId: tableInfo.id,
      numRows: 100000,
    });
  }, [tableInfo.id, generateFakeRows]);

  const tableColumns = useMemo(
    () =>
      columns.map((col) =>
        columnHelper.accessor(col.name, {
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

            if (!row) return null;

            return (
              <EditableCell
                value={value}
                rowId={row.id}
                columnId={col.id}
                columnType={col.type}
                tableId={tableInfo.id}
                onNavigate={handleNavigate}
              />
            );
          },
          size: col.name === "Name" ? 230 : 180,
        }),
      ),
    [columns, columnHelper, rows, tableInfo.id, handleNavigate],
  );

  const tableData = useMemo(() => {
    return rows.map((row) => row.data || {});
  }, [rows]);

  const reactTable = useReactTable({
    data: tableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      if (
        scrollHeight - scrollTop - clientHeight < 100 &&
        hasNextPage &&
        !isPending
      ) {
        void fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isPending],
  );

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: reactTable.getRowModel().rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32,
    overscan: 50,
  });

  if (isPending) {
    return <Loader />;
  }

  if (isError) {
    return (
      <div className="flex h-screen flex-1 items-center justify-center text-red-600">
        <p>
          Something went wrong while loading the table. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex border-b border-slate-300">
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
            <div className="flex h-[32px] w-[92px] cursor-pointer items-center justify-center border-r border-slate-300 bg-gray-100 px-2 text-xs">
              <Plus size={15} className="mr-2" />
            </div>
          </div>
        ))}
      </div>
      <div
        ref={parentRef}
        className="flex-1 overflow-auto bg-gray-50"
        onScroll={handleScroll}
      >
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = reactTable.getRowModel().rows[virtualRow.index];
            if (!row) return null;
            return (
              <div
                key={row.id}
                className="absolute left-0 top-0 flex w-fit bg-white text-xs hover:bg-gray-100"
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {row.getVisibleCells().map((cell, cellIndex) => (
                  <div
                    key={cell.id}
                    className="flex h-[32px] items-center border-b border-slate-300"
                    style={{ width: cell.column.getSize() }}
                  >
                    {cellIndex === 0 && (
                      <span className="flex h-full w-[70px] items-center p-4 text-gray-500">
                        {virtualRow.index + 1}
                      </span>
                    )}
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
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
        {isPending && (
          <div className="flex w-full items-center justify-center py-4">
            <Loader />
          </div>
        )}
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
