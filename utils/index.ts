import { type ClassValue, clsx } from "clsx";
import { format, isValid, parseISO } from "date-fns";
import { bg } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

import { BREAKPOINTS, ScreenSize } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getMinWidth(name: `--breakpoint-${ScreenSize}`) {
  const key = name.replace("--breakpoint-", "") as ScreenSize;
  return `(min-width: ${BREAKPOINTS[key]})`;
}

export function formatDate(dt: string | null) {
  if (!dt) return "—";
  const date = parseISO(dt);
  if (!isValid(date)) return dt;
  return format(date, "d MMM yyyy HH:mm", { locale: bg });
}

export function getString(fd: FormData, key: string) {
  const v = fd.get(key);
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed.length ? trimmed : null;
}
