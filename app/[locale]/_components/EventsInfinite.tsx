"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { Event } from "@/lib/api";
import { getEvents } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { useEventFilters } from "@/hooks";
import { Skeleton } from "@/components/ui";

import type { EventTimeFilter } from "./FilterByTime";
import { Events } from ".";

const PAGE_SIZE = 16;

interface EventsInfiniteProps {
  initialEvents: Event[];
  initialError?: string | null;
  timeFilter: EventTimeFilter;
  totalCount?: number;
}

export function EventsInfinite({
  initialEvents,
  initialError,
  timeFilter,
  totalCount,
}: EventsInfiniteProps) {
  const filters = useEventFilters();
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    initialError ?? null,
  );
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialEvents.length === PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoadingAllForFilters, setIsLoadingAllForFilters] = useState(false);
  const [hasLoadedAllForFilters, setHasLoadedAllForFilters] = useState(false);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    try {
      const supabase = createClient();
      const offset = page * PAGE_SIZE;

      const { data, error } = await getEvents(supabase, {
        all: false,
        limit: PAGE_SIZE,
        offset,
      });

      if (error) {
        console.error(error);
        setErrorMessage(error.message ?? "Failed to load more events");
        setHasMore(false);
        return;
      }

      const next = data ?? [];
      if (!next.length) {
        setHasMore(false);
        return;
      }

      setEvents((prev) => {
        const merged = [...prev, ...next];
        const seen = new Set<number | string>();
        return merged.filter((e) => {
          const key = (e.id as number | string) ?? e.slug;
          if (key == null) return true;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      });
      setPage((prev) => prev + 1);

      if (next.length < PAGE_SIZE) {
        setHasMore(false);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message ?? "Failed to load more events");
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, page]);

  // When filters are active, load the full events list once so that
  // filtered counts reflect all matching events, not just the first page.
  useEffect(() => {
    let cancelled = false;

    async function loadAllEventsForFilters() {
      setIsLoadingAllForFilters(true);
      try {
        const supabase = createClient();
        const { data, error } = await getEvents(supabase, {
          all: false,
        });

        if (cancelled) return;

        if (error) {
          console.error(error);
          setErrorMessage(error.message ?? "Failed to load events");
          setHasMore(false);
          return;
        }

        const next = data ?? [];
        setEvents(next);
        setPage(1);
        setHasMore(false);
        setHasLoadedAllForFilters(true);
      } catch (err: any) {
        if (cancelled) return;
        console.error(err);
        setErrorMessage(err?.message ?? "Failed to load events");
        setHasMore(false);
      } finally {
        if (!cancelled) {
          setIsLoadingAllForFilters(false);
        }
      }
    }

    if (filters.hasFilters && !hasLoadedAllForFilters) {
      void loadAllEventsForFilters();
    }

    // If filters are cleared after we've loaded all events once,
    // we simply keep the full list in memory and keep hasMore=false,
    // so no further lazy loading or extra requests happen.

    return () => {
      cancelled = true;
    };
  }, [filters.hasFilters, hasLoadedAllForFilters]);

  useEffect(() => {
    if (!hasMore) return;

    const node = loaderRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [loadMore, hasMore]);

  return (
    <div className="flex flex-col gap-6">
      <Events
        events={events}
        errorMessage={errorMessage}
        timeFilter={timeFilter}
        totalCount={totalCount}
        filters={filters}
      />

      <div ref={loaderRef} className="flex justify-center py-6">
        {(isLoadingMore || isLoadingAllForFilters) && (
          <div className="grid w-full max-w-5xl gap-6 [grid-template-columns:repeat(auto-fill,minmax(min(100%,18rem),1fr))]">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-72 w-full" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
