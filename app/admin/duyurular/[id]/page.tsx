import { notFound } from "next/navigation";
import { guardAdminPage } from "@/lib/admin-guard";
import { getAnnouncementById } from "@/lib/data";
import { AnnouncementForm } from "@/components/admin/AnnouncementForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditAnnouncementPage({ params }: Props) {
  await guardAdminPage("settings");
  const { id } = await params;
  const item = await getAnnouncementById(id);
  if (!item) notFound();

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl text-foreground">Duyuruyu düzenle</h1>
      <AnnouncementForm item={item} />
    </div>
  );
}
