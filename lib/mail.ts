import { prisma } from "@/lib/prisma";

/** SMTP test / send — nodemailer olmadan net.Socket ile basit doğrulama değil;
 *  ayarlar kaydedilir; gönderim için runtime'da dynamic import deneriz.
 *  Bağımlılık eklemeden: fetch tabanlı opsiyon yok, nodemailer ekleyelim. */

export type SmtpConfig = {
  enabled: boolean;
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
  secure: boolean;
};

export async function getSmtpConfig(): Promise<SmtpConfig> {
  const s = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  return {
    enabled: s?.smtpEnabled ?? false,
    host: s?.smtpHost ?? "",
    port: s?.smtpPort ?? 587,
    user: s?.smtpUser ?? "",
    password: s?.smtpPassword ?? "",
    from: s?.smtpFrom || s?.email || "",
    secure: s?.smtpSecure ?? true,
  };
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const cfg = await getSmtpConfig();
  if (!cfg.enabled) {
    return { ok: false, error: "SMTP devre dışı." };
  }
  if (!cfg.host || !cfg.from) {
    return { ok: false, error: "SMTP host / gönderen adresi eksik." };
  }

  try {
    // Dynamic require to keep optional at type level
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure && cfg.port === 465,
      auth: cfg.user
        ? { user: cfg.user, pass: cfg.password }
        : undefined,
    });

    await transporter.sendMail({
      from: cfg.from,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    });
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "SMTP hatası";
    return { ok: false, error: msg };
  }
}

export async function testSmtpConnection(): Promise<{
  ok: boolean;
  error?: string;
}> {
  const cfg = await getSmtpConfig();
  if (!cfg.host) return { ok: false, error: "SMTP host boş." };
  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure && cfg.port === 465,
      auth: cfg.user
        ? { user: cfg.user, pass: cfg.password }
        : undefined,
    });
    await transporter.verify();
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Bağlantı başarısız",
    };
  }
}
