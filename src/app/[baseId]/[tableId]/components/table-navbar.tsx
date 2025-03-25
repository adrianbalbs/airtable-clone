import {
  ArrowDownUp,
  ArrowUpWideNarrow,
  Bell,
  ChevronDown,
  CircleHelp,
  ExternalLink,
  EyeOff,
  History,
  ListFilter,
  ListTree,
  Menu,
  PaintBucket,
  Search,
  Sheet,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ProfileMenu from "~/app/_components/profile-menu";
import TabSelector from "./tab-selector";

export default function TableNavbar() {
  return (
    <div className="w-full">
      <header className="flex h-14 items-center justify-between bg-primary px-5">
        <div className="flex flex-shrink-0 items-center gap-5">
          <div className="flex items-center">
            <Link href="/" className="cursor-pointer">
              <Image
                src="/airtable-symbol.svg"
                alt="Airtable Symbol"
                width={20}
                height={20}
                className="mr-3 invert"
              />
            </Link>
            <p className="mr-1 font-semibold">Untitled Base</p>
            <ChevronDown size={15} />
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <div className="inset-shadow-sm flex cursor-pointer items-center rounded-full bg-secondary px-3 py-1.5 text-black">
              <p className="text-sm">Data</p>
            </div>
            <div className="flex cursor-pointer items-center rounded-full px-3 py-1.5 hover:bg-secondary hover:text-black">
              <p className="text-sm">Automations</p>
            </div>
            <div className="flex cursor-pointer items-center rounded-full px-3 py-1.5 hover:bg-secondary hover:text-black">
              <p className="text-sm">Interfaces</p>
            </div>
            <div className="h-6 w-px bg-slate-500" />
            <div className="flex cursor-pointer items-center rounded-full px-3 py-1.5 hover:bg-secondary hover:text-black">
              <p className="text-sm">Forms</p>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <div className="mr-2 flex cursor-pointer items-center rounded-full px-3 py-1.5 text-slate-600 hover:bg-secondary hover:text-black">
            <History size={15} />
          </div>
          <div className="mr-3 flex cursor-pointer items-center rounded-full px-2 py-1.5 text-slate-600 hover:bg-secondary hover:text-black">
            <CircleHelp size={15} className="mr-2" />
            <p className="text-sm">Help</p>
          </div>
          <div className="mr-3 flex cursor-pointer items-center rounded-full bg-[#2b98bf] px-3 py-1.5">
            <p className="text-sm text-white">Trial: 14 days left</p>
          </div>
          <div className="mr-5 flex cursor-pointer items-center rounded-full bg-white px-2 py-1.5">
            <UsersRound size={15} className="mr-1 text-[#176da5]" />
            <p className="text-sm text-[#176da5]">Share</p>
          </div>
          <div className="mr-5 flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full bg-white">
            <Bell size={15} className="text-[#176da5]" />
          </div>
          <ProfileMenu />
        </div>
      </header>
      <TabSelector />
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
  );
}
