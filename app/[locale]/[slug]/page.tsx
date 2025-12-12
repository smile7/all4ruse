import { getTranslations } from "next-intl/server";

import { EventDetailsCard } from "@/components/EventDetailsCard";
import EventHeroImage from "@/components/EventHeroImage/EventHeroImage";
import { ImagesGallery } from "@/components/ImagesGallery";
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

  const images: string[] = Array.isArray(event.images)
    ? event.images.filter((x): x is string => typeof x === "string")
    : [];

  return (
    <div className="flex flex-col gap-12">
      {event.image && <EventHeroImage src={event.image} alt={event.title} />}
      <article className="flex flex-col gap-12">
        <Typography.H1 className="text-center">{event.title}</Typography.H1>
        <hr />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-3 space-y-6">
            <div className="minimal-tiptap-editor">
              <div
                className="whitespace-pre-wrap text-pretty"
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            </div>
          </div>
          <div className="md:col-span-1">
            <EventDetailsCard event={event} />
          </div>
        </div>

        {images.length > 0 && (
          <section className="mt-8 space-y-4">
            <Typography.H3>{t("gallery")}</Typography.H3>
            <ImagesGallery images={images} title={event.title} />
          </section>
        )}
      </article>
    </div>
  );
}
