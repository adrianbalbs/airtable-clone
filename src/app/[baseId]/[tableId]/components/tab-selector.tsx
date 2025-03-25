"use client";

import { ChevronDown, Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "~/trpc/react";

export default function TabSelector() {
  const params = useParams<{ baseId: string; tableId: string }>();
  const baseId = parseInt(params.baseId);
  const tableId = parseInt(params.tableId);
  const utils = api.useUtils();
  const baseQuery = api.base.getBaseById.useQuery({
    id: baseId,
  });

  const addTableMutation = api.table.createTable.useMutation({
    onMutate: async () => {
      await utils.base.getBaseById.cancel();

      const previousBase = utils.base.getBaseById.getData({ id: baseId });

      utils.base.getBaseById.setData({ id: baseId }, (old) => {
        if (!old) return old;

        const nextTableNumber = old.tables.length + 1;

        return {
          ...old,
          tables: [
            ...old.tables,
            {
              id: -1,
              name: `Table ${nextTableNumber}`,
              base: baseId,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        };
      });

      return { previousBase };
    },
    onError: (err, newTable, context) => {
      if (context?.previousBase) {
        utils.base.getBaseById.setData({ id: baseId }, context.previousBase);
      }
    },
    onSettled: () => {
      void utils.base.getBaseById.invalidate();
    },
  });

  return (
    <div className="flex h-[32px] bg-primary text-slate-600">
      <div className="w-4 bg-secondary"></div>
      <div className="flex flex-1 cursor-pointer overflow-hidden rounded-tr-lg bg-secondary">
        {baseQuery.data?.tables.map((table) => (
          <Link
            key={table.id}
            href={`/${baseId}/${table.id}`}
            className={`flex shrink-0 items-center rounded-t-sm px-3 ${
              table.id === tableId
                ? "bg-white text-black"
                : "hover:bg-hover hover:text-black"
            }`}
          >
            <p className="mr-2 text-sm">{table.name}</p>
            {table.id === tableId && <ChevronDown size={15} />}
          </Link>
        ))}
        <div className="flex cursor-pointer items-center hover:text-black">
          <div className="relative my-auto h-3 w-px bg-slate-500" />
          <ChevronDown size={15} className="mx-3" />
          <div className="relative my-auto h-3 w-px bg-slate-500" />
        </div>
        <div
          className="flex shrink-0 cursor-pointer items-center px-3 hover:text-black"
          onClick={() => {
            addTableMutation.mutate({ baseId });
          }}
        >
          <Plus size={15} className="mr-2" />
          <p className="mr-2 text-sm">Add or import</p>
        </div>
      </div>
      <div className="w-2 bg-primary" />
      <div className="flex items-center rounded-tl-lg bg-secondary">
        <p className="cursor-pointer px-4 text-sm hover:text-black">
          Extensions
        </p>
        <div className="flex cursor-pointer items-center hover:text-black">
          <p className="mr-2 text-sm">Tools</p>
          <ChevronDown size={15} className="mr-4" />
        </div>
      </div>
    </div>
  );
}
