"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { Event } from "@/lib/api";
import { getEvents } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
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
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    initialError ?? null,
  );
  const [page, setPage] = useState(1); // first page is already loaded
  const [hasMore, setHasMore] = useState(initialEvents.length === PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

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

      // Merge and de-duplicate by id to avoid duplicate keys in the grid
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
      />

      <div ref={loaderRef} className="flex justify-center py-6">
        {isLoadingMore && (
          <div className="grid w-full max-w-3xl grid-cols-1 gap-4 md:grid-cols-2">
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="hidden h-32 rounded-lg md:block" />
            <Skeleton className="hidden h-32 rounded-lg md:block" />
          </div>
        )}
      </div>
    </div>
  );
}
