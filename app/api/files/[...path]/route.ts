import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getUploadDir } from "@/lib/upload";

type Params = { params: Promise<{ path: string[] }> };

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

export async function GET(_req: Request, { params }: Params) {
  const segments = (await params).path;
  if (!segments?.length) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filename = segments.join("/");
  if (filename.includes("..") || path.isAbsolute(filename)) {
    return new NextResponse("Bad request", { status: 400 });
  }

  const filePath = path.join(getUploadDir(), filename);
  try {
    const data = await readFile(filePath);
    const ext = path.extname(filename).toLowerCase();
    return new NextResponse(data, {
      headers: {
        "Content-Type": MIME[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
