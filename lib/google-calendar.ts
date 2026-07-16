import { prisma } from "@/lib/prisma";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/userinfo.email",
].join(" ");

function clientId() {
  return process.env.GOOGLE_CLIENT_ID || "";
}
function clientSecret() {
  return process.env.GOOGLE_CLIENT_SECRET || "";
}
function redirectUri(siteUrl: string) {
  return (
    process.env.GOOGLE_REDIRECT_URI ||
    `${siteUrl.replace(/\/$/, "")}/api/google/callback`
  );
}

export function isGoogleOAuthConfigured() {
  return Boolean(clientId() && clientSecret());
}

export function getGoogleAuthUrl(siteUrl: string, state = "fotocekim") {
  const params = new URLSearchParams({
    client_id: clientId(),
    redirect_uri: redirectUri(siteUrl),
    response_type: "code",
    scope: SCOPES,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string, siteUrl: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId(),
      client_secret: clientSecret(),
      redirect_uri: redirectUri(siteUrl),
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json() as Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
  }>;
}

export async function getGoogleCalConnection() {
  const s = await prisma.siteSettings.findUnique({ where: { id: "default" } });
  return {
    enabled: s?.googleCalEnabled ?? false,
    calendarId: s?.googleCalId || "primary",
    refreshToken: s?.googleCalRefreshToken || "",
    accessToken: s?.googleCalAccessToken || "",
    expiry: s?.googleCalTokenExpiry ?? null,
    email: s?.googleCalEmail || "",
    connected: Boolean(s?.googleCalRefreshToken),
  };
}

async function refreshAccessToken(refreshToken: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId(),
      client_secret: clientSecret(),
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{
    access_token: string;
    expires_in: number;
  }>;
}

export async function getValidAccessToken(): Promise<string | null> {
  const conn = await getGoogleCalConnection();
  if (!conn.refreshToken) return null;

  const stillValid =
    conn.accessToken &&
    conn.expiry &&
    conn.expiry.getTime() > Date.now() + 60_000;

  if (stillValid) return conn.accessToken;

  const refreshed = await refreshAccessToken(conn.refreshToken);
  const expiry = new Date(Date.now() + refreshed.expires_in * 1000);
  await prisma.siteSettings.update({
    where: { id: "default" },
    data: {
      googleCalAccessToken: refreshed.access_token,
      googleCalTokenExpiry: expiry,
      googleCalEnabled: true,
    },
  });
  return refreshed.access_token;
}

async function fetchUserEmail(accessToken: string) {
  const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!res.ok) return "";
  const data = (await res.json()) as { email?: string };
  return data.email || "";
}

export async function saveGoogleTokens(opts: {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}) {
  const email = await fetchUserEmail(opts.accessToken);
  const existing = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  });
  const data = {
    googleCalEnabled: true,
    googleCalAccessToken: opts.accessToken,
    googleCalTokenExpiry: new Date(Date.now() + opts.expiresIn * 1000),
    googleCalEmail: email,
    ...(opts.refreshToken
      ? { googleCalRefreshToken: opts.refreshToken }
      : {}),
  };
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      siteName: existing?.siteName || "FotoCekim",
      ...data,
      googleCalRefreshToken:
        opts.refreshToken || existing?.googleCalRefreshToken || "",
    },
    update: data,
  });
}

export async function disconnectGoogleCalendar() {
  await prisma.siteSettings.update({
    where: { id: "default" },
    data: {
      googleCalEnabled: false,
      googleCalRefreshToken: "",
      googleCalAccessToken: "",
      googleCalTokenExpiry: null,
      googleCalEmail: "",
    },
  });
}

function toRfc3339(date: string, time: string) {
  // Europe/Istanbul offset +03:00 (fixed; DST simplified)
  return `${date}T${time}:00+03:00`;
}

function endTime(time: string, durationMin = 60) {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + durationMin;
  const eh = String(Math.floor(total / 60) % 24).padStart(2, "0");
  const em = String(total % 60).padStart(2, "0");
  return `${eh}:${em}`;
}

export async function createGoogleCalendarEvent(opts: {
  title: string;
  date: string;
  time: string;
  description?: string;
  location?: string;
  durationMinutes?: number;
}): Promise<string | null> {
  const token = await getValidAccessToken();
  if (!token) return null;
  const conn = await getGoogleCalConnection();
  const calendarId = encodeURIComponent(conn.calendarId || "primary");
  const start = toRfc3339(opts.date, opts.time);
  const end = toRfc3339(
    opts.date,
    endTime(opts.time, opts.durationMinutes ?? 60),
  );

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: opts.title,
        description: opts.description || "",
        location: opts.location || "",
        start: { dateTime: start, timeZone: "Europe/Istanbul" },
        end: { dateTime: end, timeZone: "Europe/Istanbul" },
      }),
      cache: "no-store",
    },
  );
  if (!res.ok) {
    console.error("Google create event failed", await res.text());
    return null;
  }
  const data = (await res.json()) as { id?: string };
  return data.id || null;
}

export async function deleteGoogleCalendarEvent(
  eventId: string,
): Promise<boolean> {
  const token = await getValidAccessToken();
  if (!token || !eventId) return false;
  const conn = await getGoogleCalConnection();
  const calendarId = encodeURIComponent(conn.calendarId || "primary");
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${encodeURIComponent(eventId)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );
  return res.ok || res.status === 404;
}

/** Remove freebusy usage entirely */
export async function fetchGoogleBusySlots(_dateStr: string): Promise<string[]> {
  return [];
}
