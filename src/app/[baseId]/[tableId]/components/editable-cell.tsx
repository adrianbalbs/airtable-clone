import React, { useState, useEffect, useRef, memo, useCallback } from "react";
import { api } from "~/trpc/react";

type EditableCellProps = {
  value: string | number | null;
  rowId: number;
  columnId: number;
  columnType: "text" | "number";
  tableId: number;
  onNavigate?: (direction: "right" | "left" | "up" | "down") => void;
  onCellUpdate?: (rowId: number, columnId: number, value: unknown) => void;
};

export const EditableCell = memo(function EditableCell({
  value,
  rowId,
  columnId,
  columnType,
  tableId,
  onNavigate,
  onCellUpdate,
}: EditableCellProps) {
  const [localValue, setLocalValue] = useState(value?.toString() ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  const isDirtyRef = useRef(false);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const utils = api.useUtils();

  useEffect(() => {
    if (document.activeElement !== inputRef.current && !isDirtyRef.current) {
      setLocalValue(value?.toString() ?? "");
    }
  }, [value]);

  const updateCell = api.table.updateCell.useMutation({
    onMutate: async ({ value: newValue }) => {
      await utils.table.fetchRows.cancel();

      if (onCellUpdate) {
        onCellUpdate(rowId, columnId, newValue);
      }

      return { previousValue: value };
    },
    onError: (err, variables, context) => {
      if (context?.previousValue !== undefined) {
        utils.table.fetchRows.setInfiniteData(
          { tableId, pageSize: 100 },
          (old) => {
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
                      [columnId]: context.previousValue,
                    },
                  };
                }),
              })),
            };
          },
        );
      }
    },
  });

  const sendUpdate = useCallback(
    (newValue: string) => {
      if (newValue === value?.toString()) return;

      if (columnType === "number") {
        if (newValue === "" || newValue === "-") {
          setLocalValue("");
          return;
        }
        const numValue = Number(newValue);
        if (isNaN(numValue) || !isFinite(numValue)) {
          setLocalValue(value?.toString() ?? "");
          return;
        }
        void updateCell.mutateAsync({
          tableId,
          rowId,
          columnId,
          value: numValue,
        });
        return;
      }

      void updateCell.mutateAsync({
        tableId,
        rowId,
        columnId,
        value: newValue === "" ? null : newValue,
      });
    },
    [columnId, columnType, rowId, tableId, updateCell, value],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      if (columnType === "number") {
        if (newValue === "") {
          isDirtyRef.current = true;
          setLocalValue(newValue);
        } else if (newValue === "-") {
          isDirtyRef.current = true;
          setLocalValue(newValue);
        } else if (/^-?\d*\.?\d*$/.test(newValue)) {
          if ((newValue.match(/\./g) ?? []).length <= 1) {
            isDirtyRef.current = true;
            setLocalValue(newValue);
          }
        } else {
          return;
        }
      } else {
        isDirtyRef.current = true;
        setLocalValue(newValue);
      }

      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }

      updateTimeoutRef.current = setTimeout(() => {
        sendUpdate(newValue);
        updateTimeoutRef.current = undefined;
      }, 300);
    },
    [columnType, sendUpdate],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!onNavigate) return;

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
    [onNavigate],
  );

  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex h-full w-full items-center border-r border-gray-300 text-xs">
      <input
        ref={inputRef}
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        type="text"
        className="h-full w-full cursor-text px-2 focus:outline-blue-500"
        data-cell-id={`${columnId}-${rowId}`}
      />
    </div>
  );
});
