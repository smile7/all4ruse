import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { EventDetailsCard } from "@/components/EventDetailsCard";
import EventHeroImage from "@/components/EventHeroImage/EventHeroImage";
import { EventShareButton } from "@/components/EventShareButton";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ImagesGallery } from "@/components/ImagesGallery";
import { Typography } from "@/components/Typography";
import { Card, CardContent, CardTitle, ErrorAlert } from "@/components/ui";
import { TAG_LABELS_BG } from "@/constants";
import { routing } from "@/i18n/routing";
import { getEventBySlug, type Tag } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { getEventTemporalStatus } from "../_components/FilterByTime";

import "@/components/ui/minimal-tiptap/styles/index.css";
import EventDescriptionWrapper from "@/components/EventDescriptionWrapper";
import { translateText } from "@/lib/translateText";
import { ScrollToTopOnMount } from "@/components/ScrollToTopOnMount";

type EventPageParams = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<EventPageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const supabase = await createClient();
  const { data: event } = await getEventBySlug(supabase, slug);

  if (!event) {
    return {};
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://all4ruse.com";
  const url = `${siteUrl}/${locale}/${slug}`;

  const title = event.title ?? "All4Ruse";
  const description =
    event.description?.replace(/<[^>]+>/g, " ").slice(0, 160) ||
    "Събитие в Русе в All4Ruse.";
  const imageUrl = event.image
    ? new URL(event.image, siteUrl).toString()
    : undefined;

  const languages = Object.fromEntries(
    routing.locales.map((loc) => [loc, `${siteUrl}/${loc}/${slug}`]),
  );

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      locale,
      siteName: "All4Ruse",
      images: imageUrl
        ? [
            {
              url: imageUrl,
              alt: title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function EventPage(props: {
  params: Promise<EventPageParams>;
}) {
  const { params } = props;
  const t = await getTranslations("SingleEvent");
  const tHome = await getTranslations("HomePage");
  const locale = await getLocale();
  const supabase = await createClient();
  const { slug } = await params;
  const { data: event } = await getEventBySlug(supabase, slug);

  if (!event) {
    notFound();
  }

  // Load tags for this event with the join table
  const { data: eventTags } = await supabase
    .from("event_tags")
    .select("tag_id")
    .eq("event_id", event.id);

  let tags: Tag[] = [];

  if (eventTags && eventTags.length > 0) {
    const tagIds = eventTags.map((row: { tag_id: number }) => row.tag_id);
    const { data: tagsData } = await supabase
      .from("tags")
      .select("*")
      .in("id", tagIds);

    tags = (tagsData ?? []) as Tag[];
  }

  const images: string[] = Array.isArray(event.images)
    ? event.images.filter((x): x is string => typeof x === "string")
    : [];

  const isPast = getEventTemporalStatus(event) === "past";
  const isFree = (event.price ?? "").trim() === "0";

  let translatedTitle = event.title;
  let translatedDescription = event.description;
  if (locale !== "bg") {
    try {
      translatedTitle = await translateText(event.title, locale);
      translatedDescription = await translateText(event.description, locale);
    } catch (e) {
      console.log(e);
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://all4ruse.com";
  const eventUrl = `${siteUrl}/${locale}/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: translatedTitle ?? event.title,
    description:
      translatedDescription?.replace(/<[^>]+>/g, " ") ||
      event.description?.replace(/<[^>]+>/g, " ") ||
      undefined,
    url: eventUrl,
    image: event.image || (images.length > 0 ? images[0] : undefined),
    startDate: `${event.startDate}T${(event.startTime ?? "00:00").slice(0, 5)}:00`,
    endDate: `${event.endDate}T${(event.endTime ?? "00:00").slice(0, 5)}:00`,
    eventStatus: isPast
      ? "https://schema.org/EventCompleted"
      : "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: event.place ?? undefined,
      address: {
        "@type": "PostalAddress",
        streetAddress: event.address ?? undefined,
        addressLocality: event.town ?? undefined,
        addressCountry: "BG",
      },
    },
    offers: {
      "@type": "Offer",
      url: eventUrl,
      price: event.price ?? (isFree ? "0" : undefined),
      priceCurrency: "BGN",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="flex flex-col gap-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ScrollToTopOnMount />
      {event.image && (
        <EventHeroImage
          src={event.image}
          alt={translatedTitle}
          isPast={isPast}
        />
      )}

      <Card>
        <CardContent className="flex flex-col gap-6 p-6">
          {isPast && (
            <div className="flex justify-center">
              <span
                className="px-6 py-2 text-xl uppercase rounded-md font-bold shadow-lg whitespace-nowrap"
                style={{
                  background: "var(--color-secondary)",
                  color: "var(--color-destructive)",
                  border: "2px solid var(--color-destructive)",
                }}
              >
                {tHome("pastEvent")}
              </span>
            </div>
          )}
          <div className="flex items-center flex-col md:flex-row md:justify-between gap-4">
            <Typography.H1 className="text-center flex-1">
              {translatedTitle}
            </Typography.H1>
            <div className="flex items-center gap-2">
              {typeof event.id === "number" && (
                <FavoriteButton
                  id={event.id}
                  name={event.title ?? ""}
                  url={`/${locale}/${slug}`}
                />
              )}
              <EventShareButton
                url={eventUrl}
                title={translatedTitle ?? event.title ?? ""}
              />
            </div>
          </div>

          {(tags.length > 0 || isFree) && (
            <div className="flex flex-wrap justify-center gap-2">
              {tags.map((tag) => {
                const base = (tag.title ?? "").toUpperCase();
                const label =
                  locale === "bg" ? (TAG_LABELS_BG[base] ?? base) : base;

                return (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary shadow-sm"
                  >
                    <span># {label}</span>
                  </span>
                );
              })}

              {isFree && (
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary shadow-sm">
                  <span># {tHome("freeEvent")}</span>
                </span>
              )}
            </div>
          )}

          <hr />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8 space-y-6">
              <EventDescriptionWrapper
                description={event.description}
                locale={locale}
              />
            </div>
            <div className="lg:col-span-4">
              <EventDetailsCard event={event} />
            </div>
          </div>
        </CardContent>
      </Card>

      {images.length > 0 && (
        <Card className="space-y-4 p-6">
          <CardTitle>
            <Typography.H2>{t("gallery")}</Typography.H2>
          </CardTitle>
          <CardContent className="p-0">
            <ImagesGallery images={images} title={event.title} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
