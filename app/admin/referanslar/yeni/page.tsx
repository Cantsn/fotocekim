import { guardAdminPage } from "@/lib/admin-guard";
import { TestimonialForm } from "@/components/admin/TestimonialForm";

export const dynamic = "force-dynamic";

export default async function NewTestimonialPage() {
  await guardAdminPage("settings");
  return (
    <div>
      <h1 className="mb-8 font-serif text-3xl text-foreground">Yeni referans</h1>
      <TestimonialForm />
    </div>
  );
}
