import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { Typography } from "@/components/Typography";
import { getEventBySlug } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

export default async function EventPage(props: { params: { slug: string } }) {
  const { params } = props;
  const t = await getTranslations("HomePage");
  const supabase = await createClient();
  const { data: event, error } = await getEventBySlug(supabase, params.slug);

  if (error || !event)
    return <div>Възникна грешка. Моля опитайте отново по-късно.</div>;

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <Typography.H1>{t("title")}</Typography.H1>

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

            <div className="prose prose-lg max-w-none">{event.description}</div>
          </article>
        </div>
      </div>
    </div>
  );
}
