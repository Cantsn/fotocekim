"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission, hashPassword, requireAdmin } from "@/lib/auth";
import {
  ALL_PERMISSIONS,
  stringifyPermissions,
  type Permission,
  PERMISSIONS,
} from "@/lib/permissions";
import {
  deleteUploadedFile,
  saveRemoteMedia,
  saveUploadedImage,
  saveUploadedMedia,
  slugify,
} from "@/lib/upload";
import { testSmtpConnection } from "@/lib/mail";
import {
  analyzeCaption,
  collectMediaUrls,
  fetchInstagramByUsername,
  normalizeInstagramUsername,
} from "@/lib/instagram";

export type ActionState = { error?: string; ok?: boolean; message?: string };

/** Google Maps iframe HTML veya düz embed URL → src */
function normalizeMapEmbedInput(raw: string): string {
  const s = raw.trim();
  if (!s) return "";
  const fromIframe = s.match(/src=["']([^"']+)["']/i);
  if (fromIframe?.[1]) return fromIframe[1].trim();
  // maps.app.goo.gl / share link değil, sadece google.com/maps/embed kabul etmeye çalış
  return s;
}

function revalidatePublic() {
  revalidatePath("/", "layout");
  revalidatePath("/admin", "layout");
}

function parseBool(v: FormDataEntryValue | null) {
  return v === "on" || v === "true" || v === "1";
}

function parseFeatures(raw: string): string {
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return JSON.stringify(lines);
}

// ---------- Announcements ----------
export async function saveAnnouncementAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requirePermission("settings");
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const linkUrl = String(formData.get("linkUrl") ?? "").trim();
  const linkLabel = String(formData.get("linkLabel") ?? "").trim();
  const style = String(formData.get("style") ?? "accent");
  const order = Number(formData.get("order") ?? 0) || 0;
  const active = parseBool(formData.get("active"));
  const startsAt = String(formData.get("startsAt") ?? "").trim() || null;
  const endsAt = String(formData.get("endsAt") ?? "").trim() || null;

  if (!title) return { error: "Başlık gerekli." };

  try {
    if (id) {
      await prisma.announcement.update({
        where: { id },
        data: {
          title,
          message,
          linkUrl,
          linkLabel,
          style,
          order,
          active,
          startsAt,
          endsAt,
        },
      });
    } else {
      await prisma.announcement.create({
        data: {
          title,
          message,
          linkUrl,
          linkLabel,
          style,
          order,
          active,
          startsAt,
          endsAt,
        },
      });
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Kayıt hatası" };
  }

  revalidatePublic();
  revalidatePath("/admin/duyurular");
  redirect("/admin/duyurular");
}

export async function deleteAnnouncementAction(formData: FormData) {
  await requirePermission("settings");
  const id = String(formData.get("id") ?? "");
  if (id) await prisma.announcement.delete({ where: { id } });
  revalidatePublic();
  revalidatePath("/admin/duyurular");
}

export async function toggleAnnouncementAction(formData: FormData) {
  await requirePermission("settings");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const row = await prisma.announcement.findUnique({ where: { id } });
  if (!row) return;
  await prisma.announcement.update({
    where: { id },
    data: { active: !row.active },
  });
  revalidatePublic();
  revalidatePath("/admin/duyurular");
}

// ---------- Testimonials (Referanslar) ----------
export async function saveTestimonialAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requirePermission("settings");
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const ratingRaw = Number(formData.get("rating") ?? 5);
  const rating = Math.min(5, Math.max(1, Number.isFinite(ratingRaw) ? ratingRaw : 5));
  const order = Number(formData.get("order") ?? 0) || 0;
  const published = parseBool(formData.get("published"));

  if (!name) return { error: "İsim gerekli." };
  if (!content) return { error: "Yorum metni gerekli." };

  try {
    if (id) {
      await prisma.testimonial.update({
        where: { id },
        data: { name, role: role || null, content, rating, order, published },
      });
    } else {
      await prisma.testimonial.create({
        data: { name, role: role || null, content, rating, order, published },
      });
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Kayıt hatası" };
  }

  revalidatePublic();
  revalidatePath("/admin/referanslar");
  redirect("/admin/referanslar");
}

export async function deleteTestimonialAction(formData: FormData) {
  await requirePermission("settings");
  const id = String(formData.get("id") ?? "");
  if (id) await prisma.testimonial.delete({ where: { id } });
  revalidatePublic();
  revalidatePath("/admin/referanslar");
}

export async function toggleTestimonialAction(formData: FormData) {
  await requirePermission("settings");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const row = await prisma.testimonial.findUnique({ where: { id } });
  if (!row) return;
  await prisma.testimonial.update({
    where: { id },
    data: { published: !row.published },
  });
  revalidatePublic();
  revalidatePath("/admin/referanslar");
}

// ---------- FAQ (SSS) ----------
export async function saveFaqAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requirePermission("settings");
  const id = String(formData.get("id") ?? "");
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  const order = Number(formData.get("order") ?? 0) || 0;
  const published = parseBool(formData.get("published"));

  if (!question) return { error: "Soru gerekli." };
  if (!answer) return { error: "Cevap gerekli." };

  try {
    if (id) {
      await prisma.faq.update({
        where: { id },
        data: { question, answer, order, published },
      });
    } else {
      await prisma.faq.create({
        data: { question, answer, order, published },
      });
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Kayıt hatası" };
  }

  revalidatePublic();
  revalidatePath("/admin/sss");
  revalidatePath("/sss");
  redirect("/admin/sss");
}

export async function deleteFaqAction(formData: FormData) {
  await requirePermission("settings");
  const id = String(formData.get("id") ?? "");
  if (id) await prisma.faq.delete({ where: { id } });
  revalidatePublic();
  revalidatePath("/admin/sss");
  revalidatePath("/sss");
}

export async function toggleFaqAction(formData: FormData) {
  await requirePermission("settings");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const row = await prisma.faq.findUnique({ where: { id } });
  if (!row) return;
  await prisma.faq.update({
    where: { id },
    data: { published: !row.published },
  });
  revalidatePublic();
  revalidatePath("/admin/sss");
  revalidatePath("/sss");
}

// ---------- Services ----------
export async function saveServiceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requirePermission("services");
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  let slug = String(formData.get("slug") ?? "").trim() || slugify(title);
  const shortDesc = String(formData.get("shortDesc") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const order = Number(formData.get("order") ?? 0) || 0;
  const published = parseBool(formData.get("published"));

  if (!title) return { error: "Başlık gerekli." };

  let serviceId = id;
  try {
    if (id) {
      await prisma.service.update({
        where: { id },
        data: { title, slug, shortDesc, content, order, published },
      });
    } else {
      const clash = await prisma.service.findUnique({ where: { slug } });
      if (clash) slug = `${slug}-${Date.now().toString(36)}`;
      const created = await prisma.service.create({
        data: { title, slug, shortDesc, content, order, published },
      });
      serviceId = created.id;
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Kayıt hatası" };
  }

  revalidatePublic();
  revalidatePath("/admin/hizmetler");
  // Yeni kayıttan sonra görsel yönetimine yönlendir
  if (!id && serviceId) {
    redirect(`/admin/hizmetler/${serviceId}`);
  }
  redirect("/admin/hizmetler");
}

export async function deleteServiceAction(formData: FormData) {
  await requirePermission("services");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const service = await prisma.service.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!service) return;
  await deleteUploadedFile(service.coverUrl);
  for (const img of service.images) {
    await deleteUploadedFile(img.url);
  }
  await prisma.service.delete({ where: { id } });
  revalidatePublic();
  revalidatePath("/admin/hizmetler");
}

export async function uploadServiceImagesAction(formData: FormData) {
  await requirePermission("services");
  const serviceId = String(formData.get("entityId") ?? "");
  if (!serviceId) return { error: "Hizmet bulunamadı." };
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return { error: "Hizmet bulunamadı." };

  const files = formData.getAll("files");
  let orderBase = await prisma.serviceImage.count({ where: { serviceId } });
  let uploaded = 0;
  try {
    for (const item of files) {
      if (item instanceof File && item.size > 0) {
        const { url } = await saveUploadedMedia(item);
        await prisma.serviceImage.create({
          data: {
            serviceId,
            url,
            alt: service.title,
            order: orderBase++,
          },
        });
        uploaded += 1;
        // İlk medya kapak yoksa kapak olsun
        if (!service.coverUrl && uploaded === 1) {
          await prisma.service.update({
            where: { id: serviceId },
            data: { coverUrl: url },
          });
        }
      }
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Yükleme hatası" };
  }
  revalidatePublic();
  revalidatePath(`/admin/hizmetler/${serviceId}`);
  return { ok: true, message: `${uploaded} medya yüklendi` };
}

export async function uploadServiceCoverAction(formData: FormData) {
  await requirePermission("services");
  const serviceId = String(formData.get("entityId") ?? "");
  if (!serviceId) return { error: "Hizmet bulunamadı." };
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Dosya seçin." };
  }
  try {
    const { url } = await saveUploadedMedia(file);
    const prev = await prisma.service.findUnique({ where: { id: serviceId } });
    if (prev?.coverUrl) {
      const inGallery = await prisma.serviceImage.findFirst({
        where: { serviceId, url: prev.coverUrl },
      });
      if (!inGallery) await deleteUploadedFile(prev.coverUrl);
    }
    await prisma.service.update({
      where: { id: serviceId },
      data: { coverUrl: url },
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Yükleme hatası" };
  }
  revalidatePublic();
  revalidatePath(`/admin/hizmetler/${serviceId}`);
  return { ok: true };
}

export async function setServiceCoverFromImageAction(formData: FormData) {
  await requirePermission("services");
  const serviceId = String(formData.get("entityId") ?? "");
  const imageId = String(formData.get("imageId") ?? "");
  if (!serviceId || !imageId) return;
  const img = await prisma.serviceImage.findFirst({
    where: { id: imageId, serviceId },
  });
  if (!img) return;
  await prisma.service.update({
    where: { id: serviceId },
    data: { coverUrl: img.url },
  });
  revalidatePublic();
  revalidatePath(`/admin/hizmetler/${serviceId}`);
}

export async function clearServiceCoverAction(formData: FormData) {
  await requirePermission("services");
  const serviceId = String(formData.get("entityId") ?? "");
  if (!serviceId) return;
  const prev = await prisma.service.findUnique({ where: { id: serviceId } });
  // Cover file only delete if not used in gallery
  if (prev?.coverUrl) {
    const inGallery = await prisma.serviceImage.findFirst({
      where: { serviceId, url: prev.coverUrl },
    });
    if (!inGallery) await deleteUploadedFile(prev.coverUrl);
  }
  await prisma.service.update({
    where: { id: serviceId },
    data: { coverUrl: null },
  });
  revalidatePublic();
  revalidatePath(`/admin/hizmetler/${serviceId}`);
}

export async function deleteServiceImageAction(formData: FormData) {
  await requirePermission("services");
  const id = String(formData.get("imageId") ?? "");
  if (!id) return;
  const img = await prisma.serviceImage.findUnique({ where: { id } });
  if (!img) return;
  const service = await prisma.service.findUnique({
    where: { id: img.serviceId },
  });
  await deleteUploadedFile(img.url);
  await prisma.serviceImage.delete({ where: { id } });
  if (service?.coverUrl === img.url) {
    const next = await prisma.serviceImage.findFirst({
      where: { serviceId: img.serviceId },
      orderBy: { order: "asc" },
    });
    await prisma.service.update({
      where: { id: img.serviceId },
      data: { coverUrl: next?.url ?? null },
    });
  }
  revalidatePublic();
  revalidatePath(`/admin/hizmetler/${img.serviceId}`);
}

export async function moveServiceImageAction(formData: FormData) {
  await requirePermission("services");
  const id = String(formData.get("imageId") ?? "");
  const dir = String(formData.get("direction") ?? "");
  if (!id || (dir !== "left" && dir !== "right")) return;
  const img = await prisma.serviceImage.findUnique({ where: { id } });
  if (!img) return;
  const siblings = await prisma.serviceImage.findMany({
    where: { serviceId: img.serviceId },
    orderBy: { order: "asc" },
  });
  const idx = siblings.findIndex((s) => s.id === id);
  const swapWith = dir === "left" ? idx - 1 : idx + 1;
  if (idx < 0 || swapWith < 0 || swapWith >= siblings.length) return;
  const a = siblings[idx];
  const b = siblings[swapWith];
  await prisma.$transaction([
    prisma.serviceImage.update({
      where: { id: a.id },
      data: { order: b.order },
    }),
    prisma.serviceImage.update({
      where: { id: b.id },
      data: { order: a.order },
    }),
  ]);
  // Fix if orders were equal
  if (a.order === b.order) {
    await prisma.serviceImage.update({
      where: { id: a.id },
      data: { order: swapWith },
    });
    await prisma.serviceImage.update({
      where: { id: b.id },
      data: { order: idx },
    });
  }
  revalidatePublic();
  revalidatePath(`/admin/hizmetler/${img.serviceId}`);
}

export async function updateServiceImageAltAction(formData: FormData) {
  await requirePermission("services");
  const id = String(formData.get("imageId") ?? "");
  const alt = String(formData.get("alt") ?? "").trim();
  if (!id) return;
  const img = await prisma.serviceImage.update({
    where: { id },
    data: { alt },
  });
  revalidatePublic();
  revalidatePath(`/admin/hizmetler/${img.serviceId}`);
}

// ---------- Packages ----------
export async function savePackageAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requirePermission("packages");
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  let slug = String(formData.get("slug") ?? "").trim() || slugify(name);
  const description = String(formData.get("description") ?? "").trim();
  const priceRaw = String(formData.get("priceFrom") ?? "").trim();
  const priceFrom = priceRaw === "" ? null : Number(priceRaw);
  const currency = String(formData.get("currency") ?? "TRY").trim() || "TRY";
  const discountTypeRaw = String(formData.get("discountType") ?? "NONE");
  const discountType =
    discountTypeRaw === "PERCENT" || discountTypeRaw === "AMOUNT"
      ? discountTypeRaw
      : "NONE";
  const discountValRaw = String(formData.get("discountValue") ?? "").trim();
  let discountValue: number | null =
    discountValRaw === "" ? null : Number(discountValRaw);
  if (discountType === "NONE") discountValue = null;
  if (discountType === "PERCENT" && discountValue != null) {
    discountValue = Math.min(100, Math.max(0, Math.floor(discountValue)));
  }
  if (discountType === "AMOUNT" && discountValue != null) {
    discountValue = Math.max(0, Math.floor(discountValue));
  }
  const features = parseFeatures(String(formData.get("features") ?? ""));
  const highlight = parseBool(formData.get("highlight"));
  const order = Number(formData.get("order") ?? 0) || 0;
  const published = parseBool(formData.get("published"));

  if (!name) return { error: "Paket adı gerekli." };

  try {
    if (id) {
      await prisma.package.update({
        where: { id },
        data: {
          name,
          slug,
          description,
          priceFrom: Number.isFinite(priceFrom as number) ? priceFrom : null,
          currency,
          discountType,
          discountValue:
            discountValue != null && Number.isFinite(discountValue)
              ? discountValue
              : null,
          features,
          highlight,
          order,
          published,
        },
      });
    } else {
      const clash = await prisma.package.findUnique({ where: { slug } });
      if (clash) slug = `${slug}-${Date.now().toString(36)}`;
      await prisma.package.create({
        data: {
          name,
          slug,
          description,
          priceFrom: Number.isFinite(priceFrom as number) ? priceFrom : null,
          currency,
          discountType,
          discountValue:
            discountValue != null && Number.isFinite(discountValue)
              ? discountValue
              : null,
          features,
          highlight,
          order,
          published,
        },
      });
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Kayıt hatası" };
  }

  revalidatePublic();
  redirect("/admin/paketler");
}

export async function deletePackageAction(formData: FormData) {
  await requirePermission("packages");
  const id = String(formData.get("id") ?? "");
  if (id) await prisma.package.delete({ where: { id } });
  revalidatePublic();
}

// ---------- Portfolio ----------
export async function saveProjectAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requirePermission("portfolio");
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  let slug = String(formData.get("slug") ?? "").trim() || slugify(title);
  const clientFirstName = String(formData.get("clientFirstName") ?? "").trim() || null;
  const clientLastName = String(formData.get("clientLastName") ?? "").trim() || null;
  const location = String(formData.get("location") ?? "").trim() || null;
  const plato = String(formData.get("plato") ?? "").trim() || null;
  const dateRaw = String(formData.get("date") ?? "").trim();
  const category = String(formData.get("category") ?? "dugun").trim();
  const description = String(formData.get("description") ?? "").trim();
  const order = Number(formData.get("order") ?? 0) || 0;
  const published = parseBool(formData.get("published"));
  const featured = parseBool(formData.get("featured"));

  if (!title) return { error: "Başlık gerekli." };

  const clientName =
    [clientFirstName, clientLastName].filter(Boolean).join(" ") || null;
  const date = dateRaw ? new Date(dateRaw) : null;

  let projectId = id;
  try {
    if (id) {
      await prisma.project.update({
        where: { id },
        data: {
          title,
          slug,
          clientFirstName,
          clientLastName,
          clientName,
          location,
          plato,
          date,
          category,
          description,
          order,
          published,
          featured,
        },
      });
    } else {
      const clash = await prisma.project.findUnique({ where: { slug } });
      if (clash) slug = `${slug}-${Date.now().toString(36)}`;
      const created = await prisma.project.create({
        data: {
          title,
          slug,
          clientFirstName,
          clientLastName,
          clientName,
          location,
          plato,
          date,
          category,
          description,
          order,
          published,
          featured,
        },
      });
      projectId = created.id;
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Kayıt hatası" };
  }

  revalidatePublic();
  revalidatePath("/admin/portfolyo");
  if (!id && projectId) {
    redirect(`/admin/portfolyo/${projectId}`);
  }
  redirect("/admin/portfolyo");
}

export async function deleteProjectAction(formData: FormData) {
  await requirePermission("portfolio");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!project) return;
  await deleteUploadedFile(project.coverUrl);
  for (const img of project.images) {
    await deleteUploadedFile(img.url);
  }
  await prisma.project.delete({ where: { id } });
  revalidatePublic();
  revalidatePath("/admin/portfolyo");
}

export async function uploadProjectImagesAction(formData: FormData) {
  await requirePermission("portfolio");
  const projectId = String(formData.get("entityId") ?? "");
  if (!projectId) return { error: "Proje bulunamadı." };
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return { error: "Proje bulunamadı." };

  const files = formData.getAll("files");
  let orderBase = await prisma.projectImage.count({ where: { projectId } });
  let uploaded = 0;
  try {
    for (const item of files) {
      if (item instanceof File && item.size > 0) {
        const { url } = await saveUploadedMedia(item);
        await prisma.projectImage.create({
          data: {
            projectId,
            url,
            alt: project.title,
            order: orderBase++,
          },
        });
        uploaded += 1;
        if (!project.coverUrl && uploaded === 1) {
          await prisma.project.update({
            where: { id: projectId },
            data: { coverUrl: url },
          });
        }
      }
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Yükleme hatası" };
  }
  revalidatePublic();
  revalidatePath(`/admin/portfolyo/${projectId}`);
  return { ok: true, message: `${uploaded} medya yüklendi` };
}

export async function uploadProjectCoverAction(formData: FormData) {
  await requirePermission("portfolio");
  const projectId = String(formData.get("entityId") ?? "");
  if (!projectId) return { error: "Proje bulunamadı." };
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Dosya seçin." };
  }
  try {
    const { url } = await saveUploadedMedia(file);
    const prev = await prisma.project.findUnique({ where: { id: projectId } });
    if (prev?.coverUrl) {
      const inGallery = await prisma.projectImage.findFirst({
        where: { projectId, url: prev.coverUrl },
      });
      if (!inGallery) await deleteUploadedFile(prev.coverUrl);
    }
    await prisma.project.update({
      where: { id: projectId },
      data: { coverUrl: url },
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Yükleme hatası" };
  }
  revalidatePublic();
  revalidatePath(`/admin/portfolyo/${projectId}`);
  return { ok: true };
}

export async function setProjectCoverFromImageAction(formData: FormData) {
  await requirePermission("portfolio");
  const projectId = String(formData.get("entityId") ?? "");
  const imageId = String(formData.get("imageId") ?? "");
  if (!projectId || !imageId) return;
  const img = await prisma.projectImage.findFirst({
    where: { id: imageId, projectId },
  });
  if (!img) return;
  await prisma.project.update({
    where: { id: projectId },
    data: { coverUrl: img.url },
  });
  revalidatePublic();
  revalidatePath(`/admin/portfolyo/${projectId}`);
}

export async function clearProjectCoverAction(formData: FormData) {
  await requirePermission("portfolio");
  const projectId = String(formData.get("entityId") ?? "");
  if (!projectId) return;
  const prev = await prisma.project.findUnique({ where: { id: projectId } });
  if (prev?.coverUrl) {
    const inGallery = await prisma.projectImage.findFirst({
      where: { projectId, url: prev.coverUrl },
    });
    if (!inGallery) await deleteUploadedFile(prev.coverUrl);
  }
  await prisma.project.update({
    where: { id: projectId },
    data: { coverUrl: null },
  });
  revalidatePublic();
  revalidatePath(`/admin/portfolyo/${projectId}`);
}

export async function deleteProjectImageAction(formData: FormData) {
  await requirePermission("portfolio");
  const id = String(formData.get("imageId") ?? formData.get("id") ?? "");
  if (!id) return;
  const img = await prisma.projectImage.findUnique({ where: { id } });
  if (!img) return;
  const project = await prisma.project.findUnique({
    where: { id: img.projectId },
  });
  await deleteUploadedFile(img.url);
  await prisma.projectImage.delete({ where: { id } });
  if (project?.coverUrl === img.url) {
    const next = await prisma.projectImage.findFirst({
      where: { projectId: img.projectId },
      orderBy: { order: "asc" },
    });
    await prisma.project.update({
      where: { id: img.projectId },
      data: { coverUrl: next?.url ?? null },
    });
  }
  revalidatePublic();
  revalidatePath(`/admin/portfolyo/${img.projectId}`);
}

export async function moveProjectImageAction(formData: FormData) {
  await requirePermission("portfolio");
  const id = String(formData.get("imageId") ?? "");
  const dir = String(formData.get("direction") ?? "");
  if (!id || (dir !== "left" && dir !== "right")) return;
  const img = await prisma.projectImage.findUnique({ where: { id } });
  if (!img) return;
  const siblings = await prisma.projectImage.findMany({
    where: { projectId: img.projectId },
    orderBy: { order: "asc" },
  });
  const idx = siblings.findIndex((s) => s.id === id);
  const swapWith = dir === "left" ? idx - 1 : idx + 1;
  if (idx < 0 || swapWith < 0 || swapWith >= siblings.length) return;
  const a = siblings[idx];
  const b = siblings[swapWith];
  await prisma.$transaction([
    prisma.projectImage.update({
      where: { id: a.id },
      data: { order: b.order },
    }),
    prisma.projectImage.update({
      where: { id: b.id },
      data: { order: a.order },
    }),
  ]);
  if (a.order === b.order) {
    await prisma.projectImage.update({
      where: { id: a.id },
      data: { order: swapWith },
    });
    await prisma.projectImage.update({
      where: { id: b.id },
      data: { order: idx },
    });
  }
  revalidatePublic();
  revalidatePath(`/admin/portfolyo/${img.projectId}`);
}

export async function updateProjectImageAltAction(formData: FormData) {
  await requirePermission("portfolio");
  const id = String(formData.get("imageId") ?? "");
  const alt = String(formData.get("alt") ?? "").trim();
  if (!id) return;
  const img = await prisma.projectImage.update({
    where: { id },
    data: { alt },
  });
  revalidatePublic();
  revalidatePath(`/admin/portfolyo/${img.projectId}`);
}

// ---------- Settings ----------
export async function saveSettingsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requirePermission("settings");

  const smtpPasswordInput = String(formData.get("smtpPassword") ?? "");
  const existing = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  });

  const data = {
    siteName: String(formData.get("siteName") ?? "").trim() || "FotoCekim",
    tagline: String(formData.get("tagline") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    whatsapp: String(formData.get("whatsapp") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
    mapEmbedUrl: normalizeMapEmbedInput(
      String(formData.get("mapEmbedUrl") ?? ""),
    ),
    mapLinkUrl: String(formData.get("mapLinkUrl") ?? "").trim(),
    instagram: String(formData.get("instagram") ?? "").trim(),
    youtube: String(formData.get("youtube") ?? "").trim(),
    tiktok: String(formData.get("tiktok") ?? "").trim(),
    showPrices: parseBool(formData.get("showPrices")),
    seoTitle: String(formData.get("seoTitle") ?? "").trim(),
    seoDescription: String(formData.get("seoDescription") ?? "").trim(),
    smtpEnabled: parseBool(formData.get("smtpEnabled")),
    smtpHost: String(formData.get("smtpHost") ?? "").trim(),
    smtpPort: Number(formData.get("smtpPort") ?? 587) || 587,
    smtpUser: String(formData.get("smtpUser") ?? "").trim(),
    smtpPassword:
      smtpPasswordInput.trim() !== ""
        ? smtpPasswordInput
        : (existing?.smtpPassword ?? ""),
    smtpFrom: String(formData.get("smtpFrom") ?? "").trim(),
    smtpSecure: parseBool(formData.get("smtpSecure")),
  };

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: { id: "default", ...data },
    update: data,
  });

  revalidatePublic();
  // SEO metadata root layout generateMetadata ile gelir
  revalidatePath("/", "layout");
  revalidatePath("/admin/ayarlar");
  return { ok: true, message: "Ayarlar kaydedildi. SEO ve site bilgileri güncellendi." };
}

export async function uploadHeroMediaAction(formData: FormData) {
  await requirePermission("settings");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Dosya seçin." };
  }
  try {
    const { url, kind } = await saveUploadedMedia(file);
    const existing = await prisma.siteSettings.findUnique({
      where: { id: "default" },
    });
    if (existing?.heroMediaUrl) {
      await deleteUploadedFile(existing.heroMediaUrl);
    }
    await prisma.siteSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        siteName: existing?.siteName ?? "FotoCekim",
        heroMediaType: kind,
        heroMediaUrl: url,
      },
      update: {
        heroMediaType: kind,
        heroMediaUrl: url,
      },
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Yükleme hatası" };
  }
  revalidatePublic();
  revalidatePath("/admin/ayarlar");
  return { ok: true, message: "Hero medyası güncellendi." };
}

export async function uploadHeroPosterAction(formData: FormData) {
  await requirePermission("settings");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Poster görseli seçin." };
  }
  try {
    const url = await saveUploadedImage(file);
    const existing = await prisma.siteSettings.findUnique({
      where: { id: "default" },
    });
    if (existing?.heroPosterUrl) {
      await deleteUploadedFile(existing.heroPosterUrl);
    }
    await prisma.siteSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        siteName: existing?.siteName ?? "FotoCekim",
        heroPosterUrl: url,
      },
      update: { heroPosterUrl: url },
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Yükleme hatası" };
  }
  revalidatePublic();
  revalidatePath("/admin/ayarlar");
  return { ok: true, message: "Hero poster güncellendi." };
}

export async function saveHeroMediaUrlAction(formData: FormData) {
  await requirePermission("settings");
  const rawUrl = String(formData.get("url") ?? "").trim();
  const typeRaw = String(formData.get("type") ?? "IMAGE").toUpperCase();
  const type = typeRaw === "VIDEO" ? "VIDEO" : "IMAGE";

  if (!rawUrl) return { error: "URL girin." };
  // Allow relative /api/files/... or absolute http(s)
  if (
    !rawUrl.startsWith("/api/files/") &&
    !rawUrl.startsWith("https://") &&
    !rawUrl.startsWith("http://")
  ) {
    return { error: "Geçerli bir URL girin (https://… veya yüklenen dosya)." };
  }

  const existing = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  });
  // Only delete previous if it was an uploaded file and different from new
  if (
    existing?.heroMediaUrl &&
    existing.heroMediaUrl !== rawUrl &&
    existing.heroMediaUrl.startsWith("/api/files/")
  ) {
    await deleteUploadedFile(existing.heroMediaUrl);
  }

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      siteName: existing?.siteName ?? "FotoCekim",
      heroMediaType: type,
      heroMediaUrl: rawUrl,
    },
    update: {
      heroMediaType: type,
      heroMediaUrl: rawUrl,
    },
  });

  revalidatePublic();
  revalidatePath("/admin/ayarlar");
  return { ok: true, message: "Hero URL kaydedildi." };
}

export async function clearHeroMediaAction() {
  await requirePermission("settings");
  const existing = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  });
  if (existing?.heroMediaUrl) {
    await deleteUploadedFile(existing.heroMediaUrl);
  }
  if (existing?.heroPosterUrl) {
    await deleteUploadedFile(existing.heroPosterUrl);
  }
  await prisma.siteSettings.update({
    where: { id: "default" },
    data: {
      heroMediaType: "NONE",
      heroMediaUrl: "",
      heroPosterUrl: "",
    },
  });
  revalidatePublic();
  revalidatePath("/admin/ayarlar");
  return { ok: true, message: "Hero medyası kaldırıldı." };
}

export async function clearHeroPosterAction() {
  await requirePermission("settings");
  const existing = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  });
  if (existing?.heroPosterUrl) {
    await deleteUploadedFile(existing.heroPosterUrl);
  }
  await prisma.siteSettings.update({
    where: { id: "default" },
    data: { heroPosterUrl: "" },
  });
  revalidatePublic();
  revalidatePath("/admin/ayarlar");
  return { ok: true, message: "Poster kaldırıldı." };
}

export async function testSmtpAction(): Promise<ActionState> {
  await requirePermission("settings");
  const result = await testSmtpConnection();
  if (!result.ok) return { error: result.error || "SMTP test başarısız" };
  return { ok: true, message: "SMTP bağlantısı başarılı." };
}

// ---------- Instagram → Portföy ----------
export async function loadInstagramFeedAction(
  formData: FormData,
): Promise<{
  error?: string;
  username?: string;
  items?: Awaited<ReturnType<typeof fetchInstagramByUsername>>["items"];
  debug?: Awaited<ReturnType<typeof fetchInstagramByUsername>>["debug"];
}> {
  await requirePermission("portfolio");
  const username = normalizeInstagramUsername(
    String(formData.get("username") ?? ""),
  );
  if (!username) return { error: "Instagram kullanıcı adı girin." };

  const sessionCookie = String(formData.get("sessionCookie") ?? "");
  // Tüm (veya çok sayıda) gönderi: foto + video + açıklama
  const result = await fetchInstagramByUsername(username, 250, {
    sessionCookie,
  });
  if (result.error) {
    return {
      error: result.error,
      username: result.username,
      debug: result.debug,
    };
  }
  return {
    items: result.items,
    username: result.username,
    debug: result.debug,
  };
}

export async function importInstagramMediaAction(
  formData: FormData,
): Promise<ActionState> {
  await requirePermission("portfolio");

  // Seçilen gönderilerin tam verisi client’tan gelir (Instagram’a tekrar gitmez)
  const rawPayload = String(formData.get("itemsJson") ?? "");
  let selected: Awaited<
    ReturnType<typeof fetchInstagramByUsername>
  >["items"] = [];
  try {
    const parsed = JSON.parse(rawPayload) as unknown;
    if (!Array.isArray(parsed)) throw new Error("itemsJson dizi değil");
    selected = parsed as typeof selected;
  } catch {
    return {
      error:
        "Seçim verisi okunamadı. Gönderileri yeniden getirip tekrar seçin.",
    };
  }

  if (selected.length === 0) {
    return { error: "En az bir gönderi seçin." };
  }

  const published = parseBool(formData.get("published"));
  const forceCategory = String(formData.get("category") ?? "").trim();

  let imported = 0;
  const errors: string[] = [];

  for (const item of selected) {
    try {
      if (!item?.id) continue;
      const analysis = analyzeCaption(item.caption || "");
      const category =
        forceCategory && forceCategory !== "auto"
          ? forceCategory
          : item.categoryGuess || analysis.categoryGuess;
      const title = (analysis.title || item.caption || `IG ${item.id}`).slice(
        0,
        100,
      );
      let slug = slugify(title) || `ig-${String(item.id).slice(-8)}`;
      const clash = await prisma.project.findUnique({ where: { slug } });
      if (clash) slug = `${slug}-${String(item.id).slice(-6)}`;

      const description = [
        (item.caption || "").trim(),
        item.permalink ? `\n\nKaynak: ${item.permalink}` : "",
      ]
        .join("")
        .trim()
        .slice(0, 4000);

      const date = item.timestamp ? new Date(item.timestamp) : null;
      const urls = collectMediaUrls(item);
      if (urls.length === 0) {
        errors.push(`${title}: medya URL yok`);
        continue;
      }

      const saved: string[] = [];
      for (const remote of urls.slice(0, 30)) {
        try {
          const { url } = await saveRemoteMedia(remote);
          saved.push(url);
        } catch {
          // tek dosya hatası
        }
      }
      if (saved.length === 0) {
        errors.push(`${title}: indirme başarısız`);
        continue;
      }

      // Kapak: ilk görsel tercihen
      const coverUrl = saved[0];

      await prisma.project.create({
        data: {
          title,
          slug,
          description,
          category,
          coverUrl,
          date,
          published,
          featured: false,
          order: 0,
          images: {
            create: saved.map((url, i) => ({
              url,
              alt: title,
              order: i,
            })),
          },
        },
      });
      imported += 1;
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "Kayıt hatası");
    }
  }

  revalidatePublic();
  revalidatePath("/admin/portfolyo");
  revalidatePath("/admin/instagram");

  if (imported === 0) {
    return {
      error:
        errors[0] ||
        "Hiçbir gönderi aktarılamadı. Medya indirme veya seçim hatası.",
    };
  }

  return {
    ok: true,
    message: `${imported} proje portföye aktarıldı.${
      errors.length ? ` ${errors.length} hata atlandı.` : ""
    }`,
  };
}

// ---------- Team ----------
export async function saveTeamMemberAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requirePermission("team");
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const active = parseBool(formData.get("active"));

  const perms: Permission[] = [];
  for (const p of PERMISSIONS) {
    if (parseBool(formData.get(`perm_${p}`))) perms.push(p);
  }
  // dashboard always
  if (!perms.includes("dashboard")) perms.unshift("dashboard");

  if (!name || !email) return { error: "Ad ve e-posta gerekli." };

  try {
    if (id) {
      const target = await prisma.user.findUnique({ where: { id } });
      if (!target) return { error: "Kullanıcı yok." };
      if (target.isOwner) {
        // owner: only name/email/password, keep owner perms
        const data: {
          name: string;
          email: string;
          passwordHash?: string;
        } = { name, email };
        if (password.length >= 8) {
          data.passwordHash = await hashPassword(password);
        }
        await prisma.user.update({ where: { id }, data });
      } else {
        const data: {
          name: string;
          email: string;
          active: boolean;
          permissions: string;
          passwordHash?: string;
        } = {
          name,
          email,
          active,
          permissions: stringifyPermissions(perms),
        };
        if (password.length >= 8) {
          data.passwordHash = await hashPassword(password);
        }
        await prisma.user.update({ where: { id }, data });
      }
    } else {
      if (password.length < 8) {
        return { error: "Yeni üye için şifre en az 8 karakter olmalı." };
      }
      await prisma.user.create({
        data: {
          name,
          email,
          passwordHash: await hashPassword(password),
          active,
          isOwner: false,
          permissions: stringifyPermissions(perms),
        },
      });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Kayıt hatası";
    if (msg.includes("Unique")) return { error: "Bu e-posta zaten kayıtlı." };
    return { error: msg };
  }

  revalidatePath("/admin/ekip");
  redirect("/admin/ekip");
}

export async function deleteTeamMemberAction(formData: FormData) {
  const actor = await requirePermission("team");
  const id = String(formData.get("id") ?? "");
  if (!id || id === actor.id) return;
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target || target.isOwner) return;
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/ekip");
}

export async function updateInquiryStatusAction(
  formData: FormData,
): Promise<ActionState> {
  await requirePermission("inquiries");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "READ");
  if (!id) return { error: "Kayıt bulunamadı." };

  const allowed = ["NEW", "READ", "QUOTED", "CONFIRMED", "CANCELLED"];
  if (!allowed.includes(status)) return { error: "Geçersiz durum." };

  const row = await prisma.inquiry.findUnique({ where: { id } });
  if (!row) return { error: "Kayıt bulunamadı." };

  if (status === "CONFIRMED") {
    if (row.eventDate && row.eventTime) {
      const { isSlotAvailable } = await import("@/lib/availability");
      const free = await isSlotAvailable(row.eventDate, row.eventTime, id);
      if (!free) {
        return {
          error:
            "Bu tarih/saat dolu. Onay için önce başka bir slot seçin veya çakışmayı kaldırın.",
        };
      }
    }
  }

  let googleEventId = row.googleEventId;

  if (status === "CONFIRMED" && row.eventDate && row.eventTime && !googleEventId) {
    const { createGoogleCalendarEvent } = await import("@/lib/google-calendar");
    googleEventId = await createGoogleCalendarEvent({
      title: `Çekim: ${row.name}`,
      date: row.eventDate,
      time: row.eventTime,
      description: `${row.phone}\n${row.email || ""}\n${row.message}`,
      location: row.location || undefined,
    });
  }

  if (
    (status === "CANCELLED" || status === "NEW") &&
    row.googleEventId &&
    row.status === "CONFIRMED"
  ) {
    const { deleteGoogleCalendarEvent } = await import("@/lib/google-calendar");
    await deleteGoogleCalendarEvent(row.googleEventId);
    googleEventId = null;
  }

  await prisma.inquiry.update({
    where: { id },
    data: { status, googleEventId },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/randevular");
  revalidatePath("/admin/takvim");
  revalidatePath("/randevu");
  return { ok: true, message: "Durum güncellendi." };
}

/** Ensure owner exists — used by seed */
export async function ensureOwnerSeedData() {
  await requireAdmin();
  return ALL_PERMISSIONS;
}
