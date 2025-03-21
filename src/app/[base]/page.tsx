import { auth } from "~/server/auth";
import ProfileMenu from "../_components/profile-menu";
import { redirect } from "next/navigation";
import Image from "next/image";
import {
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
  Plus,
  Search,
  Sheet,
  UsersRound,
} from "lucide-react";

export default async function Base({ params }: { params: { base: number } }) {
  const { base } = params;
  const session = await auth();

  if (!session?.user) {
    redirect("api/auth/signin");
  }
  return (
    <>
      <div className="fixed top-0 w-full">
        <header className="flex h-14 w-full items-center justify-between bg-primary px-5">
          <div className="flex flex-shrink-0 items-center gap-5">
            <div className="flex items-center">
              <Image
                src="/airtable-symbol.svg"
                alt="Airtable Symbol"
                width={20}
                height={20}
                className="mr-3 invert"
              />
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
            <ProfileMenu
              name={session.user.name ?? "undefined"}
              email={session.user.email ?? "undefined"}
            />
          </div>
        </header>
        <div className="relative flex h-[32px] w-full bg-primary text-slate-600">
          <div className="h-full w-4 bg-secondary"></div>
          <div className="flex h-full w-full cursor-pointer overflow-hidden rounded-tr-lg bg-secondary">
            <div className="relative z-10 flex shrink-0 items-center rounded-t-sm bg-white px-3 text-black">
              <p className="mr-2 text-sm">Table 1</p>
              <ChevronDown size={15} />
            </div>
            <div className="flex shrink-0 cursor-pointer items-center rounded-t-sm px-3 hover:bg-hover hover:text-black">
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
          <div className="flex h-full items-center rounded-tl-lg bg-secondary">
            <p className="cursor-pointer px-4 text-sm hover:text-black">
              Extensions
            </p>
            <div className="flex cursor-pointer items-center hover:text-black">
              <p className="mr-2 text-sm">Tools</p>
              <ChevronDown size={15} className="mr-4" />
            </div>
          </div>
        </div>
        <div className="flex w-full items-center overflow-hidden border-b border-slate-300 p-2 text-sm">
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
    </>
  );
}
