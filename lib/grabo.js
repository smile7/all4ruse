import type { Host } from "./api";

type GraboEventJsonLd = {
  "@type"?: string;
  name?: string;
  description?: string;
  image?: string;
  startDate?: string;
  offers?: {
    price?: string;
  };
  location?: {
    address?: {
      addressLocality?: string;
    };
  };
  performer?: {
    name?: string;
  };
};

export type GraboImportResult = {
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
    .replace(/>\s+</g, "><")
    .replace(/\s*<br\s*\/?>\s*/gi, "<br />")
    .replace(/(?:<br \/>){3,}/g, "<br /><br />")
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

function extractTitle(html: string): string {
  const ogTitle = extractMetaContent(html, "og:title");
  if (ogTitle) return ogTitle;

  const headingMatch = html.match(
    /<h1[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>[\s\S]*?<\/h1>/i,
  );
  if (headingMatch?.[1]) {
    return stripTags(headingMatch[1]);
  }

  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (!titleMatch?.[1]) return "";

  return stripTags(titleMatch[1])
    .replace(/\s*\|\s*Grabo\.bg.*$/i, "")
    .trim();
}

function extractEventJsonLd(html: string): GraboEventJsonLd | null {
  const matches = html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );

  for (const match of matches) {
    const raw = decodeHtmlEntities(match[1]?.trim() ?? "");
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw) as GraboEventJsonLd | GraboEventJsonLd[];
      const candidates = Array.isArray(parsed) ? parsed : [parsed];

      for (const candidate of candidates) {
        if (candidate?.["@type"] === "Event") {
          return candidate;
        }
      }
    } catch {
      continue;
    }
  }

  return null;
}

function extractDescriptionHtml(html: string): string {
  const match = html.match(
    /<div class="deal_descr_extrabox[^"]*">[\s\S]*?<div class="dde-content">\s*([\s\S]*?)\s*<\/div>\s*<\/div>/i,
  );

  if (match?.[1]) {
    return normalizeHtmlSnippet(match[1]);
  }

  return extractMetaContent(html, "description");
}

function extractAddress(html: string): string {
  const match = html.match(
    /<strong class="nvp_mapbox_extra"[^>]*>[\s\S]*?<b>([\s\S]*?)<\/b>[\s\S]*?<\/strong>/i,
  );

  if (match?.[1]) {
    return stripTags(match[1]);
  }

  return extractMetaContent(html, "og:street-address");
}

function extractTitleLocation(title: string): string {
  const markerIndex = title.lastIndexOf(" в ");
  if (markerIndex === -1) return "";

  return title.slice(markerIndex + 3).trim();
}

function cleanPlace(location: string, town: string): string {
  if (!location) return "";

  let value = collapseWhitespace(location);
  if (town) {
    value = value.replace(
      new RegExp(`\\s*[-,–—]\\s*${escapeRegExp(town)}$`, "i"),
      "",
    );
  }

  return value.trim();
}

function extractTown(
  address: string,
  eventJsonLd: GraboEventJsonLd | null,
): string {
  if (address) {
    const [segment] = address.split(",");
    if (segment?.trim()) {
      return collapseWhitespace(segment);
    }
  }

  return collapseWhitespace(
    eventJsonLd?.location?.address?.addressLocality ?? "",
  );
}

function formatPrice(value: number): string {
  return Number.isInteger(value)
    ? value.toString()
    : value
        .toFixed(2)
        .replace(/\.0+$/, "")
        .replace(/(\.\d*[1-9])0+$/, "$1");
}

function extractPrice(html: string, fallbackPrice: string | undefined): string {
  const tableMatch = html.match(
    /<table class="dealview-variants-table[^"]*">([\s\S]*?)<\/table>/i,
  );
  const source = tableMatch?.[1] ?? html;
  const matches = source.matchAll(
    /(\d+(?:[.,]\d+)?)\s*<small>\s*€\s*<\/small>/gi,
  );
  const values = Array.from(matches)
    .map((match) => Number.parseFloat(match[1].replace(",", ".")))
    .filter((value) => Number.isFinite(value));

  if (values.length > 0) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    return min === max
      ? formatPrice(min)
      : `${formatPrice(min)}-${formatPrice(max)}`;
  }

  const fallback = Number.parseFloat((fallbackPrice ?? "").replace(",", "."));
  return Number.isFinite(fallback) ? formatPrice(fallback) : "";
}

function extractStartTime(
  title: string,
  description: string,
  eventJsonLd: GraboEventJsonLd | null,
): string {
  const sources = [eventJsonLd?.name ?? "", title, stripTags(description)];

  for (const source of sources) {
    const match = source.match(/от\s+(\d{1,2}:\d{2})\s*ч/i);
    if (match?.[1]) {
      const [hours, minutes] = match[1].split(":");
      return `${hours.padStart(2, "0")}:${minutes}`;
    }
  }

  return "";
}

function extractDatePart(value: string | undefined): string {
  const match = value?.match(/\d{4}-\d{2}-\d{2}/);
  return match?.[0] ?? "";
}

function extractOrganizer(
  html: string,
  pageUrl: string,
  fallbackName: string | undefined,
): Host[] {
  const match = html.match(
    /<div class="dv3_business_name">[\s\S]*?<a href="([^"]+)">([\s\S]*?)<\/a>/i,
  );

  if (match?.[1] && match?.[2]) {
    return [
      {
        name: stripTags(match[2]),
        link: toAbsoluteUrl(match[1], pageUrl),
      },
    ];
  }

  const fallback = collapseWhitespace(fallbackName ?? "");
  return fallback ? [{ name: fallback, link: "" }] : [];
}

function extractTagSuggestions(
  title: string,
  description: string,
  place: string,
): string[] {
  const haystack = `${title} ${stripTags(description)} ${place}`.toLowerCase();
  const suggestions = new Set<string>();

  if (haystack.includes("комед")) {
    suggestions.add("COMEDY");
  }

  if (haystack.includes("теат") || haystack.includes("постановк")) {
    suggestions.add("THEATRE");
  }

  if (haystack.includes("концерт")) {
    suggestions.add("CONCERT");
  }

  if (haystack.includes("музик")) {
    suggestions.add("MUSIC");
  }

  if (
    haystack.includes("на открито") ||
    haystack.includes("летен театър") ||
    haystack.includes("амфитеатър")
  ) {
    suggestions.add("OUTDOOR");
  }

  if (haystack.includes("опера")) {
    suggestions.add("OPERA");
  }

  return Array.from(suggestions);
}

export function parseGraboEventPage(
  html: string,
  pageUrl: string,
): GraboImportResult | null {
  const eventJsonLd = extractEventJsonLd(html);
  const title = extractTitle(html);

  if (!title) {
    return null;
  }

  const description = extractDescriptionHtml(html);
  const address = extractAddress(html);
  const town = extractTown(address, eventJsonLd);
  const place = cleanPlace(extractTitleLocation(title), town);
  const startDate = extractDatePart(eventJsonLd?.startDate);
  const startTime = extractStartTime(title, description, eventJsonLd);
  const organizers = extractOrganizer(
    html,
    pageUrl,
    eventJsonLd?.performer?.name,
  );
  const coverImageUrl =
    toAbsoluteUrl(
      extractMetaContent(html, "og:image") || eventJsonLd?.image,
      pageUrl,
    ) || null;

  return {
    title,
    description,
    startDate,
    endDate: startDate,
    startTime,
    endTime: "",
    address,
    place,
    town,
    organizers,
    ticketsLink: pageUrl,
    price: extractPrice(html, eventJsonLd?.offers?.price),
    coverImageUrl,
    tagSuggestions: extractTagSuggestions(title, description, place),
  };
}
