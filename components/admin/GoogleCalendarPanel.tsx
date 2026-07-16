import Link from "next/link";
import {
  getGoogleCalConnection,
  isGoogleOAuthConfigured,
} from "@/lib/google-calendar";
import { disconnectGoogleAction } from "@/lib/actions/availability";
import { CheckCircle2, Link2, Unplug } from "lucide-react";

export async function GoogleCalendarPanel() {
  const configured = isGoogleOAuthConfigured();
  const conn = await getGoogleCalConnection();

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 className="flex items-center gap-2 font-serif text-xl text-foreground">
        <Link2 className="h-5 w-5 text-accent" />
        Google Calendar
      </h2>
      <p className="mt-2 text-sm text-muted">
        Google hesabınızı bağlayın. Randevu <strong>Onay</strong> olduğunda
        etkinlik otomatik Google Takvim’e yazılır; silinince / iptalde kaldırılır.
      </p>

      {!configured && (
        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-950">
          <p className="font-medium">Ortam değişkenleri gerekli</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
            <li>
              <code>GOOGLE_CLIENT_ID</code>
            </li>
            <li>
              <code>GOOGLE_CLIENT_SECRET</code>
            </li>
            <li>
              <code>NEXT_PUBLIC_SITE_URL</code> (örn. https://nextcan.net)
            </li>
            <li>
              Google Cloud Console → OAuth redirect:{" "}
              <code>
                {"{SITE_URL}"}/api/google/callback
              </code>
            </li>
            <li>Scope: calendar.events</li>
          </ul>
        </div>
      )}

      {configured && conn.connected && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <div className="flex-1">
            <p className="font-medium text-foreground">Bağlı</p>
            <p className="text-xs text-muted">
              {conn.email || "Google hesabı"} · takvim: {conn.calendarId}
            </p>
          </div>
          <form action={disconnectGoogleAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs text-muted hover:text-danger"
            >
              <Unplug className="h-3.5 w-3.5" />
              Bağlantıyı kes
            </button>
          </form>
        </div>
      )}

      {configured && !conn.connected && (
        <div className="mt-4">
          <Link
            href="/api/google/connect"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white"
          >
            <Link2 className="h-4 w-4" />
            Google ile bağlan
          </Link>
        </div>
      )}
    </div>
  );
}
