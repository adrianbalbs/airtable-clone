import {
  Input,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Menu,
  MenuButton,
  MenuItems,
} from "@headlessui/react";
import { Baseline, ChevronDown, Hash, Plus } from "lucide-react";
import { useState } from "react";
import { api, type RouterOutputs } from "~/trpc/react";

type TableData = RouterOutputs["table"]["getTableById"];
type Column = TableData["columns"][number];

export default function AddColumnDropDownButton({
  tableId,
  baseId,
}: {
  tableId: number;
  baseId: number;
}) {
  const [value, setValue] = useState("");
  const [columnType, setColumnType] = useState<"text" | "number">("text");
  const utils = api.useUtils();

  const { data: tableData } = api.table.getTableById.useQuery({
    tableId,
    baseId,
  });

  const addColumn = api.table.addColumn.useMutation({
    onMutate: async ({ name, type }) => {
      // Cancel any outgoing refetches
      await utils.table.getTableById.cancel({ tableId, baseId });
      await utils.table.fetchRows.cancel({ tableId });

      // Snapshot the previous values
      const previousTableData = utils.table.getTableById.getData({
        tableId,
        baseId,
      });
      const previousRowsData = utils.table.fetchRows.getInfiniteData({
        tableId,
        pageSize: 50,
      });

      const optimisticId = -Date.now();
      const optimisticColumn: Column = {
        id: optimisticId,
        table: tableId,
        name,
        type,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Update table data optimistically
      if (tableData) {
        utils.table.getTableById.setData(
          { tableId, baseId },
          {
            ...tableData,
            columns: [...tableData.columns, optimisticColumn],
          },
        );
      }

      // Update rows data optimistically
      utils.table.fetchRows.setInfiniteData(
        { tableId, pageSize: 50 },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              rows: page.rows.map((row) => ({
                ...row,
                data: {
                  ...row.data,
                  [name]: null,
                },
              })),
            })),
          };
        },
      );

      return { previousTableData, previousRowsData, optimisticId };
    },
    onError: (_, __, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTableData) {
        utils.table.getTableById.setData(
          { tableId, baseId },
          context.previousTableData,
        );
      }
      if (context?.previousRowsData) {
        utils.table.fetchRows.setInfiniteData(
          { tableId, pageSize: 50 },
          context.previousRowsData,
        );
      }
    },
    onSuccess: (newColumn, _, context) => {
      if (context?.optimisticId && tableData) {
        // Update table data with the real column
        utils.table.getTableById.setData(
          { tableId, baseId },
          {
            ...tableData,
            columns: tableData.columns.map((col) =>
              col.id === context.optimisticId ? newColumn : col,
            ),
          },
        );

        // Update rows data with the real column
        utils.table.fetchRows.setInfiniteData(
          { tableId, pageSize: 50 },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                rows: page.rows.map((row) => ({
                  ...row,
                  data: {
                    ...row.data,
                    [newColumn.name]: row.data[newColumn.name] ?? null,
                  },
                })),
              })),
            };
          },
        );
      }
    },
  });

  const handleAddColumn = () => {
    if (!value.trim()) return;

    addColumn.mutate({
      tableId,
      name: value.trim(),
      type: columnType,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();

    if (e.key === "Enter") {
      handleAddColumn();
    }
  };

  return (
    <Menu>
      {({ close }) => (
        <div>
          <MenuButton className="flex h-[32px] w-[92px] cursor-pointer items-center justify-center border-r border-slate-300 bg-gray-100 px-2 text-xs">
            <Plus size={15} className="mr-2" />
          </MenuButton>
          <MenuItems
            anchor="bottom start"
            className="h-xl z-20 mt-1 w-[400px] rounded-xl border border-slate-300 bg-white p-4 shadow-lg"
          >
            <Input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              placeholder="Field name"
              className="mb-4 w-full rounded-lg border border-slate-300 p-2 text-xs shadow-md"
            />
            <div className="relative">
              <Listbox value={columnType} onChange={setColumnType}>
                <div className="relative">
                  <ListboxButton className="mb-4 flex w-full items-center justify-between rounded-lg border border-slate-300 p-2 text-xs text-gray-500 shadow-md">
                    <div className="flex items-center">
                      {columnType === "text" ? (
                        <Baseline size={15} className="mr-2" />
                      ) : (
                        <Hash size={15} className="mr-2" />
                      )}
                      <span>{columnType === "text" ? "Text" : "Number"}</span>
                    </div>
                    <ChevronDown size={15} className="ml-2" />
                  </ListboxButton>

                  <ListboxOptions
                    className="absolute z-50 mt-1 w-[var(--button-width)] rounded-lg border border-slate-300 bg-white p-2 text-xs text-gray-500 shadow-lg"
                    anchor="bottom"
                  >
                    <ListboxOption
                      value="text"
                      className="flex cursor-pointer items-center rounded px-2 py-1 hover:bg-gray-100"
                    >
                      <Baseline size={15} className="mr-2" />
                      <span>Text</span>
                    </ListboxOption>
                    <ListboxOption
                      value="number"
                      className="flex cursor-pointer items-center rounded px-2 py-1 hover:bg-gray-100"
                    >
                      <Hash size={15} className="mr-2" />
                      <span>Number</span>
                    </ListboxOption>
                  </ListboxOptions>
                </div>
              </Listbox>
            </div>
            <div className="flex items-center justify-end">
              <button
                onClick={() => close()}
                className="mr-2 rounded-lg px-4 py-2 text-xs text-gray-500 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (value.trim()) {
                    handleAddColumn();
                    setValue("");
                    close();
                  }
                }}
                className="rounded-lg bg-blue-500 px-4 py-2 text-xs text-white shadow-md hover:bg-blue-600"
                disabled={!value.trim()}
              >
                Create field
              </button>
            </div>
          </MenuItems>
        </div>
      )}
    </Menu>
  );
}
