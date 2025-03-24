import React, { useState, useEffect, useRef, memo, useCallback } from "react";
import { api } from "~/trpc/react";

type EditableCellProps = {
  value: string | number | null;
  rowId: number;
  columnId: number;
  columnType: "text" | "number";
  tableId: number;
  onNavigate?: (direction: "right" | "left" | "up" | "down") => void;
};

export const EditableCell = memo(function EditableCell({
  value,
  rowId,
  columnId,
  columnType,
  tableId,
  onNavigate,
}: EditableCellProps) {
  const [localValue, setLocalValue] = useState(value?.toString() ?? "");
  const isDirtyRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const latestValueRef = useRef(value?.toString() ?? "");
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const utils = api.useUtils();

  const updateCell = api.table.updateCell.useMutation({
    onMutate: async ({ value: newValue }) => {
      await utils.table.fetchRows.cancel();
      utils.table.fetchRows.setInfiniteData({ tableId }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            rows: page.rows.map((row) => {
              if (row.id !== rowId) return row;
              return {
                ...row,
                data: {
                  ...row.data,
                  [columnId]: newValue,
                },
              };
            }),
          })),
        };
      });
    },
  });

  const sendUpdate = useCallback(
    (newValue: string) => {
      if (newValue === latestValueRef.current) return;

      const typedValue =
        newValue === ""
          ? null
          : columnType === "number"
            ? Number(newValue) || null
            : newValue;

      void updateCell.mutateAsync({
        tableId,
        rowId,
        columnId,
        value: typedValue,
      });
      latestValueRef.current = newValue;
    },
    [columnId, columnType, rowId, tableId, updateCell],
  );

  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (
        columnType === "number" &&
        newValue !== "" &&
        !/^\d*\.?\d*$/.test(newValue)
      ) {
        return;
      }
      isDirtyRef.current = true;
      setLocalValue(newValue);

      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      updateTimeoutRef.current = setTimeout(() => {
        sendUpdate(newValue);
        updateTimeoutRef.current = undefined;
      }, 500);
    },
    [columnType, sendUpdate],
  );

  useEffect(() => {
    if (document.activeElement !== inputRef.current && !isDirtyRef.current) {
      setLocalValue(value?.toString() ?? "");
      latestValueRef.current = value?.toString() ?? "";
    }
  }, [value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!onNavigate) return;

      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = undefined;
      }

      if (
        e.key === "Tab" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "Enter" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight"
      ) {
        e.preventDefault();
        e.stopPropagation();

        if (isDirtyRef.current) {
          sendUpdate(localValue);
          isDirtyRef.current = false;
        }

        let direction: "right" | "left" | "up" | "down";
        switch (e.key) {
          case "Tab":
            direction = e.shiftKey ? "left" : "right";
            break;
          case "ArrowUp":
            direction = "up";
            break;
          case "ArrowDown":
          case "Enter":
            direction = "down";
            break;
          case "ArrowLeft":
            direction = "left";
            break;
          case "ArrowRight":
            direction = "right";
            break;
          default:
            return;
        }

        onNavigate(direction);
      }
    },
    [onNavigate, localValue, sendUpdate],
  );

  return (
    <div className="flex h-full w-full items-center border-r border-gray-300 text-xs">
      <input
        ref={inputRef}
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        type={columnType === "number" ? "number" : "text"}
        className="h-full w-full cursor-text px-2 focus:outline-blue-500"
        data-cell-id={`${columnId}-${rowId}`}
      />
    </div>
  );
});
