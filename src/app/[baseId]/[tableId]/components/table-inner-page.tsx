"use client";

import TableNavbar from "./table-navbar";
import Sidebar from "./sidebar";
import { Table } from "./table";
import { api } from "~/trpc/react";
import Loader from "./loader";

export default function TableInnerPage({
  name,
  email,
  baseId,
  tableId,
}: {
  name: string;
  email: string;
  baseId: number;
  tableId: number;
}) {
  const { data, isPending, isError } = api.table.getTableById.useQuery({
    baseId,
    tableId,
  });
  return (
    <>
      <TableNavbar name={name} email={email} />
      <div className="flex flex-1 overflow-auto">
        <Sidebar />
        {isPending ? (
          <Loader />
        ) : isError ? (
          <div className="flex h-screen flex-1 items-center justify-center text-red-600">
            <p>
              Something went wrong while loading the table. Please try again
              later.
            </p>
          </div>
        ) : (
          <Table tableData={data} />
        )}
      </div>
    </>
  );
}
