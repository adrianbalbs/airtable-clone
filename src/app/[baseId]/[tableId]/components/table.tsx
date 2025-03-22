"use client";

import { Baseline, ChevronDown, Hash, Plus } from "lucide-react";

type TestTable = {
  name: string;
  notes: string;
  age: number;
  status: string;
};
export function Table() {
  const data: TestTable[] = [
    {
      name: "Tanner",
      notes: "test",
      age: 33,
      status: "Married",
    },
    {
      name: "Kevin",
      notes: "more notes",
      age: 33,
      status: "Single",
    },
  ];
  const rows = Array.from({ length: 200 });
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex border-b border-slate-300">
        <div className="flex h-[32px] w-[230px] items-center justify-between border-r border-slate-300 bg-gray-100 px-2 text-xs">
          <div className="flex items-center">
            <Baseline size={15} className="mr-2" />
            <span>Name</span>
          </div>
          <ChevronDown size={15} />
        </div>
        <div className="flex h-[32px] w-[180px] items-center justify-between border-r border-slate-300 bg-gray-100 px-2 text-xs">
          <div className="flex items-center">
            <Baseline size={15} className="mr-2" />
            <span>Notes</span>
          </div>
          <ChevronDown size={15} />
        </div>
        <div className="flex h-[32px] w-[180px] items-center justify-between border-r border-slate-300 bg-gray-100 px-2 text-xs">
          <div className="flex items-center">
            <Hash size={15} className="mr-2" />
            <span>Age</span>
          </div>
          <ChevronDown size={15} />
        </div>
        <div className="flex h-[32px] w-[180px] items-center justify-between border-r border-slate-300 bg-gray-100 px-2 text-xs">
          <div className="flex items-center">
            <Baseline size={15} className="mr-2" />
            <span>Status</span>
          </div>
          <ChevronDown size={15} />
        </div>
        <div className="flex h-[32px] w-[92px] cursor-pointer items-center justify-center border-r border-slate-300 bg-gray-100 px-2 text-xs">
          <Plus size={15} className="mr-2" />
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-gray-50">
        {rows.map((_, index) => (
          <div
            key={index}
            className="flex w-fit border-b border-slate-300 bg-white text-xs hover:bg-gray-100"
          >
            <div className="flex h-[32px] w-[230px] items-center border-r border-slate-300">
              <span className="flex h-full w-[70px] items-center p-4 text-gray-500">
                {index + 1}
              </span>
              <input className="h-full w-full cursor-text px-2 focus:outline-blue-500" />
            </div>
            <div className="flex h-[32px] w-[180px] items-center border-r border-slate-300">
              <input className="h-full w-full cursor-text px-2 focus:outline-blue-500" />
            </div>
            <div className="flex h-[32px] w-[180px] items-center border-r border-slate-300">
              <input className="h-full w-full cursor-text px-2 focus:outline-blue-500" />
            </div>
            <div className="flex h-[32px] w-[180px] items-center border-r border-slate-300">
              <input className="h-full w-full cursor-text px-2 focus:outline-blue-500" />
            </div>
          </div>
        ))}
        <div className="flex w-fit border-b border-slate-300 bg-white text-xs hover:bg-gray-100">
          <div className="flex h-[32px] w-[230px] cursor-pointer items-center border-r border-slate-300 p-4">
            <Plus size={15} />
          </div>
        </div>
      </div>
      <div className="flex border-t border-slate-300 text-xs">
        <p className="p-2">{rows.length} records</p>
      </div>
    </div>
  );
}
