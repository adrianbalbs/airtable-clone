"use client";

import { Menu, MenuButton, MenuItems } from "@headlessui/react";
import { ListFilter, Plus } from "lucide-react";
import { useState, useCallback, useEffect, useMemo } from "react";
import { api } from "~/trpc/react";
import { useParams } from "next/navigation";
import FilterRow from "./filter-row";
import { useSearch } from "../contexts/search-context";
import { TABLE_CONFIG } from "~/app/constants/table";

type FilterCondition = {
  id: number;
  columnId: number | null;
  operator: string;
  value: string;
};

export default function FilterButton() {
  const params = useParams<{ tableId: string }>();
  const tableId = parseInt(params.tableId);
  const utils = api.useUtils();
  const { searchValue } = useSearch();
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [nextFilterId, setNextFilterId] = useState(2);

  const { data: tableData } = api.table.getTableById.useQuery({
    tableId,
  });

  useEffect(() => {
    if (tableData?.view?.config?.filters?.length) {
      const initialFilters = tableData.view.config.filters.map(
        (apiFilter, index) => ({
          id: index + 1,
          columnId: apiFilter.columnId,
          operator: apiFilter.operator,
          value: String(apiFilter.value),
        }),
      );

      setFilters(initialFilters);
      setNextFilterId(initialFilters.length + 1);
    } else if (tableData && !tableData.view?.config?.filters?.length) {
      setFilters([]);
      setNextFilterId(1);
    }
  }, [tableData]);

  const updateViewMutation = api.view.updateConfig.useMutation({
    onMutate: async (newConfig) => {
      utils.table.fetchRows.setInfiniteData(
        { tableId, pageSize: TABLE_CONFIG.PAGE_SIZE, search: searchValue },
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
        { tableId, pageSize: TABLE_CONFIG.PAGE_SIZE, search: searchValue },
        undefined,
      );

      void utils.table.getTableById.invalidate({ tableId });
      void utils.table.fetchRows.invalidate({
        tableId,
        search: searchValue,
        pageSize: TABLE_CONFIG.PAGE_SIZE,
      });
    },
    onError: (err, newConfig, context) => {
      if (context?.previousData) {
        utils.table.getTableById.setData({ tableId }, context.previousData);
      }
    },
    onSuccess: (updatedView) => {
      if (updatedView?.config?.filters) {
        const updatedFilters = updatedView.config.filters.map(
          (apiFilter, index) => ({
            id: index + 1,
            columnId: apiFilter.columnId,
            operator: apiFilter.operator,
            value: String(apiFilter.value),
          }),
        );

        setFilters(updatedFilters);
        setNextFilterId(updatedFilters.length + 1);
      } else {
        setFilters([]);
        setNextFilterId(1);
      }
    },
  });

  const prepareFiltersForApi = (filtersToProcess: FilterCondition[]) => {
    const activeFilters = filtersToProcess.filter(
      (filter) => filter.columnId !== null && filter.columnId !== undefined,
    );

    if (activeFilters.length === 0) {
      return [];
    }

    return activeFilters
      .filter((filter) => {
        const hasColumn =
          filter.columnId !== null && filter.columnId !== undefined;
        const hasOperator = filter.operator !== null && filter.operator !== "";

        const needsValue =
          filter.operator !== "is_empty" && filter.operator !== "is_not_empty";
        const hasValue = filter.value !== null && filter.value.trim() !== "";

        return hasColumn && hasOperator && (!needsValue || hasValue);
      })
      .map((filter) => ({
        columnId: Number(filter.columnId),
        operator: filter.operator,
        value: filter.value,
      }));
  };

  const hasValidFilters = useMemo(() => {
    if (filters.length === 0) return true;

    const hasIncompleteFilter = filters.some((filter) => {
      if (filter.columnId === null) return true;

      const needsValue =
        filter.operator !== "is_empty" && filter.operator !== "is_not_empty";

      return needsValue && (!filter.value || filter.value.trim() === "");
    });

    return !hasIncompleteFilter;
  }, [filters]);

  const updateFilters = useCallback(() => {
    if (!tableData?.view?.id) {
      return;
    }

    const apiFilters = prepareFiltersForApi(filters);

    updateViewMutation.mutate({
      viewId: tableData.view.id,
      config: {
        filters: apiFilters,
      },
    });
  }, [filters, tableData?.view?.id, updateViewMutation]);

  const addFilterCondition = () => {
    const newFilter = {
      id: nextFilterId,
      columnId: null,
      operator: "equals",
      value: "",
    };

    const newFilters = [...filters, newFilter];
    setFilters(newFilters);
    setNextFilterId(nextFilterId + 1);
  };

  const removeFilterCondition = (filterId: number) => {
    const updatedFilters = filters.filter((filter) => filter.id !== filterId);
    setFilters(updatedFilters);
  };

  const updateFilterCondition = (
    filterId: number,
    columnId: number | null,
    operator: string,
    value: string,
  ) => {
    setFilters(
      filters.map((filter) => {
        if (filter.id === filterId) {
          return { ...filter, columnId, operator, value };
        }
        return filter;
      }),
    );
  };

  const handleApplyFilters = () => {
    updateFilters();
  };

  return (
    <Menu>
      {({ close }) => (
        <div>
          <MenuButton className="mr-2 flex cursor-pointer items-center rounded-sm px-2 py-1 hover:bg-slate-200">
            <ListFilter size={15} className="mr-2" />
            <p>Filter</p>
          </MenuButton>
          <MenuItems
            anchor="bottom start"
            className="z-20 w-[590px] rounded-md border border-slate-300 bg-white p-4 shadow-lg"
          >
            <div className="text-sm">
              <p className="mb-4">In this view, show records</p>
              <div className="flex flex-col space-y-2">
                {filters.map((filter, index) => (
                  <div key={filter.id} className="flex items-center">
                    <div className="flex items-center justify-between">
                      <p className="mr-2 w-10">
                        {index === 0 ? "Where" : "And"}
                      </p>
                      <FilterRow
                        tableData={tableData}
                        filter={filter}
                        onDelete={() => removeFilterCondition(filter.id)}
                        onUpdate={(columnId, operator, value) =>
                          updateFilterCondition(
                            filter.id,
                            columnId,
                            operator,
                            value,
                          )
                        }
                      />
                    </div>
                  </div>
                ))}

                {filters.length === 0 && (
                  <p className="py-2 italic text-slate-500">
                    No filter conditions applied
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div
                  className="mt-3 flex cursor-pointer items-center text-slate-500 hover:text-slate-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    addFilterCondition();
                  }}
                >
                  <Plus size={15} className="mr-2" />
                  <p>Add condition</p>
                </div>
                <button
                  className={`mt-3 flex cursor-pointer items-center rounded-md p-2 text-xs text-white ${
                    hasValidFilters
                      ? "bg-blue-500 hover:bg-blue-600"
                      : "cursor-not-allowed bg-blue-300"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (hasValidFilters) {
                      handleApplyFilters();
                      close();
                    }
                  }}
                  disabled={!hasValidFilters}
                >
                  <p>Apply Filters</p>
                </button>
              </div>
            </div>
          </MenuItems>
        </div>
      )}
    </Menu>
  );
}
