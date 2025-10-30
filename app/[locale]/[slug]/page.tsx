import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { Typography } from "@/components/Typography";
import { getEventBySlug } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

import "@/components/ui/minimal-tiptap/styles/index.css";

export default async function EventPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { params } = props;
  const t = await getTranslations("HomePage");
  const supabase = await createClient();
  const { slug } = await params;
  const { data: event, error } = await getEventBySlug(supabase, slug);

  if (error || !event)
    return <div>Възникна грешка. Моля опитайте отново по-късно.</div>;

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Typography.H1>{event.title}</Typography.H1>

        <div className="mt-16">
          <article className="space-y-8">
            {event.image && (
              <div className="bg-muted aspect-video w-full overflow-hidden rounded-xl">
                <Image
                  src={event.image}
                  width={800}
                  height={450}
                  alt="Event image"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="minimal-tiptap-editor">
              <div
                className="whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            </div>{" "}
          </article>
        </div>
      </div>
    </div>
  );
}
