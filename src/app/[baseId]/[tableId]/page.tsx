import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { api } from "~/trpc/server";
import TableNavbar from "./components/table-navbar";
import Sidebar from "./components/sidebar";
import { Table } from "./components/table";

export default async function Base({
  params,
}: {
  params: { baseId: string; tableId: string };
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("api/auth/signin");
  }

  const name = session.user.name ?? "undefined";
  const email = session?.user.email ?? "undefined";
  const { baseId, tableId } = await params;

  const data = await api.table.getTableById({
    baseId: parseInt(baseId),
    tableId: parseInt(tableId),
  });

  return (
    <div className="flex h-screen flex-col">
      <TableNavbar name={name} email={email} />
      <div className="flex flex-1 overflow-auto">
        <Sidebar />
        <Table tableData={data} />
      </div>
    </div>
  );
}
