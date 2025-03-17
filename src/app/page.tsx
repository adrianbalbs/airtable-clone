import { Bell, BookOpen, ChevronDown, ChevronRight, CircleHelp, Menu, Plus, Search, ShoppingBag, Upload } from "lucide-react";
import Image from "next/image";
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
                <div className="flex gap-5 items-center flex-shrink-0">
                    <Menu className="text-slate-400 hover:text-black cursor-pointer" size={20} />
                    {/*<h3 className="font-bold">Airtable</h3>*/}
                    <Image src="/airtable.svg" alt="Airtable Logo" width={100} height={100} />
                </div>
                <div className="border border-slate-300 shrink-0 rounded-full py-1.5 px-4 flex items-center shadow-sm hover:shadow-md cursor-pointer">
                    <div className="flex items-center mr-60">
                        <Search className="text-slate-500 mr-3" size={15} />
                        <p className="text-slate-500 text-sm">Search...</p>
                    </div>
                    <p className="text-slate-400 text-sm">⌘ K</p>
                </div>
                <div className="flex items-center">
                    <div className="flex items-center hover:bg-slate-200 cursor-pointer px-2 py-2 rounded-full mr-5">
                        <CircleHelp size={15} className="mr-2" />
                        <p className="text-sm">Help</p>
                    </div>
                    <div className="w-[30px] h-[30px] flex items-center hover:bg-slate-200 cursor-pointer justify-center border border-slate-300 rounded-full mr-5">
                        <Bell size={15} />
                    </div>
                    <div className="w-[30px] h-[30px] flex items-center justify-center bg-primary border border-white rounded-full ">
                        <p>A</p>
                    </div>
                </div>
            </header>
            <div className="flex min-h-screen w-full overflow-auto text-black pt-14">
                <div className="border-slate-300 border-r min-w-[300px] px-3 py-5">
                    <nav className="flex flex-col min-h-[568px] h-full gap-1">
                        <div className="flex flex-col h-full">
                            <div className="flex justify-between items-center hover:bg-slate-200 px-2.5 py-2 rounded-md cursor-pointer">
                                <h4>Home</h4>
                                <ChevronRight size={20} />
                            </div>
                            <div className="flex justify-between items-center hover:bg-slate-200 px-2.5 py-2 rounded-md cursor-pointer">
                                <h4>All Workspaces</h4>
                                <div className="flex gap-2">
                                    <Plus size={20} />
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <div className="border-t border-gray-300 my-4 mx-auto min-w-[90%]"></div>
                            <div className="flex items-center hover:bg-slate-200 px-2.5 py-2 rounded-md cursor-pointer">
                                <p className="flex items-center text-sm">
                                    <BookOpen size={15} className="mr-2" />
                                    <span>Templates and apps</span>
                                </p>
                            </div>
                            <div className="flex items-center hover:bg-slate-200 px-2.5 py-2 rounded-md cursor-pointer">
                                <p className="flex items-center text-sm">
                                    <ShoppingBag size={15} className="mr-2" />
                                    <span>Marketplace</span>
                                </p>
                            </div>
                            <div className="flex items-center hover:bg-slate-200 px-2.5 py-2 rounded-md cursor-pointer">
                                <p className="flex items-center text-sm">
                                    <Upload size={15} className="mr-2" />
                                    <span>Import</span>
                                </p>
                            </div>
                        </div>
                    </nav>
                </div>
                <main className="bg-gray-50 w-full flex flex-col"></main>
            </div>
        </HydrateClient>
    );
}
