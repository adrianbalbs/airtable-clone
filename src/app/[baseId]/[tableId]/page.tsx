import { api, HydrateClient } from "~/trpc/server";
import TableNavbar from "./components/table-navbar";
import Sidebar from "./components/sidebar";
import { Table } from "./components/table";

export default async function Base({
  params,
}: {
  params: Promise<{ baseId: string; tableId: string }>;
}) {
  const p = await params;
  const baseId = parseInt(p.baseId);
  const tableId = parseInt(p.tableId);

  await Promise.all([
    api.base.getBaseById.prefetch({ id: baseId }),
    api.table.getTableById.prefetch({ tableId }),
    api.table.fetchRows.prefetchInfinite({ tableId, pageSize: 50 }),
  ]);

  return (
    <HydrateClient>
      <div className="flex h-screen w-full flex-col">
        <TableNavbar />
        <div className="flex flex-1 overflow-auto">
          <Sidebar />
          <Table tableId={tableId} baseId={baseId} />
        </div>
      </div>
    </HydrateClient>
  );
}
