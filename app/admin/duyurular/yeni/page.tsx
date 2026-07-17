import { guardAdminPage } from "@/lib/admin-guard";
import { AnnouncementForm } from "@/components/admin/AnnouncementForm";

export const dynamic = "force-dynamic";

export default async function NewAnnouncementPage() {
  await guardAdminPage("settings");
  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl text-foreground">Yeni duyuru</h1>
      <AnnouncementForm />
    </div>
  );
}
