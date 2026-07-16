import { notFound } from "next/navigation";
import { guardAdminPage } from "@/lib/admin-guard";
import { getTeamUsers } from "@/lib/data";
import { TeamForm } from "@/components/admin/TeamForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditTeamPage({ params }: Props) {
  await guardAdminPage("team");
  const { id } = await params;
  const users = await getTeamUsers();
  const member = users.find((u) => u.id === id);
  if (!member) notFound();

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl text-foreground">Üyeyi düzenle</h1>
      <TeamForm member={member} />
    </div>
  );
}
