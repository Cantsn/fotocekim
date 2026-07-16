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
import { deleteUploadedFile, saveUploadedImage, slugify } from "@/lib/upload";
import { testSmtpConnection } from "@/lib/mail";

export type ActionState = { error?: string; ok?: boolean; message?: string };

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

  try {
    if (id) {
      await prisma.service.update({
        where: { id },
        data: { title, slug, shortDesc, content, order, published },
      });
    } else {
      const clash = await prisma.service.findUnique({ where: { slug } });
      if (clash) slug = `${slug}-${Date.now().toString(36)}`;
      await prisma.service.create({
        data: { title, slug, shortDesc, content, order, published },
      });
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Kayıt hatası" };
  }

  revalidatePublic();
  redirect("/admin/hizmetler");
}

export async function deleteServiceAction(formData: FormData) {
  await requirePermission("services");
  const id = String(formData.get("id") ?? "");
  if (id) await prisma.service.delete({ where: { id } });
  revalidatePublic();
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

  try {
    let projectId = id;
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

    // Cover upload
    const cover = formData.get("cover");
    if (cover instanceof File && cover.size > 0) {
      const url = await saveUploadedImage(cover);
      const prev = await prisma.project.findUnique({ where: { id: projectId } });
      if (prev?.coverUrl) await deleteUploadedFile(prev.coverUrl);
      await prisma.project.update({
        where: { id: projectId },
        data: { coverUrl: url },
      });
    }

    // Gallery multi upload
    const gallery = formData.getAll("gallery");
    let orderBase = await prisma.projectImage.count({
      where: { projectId },
    });
    for (const item of gallery) {
      if (item instanceof File && item.size > 0) {
        const url = await saveUploadedImage(item);
        await prisma.projectImage.create({
          data: {
            projectId,
            url,
            alt: title,
            order: orderBase++,
          },
        });
      }
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Kayıt hatası" };
  }

  revalidatePublic();
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
}

export async function deleteProjectImageAction(formData: FormData) {
  await requirePermission("portfolio");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const img = await prisma.projectImage.findUnique({ where: { id } });
  if (!img) return;
  await deleteUploadedFile(img.url);
  await prisma.projectImage.delete({ where: { id } });
  revalidatePublic();
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
  return { ok: true, message: "Ayarlar kaydedildi." };
}

export async function testSmtpAction(): Promise<ActionState> {
  await requirePermission("settings");
  const result = await testSmtpConnection();
  if (!result.ok) return { error: result.error || "SMTP test başarısız" };
  return { ok: true, message: "SMTP bağlantısı başarılı." };
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

export async function updateInquiryStatusAction(formData: FormData) {
  await requirePermission("inquiries");
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "READ");
  if (!id) return;

  if (status === "CONFIRMED") {
    const row = await prisma.inquiry.findUnique({ where: { id } });
    if (row?.eventDate && row?.eventTime) {
      const { isSlotAvailable } = await import("@/lib/availability");
      const free = await isSlotAvailable(row.eventDate, row.eventTime, id);
      if (!free) {
        // conflict — don't confirm
        return;
      }
    }
  }

  await prisma.inquiry.update({ where: { id }, data: { status } });
  revalidatePath("/admin/randevular");
  revalidatePath("/admin/takvim");
  revalidatePath("/randevu");
}

/** Ensure owner exists — used by seed */
export async function ensureOwnerSeedData() {
  await requireAdmin();
  return ALL_PERMISSIONS;
}
