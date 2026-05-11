import type { Host } from "./api";

export type RuseOnTheDanubeImportResult = {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  address: string;
  place: string;
  town: string;
  organizers: Host[];
  ticketsLink: string;
  fbLink: string;
  price: string;
  coverImageUrl: string | null;
  tagSuggestions: string[];
};

const HTML_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  nbsp: " ",
  quot: '"',
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code) => {
      const parsed = Number.parseInt(code, 10);
      return Number.isFinite(parsed) ? String.fromCodePoint(parsed) : _;
    })
    .replace(/&#x([\da-f]+);/gi, (_, code) => {
      const parsed = Number.parseInt(code, 16);
      return Number.isFinite(parsed) ? String.fromCodePoint(parsed) : _;
    })
    .replace(/&([a-z]+);/gi, (match, entity) => HTML_ENTITIES[entity] ?? match);
}

function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function stripTags(value: string): string {
  return collapseWhitespace(
    decodeHtmlEntities(
      value
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<[^>]+>/g, " "),
    ),
  );
}

function normalizeHtmlSnippet(value: string): string {
  return decodeHtmlEntities(value)
    .replace(/\r/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s*<br\s*\/?>\s*/gi, "<br />")
    .replace(/(?:<br \/>){3,}/g, "<br /><br />")
    .replace(/<p>\s*<\/p>/gi, "")
    .trim();
}

function toAbsoluteUrl(value: string | undefined, baseUrl: string): string {
  if (!value) return "";

  try {
    return new URL(decodeHtmlEntities(value.trim()), baseUrl).toString();
  } catch {
    return "";
  }
}

function extractMetaContent(html: string, key: string): string {
  const escapedKey = escapeRegExp(key);
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${escapedKey}["'][^>]+content=["']([^"']*)["'][^>]*>`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escapedKey}["'][^>]*>`,
      "i",
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return decodeHtmlEntities(match[1]).trim();
    }
  }

  return "";
}

function extractAttributeForClass(
  html: string,
  classFragment: string,
  attribute: string,
): string {
  const escapedClass = escapeRegExp(classFragment);
  const escapedAttr = escapeRegExp(attribute);
  const exactClassToken = `(?<=["'\\s])${escapedClass}(?=["'\\s])`;
  const patterns = [
    new RegExp(
      `<[^>]+class=["'][^"']*${exactClassToken}[^"']*["'][^>]+${escapedAttr}=["']([^"']*)["'][^>]*>`,
      "i",
    ),
    new RegExp(
      `<[^>]+${escapedAttr}=["']([^"']*)["'][^>]+class=["'][^"']*${exactClassToken}[^"']*["'][^>]*>`,
      "i",
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return decodeHtmlEntities(match[1]).trim();
    }
  }

  return "";
}

function extractNodeTextByClass(html: string, classFragment: string): string {
  const escapedClass = escapeRegExp(classFragment);
  const exactClassToken = `(?<=["'\\s])${escapedClass}(?=["'\\s])`;
  const match = html.match(
    new RegExp(
      `<([a-z0-9]+)[^>]*class=["'][^"']*${exactClassToken}[^"']*["'][^>]*>([\\s\\S]*?)<\/\\1>`,
      "i",
    ),
  );

  return match?.[2] ? stripTags(match[2]) : "";
}

function extractTitle(html: string): string {
  const headingMatch = html.match(
    /<h1[^>]*class="[^"]*tribe-events-single-event-title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i,
  );
  if (headingMatch?.[1]) {
    return stripTags(headingMatch[1]);
  }

  const ogTitle = extractMetaContent(html, "og:title");
  if (!ogTitle) return "";

  return ogTitle.replace(/\s*[|\-]\s*Ruse on the Danube\s*$/i, "").trim();
}

function extractDescriptionHtml(html: string): string {
  const match = html.match(
    /<div class="tribe-events-single-event-description[^"]*">([\s\S]*?)<\/div>\s*<!-- \.tribe-events-single-event-description -->/i,
  );

  if (!match?.[1]) {
    return extractMetaContent(html, "og:description");
  }

  const sanitized = match[1].replace(
    /<p[^>]*>[\s\S]*?info@ruseonthedanube\.com[\s\S]*?<\/p>/gi,
    "",
  );

  return normalizeHtmlSnippet(sanitized);
}

function normalizeTimeValue(value: string): string {
  const match = collapseWhitespace(value).match(
    /(\d{1,2}):(\d{2})(?:\s*([AP])\.?M\.?)?/i,
  );

  if (!match) return "";

  let hours = Number.parseInt(match[1], 10);
  const minutes = match[2];
  const meridiem = match[3]?.toUpperCase();

  if (meridiem === "P" && hours < 12) {
    hours += 12;
  }

  if (meridiem === "A" && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, "0")}:${minutes}`;
}

function extractTimeAfterAt(value: string): string {
  const match = value.match(/@\s*(\d{1,2}:\d{2}(?:\s*[AP]\.?M\.?)?)/i);
  return match?.[1] ? normalizeTimeValue(match[1]) : "";
}

function extractTimeRange(value: string): {
  startTime: string;
  endTime: string;
} {
  const match = value.match(
    /(\d{1,2}:\d{2}(?:\s*[AP]\.?M\.?)?)\s*[-–]\s*(\d{1,2}:\d{2}(?:\s*[AP]\.?M\.?)?)/i,
  );

  if (!match) {
    return { startTime: "", endTime: "" };
  }

  return {
    startTime: normalizeTimeValue(match[1]),
    endTime: normalizeTimeValue(match[2]),
  };
}

function extractDateTimeParts(html: string): {
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
} {
  const startDate =
    extractAttributeForClass(html, "tribe-events-start-datetime", "title") ||
    extractAttributeForClass(html, "tribe-events-start-date", "title");
  const endDate =
    extractAttributeForClass(html, "tribe-events-end-datetime", "title") ||
    startDate;

  const startDateTimeText = extractNodeTextByClass(
    html,
    "tribe-events-start-datetime",
  );
  const endDateTimeText = extractNodeTextByClass(
    html,
    "tribe-events-end-datetime",
  );
  const timeRangeText = extractNodeTextByClass(html, "tribe-events-start-time");

  const range = extractTimeRange(timeRangeText);

  return {
    startDate,
    endDate,
    startTime: extractTimeAfterAt(startDateTimeText) || range.startTime,
    endTime: extractTimeAfterAt(endDateTimeText) || range.endTime,
  };
}

function extractSourceUrl(html: string, pageUrl: string): string {
  const match = html.match(
    /<span class="tribe-events-event-url[^"]*">\s*<a[^>]+href="([^"]+)"/i,
  );

  return toAbsoluteUrl(match?.[1], pageUrl);
}

function extractOrganizer(html: string): Host[] {
  const match = html.match(
    /<li class="tribe-events-meta-item tribe-organizer">[\s\S]*?<a[^>]+href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/i,
  );

  if (match?.[2]) {
    return [
      {
        name: stripTags(match[2]),
        link: "",
      },
    ];
  }

  const fallbackMatch = html.match(
    /<span class="rod-event-organizer">[\s\S]*?<strong>([\s\S]*?)<\/strong>/i,
  );
  const fallbackName = stripTags(fallbackMatch?.[1] ?? "");

  return fallbackName ? [{ name: fallbackName, link: "" }] : [];
}

function extractVenue(html: string): string {
  const metaVenueMatch = html.match(
    /<li class="tribe-events-meta-item tribe-venue">([\s\S]*?)<\/li>/i,
  );
  if (metaVenueMatch?.[1]) {
    return stripTags(metaVenueMatch[1]);
  }

  const topVenueMatch = html.match(
    /<div class="rod-event-location-top">[\s\S]*?<strong>([\s\S]*?)<\/strong>/i,
  );
  return stripTags(topVenueMatch?.[1] ?? "");
}

function extractAddress(html: string, venue: string): string {
  const streetMatch = html.match(
    /<span class="tribe-street-address">([\s\S]*?)<\/span>/i,
  );

  if (streetMatch?.[1]) {
    return stripTags(streetMatch[1]);
  }

  return venue;
}

function extractCategory(html: string): string {
  const match = html.match(
    /<span class="tribe-events-event-categories[^"]*">[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i,
  );

  return stripTags(match?.[1] ?? "");
}

function isFacebookUrl(value: string): boolean {
  return /^https?:\/\/(?:www\.)?(?:facebook|fb)\.com\//i.test(value);
}

function extractTagSuggestions(
  title: string,
  description: string,
  place: string,
  category: string,
): string[] {
  const haystack =
    `${title} ${stripTags(description)} ${place} ${category}`.toLowerCase();
  const suggestions = new Set<string>();

  if (
    haystack.includes("for children") ||
    haystack.includes("за деца") ||
    haystack.includes("деца") ||
    haystack.includes("famil")
  ) {
    suggestions.add("KIDS");
  }

  if (haystack.includes("куклен") || haystack.includes("puppet")) {
    suggestions.add("PUPPETTHEATRE");
    suggestions.add("KIDS");
  }

  if (haystack.includes("концерт") || haystack.includes("concert")) {
    suggestions.add("CONCERT");
    suggestions.add("MUSIC");
  }

  if (
    haystack.includes("муз") ||
    haystack.includes("music") ||
    haystack.includes("джаз") ||
    haystack.includes("jazz") ||
    haystack.includes("оркест") ||
    haystack.includes("пиано")
  ) {
    suggestions.add("MUSIC");
  }

  if (
    haystack.includes("теат") ||
    haystack.includes("theatre") ||
    haystack.includes("theater") ||
    haystack.includes("спектак") ||
    haystack.includes("dramatic")
  ) {
    suggestions.add("THEATRE");
  }

  if (haystack.includes("комед") || haystack.includes("comedy")) {
    suggestions.add("COMEDY");
  }

  if (
    haystack.includes("изложб") ||
    haystack.includes("exhibition") ||
    haystack.includes("gallery") ||
    haystack.includes("галерия") ||
    haystack.includes("живопис")
  ) {
    suggestions.add("EXHIBITION");
  }

  if (
    haystack.includes("atelier") ||
    haystack.includes("ателие") ||
    haystack.includes("workshop") ||
    haystack.includes("работилниц") ||
    haystack.includes("creative challenge")
  ) {
    suggestions.add("WORKSHOP");
  }

  if (haystack.includes("опера") || haystack.includes("opera")) {
    suggestions.add("OPERA");
    suggestions.add("MUSIC");
  }

  if (
    haystack.includes("спорт") ||
    haystack.includes("sport") ||
    haystack.includes("моторкрос") ||
    haystack.includes("motocross")
  ) {
    suggestions.add("SPORTS");
  }

  if (
    haystack.includes("турнир") ||
    haystack.includes("championship") ||
    haystack.includes("competition") ||
    haystack.includes("състезан")
  ) {
    suggestions.add("COMPETITION");
  }

  if (
    haystack.includes("изложение") ||
    haystack.includes("fair") ||
    haystack.includes("bazaar") ||
    haystack.includes("базар") ||
    haystack.includes("market")
  ) {
    suggestions.add("FAIR");
  }

  if (
    haystack.includes("книг") ||
    haystack.includes("book") ||
    haystack.includes("writer") ||
    haystack.includes("писател") ||
    haystack.includes("literature") ||
    haystack.includes("литератур")
  ) {
    suggestions.add("BOOKS");
  }

  if (
    haystack.includes("на открито") ||
    haystack.includes("outdoor") ||
    haystack.includes("park") ||
    haystack.includes("парк") ||
    haystack.includes("track") ||
    haystack.includes("писта")
  ) {
    suggestions.add("OUTDOOR");
  }

  return Array.from(suggestions);
}

export function parseRuseOnTheDanubeEventPage(
  html: string,
  pageUrl: string,
): RuseOnTheDanubeImportResult | null {
  const title = extractTitle(html);
  const description = extractDescriptionHtml(html);
  const { startDate, endDate, startTime, endTime } = extractDateTimeParts(html);
  const place = extractVenue(html);
  const address = extractAddress(html, place);
  const sourceUrl = extractSourceUrl(html, pageUrl);
  const organizers = extractOrganizer(html);
  const category = extractCategory(html);

  if (!title || (!startDate && !place && !description)) {
    return null;
  }

  return {
    title,
    description,
    startDate,
    endDate: endDate || startDate,
    startTime,
    endTime,
    address,
    place,
    town: "",
    organizers,
    ticketsLink: "",
    fbLink: isFacebookUrl(sourceUrl) ? sourceUrl : "",
    price: "",
    coverImageUrl:
      toAbsoluteUrl(extractMetaContent(html, "og:image"), pageUrl) || null,
    tagSuggestions: extractTagSuggestions(title, description, place, category),
  };
}
