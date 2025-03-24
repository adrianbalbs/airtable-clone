import { useCallback } from "react";

type ColumnDef = {
  id: number;
  table: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  type: "number" | "text";
};

type RowData = {
  id: number;
  table: number;
  data: Record<string, string | number | null>;
  createdAt: Date;
  updatedAt: Date;
};

export function useCellNavigation(rows: RowData[], columns: ColumnDef[]) {
  return useCallback(
    (direction: "right" | "left" | "up" | "down") => {
      const currentCell = document.activeElement as HTMLInputElement;
      if (!currentCell) return;

      const currentCellId = currentCell.dataset.cellId;
      if (!currentCellId) return;

      const [currentColumnId, currentRowId] = currentCellId
        .split("-")
        .map(Number);
      const currentRowIndex = rows.findIndex((r) => r.id === currentRowId);
      const currentColumnIndex = columns.findIndex(
        (c) => c.id === currentColumnId,
      );

      let nextRowIndex = currentRowIndex;
      let nextColumnIndex = currentColumnIndex;

      switch (direction) {
        case "right":
          nextColumnIndex = currentColumnIndex + 1;
          if (nextColumnIndex >= columns.length) {
            nextColumnIndex = 0;
            nextRowIndex = currentRowIndex + 1;
          }
          break;
        case "left":
          nextColumnIndex = currentColumnIndex - 1;
          if (nextColumnIndex < 0) {
            nextColumnIndex = columns.length - 1;
            nextRowIndex = currentRowIndex - 1;
          }
          break;
        case "up":
          nextRowIndex = currentRowIndex - 1;
          break;
        case "down":
          nextRowIndex = currentRowIndex + 1;
          break;
      }

      if (nextRowIndex >= 0 && nextRowIndex < rows.length) {
        const nextRow = rows[nextRowIndex];
        const nextColumn = columns[nextColumnIndex];
        if (nextRow && nextColumn) {
          const nextCell = document.querySelector(
            `[data-cell-id="${nextColumn.id}-${nextRow.id}"]`,
          )!;
          if (nextCell instanceof HTMLInputElement) {
            nextCell.focus();
          }
        }
      }
    },
    [rows, columns],
  );
}
