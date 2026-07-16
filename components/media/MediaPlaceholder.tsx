import { cn } from "@/lib/utils";

type Props = {
  label?: string;
  className?: string;
  aspect?: "video" | "square" | "portrait" | "wide" | "auto";
  icon?: boolean;
};

const aspectMap = {
  video: "aspect-video",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  wide: "aspect-[21/9]",
  auto: "",
};

/** Gri kutu — gerçek fotoğraf gelene kadar yer tutucu */
export function MediaPlaceholder({
  label = "Fotoğraf eklenecek",
  className,
  aspect = "video",
  icon = true,
}: Props) {
  return (
    <div
      className={cn(
        "relative flex w-full items-center justify-center overflow-hidden bg-placeholder text-muted",
        aspectMap[aspect],
        className,
      )}
      role="img"
      aria-label={label}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(135deg, transparent 40%, var(--placeholder-line) 40%, var(--placeholder-line) 50%, transparent 50%), linear-gradient(45deg, transparent 40%, var(--placeholder-line) 40%, var(--placeholder-line) 50%, transparent 50%)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="relative z-10 flex flex-col items-center gap-2 px-4 text-center">
        {icon && (
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="8.5" cy="10" r="1.5" />
            <path d="M21 16l-5.5-5.5L7 19" />
          </svg>
        )}
        <span className="text-xs font-medium tracking-wide uppercase opacity-80">
          {label}
        </span>
      </div>
    </div>
  );
}
