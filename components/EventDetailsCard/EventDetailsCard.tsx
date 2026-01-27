"use client";

import {
  BuildingIcon,
  CalendarDaysIcon,
  ClockIcon,
  FacebookIcon,
  MailIcon,
  PhoneIcon,
  ReceiptEuroIcon,
  TicketIcon,
  UsersIcon,
} from "lucide-react";
import { PersonIcon } from "@radix-ui/react-icons";

import { Typography } from "@/components/Typography";
import { Card, CardContent } from "@/components/ui/card";
import { Map } from "@/components/Map";
import { Event, Host } from "@/lib/api";
import { formatLongDate, formatTimeRange, formatWeekday } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";

function OrganizersList({ organizers }: { organizers: Host[] }) {
  return (
    <div className="space-y-1">
      {organizers.map((org, idx) => (
        <div key={idx} className="flex items-center gap-2 ml-2">
          <PersonIcon className="size-4 shrink-0 text-primary" />
          {org.link ? (
            <a
              href={org.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              {org.name}
            </a>
          ) : (
            org.name
          )}
        </div>
      ))}
    </div>
  );
}

export function EventDetailsCard({ event }: { event: Event }) {
  const organizers = event.organizers as Host[];
  const t = useTranslations("SingleEvent");
  const locale = useLocale();
  const localeCode = locale === "bg" ? "bg" : "en";

  const fullAddress = [event.place, event.address, event.town]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex flex-col gap-4">
      <Card className="bg-accent border-2 shadow-xl">
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 border-b pb-2 border-foreground/20">
            <CalendarDaysIcon className="size-4 shrink-0 text-primary" />
            <Typography.P>
              {event.startDate &&
                (event.endDate && event.endDate !== event.startDate
                  ? `${formatLongDate(event.startDate, localeCode)} (${formatWeekday(event.startDate, localeCode)}) - ${formatLongDate(event.endDate, localeCode)} (${formatWeekday(event.endDate, localeCode)})`
                  : `${formatLongDate(event.startDate, localeCode)} (${formatWeekday(event.startDate, localeCode)})`)}
            </Typography.P>
          </div>

          <div className="flex items-center gap-2 border-b pb-2 border-foreground/20">
            <ClockIcon className="size-4 shrink-0 text-primary" />
            <Typography.P>
              {formatTimeRange(event.startTime, event.endTime)}
            </Typography.P>
          </div>

          <div className="flex items-center gap-2 border-b pb-2 border-foreground/20">
            <BuildingIcon className="size-4 shrink-0 text-primary" />
            <Typography.P className="leading-tight">
              {event.place}, {event.address}, {event.town}
            </Typography.P>
          </div>

          {event.phoneNumber?.trim() && (
            <div className="flex items-center gap-2 border-b pb-2 border-foreground/20">
              <PhoneIcon className="size-4 shrink-0 text-primary" />
              <Typography.P>
                <a
                  href={`tel:${event.phoneNumber}`}
                  className="text-primary hover:underline block md:hidden"
                >
                  {event.phoneNumber}
                </a>

                <span className="hidden md:block">{event.phoneNumber}</span>
              </Typography.P>
            </div>
          )}
          {event.email?.trim() && (
            <div className="flex items-center gap-2 border-b pb-2 border-foreground/20">
              <MailIcon className="size-4 shrink-0 text-primary" />
              <Typography.P>
                <a
                  href={`mailto:${event.email}`}
                  className="text-primary hover:underline"
                >
                  {event.email}
                </a>
              </Typography.P>
            </div>
          )}
        </CardContent>
      </Card>
      <Card className="bg-accent border-2 shadow-xl">
        <CardContent className="space-y-3">
          {event.fbLink?.trim() && (
            <div className="flex items-center gap-2 border-b pb-2 border-foreground/20">
              <FacebookIcon className="size-4 shrink-0 text-primary" />
              <a
                href={event.fbLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                {t("facebook")}
              </a>
            </div>
          )}

          {event.ticketsLink?.trim() && (
            <div className="flex items-center gap-2 border-b pb-2 border-foreground/20">
              <TicketIcon className="size-4 shrink-0 text-primary" />
              <a
                href={event.ticketsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                {t("tickets")}
              </a>
            </div>
          )}

          {event.price?.trim() && (
            <div className="flex items-center gap-2 border-b pb-2 border-foreground/20">
              <ReceiptEuroIcon className="size-4 shrink-0 text-primary" />
              <Typography.P>
                {event.price === "0"
                  ? t("free")
                  : `${t("price")}: ${event.price} ${t("euros")}`}
              </Typography.P>
            </div>
          )}

          {organizers.length > 0 && (
            <div>
              <div className="flex items-center gap-2">
                <UsersIcon className="size-4 shrink-0 text-primary" />
                <Typography.P>{t("hosts")}: </Typography.P>
              </div>
              <OrganizersList organizers={organizers} />
            </div>
          )}
        </CardContent>
      </Card>
      <Map address={fullAddress} />
    </div>
  );
}
