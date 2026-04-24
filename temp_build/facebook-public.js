"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePublicFacebookEventPage = parsePublicFacebookEventPage;
const HTML_ENTITIES = {
    amp: "&",
    apos: "'",
    nbsp: " ",
    quot: '"',
};
const BULGARIAN_MONTHS = {
    януари: "01",
    февруари: "02",
    март: "03",
    април: "04",
    май: "05",
    юни: "06",
    юли: "07",
    август: "08",
    септември: "09",
    октомври: "10",
    ноември: "11",
    декември: "12",
};
const ENGLISH_MONTHS = {
    january: "01",
    february: "02",
    march: "03",
    april: "04",
    may: "05",
    june: "06",
    july: "07",
    august: "08",
    september: "09",
    october: "10",
    november: "11",
    december: "12",
};
function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function decodeHtmlEntities(value) {
    return value
        .replace(/&#(\d+);/g, (_, code) => {
        const parsed = Number.parseInt(code, 10);
        return Number.isFinite(parsed) ? String.fromCodePoint(parsed) : _;
    })
        .replace(/&#x([\da-f]+);/gi, (_, code) => {
        const parsed = Number.parseInt(code, 16);
        return Number.isFinite(parsed) ? String.fromCodePoint(parsed) : _;
    })
        .replace(/&([a-z]+);/gi, (match, entity) => { var _a; return (_a = HTML_ENTITIES[entity]) !== null && _a !== void 0 ? _a : match; });
}
function collapseWhitespace(value) {
    return value.replace(/\s+/g, " ").trim();
}
function extractMetaContent(html, key) {
    const escapedKey = escapeRegExp(key);
    const patterns = [
        new RegExp(`<meta[^>]+(?:property|name)=["']${escapedKey}["'][^>]+content=["']([^"']*)["'][^>]*>`, "i"),
        new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escapedKey}["'][^>]*>`, "i"),
    ];
    for (const pattern of patterns) {
        const match = html.match(pattern);
        if (match === null || match === void 0 ? void 0 : match[1]) {
            return collapseWhitespace(decodeHtmlEntities(match[1]));
        }
    }
    return "";
}
function extractTitle(html) {
    const ogTitle = extractMetaContent(html, "og:title");
    if (ogTitle)
        return ogTitle;
    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
    return (titleMatch === null || titleMatch === void 0 ? void 0 : titleMatch[1]) ? collapseWhitespace(decodeHtmlEntities(titleMatch[1])) : "";
}
function normalizeKnownTown(value) {
    const normalized = collapseWhitespace(value);
    const lower = normalized.toLowerCase();
    if (lower === "ruse")
        return "Русе";
    if (lower === "sofia")
        return "София";
    if (lower === "varna")
        return "Варна";
    if (lower === "plovdiv")
        return "Пловдив";
    if (lower === "burgas")
        return "Бургас";
    return normalized;
}
function toDisplayTextFromSlug(value) {
    return collapseWhitespace(decodeURIComponent(value).replace(/[-_]+/g, " "))
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0].toLocaleUpperCase("bg-BG") + word.slice(1))
        .join(" ");
}
function extractPlace(html) {
    const ogUrl = extractMetaContent(html, "og:url");
    if (!ogUrl)
        return "";
    try {
        const parsedUrl = new URL(ogUrl);
        const segments = parsedUrl.pathname.split("/").filter(Boolean);
        const eventsIndex = segments.findIndex((segment) => segment === "events");
        if (eventsIndex === -1)
            return "";
        const placeSlug = segments[eventsIndex + 1];
        if (!placeSlug || /^\d+$/.test(placeSlug)) {
            return "";
        }
        return toDisplayTextFromSlug(placeSlug);
    }
    catch (_a) {
        return "";
    }
}
function extractTown(title, description) {
    const bgMatch = description.match(/Събитие в\s+(.+?)\s+от\s+/i);
    if (bgMatch === null || bgMatch === void 0 ? void 0 : bgMatch[1]) {
        return normalizeKnownTown(bgMatch[1]);
    }
    const enMatch = description.match(/Event in\s+(.+?)\s+by\s+/i);
    if (enMatch === null || enMatch === void 0 ? void 0 : enMatch[1]) {
        return normalizeKnownTown(enMatch[1]);
    }
    const titleMatch = title.match(/\|\s*\d{1,2}\.\d{1,2}\s*-\s*(.+)$/i);
    if (titleMatch === null || titleMatch === void 0 ? void 0 : titleMatch[1]) {
        return normalizeKnownTown(titleMatch[1]);
    }
    return "";
}
function extractOrganizer(description) {
    const bgMatch = description.match(/\bот\s+(.+?)\s+на\s+/i);
    if (bgMatch === null || bgMatch === void 0 ? void 0 : bgMatch[1]) {
        return [{ name: collapseWhitespace(bgMatch[1]), link: "" }];
    }
    const enMatch = description.match(/\bby\s+(.+?)\s+on\s+/i);
    if (enMatch === null || enMatch === void 0 ? void 0 : enMatch[1]) {
        return [{ name: collapseWhitespace(enMatch[1]), link: "" }];
    }
    return [];
}
function toIsoDate(year, month, day) {
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}
function extractDateFromTitleAndDescription(title, description) {
    const yearMatch = description.match(/\b(20\d{2})\b/);
    const dayMonthMatch = title.match(/\b(\d{1,2})\.(\d{1,2})\b/);
    if ((yearMatch === null || yearMatch === void 0 ? void 0 : yearMatch[1]) && (dayMonthMatch === null || dayMonthMatch === void 0 ? void 0 : dayMonthMatch[1]) && (dayMonthMatch === null || dayMonthMatch === void 0 ? void 0 : dayMonthMatch[2])) {
        return toIsoDate(yearMatch[1], dayMonthMatch[2], dayMonthMatch[1]);
    }
    const bgTextualMatch = description.match(/\b([а-я]+),\s+([а-я]+)\s+(\d{1,2})\s+(20\d{2})\b/i);
    if ((bgTextualMatch === null || bgTextualMatch === void 0 ? void 0 : bgTextualMatch[2]) && (bgTextualMatch === null || bgTextualMatch === void 0 ? void 0 : bgTextualMatch[3]) && (bgTextualMatch === null || bgTextualMatch === void 0 ? void 0 : bgTextualMatch[4])) {
        const month = BULGARIAN_MONTHS[bgTextualMatch[2].toLowerCase()];
        if (month) {
            return toIsoDate(bgTextualMatch[4], month, bgTextualMatch[3]);
        }
    }
    const enTextualMatch = description.match(/\b(?:on\s+)?([A-Za-z]+)\s+(\d{1,2}),?\s+(20\d{2})\b/i);
    if ((enTextualMatch === null || enTextualMatch === void 0 ? void 0 : enTextualMatch[1]) && (enTextualMatch === null || enTextualMatch === void 0 ? void 0 : enTextualMatch[2]) && (enTextualMatch === null || enTextualMatch === void 0 ? void 0 : enTextualMatch[3])) {
        const month = ENGLISH_MONTHS[enTextualMatch[1].toLowerCase()];
        if (month) {
            return toIsoDate(enTextualMatch[3], month, enTextualMatch[2]);
        }
    }
    return "";
}
function extractStartTime(title, description) {
    const sources = [title, description];
    for (const source of sources) {
        const match = source.match(/\b(\d{1,2}:\d{2})\b/);
        if (match === null || match === void 0 ? void 0 : match[1]) {
            const [hours, minutes] = match[1].split(":");
            return `${hours.padStart(2, "0")}:${minutes}`;
        }
    }
    return "";
}
function extractTagSuggestions(title, description) {
    const haystack = `${title} ${description}`.toLowerCase();
    const suggestions = new Set();
    if (haystack.includes("концерт")) {
        suggestions.add("CONCERT");
    }
    if (haystack.includes("музик") ||
        haystack.includes("пиаф") ||
        haystack.includes("tour") ||
        haystack.includes("турне")) {
        suggestions.add("MUSIC");
    }
    if (haystack.includes("теат") || haystack.includes("постановк")) {
        suggestions.add("THEATRE");
    }
    return Array.from(suggestions);
}
function parsePublicFacebookEventPage(html, pageUrl) {
    const title = extractTitle(html);
    if (!title)
        return null;
    const description = extractMetaContent(html, "og:description");
    const town = extractTown(title, description);
    const place = extractPlace(html);
    const startDate = extractDateFromTitleAndDescription(title, description);
    const startTime = extractStartTime(title, description);
    return {
        title,
        description,
        startDate,
        endDate: startDate,
        startTime,
        endTime: "",
        address: "",
        place,
        town,
        organizers: extractOrganizer(description),
        ticketsLink: "",
        price: "",
        coverImageUrl: extractMetaContent(html, "og:image") || null,
        tagSuggestions: extractTagSuggestions(title, description),
    };
}
