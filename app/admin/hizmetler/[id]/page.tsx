import { notFound } from "next/navigation";
import { guardAdminPage } from "@/lib/admin-guard";
import { getServiceById } from "@/lib/data";
import { ServiceForm } from "@/components/admin/ServiceForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditServicePage({ params }: Props) {
  await guardAdminPage("services");
  const { id } = await params;
  const service = await getServiceById(id);
  if (!service) notFound();

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl text-foreground">Hizmeti düzenle</h1>
      <ServiceForm service={service} />
    </div>
  );
}
