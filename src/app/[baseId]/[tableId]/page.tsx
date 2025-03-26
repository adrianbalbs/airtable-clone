import { api, HydrateClient } from "~/trpc/server";
import TableNavbar from "./components/table-navbar";
import TableClientWrapper from "./components/table-client-wrapper";

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
    api.table.fetchRows.prefetchInfinite({ tableId, pageSize: 100 }),
  ]);

  return (
    <HydrateClient>
      <div className="flex h-screen w-full flex-col">
        <TableNavbar />
        <TableClientWrapper />
      </div>
    </HydrateClient>
  );
}
