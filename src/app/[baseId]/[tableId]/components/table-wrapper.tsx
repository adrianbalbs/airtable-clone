"use client";

import { api } from "~/trpc/react";
import TableNavbar from "./table-navbar";
import { Table } from "./table";
import Loader from "./loader";
import Sidebar from "./sidebar";

interface TableWrapperProps {
  baseId: string;
  tableId: string;
  name: string;
  email: string;
}

export default function TableWrapper({
  baseId,
  tableId,
  name,
  email,
}: TableWrapperProps) {
  const parsedBaseId = parseInt(baseId);
  const parsedTableId = parseInt(tableId);

  const { data: tableData, isLoading: isTableLoading } =
    api.table.getTableById.useQuery({
      baseId: parsedBaseId,
      tableId: parsedTableId,
    });

  const {
    data: rowsData,
    isLoading: isRowsLoading,
    fetchNextPage,
    hasNextPage,
  } = api.table.fetchRows.useInfiniteQuery(
    { tableId: parsedTableId, pageSize: 50 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      enabled: !!tableData,
      staleTime: 0,
      refetchOnWindowFocus: false,
    },
  );

  const isLoading = isTableLoading || (isRowsLoading && !rowsData);

  if (isLoading || !tableData) {
    return (
      <div className="flex h-screen w-full flex-col">
        <TableNavbar name={name} email={email} />
        <div className="flex flex-1 items-center justify-center">
          <Loader />
        </div>
      </div>
    );
  }

  const rows = rowsData?.pages.flatMap((page) => page.rows) ?? [];

  return (
    <div className="flex h-screen w-full flex-col">
      <TableNavbar name={name} email={email} />
      <div className="flex flex-1 overflow-auto">
        <Sidebar />
        <Table
          tableData={tableData}
          baseId={parsedBaseId}
          rows={rows}
          hasNextPage={hasNextPage ?? false}
          fetchNextPage={fetchNextPage}
          isLoadingMore={isRowsLoading}
        />
      </div>
    </div>
  );
}
