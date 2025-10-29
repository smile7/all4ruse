"use client";

import { Calendar1Icon, MapPinIcon, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { AspectRatio } from "@/components/AspectRatio";
import { Typography } from "@/components/Typography";
import { Button, Card, CardContent, ErrorAlert } from "@/components/ui";
import { FALLBACK_IMAGE } from "@/constants";
import { useFilteredEvents } from "@/hooks";
import type { Event } from "@/lib/api";
import { formatShortDate, formatTimeTZ, toTimestamp } from "@/lib/utils";

import { EventsFilters } from "./Filters";

export function Events({
  events,
  errorMessage,
  isPastEvents = false,
}: {
  events: Event[];
  errorMessage?: string | null;
  isPastEvents?: boolean;
}) {
  const filteredByTime = events.filter((e) => isPastEvent(e) === isPastEvents);
  const { filteredEvents, filters } = useFilteredEvents(filteredByTime);

  return (
    <div className="flex flex-col gap-6">
      <EventsFilters />
      {errorMessage && <ErrorAlert error={errorMessage} className="mt-4" />}
      {filteredEvents.length === 0 ? (
        <EmptyState onReset={filters.clear} />
      ) : (
        <EventsGrid events={filteredEvents} />
      )}
    </div>
  );
}

function EventsGrid({ events }: { events: Event[] }) {
  const t = useTranslations("HomePage");
  const locale = useLocale();

  return (
    <div
      className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(min(100%,18rem),1fr))]"
      aria-label="Събития"
    >
      {events.map((e) => {
        const isPast = isPastEvent(e);
        return (
          <Link
            key={e.id}
            href={`/${locale}/${e.slug}`}
            aria-label={`Отвори събитие: ${e.title}`}
            className="group"
          >
            <Card
              className={`
                flex flex-col h-full p-0 overflow-hidden border-border/60 transition-all duration-300 hover:shadow-lg
                relative border-2 hover:border-secondary
                after:content-[''] after:block after:w-full after:h-[10px] after:bg-[hsl(var(--secondary))] after:absolute after:bottom-0 after:left-0 
                ${isPast ? "opacity-60 grayscale" : ""}
              `}
            >
              {isPast && (
                <div
                  className="absolute left-1/2 top-1/4 z-40"
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
              <AspectRatio ratio={16 / 9}>
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute inset-0 transform-gpu will-change-transform transition-transform duration-500 ease-out group-hover:scale-[1.05]">
                    <Image
                      src={e.image || FALLBACK_IMAGE}
                      alt={e.title || "Снимка събитие"}
                      fill
                      sizes="18rem"
                      className="w-full object-cover"
                      draggable={false}
                    />
                  </div>
                  <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/25 to-transparent transition-opacity duration-300 group-hover:from-black/80" />
                  {e.isFree && (
                    <div className="absolute left-3 top-3 rounded-md bg-primary p-2 text-[11px] uppercase text-primary-foreground backdrop-blur-sm">
                      {t("freeEvent")}
                    </div>
                  )}
                </div>
              </AspectRatio>
              <CardContent className="flex flex-col gap-2 p-4 pt-0 pb-8">
                <Typography.Lead className="leading-tight mb-2">
                  {e.title}
                </Typography.Lead>

                <div className="flex items-center gap-2 text-xs opacity-80">
                  <Calendar1Icon className="size-4 opacity-70 shrink-0" />
                  {formatShortDate(e.startDate)} от {formatTimeTZ(e.startTime)}
                </div>

                <div className="flex items-center gap-2 text-xs opacity-80">
                  <MapPinIcon className="size-4 opacity-70 shrink-0" />
                  {e.address}, {e.town}
                </div>

                <span className="sr-only">{e.title}</span>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-6 items-center py-14">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-8 w-8" />
        </div>
        <Typography.Lead>0 събития</Typography.Lead>
        <Typography.Small>
          Не бяха намерени събития по избраните критерии.
        </Typography.Small>
        <Button className="mt-2" variant="secondary" onClick={onReset}>
          Изчисти филтрите
        </Button>
      </CardContent>
    </Card>
  );
}

function isPastEvent(event: Event): boolean {
  const now = new Date();

  const date = event.endDate ?? event.startDate;
  const time = event.endDate ? event.endTime : event.startTime;

  const dateTimeStr = date && time ? `${date}T${time}` : date;
  const eventTimestamp = toTimestamp(dateTimeStr);

  return eventTimestamp !== null && eventTimestamp < now.getTime();
}
