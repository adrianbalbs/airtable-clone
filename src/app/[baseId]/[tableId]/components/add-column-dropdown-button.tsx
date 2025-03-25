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
}: {
  tableId: number;
}) {
  const [value, setValue] = useState("");
  const [columnType, setColumnType] = useState<"text" | "number">("text");
  const [error, setError] = useState<string | null>(null);
  const utils = api.useUtils();

  const { data: tableData } = api.table.getTableById.useQuery({
    tableId,
  });

  const addColumn = api.table.addColumn.useMutation({
    onMutate: async ({ name, type }) => {
      await utils.table.getTableById.cancel({ tableId });
      await utils.table.fetchRows.cancel({ tableId });

      const previousTableData = utils.table.getTableById.getData({
        tableId,
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

      if (tableData) {
        utils.table.getTableById.setData(
          { tableId },
          {
            ...tableData,
            columns: [...tableData.columns, optimisticColumn],
          },
        );
      }

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
      if (context?.previousTableData) {
        utils.table.getTableById.setData(
          { tableId },
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
        utils.table.getTableById.setData(
          { tableId },
          {
            ...tableData,
            columns: tableData.columns.map((col) =>
              col.id === context.optimisticId ? newColumn : col,
            ),
          },
        );

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

    if (tableData?.columns.some((col) => col.name === value.trim())) {
      setError("A column with this name already exists");
      return;
    }

    setError(null);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setError(null);
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
            <div className="mb-4">
              <Input
                type="text"
                value={value}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                placeholder="Field name"
                className={`w-full rounded-lg border ${error ? "border-red-500" : "border-slate-300"} p-2 text-xs shadow-md`}
              />
              {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
            </div>
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
                onClick={() => {
                  close();
                  setError(null);
                  setValue("");
                }}
                className="mr-2 rounded-lg px-4 py-2 text-xs text-gray-500 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (value.trim()) {
                    handleAddColumn();
                    if (!error) {
                      setValue("");
                      close();
                    }
                  }
                }}
                className="rounded-lg bg-blue-500 px-4 py-2 text-xs text-white shadow-md hover:bg-blue-600 disabled:opacity-50"
                disabled={!value.trim() || !!error}
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
