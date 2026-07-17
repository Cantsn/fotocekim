import { notFound } from "next/navigation";
import { guardAdminPage } from "@/lib/admin-guard";
import { getTestimonialById } from "@/lib/data";
import { TestimonialForm } from "@/components/admin/TestimonialForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditTestimonialPage({ params }: Props) {
  await guardAdminPage("settings");
  const { id } = await params;
  const item = await getTestimonialById(id);
  if (!item) notFound();

  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl text-foreground">
        Referansı düzenle
      </h1>
      <TestimonialForm item={item} />
    </div>
  );
}
