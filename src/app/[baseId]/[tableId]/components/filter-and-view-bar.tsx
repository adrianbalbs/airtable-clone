"use client";

import {
  MenuButton,
  MenuItems,
  Menu,
  MenuItem,
  Input,
} from "@headlessui/react";
import {
  ListFilter,
  PaintBucket,
  UsersRound,
  ChevronDown,
  ListTree,
  ArrowUpWideNarrow,
  ExternalLink,
  Search,
  Menu as MenuIcon,
  ArrowDownUp,
  EyeOff,
  Sheet,
  X,
  Shapes,
} from "lucide-react";

export default function FilterAndViewBar() {
  return (
    <div className="flex items-center overflow-hidden border-b border-slate-300 p-2 text-sm">
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
      <Menu>
        {({ close }) => (
          <>
            <MenuButton className="ml-auto flex-none p-2">
              <Search size={15} />
            </MenuButton>
            <MenuItems
              anchor="bottom end"
              className="mt-2 w-64 border border-slate-300"
            >
              <MenuItem>
                <div>
                  <div
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="flex items-center p-2"
                  >
                    <Input
                      className="h-full w-full flex-1 text-sm"
                      placeholder="Find in view"
                    />
                    <X
                      size={15}
                      className="ml-2 cursor-pointer text-gray-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        close();
                      }}
                    />
                  </div>
                  <div className="bg-gray-100 p-2 text-xs">
                    <p>Use advanced search options in the</p>
                    <div className="flex items-center gap-1 text-blue-500">
                      <Shapes size={15} />
                      <span>search extension.</span>
                    </div>
                  </div>
                </div>
              </MenuItem>
            </MenuItems>
          </>
        )}
      </Menu>
    </div>
  );
}
