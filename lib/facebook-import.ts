import type { GraboImportResult } from "@/lib/grabo";

const JSON_IMPORT_TIME_ZONE = "Europe/Sofia";

type FacebookJsonImportLocation = {
  name?: string | null;
  contextualName?: string | null;
  placeType?: string | null;
  streetAddress?: string | null;
  city?: string | null;
};

type FacebookJsonImportTicketsInfo = {
  buyUrl?: string | null;
  price?: string | number | null;
};

type FacebookJsonImportOrganizer = {
  name?: string | null;
  url?: string | null;
};

export type FacebookJsonImportItem = {
  inputUrl?: string | null;
  url?: string | null;
  name?: string | null;
  address?: string | null;
  imageUrl?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  utcStartDate?: string | null;
  utcEndDate?: string | null;
  dateTimeSentence?: string | null;
  duration?: string | null;
  description?: string | null;
  location?: FacebookJsonImportLocation | null;
  ticketsInfo?: FacebookJsonImportTicketsInfo | null;
  organizedBy?: string | null;
  organizators?: FacebookJsonImportOrganizer[] | null;
};

export type FacebookJsonImportResult = GraboImportResult & {
  fbLink: string;
};

function toTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function convertPlainTextToHtml(value: string): string {
  const normalized = value.replace(/\r\n?/g, "\n").trim();
  if (!normalized) return "";

  return normalized
    .split(/\n{2,}/)
    .map(
      (paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`,
    )
    .join("");
}

export function unwrapJsonPayload(raw: string): string {
  const trimmed = raw.trim();
  const match = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return match?.[1]?.trim() ?? trimmed;
}

function selectFirstFacebookJsonImportItem(
  value: unknown,
): FacebookJsonImportItem | null {
  if (Array.isArray(value)) {
    const firstObject = value.find(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null,
    );

    return firstObject ? (firstObject as FacebookJsonImportItem) : null;
  }

  return typeof value === "object" && value !== null
    ? (value as FacebookJsonImportItem)
    : null;
}

function formatIsoInTimeZone(
  value: string,
  timeZone: string,
): { date: string; time: string } {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { date: "", time: "" };
  }

  return {
    date: new Intl.DateTimeFormat("sv-SE", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(parsed),
    time: new Intl.DateTimeFormat("sv-SE", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(parsed),
  };
}

function normalizeOrganizedBy(value: string): string {
  return value
    .replace(/^Event by\s+/i, "")
    .replace(/^Hosted by\s+/i, "")
    .replace(/^Събитие от\s+/i, "")
    .replace(/^Hosted\s+by\s+/i, "")
    .trim();
}

function inferFacebookJsonTagSuggestions(
  item: FacebookJsonImportItem,
): string[] {
  const haystack = [
    toTrimmedString(item.name),
    toTrimmedString(item.description),
    toTrimmedString(item.location?.name),
  ]
    .join(" ")
    .toLowerCase();

  const suggestions = new Set<string>();

  if (haystack.includes("концерт")) {
    suggestions.add("CONCERT");
  }

  if (
    haystack.includes("муз") ||
    haystack.includes("песен") ||
    haystack.includes("трио") ||
    haystack.includes("пиано") ||
    haystack.includes("джаз") ||
    haystack.includes("пиаф")
  ) {
    suggestions.add("MUSIC");
  }

  if (haystack.includes("теат") || haystack.includes("спектак")) {
    suggestions.add("THEATRE");
  }

  if (haystack.includes("комед")) {
    suggestions.add("COMEDY");
  }

  if (haystack.includes("летен театър") || haystack.includes("на открито")) {
    suggestions.add("OUTDOOR");
  }

  return Array.from(suggestions);
}

function looksLikeAddress(value: string): boolean {
  const normalized = value.trim();
  if (!normalized) return false;

  return (
    /(^|[\s,])(ул\.?|улица|бул\.?|булевард|пл\.?|площад|жк|кв\.?|street|st\.?|ave\.?|avenue|blvd\.?|boulevard|road|rd\.?)\b/i.test(
      normalized,
    ) ||
    /^\d{4}\b/.test(normalized) ||
    /,\s*(?:\d{4}\s+)?[^,]+,\s*(?:Bulgaria|България)$/i.test(normalized)
  );
}

function trimImportedAddress(value: string): string {
  const parts = value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return "";

  const lastPart = parts[parts.length - 1];
  if (/^(Bulgaria|България)$/i.test(lastPart)) {
    parts.pop();
  }

  if (parts.length > 1) {
    const tail = parts[parts.length - 1];
    if (/^\d{4}\b/.test(tail) || !/\d/.test(tail)) {
      parts.pop();
    }
  }

  return parts.join(", ");
}

function normalizeTimeValue(value: string): string {
  const match = value.match(/(\d{1,2}):(\d{2})/);
  if (!match) return "";

  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

function extractTimeRange(value: string): {
  startTime: string;
  endTime: string;
} {
  const match = value.match(/(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})/);
  if (!match) {
    return { startTime: "", endTime: "" };
  }

  return {
    startTime: normalizeTimeValue(match[1]),
    endTime: normalizeTimeValue(match[2]),
  };
}

function parseDurationMinutes(value: string): number | null {
  if (!value) return null;

  let totalMinutes = 0;
  const hoursMatch = value.match(/(\d+)\s*h(?:r|our|ours)?/i);
  const minutesMatch = value.match(/(\d+)\s*m(?:in|ins|inute|inutes)?/i);

  if (hoursMatch) {
    totalMinutes += Number.parseInt(hoursMatch[1], 10) * 60;
  }

  if (minutesMatch) {
    totalMinutes += Number.parseInt(minutesMatch[1], 10);
  }

  return totalMinutes > 0 ? totalMinutes : null;
}

function addMinutesInTimeZone(
  isoValue: string,
  minutes: number,
  timeZone: string,
): { date: string; time: string } {
  const parsed = new Date(isoValue);
  if (Number.isNaN(parsed.getTime())) {
    return { date: "", time: "" };
  }

  parsed.setMinutes(parsed.getMinutes() + minutes);
  return formatIsoInTimeZone(parsed.toISOString(), timeZone);
}

function extractPlaceName(
  locationName: string,
  hasSeparateAddress: boolean,
): string {
  if (!locationName) return "";

  const parts = locationName
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const firstPart = parts[0] ?? "";
  const trailing = parts.slice(1).join(", ");

  if (
    !looksLikeAddress(firstPart) &&
    (hasSeparateAddress || looksLikeAddress(trailing))
  ) {
    return firstPart;
  }

  return looksLikeAddress(locationName) ? "" : locationName;
}

function extractAddressFallback(locationName: string): string {
  if (!locationName) return "";

  const parts = locationName
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length > 1 && !looksLikeAddress(parts[0])) {
    const trailing = parts.slice(1).join(", ");
    if (looksLikeAddress(trailing)) {
      return trailing;
    }
  }

  return looksLikeAddress(locationName) ? locationName : "";
}

export function parseFacebookJsonImportData(
  value: unknown,
): FacebookJsonImportResult {
  const item = selectFirstFacebookJsonImportItem(value);

  if (!item) {
    throw new Error("Missing event object in JSON payload.");
  }

  const start = item.utcStartDate
    ? formatIsoInTimeZone(item.utcStartDate, JSON_IMPORT_TIME_ZONE)
    : { date: "", time: "" };
  const end = item.utcEndDate
    ? formatIsoInTimeZone(item.utcEndDate, JSON_IMPORT_TIME_ZONE)
    : { date: start.date, time: "" };
  const timeRange = extractTimeRange(toTrimmedString(item.dateTimeSentence));
  const durationMinutes = parseDurationMinutes(toTrimmedString(item.duration));
  const derivedEndFromDuration =
    !item.utcEndDate && item.utcStartDate && durationMinutes
      ? addMinutesInTimeZone(
          item.utcStartDate,
          durationMinutes,
          JSON_IMPORT_TIME_ZONE,
        )
      : null;

  const firstOrganizer = item.organizators?.find((organizer) =>
    Boolean(toTrimmedString(organizer?.name)),
  );
  const organizerName =
    toTrimmedString(firstOrganizer?.name) ||
    normalizeOrganizedBy(toTrimmedString(item.organizedBy));
  const organizerLink = toTrimmedString(firstOrganizer?.url);
  const coverImageUrl = toTrimmedString(item.imageUrl);
  const priceValue = item.ticketsInfo?.price;
  const price =
    typeof priceValue === "number"
      ? priceValue.toString()
      : toTrimmedString(priceValue);
  const topLevelAddress = trimImportedAddress(toTrimmedString(item.address));
  const locationName = toTrimmedString(item.location?.name);
  const streetAddress = trimImportedAddress(
    toTrimmedString(item.location?.streetAddress),
  );
  const contextualPlace = toTrimmedString(item.location?.contextualName);
  const fallbackAddress = trimImportedAddress(
    !topLevelAddress && !streetAddress
      ? extractAddressFallback(locationName)
      : "",
  );
  const place =
    contextualPlace ||
    extractPlaceName(locationName, Boolean(topLevelAddress || streetAddress));
  const startTime =
    start.time ||
    normalizeTimeValue(toTrimmedString(item.startTime)) ||
    timeRange.startTime;
  const endTime =
    end.time ||
    normalizeTimeValue(toTrimmedString(item.endTime)) ||
    timeRange.endTime ||
    derivedEndFromDuration?.time ||
    "";
  const endDate = end.date || derivedEndFromDuration?.date || start.date;

  return {
    title: toTrimmedString(item.name),
    description: convertPlainTextToHtml(toTrimmedString(item.description)),
    startDate: start.date,
    endDate,
    startTime,
    endTime,
    address: topLevelAddress || streetAddress || fallbackAddress,
    place,
    town: toTrimmedString(item.location?.city),
    organizers: organizerName
      ? [{ name: organizerName, link: organizerLink }]
      : [],
    ticketsLink: toTrimmedString(item.ticketsInfo?.buyUrl),
    fbLink: toTrimmedString(item.url) || toTrimmedString(item.inputUrl),
    price,
    coverImageUrl: coverImageUrl || null,
    tagSuggestions: inferFacebookJsonTagSuggestions(item),
  };
}

export function parseFacebookJsonImportPayload(
  raw: string,
): FacebookJsonImportResult {
  return parseFacebookJsonImportData(JSON.parse(unwrapJsonPayload(raw)));
}
