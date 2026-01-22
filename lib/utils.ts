import { type ClassValue, clsx } from "clsx";
import { format, isValid, parseISO } from "date-fns";
import { bg } from "date-fns/locale";
import { twMerge } from "tailwind-merge";
import { slugify as transliterate } from "transliteration";

import { BREAKPOINTS, EMPTY_DISPLAY, ScreenSize } from "@/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getMinWidth(name: `--breakpoint-${ScreenSize}`) {
  const key = name.replace("--breakpoint-", "") as ScreenSize;
  return `(min-width: ${BREAKPOINTS[key]})`;
}

export function toTimestamp(value?: string | null): number | null {
  if (!value) return null;
  const d = parseISO(value);
  return isValid(d) ? d.getTime() : null;
}

export function formatTimeTZ(timetz: string | null) {
  if (!timetz) return "";
  return timetz.slice(0, 5); // "HH:MM"
}

export function formatDateTime(value?: string | null) {
  if (!value) return EMPTY_DISPLAY;
  const d = parseISO(value);
  if (!isValid(d)) return EMPTY_DISPLAY;
  return format(d, "d MMM yyyy HH:mm", { locale: bg });
}

export function formatDate(value?: string | null) {
  if (!value) return EMPTY_DISPLAY;
  const d = parseISO(value);
  if (!isValid(d)) return EMPTY_DISPLAY;
  return format(d, "d MMM yyyy", { locale: bg });
}

export function formatShortDate(
  value?: string | null,
  localeCode: "bg" | "en" = "bg",
) {
  if (!value) return EMPTY_DISPLAY;
  const d = parseISO(value);
  if (!isValid(d)) return EMPTY_DISPLAY;

  if (localeCode === "bg") {
    return format(d, "d MMM", { locale: bg });
  }

  // Default to English month abbreviations when not Bulgarian
  return format(d, "d MMM");
}

export function formatTimeRange(
  startTime?: string | null,
  endTime?: string | null,
): string {
  if (!startTime) return "";
  if (!endTime || endTime === startTime) return formatTimeTZ(startTime);
  return `${formatTimeTZ(startTime)} - ${formatTimeTZ(endTime)}`;
}

export function formatDateRange(
  startDate?: string | null,
  endDate?: string | null,
): string {
  if (!startDate) return "";
  if (!endDate || endDate === startDate) return formatDate(startDate);
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

export function getString(fd: FormData, key: string) {
  const v = fd.get(key);
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed.length ? trimmed : null;
}

export function normalizeError(error: unknown): string | string[] {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An error occurred.";
}

export function slugify(title: string): string {
  const custom = title
    .replace(/ъ/g, "y")
    .replace(/Ъ/g, "Y")
    .replace(/ьо/g, "yo");
  return transliterate(custom)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Convert simple HTML produced by the editor (mainly <p>, <br>)
// into plain text with newline characters so that
// CSS `white-space: pre-wrap` can faithfully render line breaks.
export function htmlToPlainWithNewlines(value?: string | null): string {
  if (!value) return "";

  let text = value;

  // Normalize paragraph and line break tags into newlines
  text = text.replace(/<br\s*\/?>(\s*)/gi, "\n");
  text = text.replace(/<\/p>/gi, "\n");
  text = text.replace(/<p[^>]*>/gi, "");

  // Strip any remaining HTML tags
  text = text.replace(/<[^>]+>/g, "");

  // Decode a few common entities so text looks natural
  text = text.replace(/&nbsp;/gi, " ");
  text = text.replace(/&amp;/gi, "&");
  text = text.replace(/&lt;/gi, "<");
  text = text.replace(/&gt;/gi, ">");

  // Numeric entities (decimal and hex), including emoji code points
  text = text.replace(/&#(\d+);/g, (_, num: string) =>
    String.fromCodePoint(Number(num)),
  );
  text = text.replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) =>
    String.fromCodePoint(parseInt(hex, 16)),
  );

  return text.trimEnd();
}
