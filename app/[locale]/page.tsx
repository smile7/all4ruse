import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Typography } from "@/components/Typography";
import { Button } from "@/components/ui";
import { getEvents } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";

import { EventsInfinite } from "./_components/EventsInfinite";

export default async function EventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("HomePage");

  const supabase = await createClient();
  const { data: eventsRaw, error } = await getEvents(supabase, {
    all: false,
    limit: 16,
  });

  const events = (eventsRaw ?? []).map((event) => {
    const originalEmail = event.email as string | null | undefined;
    if (!originalEmail || !originalEmail.includes("@")) {
      return { ...event, email: null };
    }

    const [user, ...rest] = originalEmail.split("@");
    const domain = rest.join("@");

    return {
      ...event,
      email: null,
      emailUser: user,
      emailDomain: domain,
    } as typeof event & { emailUser: string; emailDomain: string };
  });

  // Count all upcoming active events for the summary counter
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const { count: totalUpcoming } = await supabase
    .from("events")
    .select("id", { count: "exact", head: true })
    .eq("isEventActive", true)
    .gte("startDate", todayStr);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto w-full flex flex-col gap-6">
      <div className="flex flex-col md:flex-row w-full gap-4 md:items-center md:justify-between items-center text-center md:text-left">
        {user && (
          <Button
            asChild
            className="order-1 md:order-2 self-end md:self-center md:ml-auto w-full md:w-auto"
          >
            <Link href={`/${locale}/create`}>{t("createEvent")}</Link>
          </Button>
        )}
        <div className="flex flex-col gap-2 order-2 md:order-1">
          <Typography.H1>{t("pageTitle")}</Typography.H1>
          <Typography.Small>{t("pageDescription")}</Typography.Small>
          <hr className="my-1.5" />
          <Typography.Small>{t("createProfileMsg")}</Typography.Small>
        </div>
      </div>
      <EventsInfinite
        initialEvents={events}
        initialError={error?.message}
        timeFilter="upcoming"
        totalCount={totalUpcoming ?? events?.length ?? 0}
      />
    </div>
  );
}
