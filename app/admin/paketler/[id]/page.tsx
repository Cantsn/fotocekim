import { notFound } from "next/navigation";
import { guardAdminPage } from "@/lib/admin-guard";
import { getPackageById } from "@/lib/data";
import { PackageForm } from "@/components/admin/PackageForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditPackagePage({ params }: Props) {
  await guardAdminPage("packages");
  const { id } = await params;
  const pkg = await getPackageById(id);
  if (!pkg) notFound();

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl text-foreground">Paketi düzenle</h1>
      <PackageForm pkg={pkg} />
    </div>
  );
}
