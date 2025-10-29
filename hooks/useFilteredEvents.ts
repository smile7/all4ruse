import { useMemo } from "react";

import { useEventFilters } from "@/hooks/useEventFilters";
import type { Event } from "@/lib/api";
import { toTimestamp } from "@/lib/utils";

export function useFilteredEvents(events: Event[]) {
  const {
    title,
    from,
    to,
    clear,
    hasFilters,
    appliedFiltersCount,
    setTitle,
    setFrom,
    setTo,
  } = useEventFilters();

  const filteredEvents = useMemo(() => {
    const query = title.trim().toLowerCase();
    const fromTs = from ? toTimestamp(from) : null;
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
  }, [events, title, from, to]);

  return {
    filteredEvents,
    filters: {
      title,
      setTitle,
      from,
      setFrom,
      to,
      setTo,
      hasFilters,
      appliedFiltersCount,
      clear,
    },
  };
}
