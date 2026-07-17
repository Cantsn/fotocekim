import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { getDictionary, getLocale } from "@/lib/i18n/server";
import { getSiteSettings } from "@/lib/data";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, t, settings] = await Promise.all([
    getLocale(),
    getDictionary(),
    getSiteSettings(),
  ]);

  return (
    <LocaleProvider initialLocale={locale}>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-3 focus:py-2 focus:text-white"
      >
        {t.nav.skip}
      </a>
      <SiteHeader siteName={settings.siteName} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <WhatsAppButton />
    </LocaleProvider>
  );
}
