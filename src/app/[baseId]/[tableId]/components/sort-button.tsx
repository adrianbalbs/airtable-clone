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
import { useState } from "react";
import { api, type RouterOutputs } from "~/trpc/react";

type TableData = RouterOutputs["table"]["getTableById"];
type Column = TableData["columns"][number];

type SortDirection = "asc" | "desc";

export default function SortButton() {
  const params = useParams<{ tableId: string }>();
  const tableId = parseInt(params.tableId);
  const [selectedColumn, setSelectedColumn] = useState<Column | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const { data: tableData } = api.table.getTableById.useQuery({
    tableId: tableId,
  });

  const getSortOptions = () => {
    if (!selectedColumn) return [];
    if (selectedColumn.type === "text") {
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

  return (
    <Menu>
      <MenuButton className="mr-2 flex cursor-pointer items-center rounded-sm px-2 py-1 hover:bg-slate-200">
        <ArrowDownUp size={15} className="mr-2" />
        <p className="mr-2">Sort</p>
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
          <div className="flex w-full items-end gap-2">
            <Listbox value={selectedColumn} onChange={setSelectedColumn}>
              <div className="relative w-full flex-1">
                <ListboxButton className="mb-4 flex w-full items-center justify-between rounded-md border border-slate-300 p-2 text-xs text-gray-500 shadow-md">
                  <div className="flex items-center">
                    {selectedColumn ? (
                      <>
                        {selectedColumn.type === "text" ? (
                          <Baseline size={15} className="mr-2" />
                        ) : (
                          <Hash size={15} className="mr-2" />
                        )}
                        <span>{selectedColumn.name}</span>
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
              value={sortDirection}
              onChange={setSortDirection}
              disabled={!selectedColumn}
            >
              <div className="relative">
                <ListboxButton className="mb-4 flex w-full items-center justify-between rounded-md border border-slate-300 p-2 text-xs text-gray-500 shadow-md disabled:opacity-50">
                  <div className="flex items-center">
                    {selectedColumn ? (
                      <span>
                        {selectedColumn.type === "text"
                          ? sortDirection === "asc"
                            ? "A → Z"
                            : "Z → A"
                          : sortDirection === "asc"
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
                  {getSortOptions().map((option) => (
                    <ListboxOption
                      key={option.value}
                      value={option.value}
                      className="flex cursor-pointer items-center rounded px-2 py-1 hover:bg-gray-100"
                    >
                      <span>{option.label}</span>
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </div>
            </Listbox>
            <button className="mb-4 flex h-[32px] w-[32px] items-center justify-center rounded-md text-gray-500 hover:bg-gray-100">
              <X size={15} />
            </button>
          </div>
        </div>
        <div className="flex cursor-pointer items-center text-sm text-slate-500 hover:text-slate-700">
          <Plus size={15} className="mr-2" />
          <p className="text-sm">Add another sort</p>
        </div>
      </MenuItems>
    </Menu>
  );
}
