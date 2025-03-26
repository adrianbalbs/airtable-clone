"use client";

import { useParams } from "next/navigation";
import FilterAndViewBar from "./filter-and-view-bar";
import Sidebar from "./sidebar";
import TabSelector from "./tab-selector";
import { Table } from "./table";
import { useState } from "react";

export default function TableClientWrapper() {
  const params = useParams<{ baseId: string; tableId: string }>();
  const tableId = parseInt(params.tableId);
  const baseId = parseInt(params.baseId);
  const [searchValue, setSearchValue] = useState("");

  return (
    <>
      <TabSelector />
      <FilterAndViewBar onSearchChange={setSearchValue} />
      <div className="flex flex-1 overflow-auto">
        <Sidebar />
        <Table tableId={tableId} baseId={baseId} searchValue={searchValue} />
      </div>
    </>
  );
}
