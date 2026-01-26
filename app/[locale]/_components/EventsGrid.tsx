"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { AspectRatio } from "@/components/AspectRatio";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Typography } from "@/components/Typography";
import { Card, CardContent } from "@/components/ui";
import { FALLBACK_IMAGE, TAG_LABELS_BG } from "@/constants";
import type { Event, Tag } from "@/lib/api";
import { useTags } from "@/hooks/query";
import { formatShortDate, formatTimeTZ } from "@/lib/utils";

import { EventTimeFilter } from "./FilterByTime";
import type { EventTagsMap } from "@/hooks/useEventTagsMap";

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
  const { data: allTags = [] } = useTags();

  const tagsById = new Map<number, Tag>();
  for (const tag of allTags) {
    tagsById.set(tag.id, tag);
  }

  const formatTagLabel = (tag: Tag) => {
    const base = (tag.title ?? "").toUpperCase();
    return locale === "bg" ? (TAG_LABELS_BG[base] ?? base) : base;
  };

  return (
    <div
      className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(min(100%,18rem),1fr))]"
      aria-label="Събития"
    >
      {events.length === 0 && <Typography.P>{t("noEvents")}</Typography.P>}
      {events.map((e) => {
        const tagIds =
          (eventTags && typeof e.id === "number"
            ? (eventTags[e.id] ?? [])
            : []) ?? [];

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
        return (
          <Link
            key={e.id}
            href={
              isEditMode
                ? `/${locale}/edit-event/${e.slug}`
                : `/${locale}/${e.slug}`
            }
            aria-label={`Отвори събитие: ${e.title}`}
            className="group"
          >
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
                      src={e.image || FALLBACK_IMAGE}
                      alt={e.title || "Event image"}
                      fill
                      sizes="28rem"
                      className="w-full object-cover"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-opacity" />
                  </div>
                  <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/25 to-transparent transition-opacity duration-300 group-hover:from-black/80" />

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
                  {e.title}
                </Typography.Lead>

                {tagIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                    {tagIds.map((tagId) => {
                      const tag = tagsById.get(tagId);
                      if (!tag) return null;
                      return <span key={tagId}>#{formatTagLabel(tag)}</span>;
                    })}
                  </div>
                )}

                {/* <div className="flex items-center gap-2 text-xs opacity-80">
                  <Calendar1Icon className="size-4 opacity-70 shrink-0" />
                  {formatShortDate(e.startDate)} {t("at")}{" "}
                  {formatTimeTZ(e.startTime)}
                </div> */}

                <span className="sr-only">{e.title}</span>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
