import {
  BookText,
  Calendar,
  ChartGantt,
  ChartNoAxesGantt,
  Check,
  ChevronDown,
  Kanban,
  LayoutGrid,
  ListChecks,
  Plus,
  Search,
  Settings,
  Sheet,
} from "lucide-react";

export default function Sidebar() {
  return (
    <div className="min-w-[300px] border-r border-slate-300 px-3 py-5">
      <nav className="flex h-full min-h-[568px] flex-col gap-1 text-sm">
        <div className="mx-2 mb-2 flex items-center justify-between border-b border-slate-300 py-2 text-gray-700">
          <div className="mx-2 flex items-center">
            <Search size={15} className="mr-2" />
            <p>Find a view</p>
          </div>
          <Settings size={15} className="mx-2" />
        </div>
        <div className="flex-1">
          <div className="flex cursor-pointer items-center justify-between rounded-sm bg-[#d5f1ff] px-2.5 py-2">
            <div className="flex items-center">
              <Sheet size={15} className="mr-2 text-[#166ee1]" />
              <p>Grid view</p>
            </div>
            <Check size={15} className="text-gray-700" />
          </div>
        </div>
        <div className="mx-2 cursor-pointer border-t border-slate-300 px-1 py-2">
          <div className="my-2 flex justify-between">
            <p>Create...</p>
            <ChevronDown size={15} />
          </div>
          <div className="flex cursor-pointer items-center justify-between rounded-sm px-1 py-2 hover:bg-slate-200">
            <div className="flex items-center">
              <Sheet size={15} className="mr-2 text-[#166ee1]" />
              <p>Grid</p>
            </div>
            <Plus size={15} className="text-gray-700" />
          </div>
          <div className="flex cursor-pointer items-center justify-between rounded-sm px-1 py-2 hover:bg-slate-200">
            <div className="flex items-center">
              <Calendar size={15} className="mr-2 text-[#d54401]" />
              <p>Calendar</p>
            </div>
            <Plus size={15} className="text-gray-700" />
          </div>
          <div className="flex cursor-pointer items-center justify-between rounded-sm px-1 py-2 hover:bg-slate-200">
            <div className="flex items-center">
              <LayoutGrid size={15} className="mr-2 text-[#7c37ef]" />
              <p>Gallery</p>
            </div>
            <Plus size={15} className="text-gray-700" />
          </div>
          <div className="flex cursor-pointer items-center justify-between rounded-sm px-1 py-2 hover:bg-slate-200">
            <div className="flex items-center">
              <Kanban size={15} className="mr-2 text-[#048a0e]" />
              <p>Kanban</p>
            </div>
            <Plus size={15} className="text-gray-700" />
          </div>
          <div className="flex cursor-pointer items-center justify-between rounded-sm px-1 py-2 hover:bg-slate-200">
            <div className="flex items-center">
              <ChartNoAxesGantt size={15} className="mr-2 text-[#dc043b]" />
              <p>Timeline</p>
            </div>
            <Plus size={15} className="text-gray-700" />
          </div>
          <div className="flex cursor-pointer items-center justify-between rounded-sm px-1 py-2 hover:bg-slate-200">
            <div className="flex items-center">
              <ListChecks size={15} className="mr-2 text-[#0d52ac]" />
              <p>List</p>
            </div>
            <Plus size={15} className="text-gray-700" />
          </div>
          <div className="flex cursor-pointer items-center justify-between rounded-sm px-1 py-2 hover:bg-slate-200">
            <div className="flex items-center">
              <ChartGantt size={15} className="mr-2 text-[#0d7f78]" />
              <p>Gantt</p>
            </div>
            <Plus size={15} className="text-gray-700" />
          </div>
          <div className="flex cursor-pointer items-center justify-between rounded-sm px-1 py-2 hover:bg-slate-200">
            <p>New Section</p>
            <Plus size={15} className="text-gray-700" />
          </div>
        </div>
        <div className="mx-2 cursor-pointer border-t border-slate-300 px-1 py-2">
          <div className="flex cursor-pointer items-center justify-between rounded-sm px-1 py-2 hover:bg-slate-200">
            <div className="flex items-center">
              <BookText size={15} className="mr-2 text-[#0d7f78]" />
              <p>Form</p>
            </div>
            <Plus size={15} className="text-gray-700" />
          </div>
        </div>
      </nav>
    </div>
  );
}
