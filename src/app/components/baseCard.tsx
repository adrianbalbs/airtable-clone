type BaseCardProps = {
    title: string,
}

type BaseGridProps = {
    title: string,
}

function BaseCard({ title }: BaseCardProps) {
    const shortName = title.slice(0, 2);
    return (
        <div className="flex items-center border border-slate-300 bg-white h-[92px] rounded-md shadow-sm hover:shadow-md cursor-pointer">
            <div className="flex justify-center items-center w-[92px] h-[92px] min-w-[92px]">
                <div className="flex justify-center items-center rounded-xl border border-gray-400 bg-primary w-[56px] h-[56px]">
                    <span className="text-xl">{shortName}</span>
                </div>
            </div>
            <div className="flex flex-col">
                <h4 className="text-sm mb-2">{title}</h4>
                <p className="text-xs text-gray-500">Base</p>
            </div>
        </div>
    )
}

export default function BaseGrid({ title }: BaseGridProps) {
    return (
        <div className="flex flex-col mb-5">
            <h4 className="text-gray-500 text-sm mb-3">{title}</h4>
            <div className="grid grid-cols-[repeat(auto-fill,_minmax(295px,_1fr))] gap-2 w-full">
                <BaseCard title="Untitled Base" />
                <BaseCard title="Untitled Base" />
            </div>
        </div>
    )
}
