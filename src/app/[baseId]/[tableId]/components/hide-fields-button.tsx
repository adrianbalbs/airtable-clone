"use client";
import { Input, Menu, MenuButton, MenuItems, Switch } from "@headlessui/react";
import { EyeOff, GripVertical, Hash, Baseline, HelpCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import { useState } from "react";

export default function HideFieldsButton() {
  const utils = api.useUtils();
  const params = useParams<{ tableId: string }>();
  const tableId = parseInt(params.tableId);
  const tableQuery = api.table.getTableById.useQuery({ tableId: tableId });
  const columns = tableQuery.data?.columns;
  const view = tableQuery.data?.view;
  const [searchText, setSearchText] = useState("");

  const filteredColumns = columns?.filter((column) =>
    column.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  const updateViewMutation = api.view.updateConfig.useMutation({
    onMutate: async (newConfig) => {
      await utils.table.getTableById.cancel({ tableId });

      const previousData = utils.table.getTableById.getData({ tableId });

      utils.table.getTableById.setData({ tableId }, (old) => {
        if (!old?.view) return old;
        return {
          ...old,
          view: {
            ...old.view,
            config: {
              ...old.view.config,
              ...newConfig.config,
            },
          },
        };
      });

      return { previousData };
    },
    onError: (err, newConfig, context) => {
      if (context?.previousData) {
        utils.table.getTableById.setData({ tableId }, context.previousData);
      }
    },
    onSettled: () => {
      void utils.table.getTableById.invalidate({ tableId });
    },
  });

  const handleToggleColumnVisibility = (columnId: number) => {
    if (!view?.id) return;

    const currentHiddenColumns = view.config.hiddenColumns ?? [];
    const isHidden = currentHiddenColumns.includes(columnId);

    const newHiddenColumns = isHidden
      ? currentHiddenColumns.filter((id) => id !== columnId)
      : [...currentHiddenColumns, columnId];

    updateViewMutation.mutate({
      viewId: view.id,
      config: {
        hiddenColumns: newHiddenColumns,
      },
    });
  };

  return (
    <Menu>
      <MenuButton className="mr-2 flex cursor-pointer items-center rounded-sm px-2 py-1 hover:bg-slate-200">
        <EyeOff size={15} className="mr-2" />
        <p className="mr-2">Hide fields</p>
      </MenuButton>
      <MenuItems
        anchor="bottom start"
        className="z-20 w-[300px] rounded-md border border-slate-300 bg-white p-4 shadow-lg"
      >
        <div className="mb-4 flex w-full items-center justify-between border-b border-slate-300">
          <Input
            placeholder="Find a field"
            className="w-full px-1 py-2 text-xs focus:outline-none"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
          />
          <HelpCircle size={15} className="mr-2 text-slate-500" />
        </div>
        <div className="space-y-2">
          {filteredColumns?.length === 0 ? (
            <div className="flex items-center">
              <p className="text-xs text-slate-500">No results found</p>
            </div>
          ) : (
            filteredColumns?.map((column) => {
              const isHidden =
                view?.config.hiddenColumns?.includes(column.id) ?? false;
              return (
                <div
                  key={column.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <Switch
                      checked={!isHidden}
                      onChange={() => handleToggleColumnVisibility(column.id)}
                      className="group relative mr-2 flex h-4 w-8 cursor-pointer rounded-full bg-slate-300 p-0.5 transition-colors duration-200 ease-in-out focus:outline-none data-[checked]:bg-green-400 data-[focus]:outline-1 data-[focus]:outline-white"
                    >
                      <span
                        aria-hidden="true"
                        className="pointer-events-none inline-block size-3 translate-x-0 rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-4"
                      />
                    </Switch>
                    {column.type === "number" ? (
                      <Hash size={15} className="mr-2 text-slate-500" />
                    ) : (
                      <Baseline size={15} className="mr-2 text-slate-500" />
                    )}
                    <p className="text-xs">{column.name}</p>
                  </div>
                  <GripVertical size={15} className="text-slate-500" />
                </div>
              );
            })
          )}
        </div>
      </MenuItems>
    </Menu>
  );
}
