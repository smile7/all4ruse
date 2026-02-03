import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import BackButton from "@/components/BackButton/BackButton";
import LanguageSwitcher from "@/components/LanguageSwitcher/LanguageSwitcher";
import { MobileLogo } from "@/components/MobileLogo";
import { Analytics } from "@vercel/analytics/next";
import { CookieConsentProvider } from "@/components/CookieConsentProvider";
import { AnalyticsWithConsent } from "@/components/AnalyticsWithConsent";
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://all4ruse.com";

const titles: Record<string, string> = {
  bg: "All4Ruse – събития в Русе",
  en: "All4Ruse – events in Ruse",
  ro: "All4Ruse – evenimente în Ruse",
  ua: "All4Ruse – події в Русе",
};

const descriptions: Record<string, string> = {
  bg: "Открий и споделяй културни събития в Русе – концерти, театър, работилници, събития за деца, спорт и още на едно място.",
  en: "Discover and share cultural events in Ruse – concerts, theatre, workshops, children’s events, sports and more, all in one place.",
  ro: "Descoperă și împărtășește evenimente culturale în Ruse – concerte, teatru, ateliere, evenimente pentru copii, sport și multe altele, toate într-un singur loc.",
  ua: "Відкривай та ділись культурними подіями в Русе – концерти, театр, майстер-класи, заходи для дітей, спорт та багато іншого в одному місці.",
};

const keywordsByLocale: Record<string, string[]> = {
  bg: [
    "събития в русе",
    "културни събития русе",
    "концерти русе",
    "театър русе",
    "детски събития русе",
    "спортни събития русе",
    "all4ruse",
  ],
  en: [
    "events in ruse",
    "cultural events ruse",
    "concerts ruse",
    "theatre ruse",
    "kids events ruse",
    "sports events ruse",
    "all4ruse",
  ],
  ro: [
    "evenimente în ruse",
    "evenimente culturale ruse",
    "concerte ruse",
    "teatru ruse",
    "evenimente pentru copii ruse",
    "evenimente sportive ruse",
    "all4ruse",
  ],
  ua: [
    "події в русе",
    "культурні події русе",
    "концерти русе",
    "театр русе",
    "події для дітей русе",
    "спортивні події русе",
    "all4ruse",
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const title = titles[locale] ?? titles.bg;
  const description = descriptions[locale] ?? descriptions.bg;
  const keywords = keywordsByLocale[locale] ?? keywordsByLocale.bg;

  const languages = Object.fromEntries(
    routing.locales.map((loc) => [loc, `${siteUrl}/${loc}`]),
  );

  return {
    title: {
      default: title,
      template: "%s | All4Ruse",
    },
    description,
    keywords,
    alternates: {
      languages,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${locale}`,
      siteName: "All4Ruse",
      type: "website",
      locale,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

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
          <AnalyticsWithConsent />
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
