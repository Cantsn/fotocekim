import { isVideoUrl, cn } from "@/lib/utils";

/** Foto veya video URL'sini uygun etiketle gösterir */
export function MediaThumb({
  src,
  alt = "",
  className,
  videoClassName,
  imgClassName,
  autoPlay = true,
  controls = false,
}: {
  src: string;
  alt?: string;
  className?: string;
  videoClassName?: string;
  imgClassName?: string;
  /** Liste kartlarında sessiz autoplay */
  autoPlay?: boolean;
  /** Galeri detayında kontroller */
  controls?: boolean;
}) {
  if (isVideoUrl(src)) {
    return (
      <video
        src={src}
        className={cn("object-cover", className, videoClassName)}
        muted={autoPlay}
        playsInline
        loop={autoPlay}
        autoPlay={autoPlay}
        controls={controls}
        preload="metadata"
        aria-label={alt || undefined}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={cn("object-cover", className, imgClassName)}
    />
  );
}
