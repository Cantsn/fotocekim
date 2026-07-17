import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

const ALLOWED_IMAGES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const ALLOWED_VIDEOS = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime", // .mov
]);

const MAX_IMAGE_BYTES = 12 * 1024 * 1024; // 12MB
const MAX_VIDEO_BYTES = 80 * 1024 * 1024; // 80MB

export function getUploadDir() {
  if (process.env.UPLOAD_DIR) return process.env.UPLOAD_DIR;
  // Statically scoped under project data/ (Coolify: set UPLOAD_DIR=/data/uploads)
  return path.join(/* turbopackIgnore: true */ process.cwd(), "data", "uploads");
}

export function publicFileUrl(filename: string) {
  return `/api/files/${filename}`;
}

function extFromMime(type: string): string | null {
  switch (type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "video/mp4":
      return "mp4";
    case "video/webm":
      return "webm";
    case "video/quicktime":
      return "mov";
    default:
      return null;
  }
}

async function saveUploadedFile(
  file: File,
  allowed: Set<string>,
  maxBytes: number,
  typeLabel: string,
): Promise<string> {
  if (!allowed.has(file.type)) {
    throw new Error(`${typeLabel} yüklenemez. İzin verilen tür: ${[...allowed].join(", ")}`);
  }
  if (file.size > maxBytes) {
    throw new Error(
      `Dosya en fazla ${Math.round(maxBytes / (1024 * 1024))}MB olabilir.`,
    );
  }
  const ext = extFromMime(file.type);
  if (!ext) throw new Error("Desteklenmeyen dosya türü.");

  const filename = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const dir = getUploadDir();
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);
  return publicFileUrl(filename);
}

export async function saveUploadedImage(file: File): Promise<string> {
  return saveUploadedFile(
    file,
    ALLOWED_IMAGES,
    MAX_IMAGE_BYTES,
    "Sadece JPG, PNG, WebP veya GIF",
  );
}

/** Hero vb. için fotoğraf veya video */
export async function saveUploadedMedia(
  file: File,
): Promise<{ url: string; kind: "IMAGE" | "VIDEO" }> {
  if (ALLOWED_IMAGES.has(file.type)) {
    const url = await saveUploadedFile(
      file,
      ALLOWED_IMAGES,
      MAX_IMAGE_BYTES,
      "Görsel",
    );
    return { url, kind: "IMAGE" };
  }
  if (ALLOWED_VIDEOS.has(file.type)) {
    const url = await saveUploadedFile(
      file,
      ALLOWED_VIDEOS,
      MAX_VIDEO_BYTES,
      "Video",
    );
    return { url, kind: "VIDEO" };
  }
  throw new Error(
    "Sadece JPG, PNG, WebP, GIF, MP4, WebM veya MOV yüklenebilir.",
  );
}

export async function deleteUploadedFile(url: string | null | undefined) {
  if (!url || !url.startsWith("/api/files/")) return;
  const filename = url.replace("/api/files/", "").replace(/[/\\]/g, "");
  if (!filename || filename.includes("..")) return;
  try {
    await unlink(path.join(getUploadDir(), filename));
  } catch {
    // ignore missing
  }
}

export function slugify(input: string): string {
  return input
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || `item-${Date.now()}`;
}
