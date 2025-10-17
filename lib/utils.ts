import { type ClassValue, clsx } from "clsx";
import { format, isValid, parseISO } from "date-fns";
import { bg } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

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

export function formatShortDate(value?: string | null) {
  if (!value) return EMPTY_DISPLAY;
  const d = parseISO(value);
  if (!isValid(d)) return EMPTY_DISPLAY;
  return format(d, "d MMM", { locale: bg });
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
