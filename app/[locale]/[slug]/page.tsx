import { getTranslations } from "next-intl/server";

import { EventDetailsCard } from "@/components/EventDetailsCard";
import EventHeroImage from "@/components/EventHeroImage/EventHeroImage";
import { Typography } from "@/components/Typography";
import { getEventBySlug } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

import "@/components/ui/minimal-tiptap/styles/index.css";

export default async function EventPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { params } = props;
  const t = await getTranslations("SingleEvent");
  const supabase = await createClient();
  const { slug } = await params;
  const { data: event, error } = await getEventBySlug(supabase, slug);

  if (error || !event) return <div>{t("error")}</div>;

  return (
    <div className="flex flex-col gap-6">
      {event.image && <EventHeroImage src={event.image} alt={event.title} />}
      <article className="space-y-8">
        <Typography.H1 className="text-center">{event.title}</Typography.H1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
          <div className="md:col-span-2 space-y-6">
            <div className="minimal-tiptap-editor">
              <div
                className="whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            </div>
          </div>
          <div className="md:col-span-1">
            <EventDetailsCard event={event} />
          </div>
        </div>
      </article>
    </div>
  );
}
