import type { Event } from "@/lib/api";

export type EventTimeFilter = "past" | "current" | "upcoming";

const DEFAULT_TIME = "00:00:00";

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
  return resolveStatus(startUTC, endUTC, reference);
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

  let endUTC =
    toUTCDate(
      event.endDate ?? event.startDate,
      event.endTime ?? event.startTime,
    ) ?? startUTC;

  if (endUTC.getTime() < startUTC.getTime()) {
    endUTC = new Date(startUTC);
  }

  return { startUTC, endUTC };
}

function buildEventMeta(event: Event, reference: Date): EventMeta | null {
  try {
    const { startUTC, endUTC } = getEventUtcRange(event);
    const status = resolveStatus(startUTC, endUTC, reference);
    return { event, startUTC, endUTC, status };
  } catch {
    return null;
  }
}

function resolveStatus(
  startUTC: Date,
  endUTC: Date,
  reference: Date,
): EventTimeFilter {
  const now = reference.getTime();
  if (startUTC.getTime() > now) return "upcoming";
  if (endUTC.getTime() < now) return "past";
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
