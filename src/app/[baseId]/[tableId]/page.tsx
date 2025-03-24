import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import { HydrateClient } from "~/trpc/server";
import TableWrapper from "./components/table-wrapper";

export default async function Base({
  params,
}: {
  params: Promise<{ baseId: string; tableId: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("api/auth/signin");
  }

  const name = session.user.name ?? "undefined";
  const email = session?.user.email ?? "undefined";
  const { baseId, tableId } = await params;

  return (
    <HydrateClient>
      <TableWrapper
        baseId={baseId}
        tableId={tableId}
        name={name}
        email={email}
      />
    </HydrateClient>
  );
}
