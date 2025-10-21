import Link from "next/link";
import { getTranslations } from "next-intl/server"; // <-- use this

import { Typography } from "@/components/Typography";
import { getEvents } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

import { Events } from "./_components";

export default async function EventsPage() {
  const t = await getTranslations("HomePage");

  const supabase = await createClient();
  const { data: events, error } = await getEvents(supabase);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto w-full flex flex-col gap-6">
      <div className="flex flex-row items-end justify-between">
        <Typography.H1>{t("title")}</Typography.H1>
        {user && (
          <Link
            href="/create"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            Създай събитие
          </Link>
        )}
      </div>
      <Events events={events} errorMessage={error?.message} />
    </div>
  );
}
