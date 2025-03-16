import { Bell, CircleHelp, Menu, Search } from "lucide-react";
import Link from "next/link";

import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
    //const session = await auth();

    //if (session?.user) {
    //    void api.post.getLatest.prefetch();
    //}

    return (
        <HydrateClient>
            <header className="fixed w-full flex h-14 items-center justify-between px-5 border-b border-slate-300 z-10">
                <div className="flex gap-5 items-center">
                    <Menu className="text-slate-400 hover:text-black cursor-pointer" size={20} />
                    <h3 className="font-bold">Airtable</h3>
                </div>
                <div className="border border-slate-300 rounded-full py-2 px-6 flex items-center shadow-sm hover:shadow-md cursor-pointer">
                    <div className="flex items-center mr-80">
                        <Search className="text-slate-400 mr-3" size={15} />
                        <p className="text-slate-400 text-sm">Search...</p>
                    </div>
                    <p className="text-slate-400 text-sm">⌘ K</p>
                </div>
                <div className="flex">
                    <div className="flex items-center hover:bg-slate-200 cursor-pointer px-2 py-2 rounded-full mr-5">
                        <CircleHelp size={15} className="mr-2" />
                        <p className="text-sm">Help</p>
                    </div>
                    <div className="w-10 h-10 flex items-center hover:bg-slate-200 cursor-pointer justify-center border border-slate-300 rounded-full mr-5">
                        <Bell size={20} />
                    </div>
                    <div className="w-10 h-10 flex items-center justify-center bg-blue-300 border-2 border-white rounded-full">
                        <p>A</p>
                    </div>
                </div>
            </header>
            <div className="flex min-h-screen w-full overflow-auto text-black pt-14">
                <div className="border-slate-300 border-r w-96"></div>
                <main className="bg-slate-50 w-full flex flex-col"></main>
            </div>
        </HydrateClient>
    );
}
