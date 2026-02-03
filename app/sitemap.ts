import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import { getEvents } from "@/lib/api";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://all4ruse.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  // Only include active events in the sitemap
  const { data: events } = await getEvents(supabase, { all: false });

  const locales = routing.locales;

  const staticRoutes = [
    // Home per locale
    ...locales.map((locale) => ({
      url: `${siteUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    })),
    // Why all4ruse
    ...locales.map((locale) => ({
      url: `${siteUrl}/${locale}/why-all4ruse`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    // Legal / privacy pages
    ...locales.flatMap((locale) => [
      {
        url: `${siteUrl}/${locale}/privacy-policy`,
        lastModified: new Date(),
        changeFrequency: "yearly" as const,
        priority: 0.3,
      },
      {
        url: `${siteUrl}/${locale}/legal`,
        lastModified: new Date(),
        changeFrequency: "yearly" as const,
        priority: 0.3,
      },
    ]),
  ] satisfies MetadataRoute.Sitemap;

  const eventRoutes = events
    .filter((event) => Boolean(event.slug))
    .flatMap((event) =>
      locales.map((locale) => ({
        url: `${siteUrl}/${locale}/${event.slug}`,
        lastModified: new Date(event.created_at ?? event.startDate),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ) satisfies MetadataRoute.Sitemap;

  return [...staticRoutes, ...eventRoutes];
}
