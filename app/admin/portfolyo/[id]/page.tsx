import { notFound } from "next/navigation";
import { guardAdminPage } from "@/lib/admin-guard";
import { getProjectById } from "@/lib/data";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { ImageManager } from "@/components/admin/ImageManager";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditProjectPage({ params }: Props) {
  await guardAdminPage("portfolio");
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project) notFound();

  return (
    <div>
      <h1 className="mb-2 font-serif text-3xl text-foreground">
        Projeyi düzenle
      </h1>
      <p className="mb-8 text-sm text-muted">
        Proje bilgilerini kaydedin; kapak ve galeriyi alttaki panelden yönetin.
      </p>
      <ProjectForm project={project} />
      <ImageManager
        kind="project"
        entityId={project.id}
        coverUrl={project.coverUrl}
        images={project.images}
        title={project.title}
      />
    </div>
  );
}
