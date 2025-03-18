import {
  Bell,
  BookOpen,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Grid2x2,
  Menu,
  Plus,
  Search,
  ShoppingBag,
  Upload,
} from "lucide-react";
import Image from "next/image";

import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import { redirect } from "next/navigation";
import BaseGrid from "./components/baseCard";
import ProfileMenu from "./components/profileMenu";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("api/auth/signin");
  }

  return (
    <HydrateClient>
      <header className="fixed z-10 flex h-14 w-full items-center justify-between border-b border-slate-300 px-5">
        <div className="flex flex-shrink-0 items-center gap-5">
          <Menu
            className="cursor-pointer text-slate-400 hover:text-black"
            size={20}
          />
          <Image
            src="/airtable.svg"
            alt="Airtable Logo"
            width={100}
            height={100}
          />
        </div>
        <div className="flex shrink-0 cursor-pointer items-center rounded-full border border-slate-300 px-4 py-1.5 shadow-sm hover:shadow-md">
          <div className="mr-60 flex items-center">
            <Search className="mr-3 text-slate-500" size={15} />
            <p className="text-sm text-slate-500">Search...</p>
          </div>
          <p className="text-sm text-slate-400">⌘ K</p>
        </div>
        <div className="flex items-center">
          <div className="mr-5 flex cursor-pointer items-center rounded-full px-2 py-2 hover:bg-slate-200">
            <CircleHelp size={15} className="mr-2" />
            <p className="text-sm">Help</p>
          </div>
          <div className="mr-5 flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full border border-slate-300 hover:bg-slate-200">
            <Bell size={15} />
          </div>
          <ProfileMenu />
        </div>
      </header>
      <div className="sticky flex min-h-screen w-full overflow-auto pt-14 text-black">
        <div className="min-w-[300px] border-r border-slate-300 px-3 py-5">
          <nav className="flex h-full min-h-[568px] flex-col gap-1">
            <div className="flex h-full flex-col gap-4">
              <div className="flex cursor-pointer items-center justify-between rounded-md px-2.5 py-2 hover:bg-slate-200">
                <h4>Home</h4>
                <ChevronRight
                  size={20}
                  className="rounded-md hover:bg-slate-300"
                />
              </div>
              <div className="flex cursor-pointer items-center justify-between rounded-md px-2.5 py-2 hover:bg-slate-200">
                <h4>All Workspaces</h4>
                <div className="flex gap-2">
                  <Plus size={20} className="rounded-md hover:bg-slate-300" />
                  <ChevronRight
                    size={20}
                    className="rounded-md hover:bg-slate-300"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="mx-auto my-4 min-w-[90%] border-t border-gray-300"></div>
              <div className="flex cursor-pointer items-center rounded-md px-2.5 py-2 hover:bg-slate-200">
                <p className="flex items-center text-sm">
                  <BookOpen size={15} className="mr-2" />
                  <span>Templates and apps</span>
                </p>
              </div>
              <div className="flex cursor-pointer items-center rounded-md px-2.5 py-2 hover:bg-slate-200">
                <p className="flex items-center text-sm">
                  <ShoppingBag size={15} className="mr-2" />
                  <span>Marketplace</span>
                </p>
              </div>
              <div className="flex cursor-pointer items-center rounded-md px-2.5 py-2 hover:bg-slate-200">
                <p className="flex items-center text-sm">
                  <Upload size={15} className="mr-2" />
                  <span>Import</span>
                </p>
              </div>
              <button className="mt-4 flex items-center justify-center rounded-md bg-[#176de1] py-2 text-sm text-white shadow-md">
                <Plus size={15} className="mr-1" />
                <p>Create</p>
              </button>
            </div>
          </nav>
        </div>
        <main className="w-full bg-gray-50 px-14 pt-10">
          <div className="flex h-full max-w-[1920px] flex-col">
            <h1 className="mb-10 text-3xl font-semibold">Home</h1>
            <div className="mb-5 flex items-center justify-between">
              <div className="flex">
                <div className="mr-5 flex shrink-0 cursor-pointer items-center text-gray-500 hover:text-black">
                  <p className="mr-2">Opened by you</p>
                  <ChevronDown size={15} />
                </div>
                <div className="flex shrink-0 cursor-pointer items-center text-gray-500 hover:text-black">
                  <p className="mr-2">Show all types</p>
                  <ChevronDown size={15} />
                </div>
              </div>
              <div className="flex gap-1">
                <div className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-gray-500 hover:text-black">
                  <Menu size={20} strokeWidth={1.5} />
                </div>
                <div className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-gray-300 text-black">
                  <Grid2x2 size={20} strokeWidth={1.5} />
                </div>
              </div>
            </div>
            <BaseGrid title="Today" />
            <BaseGrid title="Past 7 days" />
          </div>
        </main>
      </div>
    </HydrateClient>
  );
}
