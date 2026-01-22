import { getLocale, getTranslations } from "next-intl/server";

import { EventDetailsCard } from "@/components/EventDetailsCard";
import EventHeroImage from "@/components/EventHeroImage/EventHeroImage";
import { ImagesGallery } from "@/components/ImagesGallery";
import { Typography } from "@/components/Typography";
import { Card, CardContent, CardTitle } from "@/components/ui";
import { TAG_LABELS_BG } from "@/constants";
import { getEventBySlug, type Tag } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

import "@/components/ui/minimal-tiptap/styles/index.css";

export default async function EventPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { params } = props;
  const t = await getTranslations("SingleEvent");
  const locale = await getLocale();
  const supabase = await createClient();
  const { slug } = await params;
  const { data: event, error } = await getEventBySlug(supabase, slug);

  if (error || !event) return <div>{t("error")}</div>;

  // Load tags for this event via the join table
  const { data: eventTags } = await supabase
    .from("event_tags")
    .select("tag_id")
    .eq("event_id", event.id);

  let tags: Tag[] = [];

  if (eventTags && eventTags.length > 0) {
    const tagIds = eventTags.map((row: { tag_id: number }) => row.tag_id);
    const { data: tagsData } = await supabase
      .from("tags")
      .select("*")
      .in("id", tagIds);

    tags = (tagsData ?? []) as Tag[];
  }

  const images: string[] = Array.isArray(event.images)
    ? event.images.filter((x): x is string => typeof x === "string")
    : [];

  return (
    <div className="flex flex-col gap-6">
      {event.image && <EventHeroImage src={event.image} alt={event.title} />}

      <Card>
        <CardContent className="flex flex-col gap-6 p-6">
          <Typography.H1 className="text-center">{event.title}</Typography.H1>

          {tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2">
              {tags.map((tag) => {
                const base = (tag.title ?? "").toUpperCase();
                const label =
                  locale === "bg" ? (TAG_LABELS_BG[base] ?? base) : base;

                return (
                  <span
                    key={tag.id}
                    className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary shadow-sm"
                  >
                    <span># {label}</span>
                  </span>
                );
              })}
            </div>
          )}

          <hr />

          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="md:col-span-3 space-y-6">
              <div className="minimal-tiptap-editor">
                <div
                  className="whitespace-pre-wrap text-pretty"
                  dangerouslySetInnerHTML={{
                    __html: event.description || "",
                  }}
                />
              </div>
            </div>
            <div className="md:col-span-1">
              <EventDetailsCard event={event} />
            </div>
          </div>
        </CardContent>
      </Card>

      {images.length > 0 && (
        <Card className="space-y-4 p-6">
          <CardTitle>
            <Typography.H2>{t("gallery")}</Typography.H2>
          </CardTitle>
          <CardContent className="p-0">
            <ImagesGallery images={images} title={event.title} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
