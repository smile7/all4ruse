import type { Event } from "@/lib/api";

export type EventTimeFilter = "past" | "current" | "upcoming";

const DEFAULT_TIME = "00:00:00";
const RECENTLY_STARTED_UPCOMING_MAX_MS = 12 * 60 * 60 * 1000;
const NO_END_TIME_FALLBACK_MS = 90 * 60 * 1000;

type EventMeta = {
  event: Event;
  startUTC: Date;
  endUTC: Date;
  status: EventTimeFilter;
};

export function filterEventsByTime(
  events: Event[],
  filter: EventTimeFilter,
  reference: Date = new Date(),
): Event[] {
  const metas = events
    .map((event) => buildEventMeta(event, reference))
    .filter((meta): meta is EventMeta => meta !== null);

  const filtered = metas.filter((meta) => meta.status === filter);

  const sort =
    filter === "upcoming"
      ? // Upcoming: soonest first (ascending start date/time)
        (a: EventMeta, b: EventMeta) =>
          a.startUTC.getTime() - b.startUTC.getTime()
      : // Current & past: most recent first (descending start date/time)
        (a: EventMeta, b: EventMeta) =>
          b.startUTC.getTime() - a.startUTC.getTime();

  return filtered.sort(sort).map((meta) => meta.event);
}

export function getEventTemporalStatus(
  event: Event,
  reference: Date = new Date(),
): EventTimeFilter {
  const { startUTC, endUTC } = getEventUtcRange(event);
  return resolveEventStatus(event, startUTC, endUTC, reference);
}

export function getEventUtcRange(event: Event): {
  startUTC: Date;
  endUTC: Date;
} {
  const startUTC =
    toUTCDate(event.startDate, event.startTime) ??
    toUTCDate(
      event.endDate ?? event.startDate,
      event.endTime ?? event.startTime,
    ) ??
    new Date(0);

  const hasEndTime = Boolean(event.endTime?.trim());

  let endUTC = hasEndTime
    ? (toUTCDate(event.endDate ?? event.startDate, event.endTime) ?? startUTC)
    : new Date(startUTC.getTime() + NO_END_TIME_FALLBACK_MS);

  if (endUTC.getTime() < startUTC.getTime()) {
    endUTC = new Date(startUTC);
  }

  return { startUTC, endUTC };
}

export function getUpcomingStartedElapsedLabel(
  event: Event,
  reference: Date = new Date(),
): string | null {
  if (!isEventLiveInUpcoming(event, reference)) {
    return null;
  }

  const { startUTC, endUTC } = getEventUtcRange(event);
  const now = reference.getTime();
  const start = startUTC.getTime();

  const totalMinutes = Math.max(1, Math.floor((now - start) / (60 * 1000)));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `ПРЕДИ ${totalMinutes} ${minutesWord(totalMinutes)}`;
  }

  if (minutes === 0) {
    return `ПРЕДИ ${hours} ${hoursWord(hours)}`;
  }

  return `ПРЕДИ ${hours} ${hoursWord(hours)} ${minutes} ${minutesWord(minutes)}`;
}

export function isEventLiveInUpcoming(
  event: Event,
  reference: Date = new Date(),
): boolean {
  const { startUTC, endUTC } = getEventUtcRange(event);
  const now = reference.getTime();
  const start = startUTC.getTime();
  const end = endUTC.getTime();

  if (now < start || now > end) {
    return false;
  }

  const holdInUpcomingUntil = Math.min(
    end,
    start + RECENTLY_STARTED_UPCOMING_MAX_MS,
  );

  return now <= holdInUpcomingUntil;
}

function buildEventMeta(event: Event, reference: Date): EventMeta | null {
  try {
    const { startUTC, endUTC } = getEventUtcRange(event);
    const status = resolveEventStatus(event, startUTC, endUTC, reference);
    return { event, startUTC, endUTC, status };
  } catch {
    return null;
  }
}

function resolveEventStatus(
  event: Event,
  startUTC: Date,
  endUTC: Date,
  reference: Date,
): EventTimeFilter {
  if (event.isEventPremium) {
    return reference.getTime() > endUTC.getTime() ? "past" : "upcoming";
  }

  return resolveStatus(startUTC, endUTC, reference);
}

function resolveStatus(
  startUTC: Date,
  endUTC: Date,
  reference: Date,
): EventTimeFilter {
  const now = reference.getTime();
  const start = startUTC.getTime();
  const end = endUTC.getTime();

  if (start > now) return "upcoming";
  if (end < now) return "past";

  // Keep newly started events in upcoming for up to 12 hours or until they end.
  const holdInUpcomingUntil = Math.min(
    end,
    start + RECENTLY_STARTED_UPCOMING_MAX_MS,
  );

  if (now <= holdInUpcomingUntil) return "upcoming";
  return "current";
}

function toUTCDate(
  dateStr?: string | null,
  timeStr?: string | null,
): Date | null {
  if (!dateStr) return null;
  const trimmedDate = dateStr.trim();
  if (!trimmedDate) return null;

  const hasTime = /[T\s]/.test(trimmedDate);
  const normalizedTime = normalizeTimeString(timeStr);

  const iso = hasTime
    ? normalizeIso(trimmedDate)
    : `${trimmedDate}T${normalizedTime}`;

  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeIso(value: string): string {
  return value.replace(" ", "T");
}

function normalizeTimeString(timeStr?: string | null): string {
  const parts = (timeStr ?? DEFAULT_TIME)
    .trim()
    .split(":")
    .map((part) => Number.parseInt(part, 10));

  let [h = 0, m = 0, s = 0] = parts;
  if (!Number.isFinite(h)) h = 0;
  if (!Number.isFinite(m)) m = 0;
  if (!Number.isFinite(s)) s = 0;

  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

function pad2(num: number): string {
  return num.toString().padStart(2, "0");
}

function hoursWord(value: number): string {
  return value === 1 ? "час" : "часа";
}

function minutesWord(value: number): string {
  return value === 1 ? "минута" : "минути";
}
