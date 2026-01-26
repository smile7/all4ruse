"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { Typography } from "@/components/Typography";
import { Card, CardContent, CardTitle, ErrorAlert } from "@/components/ui";
import { useEvents, useProfile } from "@/hooks/query";

import { EventsGrid, filterEventsByTime } from "../_components";

export default function PublishedEventsPage() {
  const t = useTranslations("HomePage");

  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { data: events, isLoading: isEventsLoading, error } = useEvents();

  const userEvents = useMemo(() => {
    if (!events || !profile) {
      return [];
    }

    return events.filter((e) => e.createdBy === profile?.id);
  }, [events, profile]);

  const upcomingEvents = useMemo(
    () => filterEventsByTime(userEvents, "upcoming"),
    [userEvents],
  );

  const currentEvents = useMemo(
    () => filterEventsByTime(userEvents, "current"),
    [userEvents],
  );

  const pastEvents = useMemo(
    () => filterEventsByTime(userEvents, "past"),
    [userEvents],
  );

  if (!events) {
    return <Typography.P>{t("noEventsFound")}</Typography.P>;
  }

  return (
    <div className="flex flex-col gap-6">
      {Boolean(error) && <ErrorAlert error="">{t("error")}</ErrorAlert>}

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
