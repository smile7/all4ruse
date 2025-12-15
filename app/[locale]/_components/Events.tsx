"use client";

import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { Typography } from "@/components/Typography";
import { Button, Card, CardContent, ErrorAlert } from "@/components/ui";
import { useFilteredEvents } from "@/hooks";
import type { Event } from "@/lib/api";

import { EventTimeFilter, filterEventsByTime } from "./FilterByTime";
import { EventsFilters } from "./Filters";
import { EventsGrid } from ".";

export function Events({
  events,
  errorMessage,
  timeFilter,
}: {
  events: Event[];
  errorMessage?: string | null;
  timeFilter: EventTimeFilter;
}) {
  const timeFiltered = filterEventsByTime(events, timeFilter);
  const { filteredEvents, filters } = useFilteredEvents(timeFiltered);

  return (
    <div className="flex flex-col gap-6">
      <EventsFilters />
      {errorMessage && <ErrorAlert error={errorMessage} className="mt-4" />}
      {filteredEvents.length === 0 ? (
        <EmptyState onReset={filters.clear} />
      ) : (
        <EventsGrid events={filteredEvents} timeFilter={timeFilter} />
      )}
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  const t = useTranslations("HomePage");

  return (
    <Card>
      <CardContent className="flex flex-col gap-6 items-center py-14">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-8 w-8" />
        </div>
        <Typography.Lead>0 {t("events")}</Typography.Lead>
        <Typography.Small>{t("noEvents")}</Typography.Small>
        <Button className="mt-2" variant="secondary" onClick={onReset}>
          {t("clear")}
        </Button>
      </CardContent>
    </Card>
  );
}
