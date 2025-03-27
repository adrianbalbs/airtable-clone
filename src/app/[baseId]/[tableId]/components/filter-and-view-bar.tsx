import {
  PaintBucket,
  UsersRound,
  ChevronDown,
  ListTree,
  ArrowUpWideNarrow,
  ExternalLink,
  Menu as MenuIcon,
  Sheet,
} from "lucide-react";
import SearchMenu from "./search-menu";
import SortButton from "./sort-button";
import FilterButton from "./filter-button";
import HideFieldsButton from "./hide-fields-button";

export default function FilterAndViewBar() {
  return (
    <div className="flex items-center justify-between border-b border-slate-300 p-2 text-sm">
      <div className="flex items-center">
        <div className="flex items-center rounded-sm bg-slate-200 px-2 py-1">
          <MenuIcon size={15} className="mr-2" />
          <p>Views</p>
        </div>
        <div className="mx-3 h-4 w-px bg-slate-300" />
        <div className="mr-2 flex cursor-pointer items-center rounded-sm px-2 py-1 hover:bg-slate-200">
          <Sheet size={15} className="mr-2 text-[#166ee1]" />
          <p className="mr-2">Grid View</p>
          <UsersRound size={15} className="mr-2" />
          <ChevronDown size={15} />
        </div>
        <HideFieldsButton />
        <FilterButton />
        <div className="mr-2 flex cursor-pointer items-center rounded-sm px-2 py-1 hover:bg-slate-200">
          <ListTree size={15} className="mr-2" />
          <p className="mr-2">Group</p>
        </div>
        <SortButton />
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
      </div>
      <SearchMenu />
    </div>
  );
}
