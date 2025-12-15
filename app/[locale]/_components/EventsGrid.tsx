"use client";

import { Calendar1Icon, MapPinIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

import { AspectRatio } from "@/components/AspectRatio";
import { Typography } from "@/components/Typography";
import { Card, CardContent } from "@/components/ui";
import { FALLBACK_IMAGE } from "@/constants";
import type { Event } from "@/lib/api";
import { formatShortDate, formatTimeTZ } from "@/lib/utils";

import { EventTimeFilter } from "./FilterByTime";

export function EventsGrid({
  events,
  timeFilter,
  isEditMode = false,
}: {
  events: Event[];
  timeFilter?: EventTimeFilter;
  isEditMode?: boolean;
}) {
  const t = useTranslations("HomePage");
  const locale = useLocale();

  return (
    <div
      className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(min(100%,18rem),1fr))]"
      aria-label="Събития"
    >
      {events.map((e) => {
        return (
          <Link
            key={e.id}
            href={
              isEditMode
                ? `/${locale}/edit-event/${e.slug}`
                : `/${locale}/${e.slug}`
            }
            aria-label={`Отвори събитие: ${e.title}`}
            className="group"
          >
            <Card
              className={`
                flex flex-col h-full p-0 overflow-hidden border-border/60 transition-all duration-300 hover:shadow-lg
                relative border-2 hover:border-secondary
                after:content-[''] after:block after:w-full after:h-[10px] after:bg-[hsl(var(--secondary))] after:absolute after:bottom-0 after:left-0 
                ${timeFilter === "past" ? "opacity-60 grayscale" : ""}
              `}
            >
              {timeFilter === "past" && (
                <div
                  className="absolute left-1/2 top-1/4 z-40"
                  style={{
                    transform: "translate(-50%, -50%) rotate(-15deg)",
                  }}
                >
                  <span
                    className="px-6 py-2 uppercase rounded-md font-bold shadow-lg whitespace-nowrap"
                    style={{
                      background: "var(--color-secondary)",
                      color: "var(--color-secondary-foreground)",
                      border: "2px solid var(--color-border)",
                    }}
                  >
                    {t("pastEvent")}
                  </span>
                </div>
              )}
              <AspectRatio ratio={16 / 9}>
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute inset-0 transform-gpu will-change-transform transition-transform duration-500 ease-out group-hover:scale-[1.05]">
                    <Image
                      src={e.image || FALLBACK_IMAGE}
                      alt={e.title || "Event image"}
                      fill
                      sizes="18rem"
                      className="w-full object-cover"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-opacity" />
                  </div>
                  <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/25 to-transparent transition-opacity duration-300 group-hover:from-black/80" />
                  {e.price === "0" && (
                    <div className="absolute left-3 top-3 rounded-md bg-primary p-2 text-[11px] uppercase text-primary-foreground backdrop-blur-sm">
                      {t("freeEvent")}
                    </div>
                  )}
                </div>
              </AspectRatio>
              <CardContent className="flex flex-col gap-2 p-4 pt-0 pb-8">
                <Typography.Lead className="leading-tight mb-2">
                  {e.title}
                </Typography.Lead>

                <div className="flex items-center gap-2 text-xs opacity-80">
                  <Calendar1Icon className="size-4 opacity-70 shrink-0" />
                  {formatShortDate(e.startDate)} {t("at")}{" "}
                  {formatTimeTZ(e.startTime)}
                </div>

                <div className="flex items-center gap-2 text-xs opacity-80">
                  <MapPinIcon className="size-4 opacity-70 shrink-0" />
                  {e.address}, {e.town}
                </div>

                <span className="sr-only">{e.title}</span>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
