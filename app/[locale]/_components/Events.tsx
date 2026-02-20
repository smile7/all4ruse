"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpToLineIcon,
  FilterIcon,
  SlidersHorizontalIcon,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Typography } from "@/components/Typography";
import { DrawerDialog } from "@/components/DialogDrawer";
import { Button, Card, CardContent, ErrorAlert } from "@/components/ui";
import { useEventTagsMap, useEventFilters, useFilteredEvents } from "@/hooks";
import type { Event } from "@/lib/api";
import { cn } from "@/lib/utils";

import { EventTimeFilter, filterEventsByTime } from "./FilterByTime";
import { EventsFilters } from "./Filters";
import { EventsGrid } from ".";
import { BackToTopButton } from "@/components/BackToTopButton";

interface EventsProps {
  events: Event[];
  errorMessage?: string | null;
  timeFilter: EventTimeFilter;
  totalCount?: number;
  filters?: ReturnType<typeof useEventFilters>;
}

export function Events({
  events,
  errorMessage,
  timeFilter,
  totalCount,
  filters: externalFilters,
}: EventsProps) {
  const [isFiltersPopupOpen, setIsFiltersPopupOpen] = useState(false);
  const filters = externalFilters ?? useEventFilters();
  const timeFiltered = filterEventsByTime(events, timeFilter);
  const t = useTranslations("HomePage");
  const eventIds = timeFiltered
    .map((e) => e.id)
    .filter((id): id is number => typeof id === "number");
  const { data: eventTags = {}, isFetching: isEventTagsFetching } =
    useEventTagsMap(eventIds);

  const { filteredEvents } = useFilteredEvents(
    timeFiltered,
    filters,
    eventTags,
  );

  const effectiveTotalCount =
    typeof totalCount === "number" ? totalCount : timeFiltered.length;
  const filteredCount = filteredEvents.length;
  const hasActiveFilters = filters.appliedFiltersCount > 0;

  return (
    <div className="flex flex-col gap-6">
      <BackToTopButton />
      <EventsFilters filters={filters} />

      <Typography.Small className="text-muted-foreground">
        {hasActiveFilters
          ? t("filteredEventsSummary", {
              filtered: filteredCount,
              total: effectiveTotalCount,
            })
          : t("allEventsSummary", { count: effectiveTotalCount })}
      </Typography.Small>

      {Boolean(errorMessage) && <ErrorAlert error="">{t("error")}</ErrorAlert>}

      {filteredEvents.length === 0 ? (
        <EmptyState onReset={filters.clear} />
      ) : (
        <EventsGrid
          events={filteredEvents}
          timeFilter={timeFilter}
          eventTags={eventTags}
        />
      )}

      <DrawerDialog
        open={isFiltersPopupOpen}
        setOpen={setIsFiltersPopupOpen}
        title={t("filters")}
      >
        <div className="px-6 pb-4">
          <EventsFilters
            filters={filters}
            open
            onOpenChange={() => {}}
            inDialog
          />
        </div>
      </DrawerDialog>

      <Button
        type="button"
        variant="default"
        className="fixed bottom-10 right-4 z-40 flex items-center gap-2 rounded-full px-4 py-2 shadow-lg md:right-6"
        onClick={() => setIsFiltersPopupOpen(true)}
      >
        <SlidersHorizontalIcon className="size-4" />
        <span>
          {t("filters")}
          {filters.appliedFiltersCount
            ? `(${filters.appliedFiltersCount})`
            : ""}
        </span>
      </Button>
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
