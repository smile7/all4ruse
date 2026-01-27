import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import BackButton from "@/components/BackButton/BackButton";
import LanguageSwitcher from "@/components/LanguageSwitcher/LanguageSwitcher";
import { MobileLogo } from "@/components/MobileLogo";
import { Analytics } from "@vercel/analytics/next";
import { CookieConsentProvider } from "@/components/CookieConsentProvider";
import {
  FavoritesProvider,
  SidebarLeft,
  ThemeToggle,
} from "@/components/theme";
import {
  Separator,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function EventsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <NextIntlClientProvider>
      <SidebarProvider>
        <Analytics />
        <CookieConsentProvider initialConsent="unknown">
          <FavoritesProvider>
            <SidebarLeft />
            <SidebarInset>
              <header className="bg-background sticky top-0 flex h-18 shrink-0 z-100 items-center justify-between px-2 mb-6">
                <div className="flex items-center gap-2">
                  <SidebarTrigger className="-ml-1" />
                  <Separator
                    orientation="vertical"
                    className="data-[orientation=vertical]:h-6"
                  />
                  <BackButton />
                </div>
                <MobileLogo />
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <LanguageSwitcher />
                </div>
              </header>

              <div className="p-6 pt-0">
                <div className="mx-auto w-full max-w-(--breakpoint-xl) pb-16">
                  {children}
                </div>
              </div>
            </SidebarInset>
          </FavoritesProvider>
        </CookieConsentProvider>
        {/* <SidebarRight /> */}
      </SidebarProvider>
    </NextIntlClientProvider>
  );
}
