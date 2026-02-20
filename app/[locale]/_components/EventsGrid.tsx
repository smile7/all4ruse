"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { AspectRatio } from "@/components/AspectRatio";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Typography } from "@/components/Typography";
import { Button, Card, CardContent } from "@/components/ui";
import { FALLBACK_IMAGE } from "@/constants";
import type { Event } from "@/lib/api";
import {
  formatShortDate,
  formatTimeTZ,
  normalizeSupabaseImageUrl,
} from "@/lib/utils";

import { EventTimeFilter } from "./FilterByTime";
import type { EventTagsMap } from "@/hooks/useEventTagsMap";
import { useTranslatedTitles } from "./useTranslatedTitles";
import { UserIcon } from "lucide-react";

export function EventsGrid({
  events,
  timeFilter,
  isEditMode = false,
  eventTags,
}: {
  events: Event[];
  timeFilter?: EventTimeFilter;
  isEditMode?: boolean;
  eventTags?: EventTagsMap;
}) {
  const t = useTranslations("HomePage");
  const locale = useLocale();
  const translatedTitles: { [key: number]: string } = useTranslatedTitles(
    events,
    locale,
  );

  const shouldGroupByMonth = timeFilter === "upcoming";

  let monthLocale: string;
  if (locale === "bg") {
    monthLocale = "bg-BG";
  } else if (locale === "ro") {
    monthLocale = "ro-RO";
  } else if (locale === "ua") {
    monthLocale = "uk-UA";
  } else {
    monthLocale = "en-GB";
  }

  const monthFormatter = new Intl.DateTimeFormat(monthLocale, {
    month: "long",
  });

  const monthGroups: {
    monthKey: string;
    monthLabel: string;
    events: Event[];
  }[] = [];

  if (shouldGroupByMonth) {
    for (const event of events) {
      let monthKey = "unknown";
      let monthLabel = "";

      if (event.startDate) {
        const date = new Date(event.startDate);
        if (!Number.isNaN(date.getTime())) {
          monthKey = `${date.getFullYear()}-${date.getMonth()}`;
          monthLabel = monthFormatter.format(date);
          if (monthLabel) {
            monthLabel =
              monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
          }
        }
      }

      let group = monthGroups.find((g) => g.monthKey === monthKey);
      if (!group) {
        group = { monthKey, monthLabel, events: [] };
        monthGroups.push(group);
      }
      group.events.push(event);
    }
  }

  const renderEventCard = (e: Event) => {
    const shortDate = e.startDate
      ? formatShortDate(e.startDate, locale === "bg" ? "bg" : "en")
      : "";
    let day: string | null = null;
    let month = "";
    if (shortDate && shortDate.includes(" ")) {
      const [dayPart, monthPart] = shortDate.split(" ");
      day = dayPart;
      month = monthPart;
    }
    const imageSrc = normalizeSupabaseImageUrl(e.image || FALLBACK_IMAGE);

    const rawOrganizers = (e as any).organizers;
    const organizersArray: any[] = Array.isArray(rawOrganizers)
      ? rawOrganizers
      : [];
    const hostName: string | undefined =
      organizersArray.length > 0 && typeof organizersArray[0]?.name === "string"
        ? organizersArray[0].name
        : undefined;

    const cardInner = (
      <Card
        className={`
                flex flex-col h-full p-0 overflow-hidden border-border/60 transition-all duration-300 hover:shadow-lg
                relative border-4 hover:border-secondary
                ${timeFilter === "past" ? "opacity-60 grayscale" : ""}
              `}
      >
        {timeFilter === "past" && (
          <div
            className="absolute left-1/2 top-2/5 z-40"
            style={{
              transform: "translate(-50%, -50%) rotate(-15deg)",
            }}
          >
            <span
              className="px-6 py-2 uppercase rounded-md font-bold shadow-lg whitespace-nowrap"
              style={{
                background: "var(--color-secondary)",
                color: "var(--color-secondary-foreground)",
                border: "2px solid var(--color-border)",
              }}
            >
              {t("pastEvent")}
            </span>
          </div>
        )}
        <AspectRatio ratio={6 / 9}>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 transform-gpu will-change-transform transition-transform duration-500 ease-out group-hover:scale-[1.05]">
              <Image
                src={imageSrc}
                alt={e.title || "Event image"}
                fill
                unoptimized
                sizes="28rem"
                className="w-full object-cover"
                draggable={false}
              />
              <div className="absolute inset-0 transition-opacity" />
            </div>
            <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/25 to-transparent transition-opacity duration-300" />

            {isEditMode && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/20 group-hover:bg-white/35 pointer-events-none">
                <div className="flex flex-col gap-2 pointer-events-auto">
                  <Button asChild size="sm" variant="default">
                    <Link href={`/${locale}/edit-event/${e.slug}`}>
                      {t("edit")}
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="secondary">
                    <Link
                      href={{
                        pathname: `/${locale}/create`,
                        query: { duplicateFrom: e.slug },
                      }}
                    >
                      {t("duplicate")}
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {!isEditMode && typeof e.id === "number" && (
              <div className="absolute bottom-3 right-3 z-20">
                <FavoriteButton
                  id={e.id}
                  name={e.title ?? ""}
                  url={`/${locale}/${e.slug}`}
                />
              </div>
            )}

            {day !== null && (
              <div className="absolute left-3 top-3 z-20 flex flex-col items-center rounded-xl bg-white/95 px-4 py-3 font-semibold uppercase tracking-wide text-slate-800 shadow-md">
                <span className="text-2xl leading-none">{day}</span>
                <span className="text-[11px] leading-tight mt-0.5">
                  {month}
                </span>
              </div>
            )}

            {e.price === "0" && (
              <div className="absolute right-3 top-3 z-20 border-white border-2 rounded-md bg-primary px-3 py-1.5 text-[11px] uppercase text-primary-foreground backdrop-blur-sm shadow-md">
                {t("freeEvent")}
              </div>
            )}
          </div>
        </AspectRatio>
        <CardContent className="flex flex-col gap-2 p-4 pt-0">
          <Typography.Lead className="leading-tight mb-1">
            {translatedTitles[e.id] || e.title}
          </Typography.Lead>

          {hostName && (
            <span className="inline-flex mt-2 gap-2 text-xs" title={t("host")}>
              <UserIcon className="size-4 text-muted-foreground" />
              <span className="text-white">{hostName}</span>
            </span>
          )}

          {/* <div className="flex items-center gap-2 text-xs opacity-80">
                  <Calendar1Icon className="size-4 opacity-70 shrink-0" />
                  {formatShortDate(e.startDate)} {t("at")} {" "}
                  {formatTimeTZ(e.startTime)}
                </div> */}
          <span className="sr-only">{translatedTitles[e.id] || e.title}</span>
        </CardContent>
      </Card>
    );

    if (isEditMode) {
      return (
        <div key={e.id} className="group" aria-label={String(e.title)}>
          {cardInner}
        </div>
      );
    }

    return (
      <Link
        key={e.id}
        href={{
          pathname: `/${locale}/${e.slug}`,
          query: translatedTitles[e.id]
            ? { translatedTitle: translatedTitles[e.id] }
            : undefined,
        }}
        aria-label={`Отвори събитие: ${e.title}`}
        className="group"
      >
        {cardInner}
      </Link>
    );
  };

  return (
    <div className="flex flex-col gap-8" aria-label="Събития">
      {events.length === 0 && <Typography.P>{t("noEvents")}</Typography.P>}
      {shouldGroupByMonth
        ? monthGroups.map((group, groupIndex) => (
            <div key={group.monthKey} className="flex flex-col gap-4">
              {groupIndex > 0 && group.monthLabel && (
                <Typography.H2 className="pt-10">
                  {group.monthLabel}
                </Typography.H2>
              )}

              <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(min(100%,18rem),1fr))]">
                {group.events.map(renderEventCard)}
              </div>
            </div>
          ))
        : events.length > 0 && (
            <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(min(100%,18rem),1fr))]">
              {events.map(renderEventCard)}
            </div>
          )}
    </div>
  );
}
