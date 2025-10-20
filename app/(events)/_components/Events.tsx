"use client";

import { useMemo } from "react";
import { Calendar1Icon, MapPinIcon, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { AspectRatio } from "@/components/AspectRatio";
import { Typography } from "@/components/Typography";
import { Button, Card, CardContent, ErrorAlert } from "@/components/ui";
import { DEBOUNCE_MS, FALLBACK_IMAGE } from "@/constants";
import { useDebounce, useEventFilters } from "@/hooks";
import type { Event } from "@/lib/api";
import { formatShortDate, formatTimeTZ, toTimestamp } from "@/lib/utils";

import { EventsFilters } from "./Filters";

export function Events({
  events,
  errorMessage,
}: {
  events: Event[];
  errorMessage?: string | null;
}) {
  const { title, from, to, clear } = useEventFilters();
  const debouncedQuery = useDebounce(title, DEBOUNCE_MS);
  const effectiveQuery = title === "" ? "" : debouncedQuery;

  const filteredAndSorted = useMemo(() => {
    const query = effectiveQuery.trim().toLowerCase();
    const fromTs = toTimestamp(from || undefined);
    const toTs = to ? toTimestamp(to + "T23:59:59") : null;

    return events
      .filter((e) => {
        if (query) {
          const t = (e.title ?? "").toLowerCase();
          if (!t.includes(query)) return false;
        }
        if (fromTs || toTs) {
          const start = toTimestamp(e.startDate);
          if (fromTs && start && start < fromTs) return false;
          if (toTs && start && start > toTs) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const aT = toTimestamp(a.startDate);
        const bT = toTimestamp(b.startDate);
        if (aT === bT) return 0;
        if (aT === null) return 1;
        if (bT === null) return -1;
        return aT - bT;
      });
  }, [events, effectiveQuery, from, to]);

  return (
    <div className="flex flex-col gap-6">
      <EventsFilters />
      {errorMessage && <ErrorAlert error={errorMessage} className="mt-4" />}
      {filteredAndSorted.length === 0 ? (
        <EmptyState onReset={clear} />
      ) : (
        <EventsGrid events={filteredAndSorted} />
      )}
    </div>
  );
}

function EventsGrid({ events }: { events: Event[] }) {
  return (
    <div
      className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(min(100%,18rem),1fr))]"
      aria-label="Събития"
    >
      {events.map((e) => (
        <Link
          key={e.id}
          href={`/events/${e.id}`}
          aria-label={`Отвори събитие: ${e.title}`}
          className="group"
        >
          <Card
            className="
              flex flex-col h-full p-0 overflow-hidden border-border/60 transition-all duration-300 hover:shadow-lg
              relative border-2
              after:content-[''] after:block after:w-full after:h-[15px] after:bg-[hsl(var(--sidebar-background))] after:absolute after:bottom-0 after:left-0 
            "
          >
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
                  <div className="absolute left-3 top-3 rounded-md bg-black/60 p-2 text-[11px] uppercase text-white backdrop-blur-sm">
                    безплатно
                  </div>
                )}
              </div>
            </AspectRatio>
            <CardContent className="flex flex-col gap-2 p-4 pt-0 pb-8">
              <Typography.Lead className="leading-tight mb-2">
                {e.title}
              </Typography.Lead>

              <div className="flex items-center gap-2 text-xs opacity-80">
                <Calendar1Icon className="size-4 opacity-70" />
                {formatShortDate(e.startDate)} от {formatTimeTZ(e.startTime)}
              </div>

              <div className="flex items-center gap-2 text-xs opacity-80">
                <MapPinIcon className="size-4 opacity-70" />
                {e.address}, {e.town}
              </div>

              <span className="sr-only">{e.title}</span>
            </CardContent>
          </Card>
        </Link>
      ))}
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
