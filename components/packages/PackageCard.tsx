import { Check, Sparkles, Tag } from "lucide-react";
import type { Package } from "@/lib/types";
import {
  formatDiscountBadge,
  formatPrice,
  formatPriceAmount,
} from "@/lib/data";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function PackageCard({
  pkg,
  showPrices,
  recommendedLabel,
  ctaLabel,
  size = "default",
}: {
  pkg: Package;
  showPrices: boolean;
  recommendedLabel: string;
  ctaLabel: string;
  size?: "default" | "large";
}) {
  const badge = formatDiscountBadge(pkg);
  const large = size === "large";

  return (
    <div
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-card transition duration-300",
        pkg.highlight
          ? "border-accent/60 shadow-[0_20px_50px_-24px_rgba(166,124,61,0.55)] ring-1 ring-accent/30"
          : "border-border hover:border-accent/35 hover:shadow-[0_16px_40px_-28px_rgba(28,25,23,0.35)]",
      )}
    >
      {/* top accent strip */}
      <div
        className={cn(
          "h-1.5 w-full",
          pkg.highlight
            ? "bg-gradient-to-r from-[#8f6a32] via-[#c4a574] to-[#a67c3d]"
            : "bg-gradient-to-r from-transparent via-border to-transparent",
        )}
      />

      <div className={cn("flex flex-1 flex-col", large ? "p-7 sm:p-8" : "p-5 sm:p-6")}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            {pkg.highlight && (
              <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent">
                <Sparkles className="h-3 w-3" />
                {recommendedLabel}
              </span>
            )}
            <h3
              className={cn(
                "font-serif text-foreground",
                large ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
              )}
            >
              {pkg.name}
            </h3>
            {pkg.description && (
              <p className="mt-1.5 text-sm text-muted">{pkg.description}</p>
            )}
          </div>
          {badge && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-semibold text-rose-700">
              <Tag className="h-3 w-3" />
              {badge}
            </span>
          )}
        </div>

        {showPrices ? (
          <div className="mt-5">
            {pkg.hasDiscount && pkg.priceFrom != null ? (
              <div className="space-y-1">
                <p className="text-sm text-muted line-through decoration-rose-400/70">
                  {formatPriceAmount(pkg.priceFrom, pkg.currency)}
                </p>
                <p
                  className={cn(
                    "font-semibold tracking-tight text-accent",
                    large ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
                  )}
                >
                  {formatPrice(pkg.finalPrice, pkg.currency)}
                </p>
              </div>
            ) : (
              <p
                className={cn(
                  "font-semibold tracking-tight text-accent",
                  large ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
                )}
              >
                {formatPrice(pkg.priceFrom, pkg.currency)}
              </p>
            )}
          </div>
        ) : (
          <p className="mt-5 text-sm text-muted">Teklif üzerine</p>
        )}

        <ul className={cn("flex-1 space-y-2.5", large ? "mt-7" : "mt-5")}>
          {pkg.features.map((f) => (
            <li key={f} className="flex gap-2.5 text-sm text-muted">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                <Check className="h-3 w-3" strokeWidth={2.5} />
              </span>
              <span className="leading-snug">{f}</span>
            </li>
          ))}
        </ul>

        <ButtonLink
          href="/randevu"
          variant={pkg.highlight ? "primary" : "secondary"}
          className={cn("w-full", large ? "mt-8" : "mt-6")}
        >
          {ctaLabel}
        </ButtonLink>
      </div>
    </div>
  );
}
