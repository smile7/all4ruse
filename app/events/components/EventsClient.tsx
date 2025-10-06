"use client";

import { useMemo, useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import Image from "next/image";

import type { Event } from "@/lib/api";

const FALLBACK_IMAGE = "/logo.png";

export function EventsClient({
  initial,
  errorMessage,
}: {
  initial: Event[];
  errorMessage?: string | null;
}) {
  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    const fromTs = fromDate ? Date.parse(fromDate) : null;
    const toTs = toDate ? Date.parse(toDate + "T23:59:59") : null;
    return initial.filter((e) => {
      if (q) {
        const title = (e.title ?? "").toLocaleLowerCase();
        if (!title.includes(q)) return false;
      }
      if (fromTs || toTs) {
        const start = e.startDateTime ? Date.parse(e.startDateTime) : null;
        if (fromTs && start && start < fromTs) return false;
        if (toTs && start && start > toTs) return false;
      }
      return true;
    });
  }, [initial, query, fromDate, toDate]);

  const upcoming = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        const aT = a.startDateTime ? Date.parse(a.startDateTime) : 0;
        const bT = b.startDateTime ? Date.parse(b.startDateTime) : 0;
        return aT - bT;
      }),
    [filtered]
  );

  return (
    <div>
      <section
        aria-label="Filters"
        className="mb-6 rounded-lg border bg-card p-4 shadow-sm"
      >
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col gap-4 md:grid md:grid-cols-12"
        >
          <input
            className="col-span-4 rounded-md border px-3 py-2 text-sm"
            placeholder="Search title..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <input
            type="date"
            className="col-span-2 rounded-md border px-3 py-2 text-sm"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <input
            type="date"
            className="col-span-2 rounded-md border px-3 py-2 text-sm"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
          {(query || fromDate || toDate) && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setFromDate("");
                setToDate("");
              }}
              className="col-span-2 rounded-md bg-secondary px-3 py-2 text-sm font-medium"
            >
              Clear
            </button>
          )}
        </form>
      </section>

      {errorMessage && (
        <div
          role="alert"
          className="mb-6 rounded-md border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          Възникна грешка: {errorMessage}
        </div>
      )}

      {upcoming.length === 0 ? (
        <EmptyState
          hasFilters={!!(query || fromDate || toDate)}
          onReset={() => {
            setQuery("");
            setFromDate("");
            setToDate("");
          }}
        />
      ) : (
        <EventsGrid events={upcoming} />
      )}
    </div>
  );
}

function EventsGrid({ events }: { events: Event[] }) {
  return (
    <div
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      aria-label="Events grid"
    >
      {events.map((e) => (
        <article
          key={e.id}
          className="group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm ring-offset-background transition hover:shadow-md focus-within:ring-2 focus-within:ring-primary/50"
        >
          <div className="relative aspect-video w-full overflow-hidden bg-muted">
            <Image
              src={e.image || FALLBACK_IMAGE}
              alt={e.title || "Event"}
              fill
              sizes="(max-width:768px) 100vw,(max-width:1200px) 50vw,25vw"
              className="object-cover"
              priority={false}
            />
          </div>
          <div className="flex flex-1 flex-col p-4">
            <h3 className="line-clamp-2 text-sm font-semibold">
              {e.title || "Untitled"}
            </h3>
            <div className="mt-auto pt-3">
              <a
                href={`/events/${e.id}`}
                className="text-sm text-primary hover:underline"
              >
                View
              </a>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function EmptyState({
  hasFilters,
  onReset,
}: {
  hasFilters: boolean;
  onReset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border bg-card px-6 py-14 text-center shadow-sm">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Sparkles className="h-7 w-7" />
      </div>
      <h2 className="text-base font-semibold">No events found</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Try adjusting your filters or create a new event.
      </p>
      {hasFilters && (
        <button
          onClick={onReset}
          className="mt-5 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition hover:bg-secondary/80"
        >
          Clear filters
        </button>
      )}
      <a
        href="/events/create"
        className="mt-5 inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <Plus className="h-4 w-4" />
        Create event
      </a>
    </div>
  );
}
