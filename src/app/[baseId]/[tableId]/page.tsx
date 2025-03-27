import { api, HydrateClient } from "~/trpc/server";
import TableNavbar from "./components/table-navbar";
import TabSelector from "./components/tab-selector";
import FilterAndViewBar from "./components/filter-and-view-bar";
import Sidebar from "./components/sidebar";
import { Table } from "./components/table";
import { SearchProvider } from "./contexts/search-context";

export default async function Base({
  params,
}: {
  params: Promise<{ baseId: string; tableId: string }>;
}) {
  const p = await params;
  const baseId = parseInt(p.baseId);
  const tableId = parseInt(p.tableId);

  await api.base.getBaseById.prefetch({ id: baseId });
  await api.table.getTableById.prefetch({ tableId });
  await api.table.fetchRows.prefetchInfinite({ tableId, pageSize: 100 });

  return (
    <HydrateClient>
      <div className="flex h-screen w-full flex-col">
        <TableNavbar />
        <SearchProvider>
          <TabSelector />
          <FilterAndViewBar />
          <div className="flex flex-1 overflow-auto">
            <Sidebar />
            <Table tableId={tableId} baseId={baseId} />
          </div>
        </SearchProvider>
      </div>
    </HydrateClient>
  );
}
