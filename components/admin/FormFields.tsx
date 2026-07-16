import { cn } from "@/lib/utils";

export const fieldClass =
  "w-full rounded-xl border border-border bg-muted-bg px-4 py-2.5 text-sm text-foreground placeholder:text-muted/70 focus:border-accent focus:outline-none";

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-xs text-muted">{label}</span>
      {children}
    </label>
  );
}

export function CheckField({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-muted">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 accent-[var(--accent)]"
      />
      {label}
    </label>
  );
}

export function SubmitBar({
  pending,
  hrefCancel,
  label = "Kaydet",
}: {
  pending?: boolean;
  hrefCancel?: string;
  label?: string;
}) {
  return (
    <div className="flex flex-wrap gap-3 pt-2">
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center rounded-full bg-accent px-6 text-sm font-medium text-background disabled:opacity-50"
      >
        {pending ? "Kaydediliyor..." : label}
      </button>
      {hrefCancel && (
        <a
          href={hrefCancel}
          className="inline-flex h-11 items-center rounded-full border border-border px-6 text-sm text-muted hover:text-foreground"
        >
          İptal
        </a>
      )}
    </div>
  );
}
