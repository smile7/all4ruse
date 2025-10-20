import Image from "next/image";

import { FALLBACK_IMAGE } from "@/constants";
import { getEventBySlug } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

export default async function EventPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = await createClient();
  const { data: event, error } = await getEventBySlug(supabase, params.slug);

  if (error || !event)
    return <div>Възникна грешка. Моля опитайте отново по-късно.</div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="">
        <Image
          src={event.image || FALLBACK_IMAGE}
          alt={event.title || "Снимка събитие"}
          fill
          sizes="8rem"
          className="w-full object-cover"
          draggable={false}
        />
      </div>
      <h1>{event.title}</h1>
      <p>{event.description}</p>
      <p>{event.startDate}</p>
    </div>
  );
}
