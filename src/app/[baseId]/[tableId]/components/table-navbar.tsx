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
import FilterAndViewBar from "./filter-and-view-bar";

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
      <FilterAndViewBar />
    </div>
  );
}
