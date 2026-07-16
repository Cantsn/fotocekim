import { guardAdminPage } from "@/lib/admin-guard";
import { ProjectForm } from "@/components/admin/ProjectForm";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  await guardAdminPage("portfolio");
  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl text-foreground">Yeni portföy projesi</h1>
      <ProjectForm />
    </div>
  );
}
