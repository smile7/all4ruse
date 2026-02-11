import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";

import { EventDetailsCard } from "@/components/EventDetailsCard";
import EventHeroImage from "@/components/EventHeroImage/EventHeroImage";
import { EventShareButton } from "@/components/EventShareButton";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ImagesGallery } from "@/components/ImagesGallery";
import { Typography } from "@/components/Typography";
import {
  Button,
  Card,
  CardContent,
  CardTitle,
  ErrorAlert,
} from "@/components/ui";
import { TAG_LABELS_BG } from "@/constants";
import { routing } from "@/i18n/routing";
import { getEventBySlug, type Tag } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { getEventTemporalStatus } from "../_components/FilterByTime";
import { CalendarDaysIcon } from "lucide-react";

import "@/components/ui/minimal-tiptap/styles/index.css";
import EventDescriptionWrapper from "@/components/EventDescriptionWrapper";
import { translateText } from "@/lib/translateText";
import { ScrollToTopOnMount } from "@/components/ScrollToTopOnMount";

const DEFAULT_CALENDAR_TIMEZONE = "Europe/Sofia";

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

  const fullAddress = [event.place, event.address, event.town]
    .filter(Boolean)
    .join(", ");

  const buildGoogleCalendarUrl = () => {
    if (!event.startDate) return null;

    const hasTimeComponent = Boolean(
      (event.startTime && event.startTime.trim()) ||
        (event.endTime && event.endTime.trim()),
    );

    const normalizeDatePart = (value?: string | null) => {
      if (!value) return null;
      return value.slice(0, 10).replace(/-/g, "");
    };

    const pad2 = (num: number) => num.toString().padStart(2, "0");
    const normalizeTimePart = (value?: string | null) => {
      if (!value) return "000000";
      const [h = "0", m = "0", s = "0"] = value.trim().split(":");
      const safePart = (part: string) => {
        const parsed = Number.parseInt(part, 10);
        if (Number.isFinite(parsed) && parsed >= 0) {
          return pad2(parsed);
        }
        return "00";
      };
      return `${safePart(h)}${safePart(m)}${safePart(s)}`;
    };

    const buildToken = (
      dateStr?: string | null,
      timeStr?: string | null,
    ): string | null => {
      const datePart = normalizeDatePart(dateStr);
      if (!datePart) return null;
      if (!hasTimeComponent) {
        return datePart;
      }
      return `${datePart}T${normalizeTimePart(timeStr)}`;
    };

    const startToken = buildToken(event.startDate, event.startTime);
    const endToken = buildToken(
      event.endDate ?? event.startDate,
      event.endTime ?? event.startTime,
    );

    if (!startToken || !endToken) {
      return null;
    }

    const params = new URLSearchParams();
    params.set("ctz", DEFAULT_CALENDAR_TIMEZONE);

    if (event.title) {
      params.set("text", event.title);
    }
    if (fullAddress) {
      params.set("location", fullAddress);
    }
    if (event.description) {
      // Strip HTML tags and collapse whitespace for a cleaner, safer description
      const plainDescription = event.description
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 1000);
      if (plainDescription) {
        params.set("details", plainDescription);
      }
    }

    const baseUrl = "https://calendar.google.com/calendar/render";
    const extraParams = params.toString();
    const calendarUrl = `${baseUrl}?action=TEMPLATE&dates=${startToken}/${endToken}`;
    return extraParams ? `${calendarUrl}&${extraParams}` : calendarUrl;
  };

  const googleCalendarUrl = buildGoogleCalendarUrl();

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
          <div className="flex justify-center">
            <Typography.H1 className="text-center">
              {translatedTitle}
            </Typography.H1>
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

          <div className="flex justify-center mt-2">
            <div className="flex flex-col items-center gap-2 sm:flex-row">
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
              {googleCalendarUrl && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-center sm:w-auto"
                >
                  <a
                    href={googleCalendarUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2"
                  >
                    <CalendarDaysIcon className="size-4" />
                    <span>Google Calendar</span>
                  </a>
                </Button>
              )}
            </div>
          </div>

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
