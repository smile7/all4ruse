import { Plus } from "lucide-react";

import { getEvents } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

import { EventsClient } from "./components";

export const revalidate = 120;

export default async function EventsPage() {
  const supabase = await createClient();
  const { data: events, error } = await getEvents(supabase);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Events</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse and manage events.
          </p>
        </div>
        <a
          href="/events/create"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <Plus className="h-4 w-4" />
          Създаване
        </a>
      </header>

      <EventsClient initial={events} errorMessage={error?.message} />
    </div>
  );
}
