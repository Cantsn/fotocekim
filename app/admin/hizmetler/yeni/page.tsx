import { guardAdminPage } from "@/lib/admin-guard";
import { ServiceForm } from "@/components/admin/ServiceForm";

export const dynamic = "force-dynamic";

export default async function NewServicePage() {
  await guardAdminPage("services");
  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl text-foreground">Yeni hizmet</h1>
      <ServiceForm />
    </div>
  );
}
