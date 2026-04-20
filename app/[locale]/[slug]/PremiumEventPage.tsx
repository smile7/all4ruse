import type { ComponentType } from "react";

import Image from "next/image";
import Link from "next/link";
import {
  BuildingIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  ClockIcon,
  Music4Icon,
  TicketIcon,
} from "lucide-react";

import BackButton from "@/components/BackButton/BackButton";
import { EventShareButton } from "@/components/EventShareButton";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ScrollToTopOnMount } from "@/components/ScrollToTopOnMount";
import { ThemeToggle } from "@/components/theme";
import { Typography } from "@/components/Typography";
import { CoverFlow, type CoverFlowItem } from "@/components/ui/coverflow";
import { Button } from "@/components/ui";
import type { Event, Tag } from "@/lib/api";

export const PREMIUM_EVENT_ID = 298;

const PREMIUM_EVENT_LAYOUT_CSS = `
  [data-slot="sidebar"],
  [data-slot="sidebar-gap"] {
    display: none !important;
  }

  [data-slot="sidebar-inset"] {
    margin: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
  }

  [data-slot="sidebar-inset"] > header {
    display: none !important;
  }

  [data-slot="sidebar-inset"] > div {
    padding: 0 !important;
  }

  [data-slot="sidebar-inset"] > div > div {
    max-width: none !important;
    padding-bottom: 0 !important;
  }
`;

const VINOFRENIA_VIDEO_SRC = "/sponsors/vinofrenia.mp4";
const VINOFRENIA_TITLE = "ВИНОФРЕНИЯ '26";
const PREMIUM_GALLERY_IMAGES = [
  "/sponsors/food.jpg",
  "/sponsors/art.jpg",
  "/sponsors/music.JPG",
  "/sponsors/atmosphere.JPG",
  "/sponsors/wine.JPG",
  "/sponsors/dj.JPG",
  "/sponsors/kids.jpg",
] as const;

const PREMIUM_COVERFLOW_ITEMS: readonly CoverFlowItem[] = [
  {
    id: "wine",
    image: "/sponsors/wine.JPG",
    title: "31 български изби",
    subtitle: "Над 200 вина за дегустация на едно място.",
  },
  {
    id: "food",
    image: "/sponsors/food.jpg",
    title: "Храна на място",
    subtitle: "Вкусове и партньори, подбрани да вървят с виното.",
  },
  {
    id: "art",
    image: "/sponsors/art.jpg",
    title: "Арт матине",
    subtitle: "Ръчно създадени детайли, визуални акценти и фестивална среда.",
  },
  {
    id: "music",
    image: "/sponsors/music.JPG",
    title: "Музика на живо",
    subtitle: "Концерти и ритъм, които държат енергията до късно.",
  },
  {
    id: "dj",
    image: "/sponsors/dj.JPG",
    title: "DJ селекция",
    subtitle: "Залез, настроение и плавен преход към вечерната програма.",
  },
  {
    id: "atmosphere",
    image: "/sponsors/atmosphere.JPG",
    title: "Фестивална атмосфера",
    subtitle: "Градски двор, хора, светлини и пролетен Русе.",
  },
  {
    id: "kids",
    image: "/sponsors/kids.jpg",
    title: "Детска зона",
    subtitle: "Пространство и активности за семейства през целия ден.",
  },
] as const;

const VINOFRENIA_STORY = [
  "И тази година фестивалът ще се проведе в двора на Военен клуб Русе.",
  "След силното първо издание през 2025 г., Винофрения 2026 надгражда формата с повече участници, повече изкуство и още по-добро фестивално преживяване.",
] as const;

type FestivalMetaItem = {
  label: string;
  value: string;
  Icon: ComponentType<{ className?: string }>;
};

const VINOFRENIA_META: FestivalMetaItem[] = [
  {
    label: "Локация",
    value: "Военен клуб Русе",
    Icon: BuildingIcon,
  },
  {
    label: "Дати",
    value: "01 и 02 май 2026",
    Icon: CalendarDaysIcon,
  },
  {
    label: "Часове",
    value: "15:00ч. - 22:00ч.",
    Icon: ClockIcon,
  },
];

const VINOFRENIA_HIGHLIGHTS = [
  {
    title: "31 български изби",
    description:
      "Селекция от 31 изби от всички винени региони на България и възможност да опитате над 200 различни вина.",
    tone: "border-amber-500/20 bg-gradient-to-br from-amber-500/15 via-background to-background",
  },
  {
    title: "Храна на място",
    description:
      "Готвачи на живо, фермерски продукти и внимателно подбрани кулинарни партньори.",
    tone: "border-orange-500/20 bg-gradient-to-br from-orange-500/15 via-background to-background",
  },
  {
    title: "Арт матине",
    description:
      "В зоната за релакс ще откриеш няколко творчески ателиета и малък арт базар от ръчно създадени предмети.",
    tone: "border-rose-500/20 bg-gradient-to-br from-rose-500/15 via-background to-background",
  },
  {
    title: "Музика и концерти",
    description:
      "Вечерна програма с музика и концерти, които поддържат ритъма на фестивала до късно.",
    tone: "border-red-500/20 bg-gradient-to-br from-red-500/15 via-background to-background",
  },
  {
    title: "Детска зона",
    description:
      "Пространство и забавни активности за деца, за да може фестивалът да бъде празник за всички поколения.",
    tone: "border-emerald-500/20 bg-gradient-to-br from-emerald-500/15 via-background to-background",
  },
  {
    title: "Приятелска атмосфера",
    description:
      "Спокойна и приятелска атмосфера, в която можеш да се срещнеш с приятели и да се насладиш на виното.",
    tone: "border-sky-500/20 bg-gradient-to-br from-sky-500/15 via-background to-background",
  },
] as const;

const VINOFRENIA_TICKET_PHASES = [
  {
    title: "Стандартни билети",
    period: "",
    tickets: [
      { label: "Еднодневен билет", value: "16 евро" },
      { label: "Двудневен билет", value: "27 евро" },
    ],
  },
] as const;

const VINOFRENIA_TICKET_NOTE =
  "В цената на билета са включени брандирана дегустационна чаша и възможност да дегустирате над 200 вина от 30 български изби, да присъствате на вечерните концерти на фестивала и да се възползвате от детската зона.";

const VINOFRENIA_CLOSING = "когато виното среща хората";

const VINOFRENIA_BANDS = [
  {
    name: "Red Wine Society",
    time: "Петък вечер",
    description:
      "Петъчната вечер завършва с Red Wine Society. Група музиканти, събрали се специално за вас!",
    imageSrc: "/sponsors/music1.jpg",
    hashtags: ["#Петък", "#Рок", "#Вино"],
  },
  {
    name: "Jupiter7",
    time: "Събота вечер",
    description:
      "Съботната вечер ще чуете страхотните Jupiter7. Фънк, поп и още нещо.",
    imageSrc: "/sponsors/music2.jpg",
    hashtags: ["#Събота", "#Фънк", "#Танци"],
  },
] as const;

const BAND_HASHTAG_TONES = [
  "border-rose-500/25 bg-rose-500/12 text-rose-700 dark:text-rose-200",
  "border-amber-500/25 bg-amber-500/12 text-amber-700 dark:text-amber-200",
  "border-sky-500/25 bg-sky-500/12 text-sky-700 dark:text-sky-200",
] as const;

type TicketOption = {
  label: string;
  value: string;
};

type TicketPhase = {
  title: string;
  period: string;
  tickets: TicketOption[];
};

type HighlightItem = {
  title: string;
  description: string;
  tone: string;
};

type BandItem = {
  name: string;
  time: string;
  description: string;
  imageSrc: string;
  hashtags: readonly string[];
};

type PremiumPageContent = {
  topBarCaption: string;
  heroTitle: string;
  heroTicketButtonLabel: string;
  storyEyebrow: string;
  storyTitle: string;
  story: string[];
  highlightsEyebrow: string;
  highlightsTitle: string;
  highlights: HighlightItem[];
  bandsEyebrow: string;
  bandsTitle: string;
  bands: BandItem[];
  ticketsEyebrow: string;
  ticketsTitle: string;
  ticketPhases: TicketPhase[];
  ticketNote: string;
  ticketLinkLabel: string;
  closingEyebrow: string;
  closing: string;
  meta: FestivalMetaItem[];
  galleryFallbackTitle: string;
};

const PREMIUM_PAGE_CONTENT: PremiumPageContent = {
  topBarCaption: "Всички културни събития в Русе на едно място!",
  heroTitle: VINOFRENIA_TITLE,
  heroTicketButtonLabel: "Купи билети",
  storyEyebrow: "За фестивала",
  storyTitle: "Едно нестандартно преживяване",
  story: [...VINOFRENIA_STORY],
  highlightsEyebrow: "Какво ви очаква",
  highlightsTitle: "Вино, храна, култура и градска атмосфера",
  highlights: [...VINOFRENIA_HIGHLIGHTS],
  bandsEyebrow: "Вечерна програма",
  bandsTitle: "Музика на живо",
  bands: [...VINOFRENIA_BANDS],
  ticketsEyebrow: "Билети",
  ticketsTitle: "Вземете вашия билет сега",
  ticketPhases: VINOFRENIA_TICKET_PHASES.map((phase) => ({
    title: phase.title,
    period: phase.period,
    tickets: phase.tickets.map((ticket) => ({
      label: ticket.label,
      value: ticket.value,
    })),
  })),
  ticketNote: VINOFRENIA_TICKET_NOTE,
  ticketLinkLabel: "Купи тук",
  closingEyebrow: "ВИНОФРЕНИЯ",
  closing: VINOFRENIA_CLOSING,
  meta: [...VINOFRENIA_META],
  galleryFallbackTitle: "Галерия",
};

function WideImageStrip({ src, alt }: { src: string; alt: string }) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-border/60 bg-card/85 shadow-[0_24px_70px_-42px_rgba(0,0,0,0.65)] backdrop-blur">
      <div className="relative h-32 w-full sm:h-36 lg:h-95">
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/20" />
      </div>
    </section>
  );
}

type PremiumEventPageLabels = {
  goHome: string;
  premiumEvent: string;
  pastEvent: string;
  freeEvent: string;
  more: string;
  events: string;
  gallery: string;
};

type PremiumEventPageProps = {
  event: Event;
  publicEvent: Event;
  slug: string;
  locale: string;
  translatedTitle?: string | null;
  isPast: boolean;
  isFree: boolean;
  tags: Tag[];
  images: string[];
  relatedEvents: Event[];
  eventUrl: string;
  googleCalendarUrl: string | null;
  jsonLd: unknown;
  labels: PremiumEventPageLabels;
};

export function PremiumEventPage({
  event,
  slug,
  locale,
  translatedTitle,
  images,
  eventUrl,
  googleCalendarUrl,
  jsonLd,
  labels,
}: PremiumEventPageProps) {
  const content = PREMIUM_PAGE_CONTENT;
  const ticketsUrl = event.ticketsLink?.trim() || null;

  const galleryImages = Array.from(
    new Set(
      [...images, ...PREMIUM_GALLERY_IMAGES].filter((image): image is string =>
        Boolean(image),
      ),
    ),
  );

  const separatorImage = event.image || "/sponsors/chiflika.jpg";
  const coverFlowItems: CoverFlowItem[] = [...PREMIUM_COVERFLOW_ITEMS];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <style>{PREMIUM_EVENT_LAYOUT_CSS}</style>
      <ScrollToTopOnMount />

      <div className="relative isolate overflow-x-hidden bg-background">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(180,83,9,0.18),_transparent_34%),radial-gradient(circle_at_20%_15%,_rgba(127,29,29,0.14),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(21,128,61,0.12),_transparent_26%)]" />
        <div className="mx-auto flex min-h-svh w-full max-w-7xl flex-col px-4 pb-24 sm:px-6 lg:px-8">
          <div className="fixed inset-x-0 top-4 z-40 px-4 sm:top-6 sm:px-6 lg:top-8 lg:px-8">
            <div className="mx-auto w-full max-w-[26rem] rounded-[1.35rem] border border-white/14 bg-black/30 px-2.5 py-2.5 shadow-[0_24px_70px_-44px_rgba(0,0,0,0.85)] backdrop-blur-md sm:max-w-[32rem] sm:px-3 sm:py-3">
              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-3">
                <div className="justify-self-start [&_button]:my-0 [&_button]:border-white/18 [&_button]:bg-black/24 [&_button]:text-white [&_button]:shadow-none [&_button]:backdrop-blur-md [&_button]:hover:bg-white/12 [&_button]:hover:text-white">
                  <BackButton />
                </div>

                <Link
                  href={`/${locale}`}
                  aria-label={labels.goHome}
                  className="group justify-self-center"
                >
                  <div className="relative h-8 w-28 transition-transform duration-300 group-hover:scale-[1.02] sm:h-10 sm:w-36">
                    <Image
                      src="/all4ruse_white.png"
                      alt="All4Ruse logo"
                      fill
                      priority
                      className="object-contain"
                    />
                  </div>
                </Link>

                <div className="justify-self-end [&_button]:my-0 [&_button]:size-9 [&_button]:rounded-full [&_button]:border [&_button]:border-white/18 [&_button]:bg-black/24 [&_button]:text-white [&_button]:shadow-none [&_button]:backdrop-blur-md [&_button]:hover:bg-white/12 [&_button]:hover:text-white">
                  <ThemeToggle />
                </div>
              </div>

              <p className="mt-2 px-2 text-center text-[11px] leading-4 text-white/76 sm:text-xs sm:leading-5">
                {content.topBarCaption}
              </p>
            </div>
          </div>

          <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden bg-black">
            <div className="absolute inset-0">
              <video
                src={VINOFRENIA_VIDEO_SRC}
                className="block h-full w-full bg-black object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,8,0.36)_0%,rgba(8,8,8,0.18)_24%,rgba(8,8,8,0.65)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.18),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(225,29,72,0.22),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(15,118,110,0.18),transparent_26%)]" />
            </div>

            <div className="relative z-10 mx-auto flex min-h-svh max-w-7xl items-end px-4 pb-18 pt-24 sm:px-6 sm:pb-28 sm:pt-28 lg:px-8 lg:pb-32 lg:pt-32">
              <div className="w-full">
                <div className="mx-auto max-w-5xl text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.38em] text-white/70 sm:text-sm">
                    {content.meta[1]?.value} • {content.meta[0]?.value}
                  </p>

                  <div className="mx-auto mt-5 flex w-fit max-w-full flex-col items-center">
                    <Typography.H1 className="w-fit max-w-full text-balance text-center text-5xl leading-[0.92] text-white sm:text-6xl xl:text-7xl">
                      {content.heroTitle}
                    </Typography.H1>
                    <Button
                      asChild
                      size="lg"
                      className="mt-6 rounded-full bg-white px-7 text-base font-semibold text-black shadow-[0_20px_50px_-28px_rgba(255,255,255,0.9)] transition hover:bg-white/90"
                    >
                      <a href="#festival-tickets">
                        {content.heroTicketButtonLabel}
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="mx-auto mt-8 flex max-w-full flex-wrap items-center justify-center gap-3">
                  {content.meta.map(({ label, value, Icon }) => (
                    <div
                      key={label}
                      className="inline-flex w-fit max-w-full flex-col items-center rounded-[1.4rem] border border-white/14 bg-black/28 px-5 py-4 text-center shadow-[0_24px_70px_-44px_rgba(0,0,0,0.85)] backdrop-blur-md"
                    >
                      <div className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/68">
                        <Icon className="size-4 text-amber-300" />
                        <span>{label}</span>
                      </div>
                      <p className="mt-3 w-fit max-w-full text-sm font-medium text-white sm:text-base">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mx-auto mt-8 flex max-w-5xl flex-wrap items-center justify-center gap-2">
                  {typeof event.id === "number" && (
                    <FavoriteButton
                      id={event.id}
                      name={event.title ?? ""}
                      url={`/${locale}/${slug}`}
                    />
                  )}
                  <EventShareButton
                    url={eventUrl}
                    title={translatedTitle ?? event.title ?? ""}
                  />
                  {googleCalendarUrl && (
                    <Button asChild variant="outline">
                      <a
                        href={googleCalendarUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2"
                      >
                        <CalendarDaysIcon className="size-4" />
                        <span>Google Calendar</span>
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-5 z-20 flex justify-center sm:bottom-6">
              <a
                href="#festival-content"
                className="group inline-flex items-center gap-2 rounded-full border border-white/16 bg-black/28 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/80 backdrop-blur-md transition hover:bg-white/12 hover:text-white"
              >
                <ChevronDownIcon className="size-4 animate-bounce" />
              </a>
            </div>
          </section>

          <div id="festival-content" className="mt-8 space-y-6">
            {coverFlowItems.length > 0 && (
              <section className="overflow-hidden rounded-[2rem] border border-border/60 bg-card/85 p-5 shadow-[0_24px_70px_-42px_rgba(0,0,0,0.65)] backdrop-blur sm:p-8">
                <div className="mx-auto max-w-3xl text-center">
                  <p className="text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    Визуален преглед
                  </p>
                  <Typography.H2 className="mt-3 text-center text-2xl sm:text-3xl">
                    Вижте атмосферата
                  </Typography.H2>
                  {/* <Typography.P className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-foreground/75 sm:text-base">
                    Вижте фестивала отвътре!
                  </Typography.P> */}
                </div>

                <div className="mt-6">
                  <CoverFlow
                    items={coverFlowItems}
                    itemWidth={260}
                    itemHeight={340}
                    stackSpacing={16}
                    initialIndex={Math.min(coverFlowItems.length - 1, 2)}
                    autoPlayMs={4200}
                  />
                </div>
              </section>
            )}

            {/* <section className="rounded-[2rem] border border-border/60 bg-card/85 p-6 shadow-[0_24px_70px_-42px_rgba(0,0,0,0.65)] backdrop-blur sm:p-8">
              <p className="text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                {content.storyEyebrow}
              </p>

              <Typography.H2 className="mt-3 text-center text-2xl sm:text-3xl">
                {content.storyTitle}
              </Typography.H2>

              <div className="mt-5 space-y-4">
                {content.story.map((paragraph) => (
                  <Typography.P
                    key={paragraph}
                    className="text-base leading-7 text-foreground/80"
                  >
                    {paragraph}
                  </Typography.P>
                ))}
              </div>

              <div className="mx-auto mt-6 flex w-fit max-w-full flex-col items-center rounded-[1.5rem] border border-amber-500/20 bg-gradient-to-r from-amber-500/12 via-rose-500/8 to-transparent px-5 py-4 text-center">
                <p className="text-center text-sm font-semibold uppercase tracking-[0.22em] text-amber-700 dark:text-amber-300">
                  {content.closingEyebrow}
                </p>
                <Typography.P className="mt-3 max-w-full text-center text-lg leading-8 text-foreground">
                  {content.closing}
                </Typography.P>
              </div>
            </section> */}

            <WideImageStrip
              src={separatorImage}
              alt="Vinofrenia festival preview"
            />
            <section className="rounded-[2rem] border border-border/60 bg-card/85 p-6 shadow-[0_24px_70px_-42px_rgba(0,0,0,0.65)] backdrop-blur sm:p-8">
              <div className="mx-auto max-w-3xl">
                <p className="text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  {content.highlightsEyebrow}
                </p>
                <Typography.H2 className="mt-3 text-center text-2xl sm:text-3xl">
                  {content.highlightsTitle}
                </Typography.H2>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {content.highlights.map((item, index) => (
                  <article
                    key={item.title}
                    className={`rounded-[1.5rem] border p-5 shadow-sm ${item.tone}`}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <Typography.H3 className="mt-3 text-xl">
                      {item.title}
                    </Typography.H3>
                    <Typography.P className="mt-3 text-sm leading-6 text-foreground/75">
                      {item.description}
                    </Typography.P>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-[2rem] border border-border/60 bg-card/85 p-6 shadow-[0_24px_70px_-42px_rgba(0,0,0,0.65)] backdrop-blur sm:p-8">
              <p className="text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                {content.bandsEyebrow}
              </p>

              <Typography.H2 className="mt-3 text-center text-2xl sm:text-3xl">
                {content.bandsTitle}
              </Typography.H2>

              <div className="mt-6 grid gap-6 lg:mx-auto lg:max-w-5xl md:grid-cols-2">
                {content.bands.map((band) => (
                  <article
                    key={band.name}
                    className="overflow-hidden rounded-[1.8rem] border border-border/60 bg-background/70 shadow-sm"
                  >
                    <div className="relative aspect-square overflow-hidden border-b border-white/10">
                      <Image
                        src={band.imageSrc}
                        alt={band.name}
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        className="object-cover blur-md scale-110 opacity-70"
                        aria-hidden="true"
                      />
                      <div className="absolute inset-0 bg-background/40" />
                      <div className="absolute inset-0 z-10 flex items-center justify-center p-5 sm:p-6">
                        <div className="relative h-full w-full">
                          <Image
                            src={band.imageSrc}
                            alt={band.name}
                            fill
                            sizes="(min-width: 768px) 50vw, 100vw"
                            className="object-contain"
                          />
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-white backdrop-blur">
                        <Music4Icon className="size-4" />
                        <span>{band.time}</span>
                      </div>
                    </div>

                    <div className="p-5 sm:p-6">
                      <Typography.H3 className="text-2xl sm:text-[1.9rem]">
                        {band.name}
                      </Typography.H3>
                      <div className="mt-4 flex flex-wrap gap-3">
                        {band.hashtags.map((hashtag, index) => (
                          <span
                            key={hashtag}
                            className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold tracking-[0.08em] sm:text-base ${BAND_HASHTAG_TONES[index % BAND_HASHTAG_TONES.length]}`}
                          >
                            {hashtag}
                          </span>
                        ))}
                      </div>
                      <Typography.P className="mt-4 text-base leading-7 text-foreground/75">
                        {band.description}
                      </Typography.P>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section
              id="festival-tickets"
              className="scroll-mt-32 rounded-[2rem] border border-border/60 bg-card/85 p-6 shadow-[0_24px_70px_-42px_rgba(0,0,0,0.65)] backdrop-blur sm:p-8"
            >
              <div className="flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                <span>{content.ticketsEyebrow}</span>
              </div>

              <Typography.H2 className="mt-3 text-center text-2xl sm:text-3xl">
                {content.ticketsTitle}
              </Typography.H2>

              <div className="mt-6 grid gap-4 md:grid-cols-1 lg:mx-auto lg:max-w-2xl">
                {content.ticketPhases.map((phase) => (
                  <article
                    key={phase.title}
                    className="rounded-[1.6rem] border border-rose-500/20 bg-gradient-to-br from-rose-500/12 via-background to-background p-5 shadow-sm"
                  >
                    <p className="text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      {phase.period}
                    </p>
                    {/* <Typography.H3 className="mt-3 text-center text-xl">
                      {phase.title}
                    </Typography.H3> */}

                    <div className="mt-5 space-y-3">
                      {phase.tickets.map((ticket) => (
                        <a
                          key={ticket.label}
                          href={ticketsUrl ?? eventUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="group flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-background/70 px-4 py-3 transition hover:border-primary/35 hover:bg-primary/5"
                        >
                          <span className="text-sm font-medium text-foreground/80">
                            {ticket.label}
                          </span>
                          <span className="flex items-center gap-3">
                            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/70">
                              {content.ticketLinkLabel}
                            </span>
                            <span className="text-base font-semibold text-foreground underline decoration-transparent underline-offset-4 transition group-hover:decoration-current">
                              {ticket.value}
                            </span>
                          </span>
                        </a>
                      ))}
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-primary/15 bg-primary/5 px-5 py-4">
                <Typography.P className="text-sm leading-7 text-foreground/80">
                  {content.ticketNote}
                </Typography.P>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
