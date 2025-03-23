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

type RowData = Record<string, string | number>;

export function Table({ tableData }: TableProps) {
  const { table: tableInfo, columns } = tableData;
  const columnHelper = createColumnHelper<RowData>();

  const tableColumns = columns.map((col) =>
    columnHelper.accessor(col.name, {
      header: () => (
        <div className="flex h-[32px] items-center justify-between px-2 text-xs">
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
      cell: (info) => (
        <input
          className="h-full w-full cursor-text px-2 focus:outline-blue-500"
          value={info.getValue()?.toString() ?? ""}
          onChange={(e) => {
            /* Handle change */
          }}
        />
      ),
      size: col.name === "Name" ? 230 : 180,
    }),
  );

  const reactTable = useReactTable({
    data: [], // We'll populate this with actual data later
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { data, isPending, isError } = api.table.fetchRows.useInfiniteQuery(
    { tableId: tableInfo.id },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      enabled: !!tableInfo.id,
    },
  );

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
            {row.getVisibleCells().map((cell) => (
              <div
                key={cell.id}
                className="flex h-[32px] items-center border-r border-slate-300"
                style={{ width: cell.column.getSize() }}
              >
                {index === 0 && (
                  <span className="flex h-full w-[70px] items-center p-4 text-gray-500">
                    {index + 1}
                  </span>
                )}
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            ))}
          </div>
        ))}
        <div className="flex w-fit border-b border-slate-300 bg-white text-xs hover:bg-gray-100">
          <div className="flex h-[32px] w-[230px] cursor-pointer items-center border-r border-slate-300 p-4">
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
