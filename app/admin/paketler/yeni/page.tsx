import { guardAdminPage } from "@/lib/admin-guard";
import { PackageForm } from "@/components/admin/PackageForm";

export const dynamic = "force-dynamic";

export default async function NewPackagePage() {
  await guardAdminPage("packages");
  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl text-foreground">Yeni paket</h1>
      <PackageForm />
    </div>
  );
}
