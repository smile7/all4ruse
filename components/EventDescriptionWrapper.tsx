"use client";
import EventDescription from "@/components/EventDescription";

interface EventDescriptionWrapperProps {
  description: string;
  locale: string;
}

export default function EventDescriptionWrapper({
  description,
  locale,
}: EventDescriptionWrapperProps) {
  return <EventDescription description={description} locale={locale} />;
}
