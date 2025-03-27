"use client";

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Menu,
  MenuButton,
  MenuItems,
} from "@headlessui/react";
import {
  ArrowDownUp,
  CircleHelp,
  Plus,
  ChevronDown,
  Baseline,
  Hash,
  X,
} from "lucide-react";
import { useParams } from "next/navigation";
import { api, type RouterOutputs } from "~/trpc/react";
import { useSearch } from "../contexts/search-context";

type TableData = RouterOutputs["table"]["getTableById"];
type Column = TableData["columns"][number];

type SortDirection = "asc" | "desc";

export default function SortButton() {
  const params = useParams<{ tableId: string }>();
  const tableId = parseInt(params.tableId);
  const utils = api.useUtils();
  const { searchValue } = useSearch();
  const { data: tableData } = api.table.getTableById.useQuery({
    tableId: tableId,
  });

  const updateViewMutation = api.view.updateConfig.useMutation({
    onMutate: async (newConfig) => {
      utils.table.fetchRows.setInfiniteData(
        { tableId, pageSize: 100, search: searchValue },
        (old) => {
          if (!old) return { pages: [], pageParams: [] };
          return { ...old, pages: [] };
        },
      );

      await utils.table.getTableById.cancel({ tableId });
      await utils.table.fetchRows.cancel({ tableId });

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
    onSettled: () => {
      utils.table.fetchRows.setInfiniteData(
        { tableId, pageSize: 100, search: searchValue },
        undefined,
      );

      void utils.table.getTableById.invalidate({ tableId });
      void utils.table.fetchRows.invalidate({
        tableId,
        search: searchValue,
        pageSize: 100,
      });
    },
    onError: (err, newConfig, context) => {
      if (context?.previousData) {
        utils.table.getTableById.setData({ tableId }, context.previousData);
      }
    },
  });

  const getSortOptions = (column: Column | null) => {
    if (!column) return [];
    if (column.type === "text") {
      return [
        { value: "asc", label: "A → Z" },
        { value: "desc", label: "Z → A" },
      ];
    }
    return [
      { value: "asc", label: "1 → 9" },
      { value: "desc", label: "9 → 1" },
    ];
  };

  const addNewSort = () => {
    if (!tableData?.view?.id) return;

    const currentSorts = tableData.view.config.sort ?? [];
    const newSorts = [
      ...currentSorts,
      { columnId: 0, direction: "asc" as const },
    ];

    updateViewMutation.mutate({
      viewId: tableData.view.id,
      config: {
        sort: newSorts,
      },
    });
  };

  const updateSort = (
    index: number,
    updates: { column?: Column | null; direction?: SortDirection },
  ) => {
    if (!tableData?.view?.id) return;

    const currentSorts = tableData.view.config.sort ?? [];
    const newSorts = [...currentSorts];

    if (updates.column) {
      newSorts[index] = {
        columnId: updates.column.id,
        direction: newSorts[index]?.direction ?? "asc",
      };
    }

    if (updates.direction) {
      newSorts[index] = {
        ...newSorts[index],
        columnId: newSorts[index]?.columnId ?? 0,
        direction: updates.direction,
      };
    }

    updateViewMutation.mutate({
      viewId: tableData.view.id,
      config: {
        sort: newSorts,
      },
    });
  };

  const removeSort = (index: number) => {
    if (!tableData?.view?.id) return;

    const currentSorts = tableData.view.config.sort ?? [];
    const newSorts = currentSorts.filter((_, i) => i !== index);

    if (newSorts.length === 0) {
      newSorts.push({ columnId: 0, direction: "asc" as const });
    }

    updateViewMutation.mutate({
      viewId: tableData.view.id,
      config: {
        sort: newSorts,
      },
    });
  };

  const currentSorts = tableData?.view?.config.sort?.map((sort) => ({
    column: tableData.columns.find((col) => col.id === sort.columnId) ?? null,
    direction: sort.direction,
  })) ?? [{ column: null, direction: "asc" }];

  return (
    <Menu>
      <MenuButton className="mr-2 flex cursor-pointer items-center rounded-sm px-2 py-1 hover:bg-slate-200">
        <ArrowDownUp size={15} className="mr-2" />
        <p className="mr-2">Sort</p>
        {updateViewMutation.isPending && (
          <span className="ml-1 h-3 w-3 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
        )}
      </MenuButton>
      <MenuItems
        anchor="bottom start"
        className="z-20 w-[452px] rounded-md border border-slate-300 bg-white p-4 shadow-lg"
      >
        <div className="flex items-center">
          <p className="mr-2 text-sm font-medium">Sort by</p>
          <CircleHelp size={15} className="text-slate-500" />
        </div>
        <div className="my-2 h-px w-full bg-slate-200" />
        <div>
          {currentSorts.map((sort, index) => (
            <div key={index} className="flex w-full items-end gap-2">
              <Listbox
                value={sort.column}
                onChange={(column) => {
                  updateSort(index, { column });
                }}
                disabled={updateViewMutation.isPending}
              >
                <div className="relative w-full flex-1">
                  <ListboxButton
                    className={`mb-4 flex w-full items-center justify-between rounded-md border border-slate-300 p-2 text-xs text-gray-500 shadow-md ${updateViewMutation.isPending ? "cursor-not-allowed opacity-50" : ""}`}
                    disabled={updateViewMutation.isPending}
                  >
                    <div className="flex items-center">
                      {sort.column ? (
                        <>
                          {sort.column.type === "text" ? (
                            <Baseline size={15} className="mr-2" />
                          ) : (
                            <Hash size={15} className="mr-2" />
                          )}
                          <span>{sort.column.name}</span>
                        </>
                      ) : (
                        <span>Select a column</span>
                      )}
                    </div>
                    <ChevronDown size={15} className="ml-2" />
                  </ListboxButton>

                  <ListboxOptions
                    className="absolute z-50 mt-1 w-[var(--button-width)] rounded-md border border-slate-300 bg-white p-2 text-xs text-gray-500 shadow-lg"
                    anchor="bottom"
                  >
                    {tableData?.columns.map((column) => (
                      <ListboxOption
                        key={column.id}
                        value={column}
                        className="flex cursor-pointer items-center rounded px-2 py-1 hover:bg-gray-100"
                        disabled={updateViewMutation.isPending}
                      >
                        {column.type === "text" ? (
                          <Baseline size={15} className="mr-2" />
                        ) : (
                          <Hash size={15} className="mr-2" />
                        )}
                        <span>{column.name}</span>
                      </ListboxOption>
                    ))}
                  </ListboxOptions>
                </div>
              </Listbox>

              <Listbox
                value={sort.direction}
                onChange={(direction) => {
                  updateSort(index, { direction });
                }}
                disabled={!sort.column || updateViewMutation.isPending}
              >
                <div className="relative">
                  <ListboxButton
                    className={`mb-4 flex w-full items-center justify-between rounded-md border border-slate-300 p-2 text-xs text-gray-500 shadow-md disabled:opacity-50 ${updateViewMutation.isPending ? "cursor-not-allowed opacity-50" : ""}`}
                    disabled={!sort.column || updateViewMutation.isPending}
                  >
                    <div className="flex items-center">
                      {sort.column ? (
                        <span>
                          {sort.column.type === "text"
                            ? sort.direction === "asc"
                              ? "A → Z"
                              : "Z → A"
                            : sort.direction === "asc"
                              ? "1 → 9"
                              : "9 → 1"}
                        </span>
                      ) : (
                        <span>Direction</span>
                      )}
                    </div>
                    <ChevronDown size={15} className="ml-2" />
                  </ListboxButton>

                  <ListboxOptions
                    className="absolute z-50 mt-1 w-[var(--button-width)] rounded-md border border-slate-300 bg-white p-2 text-xs text-gray-500 shadow-lg"
                    anchor="bottom"
                  >
                    {getSortOptions(sort.column).map((option) => (
                      <ListboxOption
                        key={option.value}
                        value={option.value}
                        className="flex cursor-pointer items-center rounded px-2 py-1 hover:bg-gray-100"
                        disabled={updateViewMutation.isPending}
                      >
                        <span>{option.label}</span>
                      </ListboxOption>
                    ))}
                  </ListboxOptions>
                </div>
              </Listbox>
              <button
                className={`mb-4 flex h-[32px] w-[32px] items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 ${updateViewMutation.isPending ? "cursor-not-allowed opacity-50" : ""}`}
                onClick={() => removeSort(index)}
                disabled={updateViewMutation.isPending}
              >
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
        <div
          className={`flex items-center text-sm text-slate-500 hover:text-slate-700 ${updateViewMutation.isPending ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          onClick={updateViewMutation.isPending ? undefined : addNewSort}
        >
          <Plus size={15} className="mr-2" />
          <p className="text-sm">Add another sort</p>
        </div>
      </MenuItems>
    </Menu>
  );
}
