"use client";

import {
  Input,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import {
  ChevronDown,
  Baseline,
  Hash,
  Trash2,
  GripVertical,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { type RouterOutputs } from "~/trpc/react";

type Column = {
  id: number;
  name: string;
  type: string;
};

type Operator = {
  value: string;
  label: string;
};

type FilterData = {
  columnId: number | null;
  operator: string;
  value: string;
};

const DEFAULT_TEXT_OPERATOR: Operator = { value: "equals", label: "equals" };
const DEFAULT_NUMBER_OPERATOR: Operator = { value: "greater_than", label: ">" };

const TEXT_OPERATORS: Operator[] = [
  DEFAULT_TEXT_OPERATOR,
  { value: "does_not_equal", label: "does not equal" },
  { value: "contains", label: "contains" },
  { value: "does_not_contain", label: "does not contain" },
  { value: "is_empty", label: "is empty" },
  { value: "is_not_empty", label: "is not empty" },
];

const NUMBER_OPERATORS: Operator[] = [
  DEFAULT_NUMBER_OPERATOR,
  { value: "less_than", label: "<" },
  { value: "equals", label: "=" },
  { value: "not_equals", label: "≠" },
];

interface FilterRowProps {
  tableData?: RouterOutputs["table"]["getTableById"];
  filter?: FilterData;
  onDelete?: () => void;
  onUpdate?: (columnId: number | null, operator: string, value: string) => void;
}

export default function FilterRow({
  tableData,
  filter,
  onDelete,
  onUpdate,
}: FilterRowProps) {
  const findColumnById = useCallback(
    (columnId: number | null | undefined) => {
      if (!columnId || !tableData?.columns) return null;
      return tableData.columns.find((col) => col.id === columnId) ?? null;
    },
    [tableData?.columns],
  );

  const prevFilterRef = useRef<FilterData | undefined>();

  const [selectedColumn, setSelectedColumn] = useState<Column | null>(() =>
    findColumnById(filter?.columnId),
  );

  const [operator, setOperator] = useState<Operator>(() => {
    if (filter?.operator) {
      const foundOperator = [...TEXT_OPERATORS, ...NUMBER_OPERATORS].find(
        (op) => op.value === filter.operator,
      );
      return foundOperator ?? DEFAULT_TEXT_OPERATOR;
    }
    return DEFAULT_TEXT_OPERATOR;
  });

  const [filterValue, setFilterValue] = useState(filter?.value ?? "");

  useEffect(() => {
    if (!filter) return;

    const prevFilter = prevFilterRef.current;

    if (
      prevFilter?.columnId !== filter.columnId ||
      prevFilter?.operator !== filter.operator ||
      prevFilter?.value !== filter.value ||
      !prevFilter
    ) {
      if (prevFilter?.columnId !== filter.columnId || !prevFilter) {
        const newColumn = findColumnById(filter.columnId);
        if (newColumn) {
          setSelectedColumn(newColumn);
        }
      }

      if (prevFilter?.operator !== filter.operator || !prevFilter) {
        if (filter.operator) {
          const allOperators = [...TEXT_OPERATORS, ...NUMBER_OPERATORS];
          const newOperator = allOperators.find(
            (op) => op.value === filter.operator,
          );
          if (newOperator) {
            setOperator(newOperator);
          }
        }
      }

      if (prevFilter?.value !== filter.value || !prevFilter) {
        setFilterValue(filter.value);
      }

      prevFilterRef.current = filter;
    }
  }, [filter, findColumnById]);

  const updateFilterValue = (newValue: string) => {
    setFilterValue(newValue);
    if (selectedColumn && onUpdate) {
      onUpdate(selectedColumn.id, operator.value, newValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    if (selectedColumn?.type === "number") {
      if (newValue === "" || newValue === "-") {
        updateFilterValue(newValue);
      } else if (/^-?\d*\.?\d*$/.test(newValue)) {
        if ((newValue.match(/\./g) ?? []).length <= 1) {
          updateFilterValue(newValue);
        }
      }
    } else {
      updateFilterValue(newValue);
    }
  };

  const handleColumnSelect = (column: Column | null) => {
    setSelectedColumn(column);

    if (column) {
      const newOperator =
        column.type === "number"
          ? DEFAULT_NUMBER_OPERATOR
          : DEFAULT_TEXT_OPERATOR;

      setOperator(newOperator);

      if (onUpdate) {
        onUpdate(column.id, newOperator.value, filterValue);
      }
    }
  };

  const handleOperatorSelect = (op: Operator) => {
    setOperator(op);

    const newValue =
      op.value === "is_empty" || op.value === "is_not_empty" ? "" : filterValue;

    setFilterValue(newValue);

    if (selectedColumn && onUpdate) {
      onUpdate(selectedColumn.id, op.value, newValue);
    }
  };

  const handleDelete = () => {
    setSelectedColumn(null);
    setFilterValue("");
    setOperator(DEFAULT_TEXT_OPERATOR);

    if (onDelete) {
      onDelete();
    }
  };

  const currentOperators =
    selectedColumn?.type === "number" ? NUMBER_OPERATORS : TEXT_OPERATORS;

  const isEmptyOperator =
    operator.value === "is_empty" || operator.value === "is_not_empty";

  return (
    <div className="flex">
      <Listbox value={selectedColumn} onChange={handleColumnSelect}>
        <div className="relative w-36">
          <ListboxButton className="flex w-full items-center justify-between rounded-l-md border-y border-l border-r border-slate-300 bg-white p-2 text-xs text-gray-500">
            <div className="flex items-center truncate">
              {selectedColumn ? (
                <>
                  {selectedColumn.type === "text" ? (
                    <Baseline size={15} className="mr-2 shrink-0" />
                  ) : (
                    <Hash size={15} className="mr-2 shrink-0" />
                  )}
                  <span className="truncate">{selectedColumn.name}</span>
                </>
              ) : (
                <span>Select column</span>
              )}
            </div>
            <ChevronDown size={15} className="ml-2 shrink-0" />
          </ListboxButton>

          <ListboxOptions
            className="absolute z-50 mt-1 max-h-60 w-[var(--button-width)] overflow-auto rounded-md border border-slate-300 bg-white py-1 text-xs shadow-lg"
            anchor="bottom"
          >
            {tableData?.columns.map((column) => (
              <ListboxOption
                key={column.id}
                value={column}
                className="ui-active:bg-blue-100 flex cursor-pointer items-center px-2 py-1.5"
              >
                {column.type === "text" ? (
                  <Baseline size={15} className="mr-2 shrink-0" />
                ) : (
                  <Hash size={15} className="mr-2 shrink-0" />
                )}
                <span className="truncate">{column.name}</span>
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>

      <Listbox value={operator} onChange={handleOperatorSelect}>
        <div className="relative w-36">
          <ListboxButton className="flex w-full items-center justify-between border-y border-slate-300 bg-white p-2 text-xs text-gray-500">
            <span className="truncate">{operator.label}</span>
            <ChevronDown size={15} className="ml-2 shrink-0" />
          </ListboxButton>
          <ListboxOptions
            className="absolute z-50 mt-1 max-h-60 w-[var(--button-width)] overflow-auto rounded-md border border-slate-300 bg-white py-1 text-xs shadow-lg"
            anchor="bottom"
          >
            {currentOperators.map((op) => (
              <ListboxOption
                key={op.value}
                value={op}
                className="ui-active:bg-blue-100 cursor-pointer px-2 py-1.5"
              >
                {op.label}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>

      <Input
        type="text"
        value={filterValue}
        onChange={handleInputChange}
        onKeyDown={(e) => {
          e.stopPropagation();
        }}
        className="w-36 border-x border-y border-slate-300 bg-white p-2 text-xs text-gray-500 focus:outline-none focus:ring-0"
        placeholder="Value"
        disabled={isEmptyOperator}
      />

      <button
        className="flex items-center justify-center border-y border-r border-slate-300 bg-white p-2 text-slate-500 hover:bg-slate-50 hover:text-red-500"
        onClick={handleDelete}
      >
        <Trash2 size={15} />
      </button>

      <button className="flex items-center justify-center rounded-r-md border-y border-r border-slate-300 bg-white p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700">
        <GripVertical size={15} />
      </button>
    </div>
  );
}
