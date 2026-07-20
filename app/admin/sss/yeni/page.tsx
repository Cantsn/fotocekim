import { guardAdminPage } from "@/lib/admin-guard";
import { FaqForm } from "@/components/admin/FaqForm";

export const dynamic = "force-dynamic";

export default async function NewFaqPage() {
  await guardAdminPage("settings");
  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl text-foreground">Yeni SSS</h1>
      <FaqForm />
    </div>
  );
}
