import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin Giriş",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8">
        <p className="text-xs tracking-[0.2em] text-accent uppercase">Admin</p>
        <h1 className="mt-2 font-serif text-3xl text-foreground">Giriş yap</h1>
        <p className="mt-2 mb-8 text-sm text-muted">
          Varsayılan: admin@fotocekim.com / admin123
          <br />
          (Ortam değişkenleriyle değiştirin)
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
