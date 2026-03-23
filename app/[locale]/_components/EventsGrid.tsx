"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { AspectRatio } from "@/components/AspectRatio";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Typography } from "@/components/Typography";
import { Button, Card, CardContent } from "@/components/ui";
import { FALLBACK_IMAGE, TAG_LABELS_BG } from "@/constants";
import { useTags } from "@/hooks/query";
import type { Event, Tag } from "@/lib/api";
import {
  formatShortDate,
  formatTimeTZ,
  normalizeSupabaseImageUrl,
} from "@/lib/utils";

import { EventTimeFilter } from "./FilterByTime";
import type { EventTagsMap } from "@/hooks/useEventTagsMap";
import { useTranslatedTitles } from "./useTranslatedTitles";
import { ChevronLeftIcon, ChevronRightIcon, UserIcon } from "lucide-react";

const AD_PREVIEW_TOKEN = "decathlon";
const AD_DECATHLON_URL = "https://www.decathlon.bg";
const AD_INSERT_AFTER = 5;

export function EventsGrid({
  events,
  timeFilter,
  isEditMode = false,
  eventTags,
  variant = "grid",
}: {
  events: Event[];
  timeFilter?: EventTimeFilter;
  isEditMode?: boolean;
  eventTags?: EventTagsMap;
  variant?: "grid" | "scroll";
}) {
  const t = useTranslations("HomePage");
  const locale = useLocale();
  const { data: allTags = [] } = useTags();
  const searchParams = useSearchParams();
  const showAd = searchParams.get("ad") === AD_PREVIEW_TOKEN;
  const translatedTitles: { [key: number]: string } = useTranslatedTitles(
    events,
    locale,
  );

  const tagsById = useMemo(() => {
    const map = new Map<number, Tag>();
    for (const tag of allTags) {
      if (tag && typeof tag.id === "number") {
        map.set(tag.id, tag);
      }
    }
    return map;
  }, [allTags]);

  const TAG_COLOR_CLASSES = [
    "bg-emerald-100 text-emerald-900 border-emerald-300",
    "bg-sky-100 text-sky-900 border-sky-300",
    "bg-amber-100 text-amber-900 border-amber-300",
    "bg-rose-100 text-rose-900 border-rose-300",
    "bg-violet-100 text-violet-900 border-violet-300",
    "bg-slate-100 text-slate-900 border-slate-300",
  ] as const;

  const shouldGroupByMonth = timeFilter === "upcoming" && variant === "grid";

  const renderAdCard = () => (
    <a
      key="sponsor-ad"
      href={AD_DECATHLON_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
      aria-label="Спонсор: Decathlon"
    >
      <AspectRatio ratio={16 / 11}>
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          <div className="absolute inset-0 transform-gpu will-change-transform transition-transform duration-500 ease-out group-hover:scale-[1.05]">
            <Image
              src="/sponsors/decathlon.png"
              alt="Decathlon"
              fill
              sizes="28rem"
              className="w-full object-cover"
              draggable={false}
            />
          </div>
          <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          {/* <span className="absolute top-4 right-4 z-20 rounded-full bg-black/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
            Спонсор
          </span> */}
        </div>
      </AspectRatio>
    </a>
  );

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
    let isToday = false;
    let isTomorrow = false;

    if (shortDate && shortDate.includes(" ")) {
      const [dayPart, monthPart] = shortDate.split(" ");
      day = dayPart;
      month = monthPart;
    }

    if (e.startDate) {
      const eventDate = new Date(e.startDate);
      const today = new Date();
      const normalize = (d: Date) =>
        new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const eventTs = normalize(eventDate);
      const todayTs = normalize(today);
      const tomorrowTs = todayTs + 24 * 60 * 60 * 1000;

      if (eventTs === todayTs) {
        isToday = true;
      } else if (eventTs === tomorrowTs) {
        isTomorrow = true;
      }
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

    const tagEntries =
      eventTags && typeof e.id === "number"
        ? (eventTags[e.id] ?? [])
            .map((id) => {
              const tag = tagsById.get(id);
              if (!tag) return null;
              const base = (tag.title ?? "").toUpperCase();
              const label =
                locale === "bg" ? (TAG_LABELS_BG[base] ?? base) : base;
              if (!label) return null;
              return { id, label };
            })
            .filter((x): x is { id: number; label: string } =>
              Boolean(x && x.label),
            )
        : [];

    const cardInner = (
      <Card
        className={`
                flex flex-col h-full p-0 overflow-hidden border-border/60 transition-all duration-300 hover:shadow-lg
                relative border-4 hover:border-secondary
                ${timeFilter === "past" ? "opacity-60 grayscale" : ""}
              `}
      >
        {/* {timeFilter === "past" && (
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
        )} */}
        <AspectRatio ratio={16 / 11}>
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

            {(isToday || isTomorrow || day !== null) && (
              <div className="absolute left-3 top-3 z-20 flex flex-col items-center">
                <div className="flex flex-col items-center rounded-xl bg-white/90 px-3 pb-3 pt-2 font-semibold uppercase tracking-wide text-black shadow-md min-w-[3.5rem]">
                  <div className="flex items-baseline gap-1 leading-none h-[0.5rem]">
                    <span
                      className={`text-lg ${
                        isToday || isTomorrow ? "opacity-0 select-none" : ""
                      }`}
                    >
                      {day ?? "00"}
                    </span>
                    {!isToday && !isTomorrow && (
                      <span className="text-[11px]">{month}</span>
                    )}
                  </div>
                  <span className="text-[11px] leading-tight flex items-center justify-center">
                    {isToday
                      ? t("today")
                      : isTomorrow
                        ? t("tomorrow")
                        : "\u00A0"}
                  </span>
                  {e.startTime && (
                    <div className="flex flex-col items-center rounded-xl bg-gray-400 z-10 px-2 py-1 mt-1.5 font-semibold text-primary-foreground shadow-md min-w-[2.5rem] border-2 border-white">
                      <span className="text-xs tracking-wide">
                        {formatTimeTZ(e.startTime)}
                      </span>
                    </div>
                  )}
                </div>
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
          <div className="flex flex-col gap-4">
            <div className="flex items-start md:min-h-[2.75rem]">
              <Typography.Lead className="leading-tight line-clamp-2">
                {translatedTitles[e.id] || e.title}
              </Typography.Lead>
            </div>

            <div className="flex items-start md:h-[1.25rem]">
              {hostName && (
                <span
                  className="inline-flex gap-2 text-xs max-w-full"
                  title={t("host")}
                >
                  <UserIcon className="size-4 text-muted-foreground" />
                  <span className="text-foreground line-clamp-1">
                    {hostName}
                  </span>
                </span>
              )}
            </div>

            <div className="flex items-start md:min-h-[1.5rem]">
              {tagEntries.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tagEntries.slice(0, 3).map(({ id, label }) => {
                    const colorClass =
                      TAG_COLOR_CLASSES[id % TAG_COLOR_CLASSES.length];
                    return (
                      <span
                        key={id}
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${colorClass}`}
                      >
                        {label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

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

  // Compute which group+position the ad falls in (for grouped-by-month view)
  let adGroupIndex = -1;
  let adIndexInGroup = -1;
  if (showAd && shouldGroupByMonth) {
    let count = 0;
    for (let gi = 0; gi < monthGroups.length; gi++) {
      const size = monthGroups[gi].events.length;
      if (count + size >= AD_INSERT_AFTER) {
        adGroupIndex = gi;
        adIndexInGroup = AD_INSERT_AFTER - count;
        break;
      }
      count += size;
    }
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col gap-8" aria-label="Събития">
        <Typography.P>{t("noEvents")}</Typography.P>
      </div>
    );
  }

  if (variant === "scroll") {
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateScrollButtons = () => {
      const el = scrollRef.current;
      if (!el) return;
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    };

    useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;
      updateScrollButtons();
      el.addEventListener("scroll", updateScrollButtons);
      window.addEventListener("resize", updateScrollButtons);
      return () => {
        el.removeEventListener("scroll", updateScrollButtons);
        window.removeEventListener("resize", updateScrollButtons);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const scrollByAmount = (direction: "left" | "right") => {
      const el = scrollRef.current;
      if (!el) return;
      const amount = el.clientWidth * 0.8;
      el.scrollBy({
        left: direction === "left" ? -amount : amount,
        behavior: "smooth",
      });
    };

    return (
      <div className="relative" aria-label="Събития">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory"
        >
          {events.map((event) => (
            <div key={event.id} className="snap-start shrink-0 w-72 max-w-full">
              {renderEventCard(event)}
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 hidden md:flex items-center justify-between">
          <button
            type="button"
            className="pointer-events-auto ml-2 rounded-full bg-background/90 shadow-md border border-border p-2 disabled:opacity-30"
            onClick={() => scrollByAmount("left")}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
          >
            <ChevronLeftIcon className="size-7 cursor-pointer" />
          </button>
          <button
            type="button"
            className="pointer-events-auto mr-2 rounded-full bg-background/90 shadow-md border border-border p-2 disabled:opacity-30"
            onClick={() => scrollByAmount("right")}
            disabled={!canScrollRight}
            aria-label="Scroll right"
          >
            <ChevronRightIcon className="size-7 cursor-pointer" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8" aria-label="Събития">
      {shouldGroupByMonth ? (
        monthGroups.map((group, groupIndex) => (
          <div key={group.monthKey} className="flex flex-col gap-4">
            {groupIndex > 0 && group.monthLabel && (
              <Typography.H2 className="pt-10">
                {group.monthLabel}
              </Typography.H2>
            )}

            <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(min(100%,18rem),1fr))]">
              {groupIndex === adGroupIndex
                ? [
                    ...group.events
                      .slice(0, adIndexInGroup)
                      .map(renderEventCard),
                    renderAdCard(),
                    ...group.events.slice(adIndexInGroup).map(renderEventCard),
                  ]
                : group.events.map(renderEventCard)}
            </div>
          </div>
        ))
      ) : (
        <div className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(min(100%,18rem),1fr))]">
          {showAd && events.length >= AD_INSERT_AFTER
            ? [
                ...events.slice(0, AD_INSERT_AFTER).map(renderEventCard),
                renderAdCard(),
                ...events.slice(AD_INSERT_AFTER).map(renderEventCard),
              ]
            : events.map(renderEventCard)}
        </div>
      )}
    </div>
  );
}
