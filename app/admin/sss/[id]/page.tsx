import { notFound } from "next/navigation";
import { guardAdminPage } from "@/lib/admin-guard";
import { getFaqById } from "@/lib/data";
import { FaqForm } from "@/components/admin/FaqForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditFaqPage({ params }: Props) {
  await guardAdminPage("settings");
  const { id } = await params;
  const item = await getFaqById(id);
  if (!item) notFound();

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl text-foreground">SSS düzenle</h1>
      <FaqForm item={item} />
    </div>
  );
}
