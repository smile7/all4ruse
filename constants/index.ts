export const EVENTS_BUCKET = "event-images";
export const THEME_STORE_KEY = "theme";
export const FALLBACK_IMAGE = "/no-image.png";
export const DEFAULT_AVATAR = "/cat.png";
export const DEBOUNCE_MS = 400;
export const EMPTY_DISPLAY = "—";

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

export const TAG_LABELS_BG: Record<string, string> = {
  COMEDY: "КОМЕДИЯ",
  THEATRE: "ТЕАТЪР",
  ART: "ИЗКУСТВО",
  CONCERT: "КОНЦЕРТ",
  SPORTS: "СПОРТ",
  KIDS: "ДЕЦА",
  ENGLISH: "АНГЛИЙСКИ ЕЗИК",
  HIKE: "ПРЕХОД",
  PARTY: "ПАРТИ",
  THERAPY: "ТЕРАПИЯ",
  DANCES: "ТАНЦИ",
  RESTAURANTS: "РЕСТОРАНТИ",
  MUSIC: "МУЗИКА",
  LEARNING: "ОБУЧЕНИЕ",
  COMPETITION: "СЪСТЕЗАНИЕ",
  QUIZ: "КУИЗ",
  LECTURE: "ЛЕКЦИЯ",
  CINEMA: "КИНО",
  FEST: "ФЕСТИВАЛ",
  WORKSHOP: "РАБОТИЛНИЦА",
  EXHIBITION: "ИЗЛОЖБА",
  BOOKS: "КНИГИ",
  FOOD: "ХРАНА",
  TECHNOLOGY: "ТЕХНОЛОГИИ",
  VOLUNTEERING: "ДОБРОВОЛЧЕСТВО",
  FAIR: "БАЗАР",
  OUTDOOR: "НА ОТКРИТО",
  HISTORY: "ИСТОРИЯ",
  NETWORKING: "НЕТУЪРКИНГ",
  INFANTS: "БЕБЕТА",
};
