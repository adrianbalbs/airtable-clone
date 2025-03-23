import Image from "next/image";

export default function Loader() {
  return (
    <div className="flex h-full w-full animate-spin items-center justify-center">
      <Image src="/spinner.svg" alt="Spinner" width={50} height={50} />
    </div>
  );
}
