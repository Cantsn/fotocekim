import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_BYTES = 12 * 1024 * 1024; // 12MB

export function getUploadDir() {
  if (process.env.UPLOAD_DIR) return process.env.UPLOAD_DIR;
  // Statically scoped under project data/ (Coolify: set UPLOAD_DIR=/data/uploads)
  return path.join(/* turbopackIgnore: true */ process.cwd(), "data", "uploads");
}

export function publicFileUrl(filename: string) {
  return `/api/files/${filename}`;
}

export async function saveUploadedImage(file: File): Promise<string> {
  if (!ALLOWED.has(file.type)) {
    throw new Error("Sadece JPG, PNG, WebP veya GIF yüklenebilir.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Dosya en fazla 12MB olabilir.");
  }

  const ext =
    file.type === "image/jpeg"
      ? "jpg"
      : file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "gif";

  const filename = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const dir = getUploadDir();
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);
  return publicFileUrl(filename);
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
