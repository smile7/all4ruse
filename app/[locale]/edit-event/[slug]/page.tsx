"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { EventForm } from "@/blocks";
import { Typography } from "@/components/Typography";
import { ErrorAlert } from "@/components/ui";
import { useEvent } from "@/hooks/query";

export default function EditEventPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, error } = useEvent(slug);

  const t = useTranslations("CreateEvent");

  // TODO: add skeleton loader
  if (isLoading) return <p>Loading...</p>;
  if (error) return <ErrorAlert error={error.message} />;
  if (!data) return <Typography.P>{t("eventNotFound")}</Typography.P>;

  return <EventForm mode="edit" event={data} />;
}
