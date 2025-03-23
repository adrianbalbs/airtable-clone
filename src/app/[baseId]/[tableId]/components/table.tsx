"use client";

import { Baseline, ChevronDown, Hash, Plus } from "lucide-react";
import { api, type RouterOutputs } from "~/trpc/react";
import Loader from "./loader";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState, useCallback, memo, useEffect } from "react";

type TableProps = {
  tableData: RouterOutputs["table"]["getTableById"];
};

type ColumnDef = {
  id: number;
  table: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  type: "number" | "text";
};

type RowData = {
  id: number;
  table: number;
  data: Record<string, string | number | null>;
  createdAt: Date;
  updatedAt: Date;
};

type EditableCellProps = {
  value: string | number | null;
  rowIndex: number;
  column: ColumnDef;
  onUpdate: (columnId: number, rowIndex: number, value: string) => void;
};

const EditableCell = memo(function EditableCell({
  value,
  rowIndex,
  column,
  onUpdate,
}: EditableCellProps) {
  const [inputValue, setInputValue] = useState(value?.toString() ?? "");

  useEffect(() => {
    setInputValue(value?.toString() ?? "");
  }, [value]);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue !== value?.toString()) {
      onUpdate(column.id, rowIndex, newValue);
    }
  };

  return (
    <input
      className="h-full w-full cursor-text px-2 focus:outline-blue-500"
      value={inputValue}
      type={column.type === "number" ? "number" : "text"}
      onChange={(e) => setInputValue(e.target.value)}
      onBlur={handleBlur}
    />
  );
});

export function Table({ tableData: initialData }: TableProps) {
  const { table: tableInfo, columns } = initialData;
  const columnHelper =
    createColumnHelper<Record<string, string | number | null>>();
  const utils = api.useUtils();

  const { data, isPending, isError } = api.table.fetchRows.useInfiniteQuery(
    { tableId: tableInfo.id },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      enabled: !!tableInfo.id,
    },
  );

  const rows = useMemo(() => {
    return data?.pages.flatMap((page) => page.rows) ?? [];
  }, [data]) as RowData[];

  const addRow = api.table.addRow.useMutation({
    onError: () => {
      // On error, revert the optimistic update
      utils.table.fetchRows.setInfiniteData(
        { tableId: tableInfo.id },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page, pageIndex) => {
              if (pageIndex !== 0) return page; // Only remove from first page
              return {
                ...page,
                rows: page.rows.slice(1), // Remove the optimistically added row
              };
            }),
          };
        },
      );
    },
  });

  const handleAddRow = useCallback(() => {
    // Create an empty row data object
    const emptyRowData: Record<string, null> = {};
    columns.forEach((col) => {
      emptyRowData[col.name] = null;
    });

    // Create a temporary row for optimistic update
    const optimisticRow: RowData = {
      id: -Date.now(), // Temporary negative ID to avoid conflicts
      table: tableInfo.id,
      data: emptyRowData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Optimistically update the UI
    utils.table.fetchRows.setInfiniteData({ tableId: tableInfo.id }, (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page, pageIndex) => {
          if (pageIndex !== 0) return page; // Only add to first page
          return {
            ...page,
            rows: [...page.rows, optimisticRow],
          };
        }),
      };
    });

    // Send the create request to the server
    addRow.mutate({
      tableId: tableInfo.id,
    });
  }, [columns, tableInfo.id, utils.table.fetchRows, addRow]);

  const updateCell = api.table.updateCell.useMutation({
    onError: (error, { rowId, columnId, value: failedValue }) => {
      utils.table.fetchRows.setInfiniteData(
        { tableId: tableInfo.id },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              rows: page.rows.map((row) => {
                if (row.id !== rowId) return row;
                const column = columns.find((c) => c.id === columnId);
                if (!column) return row;
                return {
                  ...row,
                  data: {
                    ...row.data,
                    [column.name]: failedValue,
                  },
                };
              }),
            })),
          };
        },
      );
    },
  });

  const handleCellUpdate = useCallback(
    (columnId: number, rowIndex: number, value: string) => {
      const column = columns.find((c) => c.id === columnId);
      const row = rows[rowIndex];

      if (!row || !column) return;

      const typedValue =
        value === ""
          ? null
          : column.type === "number"
            ? Number(value) || null
            : value;

      utils.table.fetchRows.setInfiniteData(
        { tableId: tableInfo.id },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              rows: page.rows.map((r) => {
                if (r.id !== row.id) return r;
                return {
                  ...r,
                  data: {
                    ...r.data,
                    [column.name]: typedValue,
                  },
                };
              }),
            })),
          };
        },
      );

      updateCell.mutate({
        tableId: tableInfo.id,
        rowId: row.id,
        columnId,
        value: typedValue,
      });
    },
    [columns, rows, updateCell, tableInfo.id, utils.table.fetchRows],
  );

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

            return (
              <EditableCell
                value={value}
                rowIndex={rowIndex}
                column={col}
                onUpdate={handleCellUpdate}
              />
            );
          },
          size: col.name === "Name" ? 230 : 180,
        }),
      ),
    [columns, columnHelper, handleCellUpdate],
  );

  const tableData = useMemo(() => {
    return rows.map((row) => row.data || {});
  }, [rows]);

  const reactTable = useReactTable({
    data: tableData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
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
      <div className="flex-1 overflow-auto bg-gray-50">
        {reactTable.getRowModel().rows.map((row, index) => (
          <div
            key={row.id}
            className="flex w-fit border-b border-slate-300 bg-white text-xs hover:bg-gray-100"
          >
            {row.getVisibleCells().map((cell, cellIndex) => (
              <div
                key={cell.id}
                className="flex h-[32px] items-center border-r border-slate-300"
                style={{ width: cell.column.getSize() }}
              >
                {cellIndex === 0 && (
                  <span className="flex h-full w-[70px] items-center p-4 text-gray-500">
                    {index + 1}
                  </span>
                )}
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            ))}
          </div>
        ))}
        <div
          className="flex w-fit border-b border-slate-300 bg-white text-xs hover:bg-gray-100"
          onClick={handleAddRow}
        >
          <div className="flex h-[32px] w-[230px] cursor-pointer items-center border-r border-slate-300 py-4 pl-3">
            <Plus size={15} />
          </div>
        </div>
      </div>
      <div className="flex border-t border-slate-300 text-xs">
        <p className="p-2">{reactTable.getRowModel().rows.length} records</p>
      </div>
    </div>
  );
}
