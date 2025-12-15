"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

import { Typography } from "@/components/Typography";
import { ErrorAlert } from "@/components/ui";
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
    [userEvents]
  );

  const currentEvents = useMemo(
    () => filterEventsByTime(userEvents, "current"),
    [userEvents]
  );

  const pastEvents = useMemo(
    () => filterEventsByTime(userEvents, "past"),
    [userEvents]
  );

  // TODO: skeleton
  if (isProfileLoading || isEventsLoading) {
    return <p>Loading...</p>;
  }

  if (!events) {
    return <Typography.P>{t("noEventsFound")}</Typography.P>;
  }

  return (
    <div className="space-y-10">
      {error && <ErrorAlert error={error.message} />}

      {Boolean(error) && (
        <Typography.Small className="text-red-600">
          {t("error")} {error?.message}
        </Typography.Small>
      )}

      <section className="space-y-4">
        <Typography.H2>{t("menuEvents")}</Typography.H2>
        <EventsGrid events={upcomingEvents} timeFilter="upcoming" isEditMode />
      </section>

      <section className="space-y-4">
        <Typography.H2>{t("menuCurrentEvents")}</Typography.H2>
        <EventsGrid events={currentEvents} timeFilter="current" isEditMode />
      </section>

      <section className="space-y-4">
        <Typography.H2>{t("menuPastEvents")}</Typography.H2>
        <EventsGrid events={pastEvents} timeFilter="past" isEditMode />
      </section>
    </div>
  );
}
