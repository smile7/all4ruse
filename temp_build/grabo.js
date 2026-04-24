"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseGraboEventPage = parseGraboEventPage;
const HTML_ENTITIES = {
    amp: "&",
    apos: "'",
    nbsp: " ",
    quot: '"',
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
function stripTags(value) {
    return collapseWhitespace(decodeHtmlEntities(value
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<[^>]+>/g, " ")));
}
function normalizeHtmlSnippet(value) {
    return decodeHtmlEntities(value)
        .replace(/\r/g, "")
        .replace(/>\s+</g, "><")
        .replace(/\s*<br\s*\/?>\s*/gi, "<br />")
        .replace(/(?:<br \/>){3,}/g, "<br /><br />")
        .trim();
}
function toAbsoluteUrl(value, baseUrl) {
    if (!value)
        return "";
    try {
        return new URL(decodeHtmlEntities(value.trim()), baseUrl).toString();
    }
    catch (_a) {
        return "";
    }
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
            return decodeHtmlEntities(match[1]).trim();
        }
    }
    return "";
}
function extractTitle(html) {
    const ogTitle = extractMetaContent(html, "og:title");
    if (ogTitle)
        return ogTitle;
    const headingMatch = html.match(/<h1[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>[\s\S]*?<\/h1>/i);
    if (headingMatch === null || headingMatch === void 0 ? void 0 : headingMatch[1]) {
        return stripTags(headingMatch[1]);
    }
    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
    if (!(titleMatch === null || titleMatch === void 0 ? void 0 : titleMatch[1]))
        return "";
    return stripTags(titleMatch[1])
        .replace(/\s*\|\s*Grabo\.bg.*$/i, "")
        .trim();
}
function extractEventJsonLd(html) {
    var _a, _b;
    const matches = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    for (const match of matches) {
        const raw = decodeHtmlEntities((_b = (_a = match[1]) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : "");
        if (!raw)
            continue;
        try {
            const parsed = JSON.parse(raw);
            const candidates = Array.isArray(parsed) ? parsed : [parsed];
            for (const candidate of candidates) {
                if ((candidate === null || candidate === void 0 ? void 0 : candidate["@type"]) === "Event") {
                    return candidate;
                }
            }
        }
        catch (_c) {
            continue;
        }
    }
    return null;
}
function extractDescriptionHtml(html) {
    const match = html.match(/<div class="deal_descr_extrabox[^"]*">[\s\S]*?<div class="dde-content">\s*([\s\S]*?)\s*<\/div>\s*<\/div>/i);
    if (match === null || match === void 0 ? void 0 : match[1]) {
        return normalizeHtmlSnippet(match[1]);
    }
    return extractMetaContent(html, "description");
}
function extractAddress(html) {
    const match = html.match(/<strong class="nvp_mapbox_extra"[^>]*>[\s\S]*?<b>([\s\S]*?)<\/b>[\s\S]*?<\/strong>/i);
    if (match === null || match === void 0 ? void 0 : match[1]) {
        return stripTags(match[1]);
    }
    return extractMetaContent(html, "og:street-address");
}
function extractTitleLocation(title) {
    const markerIndex = title.lastIndexOf(" в ");
    if (markerIndex === -1)
        return "";
    return title.slice(markerIndex + 3).trim();
}
function cleanPlace(location, town) {
    if (!location)
        return "";
    let value = collapseWhitespace(location);
    if (town) {
        value = value.replace(new RegExp(`\\s*[-,–—]\\s*${escapeRegExp(town)}$`, "i"), "");
    }
    return value.trim();
}
function extractTown(address, eventJsonLd) {
    var _a, _b, _c;
    if (address) {
        const [segment] = address.split(",");
        if (segment === null || segment === void 0 ? void 0 : segment.trim()) {
            return collapseWhitespace(segment);
        }
    }
    return collapseWhitespace((_c = (_b = (_a = eventJsonLd === null || eventJsonLd === void 0 ? void 0 : eventJsonLd.location) === null || _a === void 0 ? void 0 : _a.address) === null || _b === void 0 ? void 0 : _b.addressLocality) !== null && _c !== void 0 ? _c : "");
}
function formatPrice(value) {
    return Number.isInteger(value)
        ? value.toString()
        : value
            .toFixed(2)
            .replace(/\.0+$/, "")
            .replace(/(\.\d*[1-9])0+$/, "$1");
}
function extractPrice(html, fallbackPrice) {
    var _a;
    const tableMatch = html.match(/<table class="dealview-variants-table[^"]*">([\s\S]*?)<\/table>/i);
    const source = (_a = tableMatch === null || tableMatch === void 0 ? void 0 : tableMatch[1]) !== null && _a !== void 0 ? _a : html;
    const matches = source.matchAll(/(\d+(?:[.,]\d+)?)\s*<small>\s*€\s*<\/small>/gi);
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
    const fallback = Number.parseFloat((fallbackPrice !== null && fallbackPrice !== void 0 ? fallbackPrice : "").replace(",", "."));
    return Number.isFinite(fallback) ? formatPrice(fallback) : "";
}
function extractStartTime(title, description, eventJsonLd) {
    var _a;
    const sources = [(_a = eventJsonLd === null || eventJsonLd === void 0 ? void 0 : eventJsonLd.name) !== null && _a !== void 0 ? _a : "", title, stripTags(description)];
    for (const source of sources) {
        const match = source.match(/от\s+(\d{1,2}:\d{2})\s*ч/i);
        if (match === null || match === void 0 ? void 0 : match[1]) {
            const [hours, minutes] = match[1].split(":");
            return `${hours.padStart(2, "0")}:${minutes}`;
        }
    }
    return "";
}
function extractDatePart(value) {
    var _a;
    const match = value === null || value === void 0 ? void 0 : value.match(/\d{4}-\d{2}-\d{2}/);
    return (_a = match === null || match === void 0 ? void 0 : match[0]) !== null && _a !== void 0 ? _a : "";
}
function extractOrganizer(html, pageUrl, fallbackName) {
    const match = html.match(/<div class="dv3_business_name">[\s\S]*?<a href="([^"]+)">([\s\S]*?)<\/a>/i);
    if ((match === null || match === void 0 ? void 0 : match[1]) && (match === null || match === void 0 ? void 0 : match[2])) {
        return [
            {
                name: stripTags(match[2]),
                link: toAbsoluteUrl(match[1], pageUrl),
            },
        ];
    }
    const fallback = collapseWhitespace(fallbackName !== null && fallbackName !== void 0 ? fallbackName : "");
    return fallback ? [{ name: fallback, link: "" }] : [];
}
function extractTagSuggestions(title, description, place) {
    const haystack = `${title} ${stripTags(description)} ${place}`.toLowerCase();
    const suggestions = new Set();
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
    if (haystack.includes("на открито") ||
        haystack.includes("летен театър") ||
        haystack.includes("амфитеатър")) {
        suggestions.add("OUTDOOR");
    }
    if (haystack.includes("опера")) {
        suggestions.add("OPERA");
    }
    return Array.from(suggestions);
}
function parseGraboEventPage(html, pageUrl) {
    var _a, _b;
    const eventJsonLd = extractEventJsonLd(html);
    const title = extractTitle(html);
    if (!title) {
        return null;
    }
    const description = extractDescriptionHtml(html);
    const address = extractAddress(html);
    const town = extractTown(address, eventJsonLd);
    const place = cleanPlace(extractTitleLocation(title), town);
    const startDate = extractDatePart(eventJsonLd === null || eventJsonLd === void 0 ? void 0 : eventJsonLd.startDate);
    const startTime = extractStartTime(title, description, eventJsonLd);
    const organizers = extractOrganizer(html, pageUrl, (_a = eventJsonLd === null || eventJsonLd === void 0 ? void 0 : eventJsonLd.performer) === null || _a === void 0 ? void 0 : _a.name);
    const coverImageUrl = toAbsoluteUrl(extractMetaContent(html, "og:image") || (eventJsonLd === null || eventJsonLd === void 0 ? void 0 : eventJsonLd.image), pageUrl) || null;
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
        price: extractPrice(html, (_b = eventJsonLd === null || eventJsonLd === void 0 ? void 0 : eventJsonLd.offers) === null || _b === void 0 ? void 0 : _b.price),
        coverImageUrl,
        tagSuggestions: extractTagSuggestions(title, description, place),
    };
}
