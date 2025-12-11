export const BUCKET = "event-images";
export const THEME_STORE_KEY = "theme";
export const FALLBACK_IMAGE = "/no-image.png";
export const DEBOUNCE_MS = 400;
export const EMPTY_DISPLAY = "—";

export const DEFAULT_AVATAR =
  "https://lohdrrezrtmcupuogytt.supabase.co/storage/v1/object/public/avatars/cat.png";

export const BREAKPOINTS = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

export type ScreenSize = keyof typeof BREAKPOINTS;

export type UploadedImage = {
  url: string;
  path: string;
};
