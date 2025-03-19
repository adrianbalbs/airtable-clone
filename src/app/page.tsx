import {
  Bell,
  CircleHelp,
  Menu,
  Search,
} from "lucide-react";
import Image from "next/image";

import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import { redirect } from "next/navigation";
import ProfileMenu from "./_components/profile-menu";
import Dashboard from "./_components/dasboard";

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
          <ProfileMenu name={session.user.name ?? "undefined"} email={session.user.email ?? "undefined"} />
        </div>
      </header>
      <Dashboard />
    </HydrateClient>
  );
}
