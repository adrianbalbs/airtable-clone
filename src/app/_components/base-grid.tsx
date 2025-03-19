import Link from "next/link";
import { type RouterOutputs } from "~/trpc/react";

type BaseCardProps = {
  id: number;
  title: string;
};

type BaseGridProps = {
  title: string;
  data: RouterOutputs["base"]["getAllBasesByUser"];
};

function BaseCard({ title, id }: BaseCardProps) {
  const shortName = title.slice(0, 2);
  return (
    <Link href={`/${id}`} passHref>
      <div className="flex h-[92px] cursor-pointer items-center rounded-md border border-slate-300 bg-white shadow-sm hover:shadow-md">
        <div className="flex h-[92px] w-[92px] min-w-[92px] items-center justify-center">
          <div className="flex h-[56px] w-[56px] items-center justify-center rounded-xl border border-gray-400 bg-primary">
            <span className="text-xl">{shortName}</span>
          </div>
        </div>
        <div className="flex flex-col">
          <h4 className="mb-2 text-sm">{title}</h4>
          <p className="text-xs text-gray-500">Base</p>
        </div>
      </div>
    </Link>
  );
}

export default function BaseGrid({ title, data }: BaseGridProps) {
  return (
    <div className="mb-5 flex flex-col">
      <h4 className="mb-3 text-sm text-gray-500">{title}</h4>
      <div className="grid w-full grid-cols-[repeat(auto-fill,_minmax(295px,_1fr))] gap-2">
        {data.map((base) => (
          <BaseCard key={base.id} title={base.name} id={base.id} />
        ))}
      </div>
    </div>
  );
}
