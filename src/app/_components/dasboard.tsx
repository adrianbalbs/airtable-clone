"use client";

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
import { useRouter } from "next/navigation";

dayjs.extend(isBetween);
dayjs.extend(isToday);

function Sidebar({
  setIsOpen,
}: {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div className="min-w-[300px] border-r border-slate-300 px-3 py-5">
      <nav className="flex h-full min-h-[568px] flex-col gap-1">
        <div className="flex h-full flex-col gap-4">
          <div className="flex cursor-pointer items-center justify-between rounded-md px-2.5 py-2 hover:bg-slate-200">
            <h4>Home</h4>
            <ChevronRight size={20} className="rounded-md hover:bg-slate-300" />
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
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(true);
            }}
            type="submit"
            className="mt-4 flex items-center justify-center rounded-md bg-[#176de1] py-2 text-sm text-white shadow-md"
          >
            <Plus size={15} className="mr-1" />
            <p>Create</p>
          </button>
        </div>
      </nav>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="mb-5 flex flex-col">
      <div className="grid w-full grid-cols-[repeat(auto-fill,_minmax(295px,_1fr))] gap-2">
        {Array.from({ length: 12 }, (_, index) => (
          <div
            key={index}
            className="flex h-[92px] animate-pulse cursor-pointer items-center rounded-md bg-white"
          />
        ))}
      </div>
    </div>
  );
}

function CreateBaseDialog({
  handleCreateBase,
  isOpen,
  setIsOpen,
}: {
  handleCreateBase: () => void;
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <Dialog
      open={isOpen}
      onClose={() => setIsOpen(false)}
      className="relative z-10"
    >
      <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-30">
        <DialogPanel
          transition
          className="data-[closed]:transform-[scale(95%)] w-full max-w-[752px] rounded-xl border border-slate-400 bg-white shadow-md duration-200 ease-out data-[closed]:opacity-0"
        >
          <div className="flex items-center justify-between border-b border-slate-300 p-6">
            <DialogTitle as="h1" className="text-xl font-semibold">
              How do you want to start?
            </DialogTitle>
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-black hover:bg-gray-300"
            >
              <X size={15} />
            </button>
          </div>
          <div className="p-6">
            <div className="mb-6 flex">
              <p className="mr-1 font-semibold">Workspace: </p>
              <div className="flex cursor-pointer items-center text-gray-600 hover:text-black">
                <p>My First Workspace</p>
                <ChevronDown size={20} />
              </div>
            </div>
            <div className="flex gap-5">
              <div className="flex flex-1 cursor-pointer flex-col rounded-md border border-slate-300 hover:shadow-md">
                <Image
                  src="/start-with-ai-v3.png"
                  alt="Start with AI"
                  width={340}
                  height={340}
                  className="h-full w-full"
                />
                <div className="p-3">
                  <h2 className="mb-1 text-xl font-semibold">
                    Build an app with AI
                  </h2>
                  <p>
                    Cobuilder quickly turns your process into a custom app with
                    data and interfaces.
                  </p>
                </div>
              </div>
              <div
                onClick={handleCreateBase}
                className="flex flex-1 cursor-pointer flex-col rounded-md border border-slate-300 hover:shadow-md"
              >
                <Image
                  src="/start-with-data.png"
                  alt="Start with Data"
                  width={340}
                  height={340}
                  className="h-full w-full"
                />
                <div className="p-3">
                  <h2 className="mb-1 text-xl font-semibold">
                    Start from scratch
                  </h2>
                  <p>Build your ideal workflow starting with a blank table.</p>
                </div>
              </div>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

export default function Dashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const { data = [], isPending } = api.base.getAllBasesByUser.useQuery();
  const utils = api.useUtils();
  const router = useRouter();

  const baseCreate = api.base.createBase.useMutation({
    async onMutate(newBase) {
      const tempBaseId = -Date.now();
      const tempTableId = -Date.now();
      router.push(`/${tempBaseId}/${tempTableId}`);
      await utils.base.getAllBasesByUser.cancel();
      const prevData = utils.base.getAllBasesByUser.getData();

      utils.base.getAllBasesByUser.setData(undefined, (old) => [
        ...(old ?? []),
        {
          id: tempBaseId,
          name: newBase.name,
          table: tempTableId,
          createdById: "temp",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      return { prevData };
    },
    onError(err, _newBase, ctx) {
      console.error("Base creation failed:", err);
      utils.base.getAllBasesByUser.setData(undefined, ctx?.prevData);
      router.back();
    },
    onSettled: async () => {
      await utils.base.getAllBasesByUser.invalidate();
    },
    onSuccess: (createdBase) => {
      router.replace(`/${createdBase?.id}/${createdBase.table}`);
    },
  });

  const handleCreateBase = () => {
    baseCreate.mutate({ name: "Untitled Base" });
  };

  const today = dayjs();
  const sevenDaysAgo = today.subtract(7, "day");

  const todayBases = data.filter((base) => dayjs(base.updatedAt).isToday());

  const last7DaysBases = data.filter((base) =>
    dayjs(base.updatedAt).isBetween(
      sevenDaysAgo,
      today.subtract(1, "day"),
      "day",
      "[]",
    ),
  );

  const olderBases = data.filter(
    (base) =>
      !dayjs(base.updatedAt).isToday() &&
      !dayjs(base.updatedAt).isBetween(sevenDaysAgo, today, "day", "[]"),
  );

  return (
    <div className="flex min-h-screen w-full overflow-auto pt-14 text-black">
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
          {isPending ? (
            <CardSkeleton />
          ) : data.length > 0 ? (
            <>
              {todayBases.length > 0 && (
                <BaseGrid title="Today" data={todayBases} />
              )}
              {last7DaysBases.length > 0 && (
                <BaseGrid title="Past 7 days" data={last7DaysBases} />
              )}
              {olderBases.length > 0 && (
                <BaseGrid title="Older" data={olderBases} />
              )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="flex flex-col items-center">
                <h2 className="mb-2 text-xl font-semibold">
                  Nothing has been shared with you
                </h2>
                <p className="mb-5 text-sm">
                  Bases and interfaces that have been shared with you will
                  appear here.
                </p>
                <button className="cursor-pointer rounded-md border border-gray-300 px-3 py-2 text-xs shadow-sm hover:shadow-md">
                  Go to all workspaces
                </button>
              </div>
            </div>
          )}
        </div>
        <CreateBaseDialog
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          handleCreateBase={handleCreateBase}
        />
      </main>
    </div>
  );
}
