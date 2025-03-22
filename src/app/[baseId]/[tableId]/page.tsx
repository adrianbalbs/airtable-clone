import {
  ArrowDownUp,
  ArrowUpWideNarrow,
  ChevronDown,
  ExternalLink,
  EyeOff,
  ListFilter,
  ListTree,
  Menu,
  PaintBucket,
  Plus,
  Search,
  Sheet,
  UsersRound,
} from "lucide-react";
import Sidebar from "./components/sidebar";
import Navbar from "./components/navbar";
import { Table } from "./components/table";

export default function Base({ params }: { params: { baseId: number } }) {
  return (
    <div className="flex h-screen flex-col">
      <div className="w-full">
        <Navbar />
        <div className="flex h-[32px] bg-primary text-slate-600">
          <div className="w-4 bg-secondary"></div>
          <div className="flex flex-1 cursor-pointer overflow-hidden rounded-tr-lg bg-secondary">
            <div className="flex shrink-0 items-center rounded-t-sm bg-white px-3 text-black">
              <p className="mr-2 text-sm">Table 1</p>
              <ChevronDown size={15} />
            </div>
            <div className="hover:bg-hover flex shrink-0 cursor-pointer items-center rounded-t-sm px-3 hover:text-black">
              <p className="mr-2 text-sm">Table 2</p>
            </div>
            <div className="flex cursor-pointer items-center hover:text-black">
              <div className="relative my-auto h-3 w-px bg-slate-500" />
              <ChevronDown size={15} className="mx-3" />
              <div className="relative my-auto h-3 w-px bg-slate-500" />
            </div>
            <div className="flex shrink-0 cursor-pointer items-center px-3 hover:text-black">
              <Plus size={15} className="mr-2" />
              <p className="mr-2 text-sm">Add or import</p>
            </div>
          </div>
          <div className="w-2 bg-primary" />
          <div className="flex items-center rounded-tl-lg bg-secondary">
            <p className="cursor-pointer px-4 text-sm hover:text-black">
              Extensions
            </p>
            <div className="flex cursor-pointer items-center hover:text-black">
              <p className="mr-2 text-sm">Tools</p>
              <ChevronDown size={15} className="mr-4" />
            </div>
          </div>
        </div>
        <div className="flex items-center overflow-hidden border-b border-slate-300 p-2 text-sm">
          <div className="flex items-center rounded-sm bg-slate-200 px-2 py-1">
            <Menu size={15} className="mr-2" />
            <p>Views</p>
          </div>
          <div className="mx-3 h-4 w-px bg-slate-300" />
          <div className="mr-2 flex cursor-pointer items-center rounded-sm px-2 py-1 hover:bg-slate-200">
            <Sheet size={15} className="mr-2 text-[#166ee1]" />
            <p className="mr-2">Grid View</p>
            <UsersRound size={15} className="mr-2" />
            <ChevronDown size={15} />
          </div>
          <div className="mr-2 flex cursor-pointer items-center rounded-sm px-2 py-1 hover:bg-slate-200">
            <EyeOff size={15} className="mr-2" />
            <p className="mr-2">Hide fields</p>
          </div>
          <div className="mr-2 flex cursor-pointer items-center rounded-sm px-2 py-1 hover:bg-slate-200">
            <ListFilter size={15} className="mr-2" />
            <p className="mr-2">Filter</p>
          </div>
          <div className="mr-2 flex cursor-pointer items-center rounded-sm px-2 py-1 hover:bg-slate-200">
            <ListTree size={15} className="mr-2" />
            <p className="mr-2">Group</p>
          </div>
          <div className="mr-2 flex cursor-pointer items-center rounded-sm px-2 py-1 hover:bg-slate-200">
            <ArrowDownUp size={15} className="mr-2" />
            <p className="mr-2">Sort</p>
          </div>
          <div className="mr-2 flex cursor-pointer items-center rounded-sm px-2 py-1 hover:bg-slate-200">
            <PaintBucket size={15} className="mr-2" />
            <p className="mr-2">Color</p>
          </div>
          <div className="mr-2 flex cursor-pointer items-center rounded-sm px-2 py-1 hover:bg-slate-200">
            <ArrowUpWideNarrow size={15} className="mr-2" />
          </div>
          <div className="mr-2 flex cursor-pointer items-center rounded-sm px-2 py-1 hover:bg-slate-200">
            <ExternalLink size={15} className="mr-2" />
            <p className="mr-2">Share and sync</p>
          </div>
          <div className="ml-auto flex-none p-2">
            <Search size={15} />
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AND SIDEBAR */}
      <div className="flex flex-1 overflow-auto">
        <Sidebar />
        <Table />
      </div>
    </div>
  );
}
