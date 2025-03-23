import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import TableInnerPage from "./components/table-inner-page";

export default async function Base({
  params,
}: {
  params: { baseId: string; tableId: string };
}) {
  const session = await auth();
  const { baseId, tableId } = await params;
  if (!session?.user) {
    redirect("api/auth/signin");
  }
  return (
    <div className="flex h-screen flex-col">
      <TableInnerPage
        name={session.user.name ?? "undefined"}
        email={session.user.email ?? "undefined"}
        baseId={parseInt(baseId)}
        tableId={parseInt(tableId)}
      />
    </div>
  );
}
