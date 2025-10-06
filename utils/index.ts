import { type ClassValue, clsx } from "clsx";
import { format, isValid, parseISO } from "date-fns";
import { bg } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ScreenSize = "sm" | "md" | "lg" | "xl" | "2xl";
export function getMinWidth(name: `--breakpoint-${ScreenSize}`) {
  return `(min-width: ${getCssVar(name)})`;
}

export function getCssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name);
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
