import { notFound } from "next/navigation";
import { guardAdminPage } from "@/lib/admin-guard";
import { getProjectById } from "@/lib/data";
import { ProjectForm } from "@/components/admin/ProjectForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditProjectPage({ params }: Props) {
  await guardAdminPage("portfolio");
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl text-foreground">Projeyi düzenle</h1>
      <ProjectForm project={project} />
    </div>
  );
}
