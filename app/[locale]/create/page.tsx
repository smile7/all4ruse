import { EventForm } from "@/blocks";
import { getEventBySlug } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

export default async function CreateEventPage({
  searchParams,
}: {
  searchParams: Promise<{ duplicateFrom?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const duplicateSlug = params?.duplicateFrom;

  let duplicateEvent = null;

  if (duplicateSlug) {
    const { data } = await getEventBySlug(supabase, duplicateSlug, {
      all: true,
    });
    duplicateEvent = data;
  }

  return <EventForm mode="create" event={duplicateEvent ?? undefined} />;
}
