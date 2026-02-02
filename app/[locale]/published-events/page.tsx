"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";

import { Typography } from "@/components/Typography";
import {
  Button,
  Card,
  CardContent,
  CardTitle,
  ErrorAlert,
} from "@/components/ui";
import { useEvents, useProfile } from "@/hooks/query";

import { EventsGrid, filterEventsByTime } from "../_components";

export default function PublishedEventsPage() {
  const t = useTranslations("HomePage");
  const locale = useLocale();

  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { data: events, isLoading: isEventsLoading, error } = useEvents();

  const { waitingApprovalEvents, activeUserEvents } = useMemo(() => {
    if (!events || !profile) {
      return { waitingApprovalEvents: [], activeUserEvents: [] };
    }
    const waitingApprovalEvents = events.filter(
      (e) => e.createdBy === profile?.id && e.isEventActive === false,
    );
    const activeUserEvents = events.filter(
      (e) => e.createdBy === profile?.id && e.isEventActive === true,
    );
    return { waitingApprovalEvents, activeUserEvents };
  }, [events, profile]);

  const upcomingEvents = useMemo(
    () => filterEventsByTime(activeUserEvents, "upcoming"),
    [activeUserEvents],
  );

  const currentEvents = useMemo(
    () => filterEventsByTime(activeUserEvents, "current"),
    [activeUserEvents],
  );

  const pastEvents = useMemo(
    () => filterEventsByTime(activeUserEvents, "past"),
    [activeUserEvents],
  );

  if (!events) {
    return <Typography.P>{t("noEventsFound")}</Typography.P>;
  }

  return (
    <div className="mx-auto w-full flex flex-col gap-6">
      {Boolean(error) && <ErrorAlert error="">{t("error")}</ErrorAlert>}

      <div className="flex flex-col md:flex-row w-full gap-4 md:items-center md:justify-between items-center text-center md:text-left">
        <Button
          asChild
          className="order-1 md:order-2 self-end md:self-center md:ml-auto w-full md:w-auto"
        >
          <Link href={`/${locale}/create`}>{t("createEvent")}</Link>
        </Button>
      </div>

      <Card className="space-y-4 p-6 border-orange-400">
        <CardTitle>
          <Typography.H2>{t("waitingForApproval")}</Typography.H2>
        </CardTitle>
        <CardContent className="p-0">
          <EventsGrid events={waitingApprovalEvents} isEditMode />
        </CardContent>
      </Card>

      <Card className="space-y-4 p-6">
        <CardTitle>
          <Typography.H2>{t("menuEvents")}</Typography.H2>
        </CardTitle>
        <CardContent className="p-0">
          <EventsGrid
            events={upcomingEvents}
            timeFilter="upcoming"
            isEditMode
          />
        </CardContent>
      </Card>

      <Card className="space-y-4 p-6">
        <CardTitle>
          <Typography.H2>{t("menuCurrentEvents")}</Typography.H2>
        </CardTitle>
        <CardContent className="p-0">
          <EventsGrid events={currentEvents} timeFilter="current" isEditMode />
        </CardContent>
      </Card>

      <Card className="space-y-4 p-6">
        <CardTitle>
          <Typography.H2>{t("menuPastEvents")}</Typography.H2>
        </CardTitle>
        <CardContent className="p-0">
          <EventsGrid events={pastEvents} timeFilter="past" isEditMode />
        </CardContent>
      </Card>
    </div>
  );
}
