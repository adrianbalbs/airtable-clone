"use client"

import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Grid2x2,
  Menu,
  Plus,
  ShoppingBag,
  Upload,
  X,
} from "lucide-react";

import BaseGrid from "./base-grid";
import { api } from "~/trpc/react";
import { type Dispatch, type SetStateAction, useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import Image from "next/image";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isBetween from "dayjs/plugin/isBetween";


function Sidebar({ setIsOpen }: { setIsOpen: Dispatch<SetStateAction<boolean>> }) {
  return (
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
          <button onClick={() => setIsOpen(true)} className="mt-4 flex items-center justify-center rounded-md bg-[#176de1] py-2 text-sm text-white shadow-md">
            <Plus size={15} className="mr-1" />
            <p>Create</p>
          </button>
        </div>
      </nav>
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="mb-5 flex flex-col">
      <div className="grid w-full grid-cols-[repeat(auto-fill,_minmax(295px,_1fr))] gap-2">
        {Array.from({ length: 12 }, (_, index) => (
          <div key={index} className="flex h-[92px] cursor-pointer items-center rounded-md bg-white animate-pulse" />
        ))}
      </div>
    </div>
  )
}


export default function Dashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const { data = [], isPending } = api.base.getAllBasesByUser.useQuery()

  dayjs.extend(isBetween);
  dayjs.extend(isToday);

  const today = dayjs();
  const sevenDaysAgo = today.subtract(7, "day");

  const todayBases = [];
  const last7DaysBases = [];
  const olderBases = [];

  data.forEach((base) => {
    const baseDate = dayjs(base.createdAt);

    if (baseDate.isToday()) {
      todayBases.push(base);
    } else if (baseDate.isBetween(sevenDaysAgo, today, "day", "[]")) {
      last7DaysBases.push(base);
    } else {
      olderBases.push(base);
    }
  });


  return (
    <div className="fixed flex min-h-screen w-full overflow-auto pt-14 text-black">
      <Sidebar setIsOpen={setIsOpen} />
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
          {isPending ? <CardSkeleton /> :
            data.length > 0 ? <BaseGrid title="Today" /> :
              (

                <div className="w-full h-full flex justify-center items-center">
                  <div className="flex flex-col items-center ">
                    <h2 className="font-semibold text-xl mb-2">Nothing has been shared with you</h2>
                    <p className="text-sm mb-5">Bases and interfaces that have been shared with you will appear here.</p>
                    <button className="rounded-md border border-gray-300 py-2 px-3 shadow-sm text-xs hover:shadow-md cursor-pointer">Go to all workspaces</button>
                  </div>
                </div>
              )
          }
        </div>
        <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-10">
          <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-30">
            <DialogPanel
              transition
              className="w-full max-w-[752px] rounded-xl bg-white border border-slate-400 shadow-md duration-200 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
            >
              <div className="border-b border-slate-300 p-6 flex justify-between items-center">
                <DialogTitle as="h1" className="font-semibold text-xl">
                  How do you want to start?
                </DialogTitle>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-gray-300 text-black"
                >
                  <X size={15} />
                </button>
              </div>
              <div className="p-6">
                <div className="flex mb-6">
                  <p className="font-semibold mr-1">Workspace: </p>
                  <div className="text-gray-600 flex items-center hover:text-black cursor-pointer"><p>My First Workspace</p><ChevronDown size={20} /></div>
                </div>
                <div className="flex gap-5">
                  <div className="flex flex-1 flex-col rounded-md border border-slate-300 hover:shadow-md cursor-pointer">
                    <Image src="/start-with-ai-v3.png" alt="Start with AI" width={340} height={340} className="w-full h-full" />
                    <div className="p-3">
                      <h2 className="font-semibold text-xl mb-1">Build an app with AI</h2>
                      <p>Cobuilder quickly turns your process into a custom app with data and interfaces.</p>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col rounded-md border border-slate-300 hover:shadow-md cursor-pointer">
                    <Image src="/start-with-data.png" alt="Start with Data" width={340} height={340} className="w-full h-full" />
                    <div className="p-3">
                      <h2 className="font-semibold text-xl mb-1">Start from scratch</h2>
                      <p>Build your ideal workflow starting with a blank table.</p>
                    </div>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      </main>
    </div>
  )
}
