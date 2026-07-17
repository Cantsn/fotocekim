"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { updateInquiryStatusAction } from "@/lib/actions/admin";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "NEW", label: "Yeni" },
  { value: "READ", label: "Okundu" },
  { value: "QUOTED", label: "Teklif" },
  { value: "CONFIRMED", label: "Onay" },
  { value: "CANCELLED", label: "İptal" },
];

export function InquiryStatusForm({
  id,
  status,
  compact,
}: {
  id: string;
  status: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Server-side status değişince (refresh) select senkron kalsın
  useEffect(() => {
    setValue(status);
  }, [status]);

  const onSave = () => {
    setError(null);
    const fd = new FormData();
    fd.set("id", id);
    fd.set("status", value);
    startTransition(async () => {
      try {
        const res = await updateInquiryStatusAction(fd);
        if (res && typeof res === "object" && "error" in res && res.error) {
          setError(String(res.error));
          setValue(status);
          return;
        }
        router.refresh();
      } catch {
        setError("Kaydedilemedi");
        setValue(status);
      }
    });
  };

  return (
    <div className={cn("space-y-1", compact ? "" : "min-w-[10rem]")}>
      <div className="flex items-center gap-2">
        <select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={pending}
          className={cn(
            "rounded-lg border border-border bg-muted-bg px-2 py-1.5 text-xs text-foreground disabled:opacity-60",
            compact ? "flex-1" : "min-w-[7.5rem]",
          )}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={onSave}
          disabled={pending || value === status}
          className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-accent disabled:opacity-40"
        >
          {pending ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              …
            </>
          ) : (
            "Kaydet"
          )}
        </button>
      </div>
      {error && <p className="text-[10px] text-danger">{error}</p>}
    </div>
  );
}
