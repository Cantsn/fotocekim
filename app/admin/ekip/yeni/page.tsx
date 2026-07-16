import { guardAdminPage } from "@/lib/admin-guard";
import { TeamForm } from "@/components/admin/TeamForm";

export const dynamic = "force-dynamic";

export default async function NewTeamPage() {
  await guardAdminPage("team");
  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl text-foreground">Yeni ekip üyesi</h1>
      <TeamForm />
    </div>
  );
}
